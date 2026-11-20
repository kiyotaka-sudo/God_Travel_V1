package com.godtravel.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.paiement.MonetbilInitRequest;
import com.godtravel.backend.model.dto.paiement.MonetbilInitResponse;
import com.godtravel.backend.model.dto.paiement.MonetbilStatusView;
import com.godtravel.backend.model.entity.Billet;
import com.godtravel.backend.model.entity.Colis;
import com.godtravel.backend.model.entity.ModePaiement;
import com.godtravel.backend.model.entity.Paiement;
import com.godtravel.backend.repository.BilletRepository;
import com.godtravel.backend.repository.ColisRepository;
import com.godtravel.backend.repository.ModePaiementRepository;
import com.godtravel.backend.repository.PaiementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.TreeMap;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MonetbilService {

    private final PaiementRepository paiementRepository;
    private final ModePaiementRepository modePaiementRepository;
    private final BilletRepository billetRepository;
    private final ColisRepository colisRepository;

    @Value("${monetbil.service-key:}") private String serviceKey;
    @Value("${monetbil.service-secret:}") private String serviceSecret;
    @Value("${monetbil.notify-url-base:http://localhost:8080}") private String notifyUrlBase;
    @Value("${monetbil.return-url-base:http://localhost:5173/paiement/retour}") private String returnUrlBase;

    @Transactional
    public MonetbilInitResponse initierPaiement(MonetbilInitRequest request) {
        if (serviceKey.isBlank()) {
            throw new BusinessException("Monetbil n'est pas configuré : ajoutez MONETBIL_SERVICE_KEY dans l'environnement du backend.");
        }
        if (serviceSecret.isBlank()) {
            throw new BusinessException("Monetbil n'est pas configuré : ajoutez MONETBIL_SERVICE_SECRET pour valider les notifications.");
        }

        Billet billet = null;
        Colis colis = null;
        if ("BILLET".equalsIgnoreCase(request.getTypeItem())) {
            billet = billetRepository.findById(request.getIdItem())
                    .orElseThrow(() -> new ResourceNotFoundException("Billet", "id", request.getIdItem()));
            if (!"EN_ATTENTE_PAIEMENT".equals(billet.getStatutBillet())) {
                throw new BusinessException("Ce billet n'attend pas de paiement Monetbil.");
            }
            if (billet.getPrixAppliqueXaf().compareTo(request.getMontant()) != 0) {
                throw new BusinessException("Le montant demandé ne correspond pas au prix du billet.");
            }
            var authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean clientRole = authentication != null && authentication.getAuthorities().stream()
                    .anyMatch(authority -> "ROLE_CLIENT".equals(authority.getAuthority()));
            if (clientRole && (!"EN_LIGNE".equals(billet.getCanalVente())
                    || !authentication.getName().startsWith("client:")
                    || !billet.getClient().getIdClient().equals(jwtClientId(authentication.getName()))))
                throw new BusinessException("Vous ne pouvez régler que vos propres réservations.");
        } else if ("COLIS".equalsIgnoreCase(request.getTypeItem())) {
            colis = colisRepository.findById(request.getIdItem())
                    .orElseThrow(() -> new ResourceNotFoundException("Colis", "id", request.getIdItem()));
            if (colis.getFraisExpeditionXaf().compareTo(request.getMontant()) != 0) {
                throw new BusinessException("Le montant demandé ne correspond pas aux frais du colis.");
            }
        } else {
            throw new BusinessException("Type d'article invalide.");
        }

        ModePaiement mode = modePaiementRepository.findByCodeMode("MONETBIL")
                .orElseGet(() -> modePaiementRepository.save(ModePaiement.builder()
                        .idMode("MOD-MONETBIL").codeMode("MONETBIL")
                        .libelleMode("Mobile Money / Orange Money (Monetbil)").enLigne(true).build()));

        String idPaiement = "PAI-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        String reference = "GT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        Paiement paiement = paiementRepository.save(Paiement.builder()
                .idPaiement(idPaiement)
                .modePaiement(mode)
                .billet(billet)
                .colis(colis)
                .referenceTransaction(reference)
                .montantPayeXaf(request.getMontant())
                .datePaiement(LocalDateTime.now())
                .statutPaiement("EN_ATTENTE")
                .build());

        String notifyUrl = notifyUrlBase + "/api/paiements/monetbil/notify";
        String returnUrl = UriComponentsBuilder.fromUriString(returnUrlBase)
                .queryParam("reference", reference)
                .build().encode().toUriString();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("amount", request.getMontant().toPlainString());
        form.add("phone", request.getTelephone());
        form.add("phone_lock", "true");
        form.add("locale", "fr");
        form.add("country", "CM");
        form.add("currency", "XAF");
        String operatorCode = monetbilOperatorCode(request.getOperateur());
        if (!operatorCode.isBlank()) form.add("operator", operatorCode);
        form.add("item_ref", request.getIdItem());
        form.add("payment_ref", reference);
        form.add("notify_url", notifyUrl);
        form.add("return_url", returnUrl);
        form.add("first_name", request.getNomClient() == null ? "" : request.getNomClient());
        form.add("email", request.getEmailClient() == null ? "" : request.getEmailClient());

        try {
            JsonNode response = RestClient.create().post()
                    .uri("https://api.monetbil.com/widget/v2.1/" + serviceKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(JsonNode.class);
            String paymentUrl = response == null ? "" : response.path("payment_url").asText("");
            if (response == null || !response.path("success").asBoolean(false) || paymentUrl.isBlank()) {
                paiement.setStatutPaiement("ECHEC");
                paiementRepository.save(paiement);
                annulerBilletEnEchec(paiement);
                return MonetbilInitResponse.builder().success(false).idPaiement(idPaiement)
                        .referenceTransaction(reference).status("ECHEC")
                        .message("Monetbil n'a pas pu créer la session de paiement.").build();
            }
            return MonetbilInitResponse.builder()
                    .success(true).idPaiement(idPaiement).referenceTransaction(reference)
                    .paymentUrl(paymentUrl).status("EN_ATTENTE")
                    .message("Redirection sécurisée vers Monetbil.").build();
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            paiement.setStatutPaiement("ECHEC");
            paiementRepository.save(paiement);
            annulerBilletEnEchec(paiement);
            return MonetbilInitResponse.builder().success(false).idPaiement(idPaiement)
                    .referenceTransaction(reference).status("ECHEC")
                    .message("Impossible de joindre Monetbil. Vérifiez la configuration réseau et réessayez.").build();
        }
    }

    @Transactional
    public boolean traiterWebhook(Map<String, String> payload) {
        if (!signatureValide(payload)) return false;
        String reference = payload.get("payment_ref");
        if (reference == null || reference.isBlank()) return false;
        Paiement paiement = paiementRepository.findByReferenceTransaction(reference).orElse(null);
        if (paiement == null) return false;

        String expectedItem = paiement.getBillet() != null
                ? paiement.getBillet().getIdBillet()
                : paiement.getColis() != null ? paiement.getColis().getIdColis() : "";
        if (!expectedItem.equals(payload.get("item_ref")) || !montantCorrespond(payload.get("amount"), paiement.getMontantPayeXaf())) {
            return false;
        }

        String status = payload.getOrDefault("status", "");
        if ("success".equalsIgnoreCase(status)) {
            if ("VALIDE".equals(paiement.getStatutPaiement())) return true;
            paiement.setStatutPaiement("VALIDE");
            if (paiement.getBillet() != null) {
                paiement.getBillet().setStatutBillet("VALIDE");
                billetRepository.save(paiement.getBillet());
            }
            if (paiement.getColis() != null) {
                paiement.getColis().setStatutColis("EN_TRANSIT");
                colisRepository.save(paiement.getColis());
            }
        } else if ("failed".equalsIgnoreCase(status) || "cancelled".equalsIgnoreCase(status)) {
            if ("EN_ATTENTE".equals(paiement.getStatutPaiement())) {
                paiement.setStatutPaiement("ECHEC");
                annulerBilletEnEchec(paiement);
            }
        } else {
            return false;
        }
        paiementRepository.save(paiement);
        return true;
    }

    @Transactional(readOnly = true)
    public MonetbilStatusView getStatut(String reference, String telephone) {
        Paiement paiement = paiementRepository.findByReferenceTransaction(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement", "référence", reference));
        String telephoneAssocie = paiement.getBillet() != null
                ? paiement.getBillet().getClient().getTelephone()
                : paiement.getColis() != null ? paiement.getColis().getClientExpediteur().getTelephone() : "";
        if (!normaliserTelephone(telephoneAssocie).equals(normaliserTelephone(telephone))) {
            throw new ResourceNotFoundException("Paiement", "référence", reference);
        }
        return MonetbilStatusView.builder()
                .statut(paiement.getStatutPaiement())
                .codeBillet(paiement.getBillet() == null ? null : paiement.getBillet().getCodeBillet())
                .message(switch (paiement.getStatutPaiement()) {
                    case "VALIDE" -> "Paiement confirmé.";
                    case "ECHEC" -> "Le paiement a échoué ou a été annulé.";
                    default -> "Confirmation de l'opérateur en attente.";
                }).build();
    }

    private boolean signatureValide(Map<String, String> payload) {
        if (serviceSecret.isBlank() || payload.get("sign") == null || !serviceKey.equals(payload.get("service"))) return false;
        try {
            TreeMap<String, String> signed = new TreeMap<>(payload);
            String provided = signed.remove("sign");
            StringBuilder values = new StringBuilder(serviceSecret);
            signed.values().forEach(value -> values.append(value == null ? "" : value));
            byte[] digest = MessageDigest.getInstance("MD5").digest(values.toString().getBytes(StandardCharsets.UTF_8));
            String expected = HexFormat.of().formatHex(digest);
            return MessageDigest.isEqual(expected.getBytes(StandardCharsets.US_ASCII), provided.toLowerCase().getBytes(StandardCharsets.US_ASCII));
        } catch (NoSuchAlgorithmException exception) {
            return false;
        }
    }

    private boolean montantCorrespond(String value, BigDecimal expected) {
        try { return new BigDecimal(value).compareTo(expected) == 0; }
        catch (Exception exception) { return false; }
    }

    private String monetbilOperatorCode(String operator) {
        if (operator == null || operator.isBlank()) return "";
        return switch (operator.trim().toUpperCase(java.util.Locale.ROOT)) {
            case "MTN", "CM_MTNMOBILEMONEY" -> "CM_MTNMOBILEMONEY";
            case "ORANGE", "CM_ORANGEMONEY" -> "CM_ORANGEMONEY";
            default -> throw new BusinessException("L’opérateur Mobile Money sélectionné n’est pas pris en charge.");
        };
    }

    private void annulerBilletEnEchec(Paiement paiement) {
        if (paiement.getBillet() != null && "EN_ATTENTE_PAIEMENT".equals(paiement.getBillet().getStatutBillet())) {
            paiement.getBillet().setStatutBillet("ANNULE");
            billetRepository.save(paiement.getBillet());
        }
    }

    private String normaliserTelephone(String value) {
        return value == null ? "" : value.replaceAll("[^0-9]", "");
    }

    private String jwtClientId(String subject) {
        return SecurityContextHolder.getContext().getAuthentication().getPrincipal() instanceof com.godtravel.backend.security.CustomUserDetails details
                ? details.getId() : "";
    }
}
