package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.equipage.AffecterEquipageView;
import com.godtravel.backend.model.dto.equipage.EmployeEquipageView;
import com.godtravel.backend.model.dto.equipage.VoyageEquipageView;
import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.repository.*;
import com.godtravel.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EquipageService {

    private static final ZoneId ZONE_CAMEROUN = ZoneId.of("Africa/Douala");

    private final AffecterEquipageRepository affectationRepository;
    private final RoleVoyageRepository roleRepository;
    private final EmployeRepository employeRepository;
    private final ChauffeurRepository chauffeurRepository;
    private final VoyageRepository voyageRepository;

    @Transactional(readOnly = true)
    public List<AffecterEquipageView> getEquipage(String idVoyage) {
        Voyage voyage = getVoyage(idVoyage);
        verifierAgence(voyage);
        return affectationRepository.findByVoyage_IdVoyage(idVoyage).stream().map(this::toView).toList();
    }

    @Transactional
    public AffecterEquipageView affecterMembre(String idVoyage, String idEmploye, String codeRole, String observations) {
        Voyage voyage = getVoyage(idVoyage);
        verifierVoyageProgrammable(voyage);
        verifierAgence(voyage);

        Employe employe = employeRepository.findById(idEmploye)
                .orElseThrow(() -> new ResourceNotFoundException("Employé", "id", idEmploye));
        if (!"ACTIF".equalsIgnoreCase(employe.getStatutEmploye())) {
            throw new BusinessException("Seuls les employés actifs peuvent être affectés à un voyage.");
        }
        if (employe.getAgence() == null || voyage.getAgence() == null
                || !employe.getAgence().getIdAgence().equals(voyage.getAgence().getIdAgence())) {
            throw new BusinessException("L’employé et le voyage doivent dépendre de la même agence.");
        }

        RoleVoyage role = roleRepository.findByCodeRole(codeRole == null ? "" : codeRole.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Rôle de voyage", "code", codeRole));
        if (role.getCodeRole().startsWith("CHAUFFEUR_")) {
            Chauffeur chauffeur = chauffeurRepository.findByEmploye_IdEmploye(idEmploye)
                    .orElseThrow(() -> new BusinessException("Cet employé n’a pas de dossier chauffeur valide."));
            if (chauffeur.getDateExpirationPermis() == null || chauffeur.getDateExpirationPermis().isBefore(LocalDate.now(ZONE_CAMEROUN))) {
                throw new BusinessException("Le permis de conduire de cet employé est expiré.");
            }
        }
        if (affectationRepository.existsByVoyage_IdVoyageAndEmploye_IdEmploye(idVoyage, idEmploye)) {
            throw new BusinessException("Cet employé fait déjà partie de l’équipage de ce voyage.");
        }

        AffecterEquipage affectation = AffecterEquipage.builder()
                .voyage(voyage)
                .employe(employe)
                .roleVoyage(role)
                .dateHeurePriseService(LocalDateTime.now(ZONE_CAMEROUN))
                .observations(observations == null || observations.isBlank() ? null : observations.trim())
                .build();
        try {
            return toView(affectationRepository.saveAndFlush(affectation));
        } catch (DataIntegrityViolationException exception) {
            throw new BusinessException("L’affectation existe déjà ou ne respecte plus les contraintes de la base.");
        }
    }

    @Transactional
    public void retirerMembre(String idVoyage, String idEmploye) {
        Voyage voyage = getVoyage(idVoyage);
        verifierAgence(voyage);
        AffecterEquipageId id = new AffecterEquipageId(idVoyage, idEmploye);
        AffecterEquipage affectation = affectationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Affectation d’équipage", "employé", idEmploye));
        affectationRepository.delete(affectation);
    }

    @Transactional(readOnly = true)
    public List<RoleVoyage> getRoles() {
        return roleRepository.findAll().stream().sorted((left, right) -> left.getLibelleRole().compareToIgnoreCase(right.getLibelleRole())).toList();
    }

    @Transactional(readOnly = true)
    public List<EmployeEquipageView> getEmployes() {
        String agenceId = currentAgenceId();
        return employeRepository.findByStatutEmploye("ACTIF").stream()
                .filter(employee -> agenceId == null || employee.getAgence() != null && agenceId.equals(employee.getAgence().getIdAgence()))
                .sorted((left, right) -> left.getNom().compareToIgnoreCase(right.getNom()))
                .map(employee -> new EmployeEquipageView(employee.getIdEmploye(), employee.getMatricule(),
                        String.join(" ", List.of(employee.getPrenom() == null ? "" : employee.getPrenom(), employee.getNom()).stream().filter(value -> !value.isBlank()).toList()),
                        employee.getFonction()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VoyageEquipageView> getVoyagesAffectables() {
        LocalDate today = LocalDate.now(ZONE_CAMEROUN);
        LocalDateTime debut = today.atStartOfDay();
        LocalDateTime fin = today.plusDays(8).atStartOfDay();
        String agenceId = currentAgenceId();
        return voyageRepository.findByStatutVoyageAndDateHeureDepartPrevueGreaterThanEqualAndDateHeureDepartPrevueLessThanOrderByDateHeureDepartPrevueAsc(
                        "PROGRAMME", debut, fin).stream()
                .filter(trip -> agenceId == null || trip.getAgence() != null && agenceId.equals(trip.getAgence().getIdAgence()))
                .map(this::toVoyageView)
                .toList();
    }

    private Voyage getVoyage(String idVoyage) {
        return voyageRepository.findById(idVoyage)
                .orElseThrow(() -> new ResourceNotFoundException("Voyage", "id", idVoyage));
    }

    private void verifierVoyageProgrammable(Voyage voyage) {
        if (!"PROGRAMME".equalsIgnoreCase(voyage.getStatutVoyage())) {
            throw new BusinessException("L’équipage ne peut être modifié que pour un voyage programmé.");
        }
    }

    private void verifierAgence(Voyage voyage) {
        String agenceId = currentAgenceId();
        if (agenceId != null && (voyage.getAgence() == null || !agenceId.equals(voyage.getAgence().getIdAgence()))) {
            throw new BusinessException("Ce voyage ne relève pas de votre agence.");
        }
    }

    private String currentAgenceId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getAuthority()))) {
            return null;
        }
        Object principal = authentication == null ? null : authentication.getPrincipal();
        if (principal instanceof CustomUserDetails details && details.getAgenceId() != null && !details.getAgenceId().isBlank()) {
            return details.getAgenceId();
        }
        throw new BusinessException("L’utilisateur connecté n’est pas rattaché à une agence.");
    }

    private AffecterEquipageView toView(AffecterEquipage assignment) {
        Employe employee = assignment.getEmploye();
        return new AffecterEquipageView(
                assignment.getVoyage().getIdVoyage(), employee.getIdEmploye(), employee.getMatricule(),
                String.join(" ", List.of(employee.getPrenom() == null ? "" : employee.getPrenom(), employee.getNom()).stream().filter(value -> !value.isBlank()).toList()),
                employee.getFonction(), assignment.getRoleVoyage().getCodeRole(), assignment.getRoleVoyage().getLibelleRole(),
                assignment.getDateHeurePriseService(), assignment.getObservations()
        );
    }

    private VoyageEquipageView toVoyageView(Voyage voyage) {
        Ligne ligne = voyage.getLigne();
        return new VoyageEquipageView(voyage.getIdVoyage(), voyage.getCodeVoyage(), voyage.getDateHeureDepartPrevue(),
                voyage.getStatutVoyage(), ligne.getCodeLigne(), ligne.getVilleDepart().getNomVille(),
                ligne.getVilleArrivee().getNomVille(), voyage.getBus().getImmatriculation());
    }
}
