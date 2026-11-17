package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.colis.ColisCreationRequest;
import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ColisService {

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

        String idColis = "CLS-" + DateTimeFormatter.ofPattern("yyMMddHHmmss").format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String codeSuivi = "TRK-" + DateTimeFormatter.ofPattern("ddMM").format(LocalDateTime.now()) + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

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
                .valeurDeclareeXaf(req.getValeurDeclaree() != null ? req.getValeurDeclaree() : java.math.BigDecimal.ZERO)
                .fraisExpeditionXaf(req.getFraisExpedition())
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

