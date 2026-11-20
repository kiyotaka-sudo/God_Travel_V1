package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.colis.ColisCreationRequest;
import com.godtravel.backend.model.dto.colis.EstimationFretDto;
import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ColisService {

    private static final BigDecimal TARIF_BASE_XAF = new BigDecimal("500.00");
    private static final BigDecimal TARIF_KILO_XAF = new BigDecimal("150.00");
    private static final BigDecimal TAUX_ASSURANCE = new BigDecimal("0.01");

    private final ColisRepository colisRepository;
    private final ClientRepository clientRepository;
    private final AgenceRepository agenceRepository;
    private final VoyageRepository voyageRepository;
    private final UtilisateurRepository utilisateurRepository;

    public List<Colis> listerColis(String statut) {
        if (statut != null && !statut.isBlank()) {
            return colisRepository.findByStatutColis(statut);
        }
        return colisRepository.findAll();
    }

    public Colis getColisParCodeSuivi(String codeSuivi) {
        return colisRepository.findByCodeSuivi(codeSuivi)
                .orElseThrow(() -> new ResourceNotFoundException("Colis", "codeSuivi", codeSuivi));
    }

    public EstimationFretDto estimerTarif(BigDecimal poidsKg, BigDecimal valeurDeclaree) {
        if (poidsKg == null || poidsKg.compareTo(new BigDecimal("0.1")) < 0) {
            throw new BusinessException("Le poids minimum pour un colis est de 0,1 kg.");
        }
        if (poidsKg.precision() - poidsKg.scale() > 4 || poidsKg.scale() > 2) {
            throw new BusinessException("Le poids dépasse la capacité enregistrable du colis.");
        }
        BigDecimal valeur = valeurDeclaree == null ? BigDecimal.ZERO : valeurDeclaree;
        if (valeur.signum() < 0 || valeur.precision() - valeur.scale() > 10 || valeur.scale() > 2) {
            throw new BusinessException("La valeur déclarée doit être positive et ne pas dépasser 2 décimales.");
        }

        BigDecimal poids = poidsKg.setScale(2, RoundingMode.HALF_UP);
        BigDecimal base = TARIF_BASE_XAF;
        BigDecimal poidsXaf = poids.multiply(TARIF_KILO_XAF).setScale(2, RoundingMode.HALF_UP);
        BigDecimal assuranceXaf = valeur.multiply(TAUX_ASSURANCE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = base.add(poidsXaf).add(assuranceXaf).setScale(2, RoundingMode.HALF_UP);
        return new EstimationFretDto(poids, valeur.setScale(2, RoundingMode.HALF_UP), base, poidsXaf, assuranceXaf, total);
    }

    @Transactional
    public Colis enregistrerColis(ColisCreationRequest req) {
        Agence agenceRetrait = agenceRepository.findById(req.getIdAgenceRetrait())
                .orElseThrow(() -> new ResourceNotFoundException("Agence Retrait", "id", req.getIdAgenceRetrait()));

        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur agent = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException("Agent connecté non trouvé."));

        Employe employe = agent.getEmploye();
        Agence agenceDepot = employe != null ? employe.getAgence() : null;
        if (agenceDepot == null) {
            agenceDepot = agenceRepository.findAll().stream().findFirst()
                    .orElseThrow(() -> new BusinessException("Aucune agence trouvée."));
        }

        Client clientExpediteur = clientRepository.findByTelephone(req.getTelephoneExpediteur())
                .orElseGet(() -> {
                    String idCli = "CLI-" + System.currentTimeMillis() % 1000000;
                    Client c = Client.builder()
                            .idClient(idCli)
                            .nom(req.getNomExpediteur())
                            .telephone(req.getTelephoneExpediteur())
                            .build();
                    return clientRepository.save(c);
                });

        Voyage voyage = null;
        if (req.getIdVoyage() != null) {
            voyage = voyageRepository.findById(req.getIdVoyage()).orElse(null);
        }

        String idColis = "CLS-" + System.currentTimeMillis();
        String codeSuivi = "TRK-" + DateTimeFormatter.ofPattern("ddMM").format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        BigDecimal valeurDeclaree = req.getValeurDeclaree() != null ? req.getValeurDeclaree() : BigDecimal.ZERO;
        BigDecimal tarifCalcule = estimerTarif(req.getPoidsKg(), valeurDeclaree).totalXaf();

        Colis colis = Colis.builder()
                .idColis(idColis)
                .clientExpediteur(clientExpediteur)
                .agenceDepot(agenceDepot)
                .agenceRetrait(agenceRetrait)
                .voyage(voyage)
                .employe(employe)
                .codeSuivi(codeSuivi)
                .nomDestinataire(req.getNomDestinataire())
                .prenomDestinataire(req.getPrenomDestinataire())
                .telephoneDestinataire(req.getTelephoneDestinataire())
                .cniDestinataire(req.getCniDestinataire())
                .descriptionContenu(req.getDescriptionContenu())
                .poidsKg(req.getPoidsKg())
                .valeurDeclareeXaf(valeurDeclaree)
                .fraisExpeditionXaf(tarifCalcule)
                .dateEnregistrement(LocalDateTime.now())
                .statutColis("ENREGISTRE")
                .build();

        return colisRepository.save(colis);
    }

    @Transactional
    public Colis remettreColis(String idColis, String cniDestinataire) {
        Colis colis = colisRepository.findById(idColis)
                .orElseThrow(() -> new ResourceNotFoundException("Colis", "id", idColis));

        if ("LIVRE".equals(colis.getStatutColis())) {
            throw new BusinessException("Ce colis a déjà été retiré.");
        }

        colis.setCniDestinataire(cniDestinataire);
        colis.setDateRemise(LocalDateTime.now());
        colis.setStatutColis("LIVRE");

        return colisRepository.save(colis);
    }
}

