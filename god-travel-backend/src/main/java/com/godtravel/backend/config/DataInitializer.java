package com.godtravel.backend.config;

import com.godtravel.backend.model.entity.*;
import com.godtravel.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    @Value("${app.bootstrap-admin-password:}")
    private String bootstrapAdminPassword;

    private final CompagnieRepository compagnieRepo;
    private final VilleRepository villeRepo;
    private final AgenceRepository agenceRepo;
    private final ClasseBusRepository classeBusRepo;
    private final BusRepository busRepo;
    private final ProfilRepository profilRepo;
    private final EmployeRepository employeRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final CategorieVoyageurRepository categorieRepo;
    private final ModePaiementRepository modePaiementRepo;
    private final LigneRepository ligneRepo;
    private final VoyageRepository voyageRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            initDefaultData();
        } catch (Exception e) {
            log.warn("Initialisation des données : {}", e.getMessage());
        }
    }

    private void initDefaultData() {
        // 1. Compagnie
        Compagnie compagnie = compagnieRepo.findById("CMP-001").orElseGet(() -> {
            Compagnie c = Compagnie.builder()
                    .idCompagnie("CMP-001")
                    .raisonSociale("United Express S.A.")
                    .sigle("UNITED")
                    .numContribuable("M059800012345Z")
                    .telephone("+237 222 22 22 22")
                    .emailContact("contact@unitedexpress.cm")
                    .cleHmacSecurite("A_CONFIGURER_AVANT_DEPLOIEMENT")
                    .statutActif(true)
                    .build();
            return compagnieRepo.save(c);
        });

        // 2. Villes
        Ville yde = villeRepo.findById("VIL-YDE").orElseGet(() ->
                villeRepo.save(Ville.builder().idVille("VIL-YDE").nomVille("Yaoundé").region("Centre").build()));
        Ville dla = villeRepo.findById("VIL-DLA").orElseGet(() ->
                villeRepo.save(Ville.builder().idVille("VIL-DLA").nomVille("Douala").region("Littoral").build()));

        // 3. Agences
        Agence agenceYde = agenceRepo.findById("AGC-001").orElseGet(() ->
                agenceRepo.save(Agence.builder()
                        .idAgence("AGC-001")
                        .compagnie(compagnie)
                        .ville(yde)
                        .nomAgence("Agence Mvan Yaoundé")
                        .codeAgence("YDE-MVAN")
                        .onduleurConforme(true)
                        .build()));

        Agence agenceDla = agenceRepo.findById("AGC-002").orElseGet(() ->
                agenceRepo.save(Agence.builder()
                        .idAgence("AGC-002")
                        .compagnie(compagnie)
                        .ville(dla)
                        .nomAgence("Agence Bépanda Douala")
                        .codeAgence("DLA-BEP")
                        .onduleurConforme(true)
                        .build()));

        // 4. Classes de Bus & Bus
        ClasseBus classeVip = classeBusRepo.findById("CLS-VIP").orElseGet(() ->
                classeBusRepo.save(ClasseBus.builder()
                        .idClasse("CLS-VIP")
                        .codeClasse("VIP")
                        .libelleClasse("VIP Climatise")
                        .equipementsInclus("Climatisation, WiFi, Siège inclinable, Prise USB")
                        .build()));

        busRepo.findById("BUS-001").orElseGet(() ->
                busRepo.save(Bus.builder()
                        .idBus("BUS-001")
                        .compagnie(compagnie)
                        .classeBus(classeVip)
                        .immatriculation("LT-542-AA")
                        .marque("Yutong")
                        .modele("ZK6122H")
                        .nbPlaces(70)
                        .anneeMiseService(2023)
                        .statutBus("DISPONIBLE")
                        .build()));

        // 5. Profils (RBAC)
        Profil profilAdmin = profilRepo.findById("PRF-ADMIN").orElseGet(() ->
                profilRepo.save(Profil.builder()
                        .idProfil("PRF-ADMIN")
                        .codeProfil("ROLE_ADMIN")
                        .libelleProfil("Administrateur Général")
                        .descriptionRoles("Accès total au système God Travel")
                        .build()));

        profilRepo.findById("PRF-GUICHET").orElseGet(() ->
                profilRepo.save(Profil.builder()
                        .idProfil("PRF-GUICHET")
                        .codeProfil("ROLE_GUICHETIER")
                        .libelleProfil("Guichetier")
                        .descriptionRoles("Vente et impression de billets, fret")
                        .build()));

        profilRepo.findById("PRF-CHEF").orElseGet(() ->
                profilRepo.save(Profil.builder()
                        .idProfil("PRF-CHEF")
                        .codeProfil("ROLE_CHEF_AGENCE")
                        .libelleProfil("Chef d'Agence")
                        .descriptionRoles("Clôture de caisse, supervision, gestion agence")
                        .build()));

        creerProfilSiAbsent("PRF-HOTESSE", "ROLE_HOTESSE", "Hôtesse", "Embarquement et contrôle des billets");
        creerProfilSiAbsent("PRF-CHAUFFEUR", "ROLE_CHAUFFEUR", "Chauffeur", "Suivi GPS et incidents de route");
        creerProfilSiAbsent("PRF-MECANO", "ROLE_MECANICIEN", "Mécanicien", "Flotte et interventions de maintenance");
        creerProfilSiAbsent("PRF-COMPTABLE", "ROLE_COMPTABLE", "Comptable", "Consultation des rapports financiers");

        // 6. Employé & Utilisateur Admin par défaut
        Employe empAdmin = employeRepo.findById("EMP-001").orElseGet(() ->
                employeRepo.save(Employe.builder()
                        .idEmploye("EMP-001")
                        .compagnie(compagnie)
                        .agence(agenceYde)
                        .matricule("EMP-ADMIN-01")
                        .nom("DJIONANG")
                        .prenom("Superviseur")
                        .numeroCni("100234567")
                        .telephone("+237 690 00 00 01")
                        .fonction("Directeur des Opérations")
                        .dateEmbauche(LocalDate.of(2024, 1, 1))
                        .statutEmploye("ACTIF")
                        .build()));

        if (!utilisateurRepo.existsByLogin("admin@godtravel.cm") && bootstrapAdminPassword != null && !bootstrapAdminPassword.isBlank()) {
            utilisateurRepo.save(Utilisateur.builder()
                    .idUtilisateur("USR-ADMIN-01")
                    .employe(empAdmin)
                    .profil(profilAdmin)
                    .login("admin@godtravel.cm")
                    .motDePasseHash(passwordEncoder.encode(bootstrapAdminPassword))
                    .estActif(true)
                    .build());
            log.info("Compte administrateur initial créé via APP_BOOTSTRAP_ADMIN_PASSWORD.");
        } else if (!utilisateurRepo.existsByLogin("admin@godtravel.cm")) {
            log.warn("Aucun administrateur initial créé : définissez APP_BOOTSTRAP_ADMIN_PASSWORD pour le premier démarrage.");
        }

        // 7. Modes de paiement
        modePaiementRepo.findById("MOD-ESP").orElseGet(() ->
                modePaiementRepo.save(ModePaiement.builder().idMode("MOD-ESP").codeMode("ESPECES").libelleMode("Espèces au Guichet").enLigne(false).build()));
        modePaiementRepo.findById("MOD-OM").orElseGet(() ->
                modePaiementRepo.save(ModePaiement.builder().idMode("MOD-OM").codeMode("ORANGE_MONEY").libelleMode("Orange Money Cameroun").enLigne(true).build()));
        modePaiementRepo.findById("MOD-MOMO").orElseGet(() ->
                modePaiementRepo.save(ModePaiement.builder().idMode("MOD-MOMO").codeMode("MTN_MOMO").libelleMode("MTN Mobile Money").enLigne(true).build()));
        modePaiementRepo.findById("MOD-MONETBIL").orElseGet(() ->
                modePaiementRepo.save(ModePaiement.builder().idMode("MOD-MONETBIL").codeMode("MONETBIL").libelleMode("Mobile Money via Monetbil").enLigne(true).build()));

        // 8. Catégorie voyageur
        categorieRepo.findById("CAT-ADULTE").orElseGet(() ->
                categorieRepo.save(CategorieVoyageur.builder().idCategorie("CAT-ADULTE").codeCategorie("ADULTE").libelleCategorie("Adulte Plein Tarif").ageMin(18).ageMax(99).build()));

        // 9. Ligne pilote Yaoundé - Douala
        Ligne ligneYdeDla = ligneRepo.findById("LGN-YDE-DLA").orElseGet(() ->
                ligneRepo.save(Ligne.builder()
                        .idLigne("LGN-YDE-DLA")
                        .villeDepart(yde)
                        .villeArrivee(dla)
                        .codeLigne("LIGNE-YDE-DLA")
                        .distanceKm(240)
                        .dureeEstimeeMin(210)
                        .build()));

        // 10. Voyage test pour aujourd'hui
        Bus bus = busRepo.findById("BUS-001").orElse(null);
        if (bus != null && voyageRepo.count() == 0) {
            voyageRepo.save(Voyage.builder()
                    .idVoyage("VOY-001")
                    .ligne(ligneYdeDla)
                    .bus(bus)
                    .agence(agenceYde)
                    .codeVoyage("VOY-YDE-DLA-14H")
                    .dateHeureDepartPrevue(LocalDateTime.now().plusHours(2))
                    .dateHeureArriveePrevue(LocalDateTime.now().plusHours(6))
                    .statutVoyage("OUVERT")
                    .build());
            log.info(">>> Voyage test créé : VOY-YDE-DLA-14H");
        }
    }

    private void creerProfilSiAbsent(String id, String code, String libelle, String droits) {
        profilRepo.findById(id).orElseGet(() -> profilRepo.save(Profil.builder()
                .idProfil(id)
                .codeProfil(code)
                .libelleProfil(libelle)
                .descriptionRoles(droits)
                .build()));
    }
}

