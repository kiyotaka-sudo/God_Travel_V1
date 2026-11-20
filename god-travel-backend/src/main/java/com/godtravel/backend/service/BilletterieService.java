package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.billetterie.ReservationRequest;
import com.godtravel.backend.model.dto.billetterie.TicketPublicView;
import com.godtravel.backend.model.dto.promotion.PromotionApplication;
import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.model.entity.view.VueVoyagesDisponibles;
import com.godtravel.backend.repository.*;
import com.godtravel.backend.security.CustomUserDetails;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class BilletterieService {

    private final VueVoyagesDisponiblesRepository vueVoyagesRepo;
    private final VoyageRepository voyageRepository;
    private final BilletRepository billetRepository;
    private final ClientRepository clientRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PaiementRepository paiementRepository;
    private final ModePaiementRepository modePaiementRepository;
    private final CategorieVoyageurRepository categorieVoyageurRepository;
    private final ClotureCaisseRepository clotureCaisseRepository;
    private final CompteClientRepository compteClientRepository;
    private final VerrouSiegeService verrouSiegeService;
    private final PromotionService promotionService;
    private final FideliteService fideliteService;
    @Value("${app.ticket-hmac-secret:}")
    private String ticketHmacSecret;

    public List<VueVoyagesDisponibles> getVoyagesDisponibles() {
        return vueVoyagesRepo.findAll();
    }

    @Transactional(readOnly = true)
    public List<TicketPublicView> getBilletsClientConnecte() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        String subject = auth == null ? "" : auth.getName();
        String email = subject.startsWith("client:") ? subject.substring("client:".length()) : "";
        CompteClient compte = compteClientRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new BusinessException("Compte client connecté introuvable."));
        return billetRepository.findByClient_IdClientOrderByDateEmissionDesc(compte.getIdClient()).stream()
                .filter(b -> List.of("VALIDE", "EMBARQUE").contains(b.getStatutBillet()))
                .map(this::vueTicket)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketPublicView consulterBillet(String codeBillet, String telephone) {
        Billet billet = billetRepository.findByCodeBillet(codeBillet.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Billet", "code", codeBillet));
        String telephoneEnregistre = billet.getClient().getTelephone();
        if (telephoneEnregistre == null || !normaliserTelephone(telephoneEnregistre).equals(normaliserTelephone(telephone))) {
            throw new ResourceNotFoundException("Billet", "code", codeBillet);
        }
        if (!List.of("VALIDE", "EMBARQUE").contains(billet.getStatutBillet())) {
            throw new BusinessException("Ce billet n'est pas encore confirmé. Vérifiez le statut du paiement.");
        }

        return vueTicket(billet);
    }

    private TicketPublicView vueTicket(Billet billet) {
        String telephoneEnregistre = billet.getClient().getTelephone();
        String nom = String.join(" ", Arrays.asList(billet.getClient().getPrenom(), billet.getClient().getNom()).stream()
                .filter(part -> part != null && !part.isBlank()).toList());
        String telephoneMasque = telephoneEnregistre.length() < 4 ? "••••" : "•••• " + telephoneEnregistre.substring(telephoneEnregistre.length() - 4);
        Voyage voyage = billet.getVoyage();
        return TicketPublicView.builder()
                .codeBillet(billet.getCodeBillet())
                .codeReservation(billet.getCodeReservation())
                .nomPassager(nom)
                .telephoneMasque(telephoneMasque)
                .villeDepart(voyage.getLigne().getVilleDepart().getNomVille())
                .villeArrivee(voyage.getLigne().getVilleArrivee().getNomVille())
                .immatriculationBus(voyage.getBus().getImmatriculation())
                .departPrevu(voyage.getDateHeureDepartPrevue())
                .numeroSiege(billet.getNumSiege())
                .montantXaf(billet.getPrixAppliqueXaf())
                .statut(billet.getStatutBillet())
                .qrCodeBase64(Base64.getEncoder().encodeToString(genererQrCode(billet.getCodeBillet())))
                .build();
    }

    private String normaliserTelephone(String value) {
        return value == null ? "" : value.replaceAll("[^0-9]", "");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPlanSieges(String idVoyage) {
        Voyage voyage = voyageRepository.findById(idVoyage)
                .orElseThrow(() -> new ResourceNotFoundException("Voyage", "id", idVoyage));

        int totalPlaces = voyage.getBus() != null ? voyage.getBus().getNbPlaces() : 50;
        LocalDateTime now = LocalDateTime.now();
        List<Integer> occupes = billetRepository.findSiegesVendusByVoyage(idVoyage);
        List<Integer> enAttentePaiement = billetRepository.findSiegesEnAttentePaiementByVoyage(idVoyage, now.minusMinutes(10));
        List<Integer> verrouilles = verrouSiegeService.getSiegesVerrouilles(idVoyage);
        Set<Integer> indisponibles = new HashSet<>(occupes);
        indisponibles.addAll(enAttentePaiement);
        indisponibles.addAll(verrouilles);

        List<Integer> libres = new ArrayList<>();
        for (int i = 1; i <= totalPlaces; i++) {
            if (!indisponibles.contains(i)) {
                libres.add(i);
            }
        }

        Map<String, String> statuts = new LinkedHashMap<>();
        for (int i = 1; i <= totalPlaces; i++) {
            String status = occupes.contains(i) ? "OCCUPE"
                    : (enAttentePaiement.contains(i) || verrouilles.contains(i)) ? "VERROUILLE" : "LIBRE";
            statuts.put(String.valueOf(i), status);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("idVoyage", idVoyage);
        result.put("totalPlaces", totalPlaces);
        result.put("placesOccupees", occupes);
        result.put("placesEnAttentePaiement", enAttentePaiement);
        result.put("placesVerrouillees", verrouilles);
        result.put("placesLibres", libres);
        result.put("statutsSieges", statuts);
        return result;
    }

    @Transactional
    public Billet reserverBillet(ReservationRequest req) {
        Voyage voyage = voyageRepository.findById(req.getIdVoyage())
                .orElseThrow(() -> new ResourceNotFoundException("Voyage", "id", req.getIdVoyage()));

        if (req.getIdModePaiement() == null || req.getIdModePaiement().isBlank()) {
            throw new BusinessException("Choisissez un mode de paiement valide.");
        }
        ModePaiement mode = modePaiementRepository.findByCodeMode(req.getIdModePaiement())
                .or(() -> modePaiementRepository.findById(req.getIdModePaiement()))
                .orElseThrow(() -> new BusinessException("Choisissez un mode de paiement valide."));
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean clientEnLigne = authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_CLIENT".equals(authority.getAuthority()));
        ClotureCaisse sessionCaisse = null;
        if (clientEnLigne && !"MONETBIL".equals(mode.getCodeMode()))
            throw new BusinessException("Les réservations en ligne doivent être réglées par Monetbil.");
        boolean monetbil = "MONETBIL".equals(mode.getCodeMode());
        if (!monetbil) {
            if (req.getIdClotureCaisse() == null || req.getIdClotureCaisse().isBlank()) {
                throw new BusinessException("Ouvrez une session de caisse avant une vente en espèces.");
            }
            sessionCaisse = clotureCaisseRepository.findById(req.getIdClotureCaisse())
                    .orElseThrow(() -> new BusinessException("Session de caisse introuvable."));
            if (sessionCaisse.getHeureFermeture() != null || !sessionCaisse.getAgence().getIdAgence().equals(voyage.getAgence().getIdAgence())) {
                throw new BusinessException("La session de caisse est fermée ou appartient à une autre agence.");
            }
        }

        // Vérification capacité bus
        int maxPlaces = voyage.getBus() != null ? voyage.getBus().getNbPlaces() : 70;
        if (req.getNumSiege() < 1 || req.getNumSiege() > maxPlaces) {
            throw new BusinessException("Numéro de siège invalide. Ce bus a " + maxPlaces + " places.");
        }

        // The lock owner is checked before creating either a counter sale or an online reservation.
        verrouSiegeService.verifierVerrouPourReservation(req.getIdVoyage(), req.getNumSiege());

        // Vérification anti-surbooking
        boolean dejaOccupe = billetRepository.existsSiegeOccupe(req.getIdVoyage(), req.getNumSiege(), LocalDateTime.now().minusMinutes(10));
        if (dejaOccupe) {
            throw new BusinessException("Ce siège est déjà réservé pour ce départ.");
        }

        // Récupération de l'agent connecté
        Employe employe = null;
        Client client;
        if (clientEnLigne) {
            String subject = authentication.getName();
            String email = subject.startsWith("client:") ? subject.substring("client:".length()) : "";
            CompteClient compte = compteClientRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new BusinessException("Compte client connecté introuvable."));
            client = compte.getClient();
            if (!normaliserTelephone(client.getTelephone()).equals(normaliserTelephone(req.getTelephoneClient())))
                throw new BusinessException("Utilisez le téléphone associé à votre compte client.");
        } else {
            String login = authentication.getName();
            Utilisateur agent = utilisateurRepository.findByLogin(login)
                    .orElseThrow(() -> new BusinessException("Agent connecté non trouvé."));
            employe = agent.getEmploye();
            if (employe == null || employe.getAgence() == null
                    || !employe.getAgence().getIdAgence().equals(voyage.getAgence().getIdAgence()))
                throw new BusinessException("Vous ne pouvez vendre que sur les voyages rattachés à votre agence.");
            client = clientRepository.findByTelephone(req.getTelephoneClient())
                .orElseGet(() -> {
                    String idCli = "CLI-" + System.currentTimeMillis() % 1000000;
                    Client c = Client.builder()
                            .idClient(idCli)
                            .nom(req.getNomClient())
                            .prenom(req.getPrenomClient())
                            .telephone(req.getTelephoneClient())
                            .numeroCni(req.getCniClient())
                            .build();
                    return clientRepository.save(c);
                });
        }

        // Catégorie voyageur
        CategorieVoyageur cat = req.getIdCategorie() != null
                ? categorieVoyageurRepository.findById(req.getIdCategorie()).orElse(null)
                : null;
        if (cat == null) {
            cat = categorieVoyageurRepository.findAll().stream().findFirst().orElse(null);
        }

        String idBillet = "BLT-" + DateTimeFormatter.ofPattern("yyMMddHHmmss").format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 3).toUpperCase();
        String codeBillet = "GT-" + DateTimeFormatter.ofPattern("ddMM").format(LocalDateTime.now()) + "-" + req.getNumSiege() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        String codeReservation = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        // Calcul signature HMAC-SHA256 (Anti-contrefaçon Dr Berlin DJIONANG)
        String rawData = codeBillet + "|" + (client.getNumeroCni() != null ? client.getNumeroCni() : "N/A") + "|" + req.getNumSiege() + "|" + voyage.getDateHeureDepartPrevue();
        String hmac = calculerHmacSha256(rawData, ticketHmacSecret);

        VueVoyagesDisponibles voyageTarife = vueVoyagesRepo.findById(req.getIdVoyage())
                .orElseThrow(() -> new ResourceNotFoundException("Voyage disponible", "id", req.getIdVoyage()));
        BigDecimal prix = voyageTarife.getTarifBaseXaf();
        if (prix == null || prix.signum() <= 0) {
            throw new BusinessException("Aucun tarif actif n'est défini pour ce voyage.");
        }
        Promotion promotion = null;
        BigDecimal prixFinal = prix;
        if (req.getCodePromo() != null && !req.getCodePromo().isBlank()) {
            PromotionApplication application = promotionService.appliquerPromo(req.getCodePromo(), prix);
            promotion = application.promotion();
            prixFinal = application.prixFinalXaf();
            if (prixFinal.signum() <= 0) {
                throw new BusinessException("Cette remise couvre tout le billet. Contactez l’agence pour émettre un billet gratuit.");
            }
        }
        if (req.getMontantPaye() != null && req.getMontantPaye().compareTo(prixFinal) != 0) {
            throw new BusinessException("Le montant envoyé ne correspond pas au tarif enregistré.");
        }

        Billet billet = Billet.builder()
                .idBillet(idBillet)
                .client(client)
                .voyage(voyage)
                .categorieVoyageur(cat)
                .promotion(promotion)
                .employe(employe)
                .codeBillet(codeBillet)
                .codeReservation(codeReservation)
                .numSiege(req.getNumSiege())
                .typeBillet("ALLER_SIMPLE")
                .canalVente(clientEnLigne ? "EN_LIGNE" : "GUICHET")
                .dateEmission(LocalDateTime.now())
                .dateValidite(LocalDate.now())
                .prixAppliqueXaf(prixFinal)
                .estGratuit(false)
                .voyageParTiers(false)
                .copiePieceVerifiee(true)
                .signatureHmac(hmac)
                .statutBillet(monetbil ? "EN_ATTENTE_PAIEMENT" : "VALIDE")
                .build();

        Billet savedBillet = billetRepository.save(billet);

        // Les paiements mobiles restent en attente jusqu'à la notification signée Monetbil.
        if (!monetbil) {
            String idPaiement = "PAI-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
            Paiement paiement = Paiement.builder()
                    .idPaiement(idPaiement)
                    .modePaiement(mode)
                    .clotureCaisse(sessionCaisse)
                    .billet(savedBillet)
                    .referenceTransaction("TXN-" + System.currentTimeMillis())
                    .montantPayeXaf(prixFinal)
                    .datePaiement(LocalDateTime.now())
                    .statutPaiement("VALIDE")
                    .build();
            paiementRepository.save(paiement);
            fideliteService.incrementerCompteur(client.getIdClient());
        }

        return savedBillet;
    }

    @Transactional
    public Billet annulerBillet(String idBillet) {
        Billet billet = billetRepository.findById(idBillet)
                .orElseThrow(() -> new ResourceNotFoundException("Billet", "id", idBillet));

        if ("EMBARQUE".equals(billet.getStatutBillet())) {
            throw new BusinessException("Impossible d'annuler un billet déjà embarqué.");
        }
        if ("ANNULE".equals(billet.getStatutBillet())) {
            throw new BusinessException("Ce billet est déjà annulé.");
        }

        promotionService.annulerUtilisation(billet.getPromotion());
        billet.setStatutBillet("ANNULE");
        return billetRepository.save(billet);
    }

    public byte[] genererQrCode(String codeBillet) {
        try {
            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(codeBillet, BarcodeFormat.QR_CODE, 250, 250);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
            return outputStream.toByteArray();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("Erreur de génération du QR Code : " + e.getMessage());
        }
    }

    private String calculerHmacSha256(String data, String key) {
        try {
            if (key == null || key.getBytes(StandardCharsets.UTF_8).length < 32)
                throw new BusinessException("Configurez APP_TICKET_HMAC_SECRET avec au moins 32 caractères.");
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            byte[] hash = sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}

