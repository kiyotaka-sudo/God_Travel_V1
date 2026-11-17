package com.godtravel.backend.service;

import com.godtravel.backend.exception.BusinessException;
import com.godtravel.backend.exception.ResourceNotFoundException;
import com.godtravel.backend.model.dto.maintenance.BusMaintenanceView;
import com.godtravel.backend.model.dto.maintenance.MaintenanceRequest;
import com.godtravel.backend.model.dto.maintenance.MaintenanceView;
import com.godtravel.backend.model.entity.Bus;
import com.godtravel.backend.model.entity.Employe;
import com.godtravel.backend.model.entity.Maintenance;
import com.godtravel.backend.model.entity.Utilisateur;
import com.godtravel.backend.repository.BusRepository;
import com.godtravel.backend.repository.MaintenanceRepository;
import com.godtravel.backend.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MaintenanceService {
    private final MaintenanceRepository maintenanceRepository;
    private final BusRepository busRepository;
    private final UtilisateurRepository utilisateurRepository;

    @Transactional(readOnly = true)
    public List<MaintenanceView> getInterventions() {
        Employe employee = currentEmployee();
        String companyId = employee.getCompagnie().getIdCompagnie();
        return maintenanceRepository.findByEmploye_Compagnie_IdCompagnieOrderByDateMaintenanceDesc(companyId)
                .stream().map(this::toView).toList();
    }

    @Transactional(readOnly = true)
    public List<BusMaintenanceView> getBus() {
        String companyId = currentEmployee().getCompagnie().getIdCompagnie();
        return busRepository.findAllByCompagnie_IdCompagnie(companyId).stream().map(bus -> BusMaintenanceView.builder()
                .idBus(bus.getIdBus()).immatriculation(bus.getImmatriculation()).marque(bus.getMarque())
                .modele(bus.getModele()).kilometrageTotal(bus.getKilometrageTotal()).build()).toList();
    }

    @Transactional
    public MaintenanceView creer(MaintenanceRequest request) {
        Employe employee = currentEmployee();
        Bus bus = busRepository.findById(request.getIdBus())
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", request.getIdBus()));
        if (!employee.getCompagnie().getIdCompagnie().equals(bus.getCompagnie().getIdCompagnie())) {
            throw new BusinessException("Ce bus n'appartient pas à votre compagnie.");
        }
        String id = "MNT-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        Maintenance saved = maintenanceRepository.save(Maintenance.builder().idMaintenance(id).bus(bus).employe(employee)
                .dateMaintenance(request.getDateMaintenance()).natureIntervention(request.getNatureIntervention().trim())
                .coutInterventionXaf(request.getCoutInterventionXaf()).kilometrageAuMoment(request.getKilometrageAuMoment())
                .observationsMecano(request.getObservationsMecano()).build());
        return toView(saved);
    }

    private Employe currentEmployee() {
        String login = SecurityContextHolder.getContext().getAuthentication().getName();
        Utilisateur user = utilisateurRepository.findByLogin(login)
                .orElseThrow(() -> new BusinessException("Compte connecté introuvable."));
        Employe employee = user.getEmploye();
        if (employee == null || employee.getCompagnie() == null) {
            throw new BusinessException("Votre compte n'est pas rattaché à une compagnie.");
        }
        return employee;
    }

    private MaintenanceView toView(Maintenance item) {
        Bus bus = item.getBus();
        return MaintenanceView.builder().idMaintenance(item.getIdMaintenance()).idBus(bus.getIdBus())
                .immatriculation(bus.getImmatriculation()).marque(bus.getMarque()).modele(bus.getModele())
                .natureIntervention(item.getNatureIntervention()).coutInterventionXaf(item.getCoutInterventionXaf())
                .kilometrageAuMoment(item.getKilometrageAuMoment()).dateMaintenance(item.getDateMaintenance())
                .mecanicien(item.getEmploye().getPrenom() + " " + item.getEmploye().getNom())
                .observationsMecano(item.getObservationsMecano()).build();
    }
}
