package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.model.entity.Billet;
import com.godtravel.backend.model.entity.Embarquement;
import com.godtravel.backend.model.entity.Employe;
import com.godtravel.backend.model.entity.view.VueEmbarquementPassagers;
import com.godtravel.backend.repository.BilletRepository;
import com.godtravel.backend.repository.EmbarquementRepository;
import com.godtravel.backend.repository.EmployeRepository;
import com.godtravel.backend.repository.VueEmbarquementPassagersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmbarquementService {

    private final BilletRepository billetRepository;
    private final EmbarquementRepository embarquementRepository;
    private final EmployeRepository employeRepository;
    private final VueEmbarquementPassagersRepository manifesteRepository;

    @Value("${app.ticket-hmac-secret:}")
    private String ticketHmacSecret;

    @Transactional(readOnly = true)
    public List<VueEmbarquementPassagers> getManifeste(String idVoyage) {
        return manifesteRepository.findByIdVoyage(idVoyage).stream()
                .sorted(Comparator.comparing(
                        VueEmbarquementPassagers::getNumSiege,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .toList();
    }

    @Transactional
    public Embarquement validerEmbarquement(String codeBillet, String idEmploye, String terminalScan) {
        String normalizedCode = codeBillet == null ? "" : codeBillet.trim();
        Billet billet = billetRepository.findByCodeBillet(normalizedCode)
                .orElseThrow(() -> new BusinessException("Billet introuvable."));

        // Priorité au doublon pour fournir le message adapté même si le billet est déjà EMBARQUE.
        if (embarquementRepository.existsByBillet_IdBillet(billet.getIdBillet())) {
            throw new BusinessException("Ce billet a déjà été scanné.");
        }
        if (!"VALIDE".equals(billet.getStatutBillet())) {
            throw new BusinessException("Ce billet ne peut pas être embarqué (statut actuel : "
                    + billet.getStatutBillet() + ").");
        }

        Employe employe = employeRepository.findById(idEmploye)
                .orElseThrow(() -> new BusinessException("Employé connecté introuvable."));
        boolean conforme = verifierSignature(billet);

        Embarquement embarquement = Embarquement.builder()
                .idEmbarquement("EMB-" + java.util.UUID.randomUUID().toString().replace("-", "")
                        .substring(0, 16).toUpperCase())
                .billet(billet)
                .employe(employe)
                .dateHeureScan(LocalDateTime.now())
                .terminalScan(terminalScan == null || terminalScan.isBlank() ? null : terminalScan.trim())
                .estConforme(conforme)
                .build();

        if (conforme) {
            billet.setStatutBillet("EMBARQUE");
            billetRepository.save(billet);
        }
        // Une signature incorrecte est consignée comme tentative non conforme, sans embarquer le billet.
        return embarquementRepository.save(embarquement);
    }

    private boolean verifierSignature(Billet billet) {
        if (ticketHmacSecret == null || ticketHmacSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new BusinessException("Configurez APP_TICKET_HMAC_SECRET avec au moins 32 caractères.");
        }

        try {
            String numeroCni = billet.getClient().getNumeroCni() == null
                    ? "N/A"
                    : billet.getClient().getNumeroCni();
            String departPrevu = billet.getVoyage().getDateHeureDepartPrevue().toString();
            String payload = billet.getCodeBillet() + "|" + numeroCni + "|"
                    + billet.getNumSiege() + "|" + departPrevu;

            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec key = new SecretKeySpec(ticketHmacSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            hmac.init(key);
            byte[] expected = HexFormat.of().formatHex(hmac.doFinal(payload.getBytes(StandardCharsets.UTF_8)))
                    .getBytes(StandardCharsets.UTF_8);
            byte[] actual = billet.getSignatureHmac() == null
                    ? new byte[0]
                    : billet.getSignatureHmac().getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(expected, actual);
        } catch (BusinessException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new BusinessException("Impossible de vérifier la signature du billet.");
        }
    }
}
