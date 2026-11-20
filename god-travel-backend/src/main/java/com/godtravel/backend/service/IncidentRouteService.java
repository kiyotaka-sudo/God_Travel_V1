package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.equipage.IncidentRouteRequest;
import com.godtravel.backend.model.dto.equipage.IncidentRouteView;
import com.godtravel.backend.model.entity.IncidentRoute;
import com.godtravel.backend.model.entity.Voyage;
import com.godtravel.backend.repository.AffecterEquipageRepository;
import com.godtravel.backend.repository.IncidentRouteRepository;
import com.godtravel.backend.repository.UtilisateurRepository;
import com.godtravel.backend.repository.VoyageRepository;
import com.godtravel.backend.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IncidentRouteService {

    private static final ZoneId ZONE_CAMEROUN = ZoneId.of("Africa/Douala");
    private static final Set<String> TYPES_AUTORISES = Set.of(
            "CREVAISON", "PANNE_MOTEUR", "EMBARRAS_CIRCULATION", "ACCIDENT", "CONTROLE");

    private final IncidentRouteRepository incidentRepository;
    private final VoyageRepository voyageRepository;
    private final AffecterEquipageRepository affectationRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional
    public IncidentRouteView declarer(IncidentRouteRequest request) {
        Voyage voyage = voyageRepository.findById(request.idVoyage())
                .orElseThrow(() -> new ResourceNotFoundException("Voyage", "id", request.idVoyage()));
        if (!"EN_COURS".equalsIgnoreCase(voyage.getStatutVoyage())) {
            throw new BusinessException("Un incident ne peut être déclaré que sur un voyage en cours.");
        }
        verifierAcces(voyage);

        String type = request.typeIncident().trim().toUpperCase();
        if (!TYPES_AUTORISES.contains(type)) {
            throw new BusinessException("Le type d’incident sélectionné n’est pas reconnu.");
        }
        String description = request.descriptionDetaillee().trim();
        if (description.isEmpty() || description.length() > 255) {
            throw new BusinessException("La description doit contenir entre 1 et 255 caractères.");
        }
        if (request.tempsRetardEstimeMin() == null || request.tempsRetardEstimeMin() < 0) {
            throw new BusinessException("Le retard estimé ne peut pas être négatif.");
        }

        IncidentRoute incident = IncidentRoute.builder()
                .idIncident("INC-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase())
                .voyage(voyage)
                .dateHeureIncident(LocalDateTime.now(ZONE_CAMEROUN))
                .typeIncident(type)
                .descriptionDetaillee(description)
                .tempsRetardEstimeMin(request.tempsRetardEstimeMin())
                .build();
        return toView(incidentRepository.save(incident));
    }

    @Transactional(readOnly = true)
    public List<IncidentRouteView> getIncidents(String idVoyage) {
        Voyage voyage = voyageRepository.findById(idVoyage)
                .orElseThrow(() -> new ResourceNotFoundException("Voyage", "id", idVoyage));
        verifierAcces(voyage);
        return incidentRepository.findByVoyage_IdVoyageOrderByDateHeureIncidentDesc(idVoyage)
                .stream().map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public List<IncidentRouteView> getIncidentsJour() {
        LocalDate today = LocalDate.now(ZONE_CAMEROUN);
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();
        String agenceId = isAdmin() ? null : currentAgenceId();
        return incidentRepository.findByDateHeureIncidentGreaterThanEqualAndDateHeureIncidentLessThanOrderByDateHeureIncidentDesc(start, end).stream()
                .filter(incident -> agenceId == null || incident.getVoyage().getAgence() != null
                        && agenceId.equals(incident.getVoyage().getAgence().getIdAgence()))
                .map(this::toView)
                .toList();
    }

    private void verifierAcces(Voyage voyage) {
        if (isAdmin()) return;
        Authentication authentication = currentAuthentication();
        if (hasRole(authentication, "ROLE_CHAUFFEUR")) {
            CustomUserDetails details = userDetails(authentication);
            String employeeId = utilisateurRepository.findById(details.getId())
                    .map(user -> user.getEmploye() == null ? null : user.getEmploye().getIdEmploye())
                    .orElse(null);
            if (employeeId == null || !affectationRepository.estChauffeurAffecte(voyage.getIdVoyage(), employeeId)) {
                throw new BusinessException("Vous n’êtes pas affecté comme chauffeur à ce voyage.");
            }
            return;
        }
        String agenceId = currentAgenceId();
        if (voyage.getAgence() == null || !agenceId.equals(voyage.getAgence().getIdAgence())) {
            throw new BusinessException("Ce voyage ne relève pas de votre agence.");
        }
    }

    private IncidentRouteView toView(IncidentRoute incident) {
        Voyage voyage = incident.getVoyage();
        return new IncidentRouteView(incident.getIdIncident(), voyage.getIdVoyage(), voyage.getCodeVoyage(),
                incident.getDateHeureIncident(), incident.getTypeIncident(), incident.getDescriptionDetaillee(),
                incident.getTempsRetardEstimeMin(), voyage.getLigne().getVilleDepart().getNomVille(),
                voyage.getLigne().getVilleArrivee().getNomVille());
    }

    private boolean isAdmin() {
        return hasRole(currentAuthentication(), "ROLE_ADMIN");
    }

    private String currentAgenceId() {
        String id = userDetails(currentAuthentication()).getAgenceId();
        if (id == null || id.isBlank()) throw new BusinessException("Votre compte n’est pas rattaché à une agence.");
        return id;
    }

    private CustomUserDetails userDetails(Authentication authentication) {
        if (authentication.getPrincipal() instanceof CustomUserDetails details) return details;
        throw new BusinessException("Impossible d’identifier le compte connecté.");
    }

    private Authentication currentAuthentication() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BusinessException("Connectez-vous pour accéder aux incidents de route.");
        }
        return authentication;
    }

    private boolean hasRole(Authentication authentication, String authority) {
        return authentication.getAuthorities().stream().anyMatch(item -> authority.equals(item.getAuthority()));
    }
}
