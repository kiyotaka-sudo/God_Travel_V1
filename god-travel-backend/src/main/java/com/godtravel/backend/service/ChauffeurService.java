package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.model.dto.equipage.FeuilleRouteChauffeurView;
import com.godtravel.backend.model.entity.AffecterEquipage;
import com.godtravel.backend.model.entity.Employe;
import com.godtravel.backend.model.entity.Utilisateur;
import com.godtravel.backend.repository.AffecterEquipageRepository;
import com.godtravel.backend.repository.BilletRepository;
import com.godtravel.backend.repository.ChauffeurRepository;
import com.godtravel.backend.repository.UtilisateurRepository;
import com.godtravel.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChauffeurService {

    private static final ZoneId ZONE_CAMEROUN = ZoneId.of("Africa/Douala");

    private final UtilisateurRepository utilisateurRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final AffecterEquipageRepository affectationRepository;
    private final BilletRepository billetRepository;

    @Transactional(readOnly = true)
    public FeuilleRouteChauffeurView getMonTrajet() {
        CustomUserDetails details = currentUserDetails();
        Utilisateur user = utilisateurRepository.findById(details.getId())
                .orElseThrow(() -> new BusinessException("Compte chauffeur introuvable."));
        Employe employee = user.getEmploye();
        if (employee == null) throw new BusinessException("Aucun employé n’est rattaché à ce compte.");

        var chauffeur = chauffeurRepository.findByEmploye_IdEmploye(employee.getIdEmploye())
                .orElseThrow(() -> new BusinessException("Aucun dossier chauffeur n’est associé à ce compte."));
        if (chauffeur.getDateExpirationPermis() == null || chauffeur.getDateExpirationPermis().isBefore(LocalDate.now(ZONE_CAMEROUN))) {
            throw new BusinessException("Votre permis de conduire est expiré. Contactez votre agence.");
        }

        LocalDate today = LocalDate.now(ZONE_CAMEROUN);
        List<AffecterEquipage> assignments = affectationRepository.findTrajetsChauffeurDuJour(
                employee.getIdEmploye(), today.atStartOfDay(), today.plusDays(1).atStartOfDay());
        LocalDateTime now = LocalDateTime.now(ZONE_CAMEROUN);
        AffecterEquipage selected = assignments.stream()
                .filter(item -> List.of("PROGRAMME", "EN_COURS").contains(item.getVoyage().getStatutVoyage()))
                .min(Comparator
                        .comparingInt((AffecterEquipage item) -> "EN_COURS".equals(item.getVoyage().getStatutVoyage()) ? 0
                                : item.getVoyage().getDateHeureDepartPrevue().isBefore(now) ? 2 : 1)
                        .thenComparing(item -> item.getVoyage().getDateHeureDepartPrevue()))
                .orElseThrow(() -> new BusinessException("Aucun trajet ne vous est affecté aujourd’hui."));

        var trip = selected.getVoyage();
        return new FeuilleRouteChauffeurView(trip.getIdVoyage(), trip.getCodeVoyage(), trip.getStatutVoyage(),
                trip.getDateHeureDepartPrevue(), trip.getDateHeureArriveePrevue(), trip.getLigne().getCodeLigne(),
                trip.getLigne().getVilleDepart().getNomVille(), trip.getLigne().getVilleArrivee().getNomVille(),
                trip.getBus().getImmatriculation(), trip.getBus().getClasseBus().getLibelleClasse(),
                selected.getRoleVoyage().getLibelleRole(), billetRepository.countPassagersPrevus(trip.getIdVoyage()));
    }

    private CustomUserDetails currentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails details)) {
            throw new BusinessException("Impossible d’identifier le chauffeur connecté.");
        }
        return details;
    }
}
