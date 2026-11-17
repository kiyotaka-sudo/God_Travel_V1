package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.model.dto.caisse.CaisseTransactionView;
import com.godtravel.backend.model.entity.view.VueReleveCaisseJournalier;
import com.godtravel.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CaisseService {

    private final ClotureCaisseRepository clotureCaisseRepository;
    private final PaiementRepository paiementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final AgenceRepository agenceRepository;
    private final VueReleveCaisseJournalierRepository vueReleveCaisseRepo;

    public List<VueReleveCaisseJournalier> getRelevesJournaliers() {
        return vueReleveCaisseRepo.findAll();
    }

    public ClotureCaisse getSessionActiveAgent() {
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur agent = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException("Agent connecté non trouvé."));
        if (agent.getEmploye() == null || agent.getEmploye().getAgence() == null) {
            throw new BusinessException("L'agent connecté n'est rattaché à aucune agence.");
        }
        return clotureCaisseRepository.findByAgence_IdAgenceAndDateClotureAndHeureFermetureIsNull(
                agent.getEmploye().getAgence().getIdAgence(), LocalDate.now()).orElse(null);
    }

    public BigDecimal getTotalSession(String idCloture) {
        return paiementsValides(idCloture).stream().map(Paiement::getMontantPayeXaf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional(readOnly = true)
    public List<CaisseTransactionView> getTransactionsSession(String idCloture) {
        verifierSessionDeAgence(idCloture);
        return paiementRepository.findByClotureCaisse_IdCloture(idCloture).stream()
                .map(paiement -> CaisseTransactionView.builder()
                        .reference(paiement.getReferenceTransaction())
                        .libelle(paiement.getBillet() != null
                                ? "Billet " + paiement.getBillet().getCodeBillet()
                                : paiement.getColis() != null ? "Colis " + paiement.getColis().getCodeSuivi() : "Encaissement")
                        .mode(paiement.getModePaiement().getLibelleMode())
                        .montantXaf(paiement.getMontantPayeXaf())
                        .statut(paiement.getStatutPaiement())
                        .datePaiement(paiement.getDatePaiement())
                        .build()).toList();
    }

    private List<Paiement> paiementsValides(String idCloture) {
        return paiementRepository.findByClotureCaisse_IdCloture(idCloture).stream()
                .filter(paiement -> "VALIDE".equals(paiement.getStatutPaiement())).toList();
    }

    private void verifierSessionDeAgence(String idCloture) {
        ClotureCaisse session = clotureCaisseRepository.findById(idCloture)
                .orElseThrow(() -> new ResourceNotFoundException("Session caisse", "id", idCloture));
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur user = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException("Agent connecté non trouvé."));
        if (user.getEmploye() == null || user.getEmploye().getAgence() == null
                || !session.getAgence().getIdAgence().equals(user.getEmploye().getAgence().getIdAgence())) {
            throw new BusinessException("Cette session ne dépend pas de votre agence.");
        }
    }

    @Transactional
    public ClotureCaisse ouvrirCaisse() {
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur agent = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException("Agent connecté non trouvé."));

        Employe guichetier = agent.getEmploye();
        if (guichetier == null || guichetier.getAgence() == null) {
            throw new BusinessException("L'agent connecté n'est rattaché à aucune agence.");
        }

        Agence agence = guichetier.getAgence();
        LocalDate today = LocalDate.now();

        // Vérifier si une session est déjà ouverte
        boolean dejaOuverte = clotureCaisseRepository
                .findByAgence_IdAgenceAndDateClotureAndHeureFermetureIsNull(agence.getIdAgence(), today)
                .isPresent();

        if (dejaOuverte) {
            throw new BusinessException("Une session de caisse est déjà ouverte pour aujourd'hui.");
        }

        String idCloture = "CLS-CAISSE-" + System.currentTimeMillis();
        ClotureCaisse session = ClotureCaisse.builder()
                .idCloture(idCloture)
                .agence(agence)
                .employeGuichetier(guichetier)
                .dateCloture(today)
                .heureOuverture(LocalTime.now())
                .montantTheoriqueXaf(BigDecimal.ZERO)
                .build();

        return clotureCaisseRepository.save(session);
    }

    @Transactional
    public ClotureCaisse cloturerCaisse(String idCloture, BigDecimal montantPhysique, String observations) {
        verifierSessionDeAgence(idCloture);
        ClotureCaisse cloture = clotureCaisseRepository.findById(idCloture)
                .orElseThrow(() -> new ResourceNotFoundException("ClotureCaisse", "id", idCloture));

        if (cloture.getHeureFermeture() != null) {
            throw new BusinessException("Cette session est déjà clôturée.");
        }

        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur agent = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException("Agent connecté non trouvé."));

        // Calculer le total théorique des paiements encaissés
        BigDecimal totalTheorique = getTotalSession(idCloture);

        BigDecimal physique = montantPhysique != null ? montantPhysique : totalTheorique;
        BigDecimal ecart = physique.subtract(totalTheorique);

        cloture.setEmployeChef(agent.getEmploye());
        cloture.setHeureFermeture(LocalTime.now());
        cloture.setMontantTheoriqueXaf(totalTheorique);
        cloture.setMontantCompteXaf(physique);
        cloture.setEcartConstateXaf(ecart);
        cloture.setObservationCloture(observations);

        return clotureCaisseRepository.save(cloture);
    }
}
