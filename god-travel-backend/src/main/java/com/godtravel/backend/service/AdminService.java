package com.godtravel.backend.service;

import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.model.dto.admin.CreerUtilisateurRequest;
import com.godtravel.backend.model.dto.admin.UtilisateurAdminView;
import com.godtravel.backend.repository.*;
import com.godtravel.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CompagnieRepository compagnieRepository;
    private final AgenceRepository agenceRepository;
    private final VilleRepository villeRepository;
    private final LigneRepository ligneRepository;
    private final BusRepository busRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final BilletRepository billetRepository;
    private final ColisRepository colisRepository;
    private final VoyageRepository voyageRepository;
    private final EmployeRepository employeRepository;
    private final ProfilRepository profilRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Compagnie> getCompagnies() {
        return compagnieRepository.findAll();
    }

    public List<Agence> getAgences() {
        return agenceRepository.findAll();
    }

    public List<Ville> getVilles() {
        return villeRepository.findAll();
    }

    public List<Ligne> getLignes() {
        return ligneRepository.findAll();
    }

    public List<Bus> getBus() {
        return busRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<UtilisateurAdminView> getUtilisateurs() {
        return utilisateurRepository.findAll().stream().map(user -> UtilisateurAdminView.builder()
                .idUtilisateur(user.getIdUtilisateur())
                .login(user.getLogin())
                .nomComplet(user.getEmploye().getPrenom() + " " + user.getEmploye().getNom())
                .role(user.getProfil().getCodeProfil())
                .agence(user.getEmploye().getAgence().getNomAgence())
                .actif(Boolean.TRUE.equals(user.getEstActif()))
                .build()).toList();
    }

    @Transactional
    public UtilisateurAdminView creerUtilisateur(CreerUtilisateurRequest request) {
        String login = request.getLogin().trim().toLowerCase();
        if (utilisateurRepository.existsByLogin(login)) {
            throw new BusinessException("Un compte utilise déjà cette adresse e-mail.");
        }
        if (employeRepository.findByNumeroCni(request.getNumeroCni().trim()).isPresent()) {
            throw new BusinessException("Un dossier employé utilise déjà ce numéro CNI.");
        }

        Agence agence = agenceRepository.findById(request.getIdAgence())
                .orElseThrow(() -> new BusinessException("Agence introuvable."));
        Profil profil = profilRepository.findByCodeProfil(request.getCodeProfil())
                .orElseThrow(() -> new BusinessException("Profil d'accès invalide."));

        String suffix = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        Employe employe = employeRepository.save(Employe.builder()
                .idEmploye("EMP-" + suffix)
                .compagnie(agence.getCompagnie())
                .agence(agence)
                .matricule("GT-" + suffix)
                .prenom(request.getPrenom().trim())
                .nom(request.getNom().trim())
                .numeroCni(request.getNumeroCni().trim())
                .telephone(request.getTelephone().trim())
                .fonction(request.getFonction().trim())
                .dateEmbauche(LocalDate.now())
                .statutEmploye("ACTIF")
                .build());

        Utilisateur utilisateur = utilisateurRepository.save(Utilisateur.builder()
                .idUtilisateur("USR-" + suffix)
                .employe(employe)
                .profil(profil)
                .login(login)
                .motDePasseHash(passwordEncoder.encode(request.getMotDePasse()))
                .estActif(true)
                .build());

        return UtilisateurAdminView.builder()
                .idUtilisateur(utilisateur.getIdUtilisateur())
                .login(utilisateur.getLogin())
                .nomComplet(employe.getPrenom() + " " + employe.getNom())
                .role(profil.getCodeProfil())
                .agence(agence.getNomAgence())
                .actif(true)
                .build();
    }

    public List<Profil> getProfils() { return profilRepository.findAll(); }

    public Map<String, Object> getDashboardStats() {
        long totalVoyages = voyageRepository.count();
        long totalBillets = billetRepository.count();
        long totalColis = colisRepository.count();
        long totalBus = busRepository.count();

        BigDecimal caTotalBillets = billetRepository.findAll().stream()
                .filter(b -> "VALIDE".equals(b.getStatutBillet()) || "EMBARQUE".equals(b.getStatutBillet()))
                .map(Billet::getPrixAppliqueXaf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal caTotalColis = colisRepository.findAll().stream()
                .map(Colis::getFraisExpeditionXaf)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalVoyages", totalVoyages);
        stats.put("totalBilletsVendus", totalBillets);
        stats.put("totalColisTraites", totalColis);
        stats.put("totalBusFlotte", totalBus);
        stats.put("chiffreAffairesBilletterie", caTotalBillets);
        stats.put("chiffreAffairesFret", caTotalColis);
        stats.put("chiffreAffairesGlobal", caTotalBillets.add(caTotalColis));
        return stats;
    }
}

