-- =============================================================================
-- GOD TRAVEL — JEU DE DONNÉES ENRICHI DU TERRITOIRE CAMEROUNAIS
-- Conforme : Villes, Agences, Lignes, Tarifs XAF, Bus, Voyages, GPS, Colis
-- =============================================================================

USE `god_travel_41`;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- 1. VILLES DU CAMEROUN (Grandes métropoles et carrefours de transport)
-- -----------------------------------------------------------------------------
INSERT INTO `VILLE` (`ID_VILLE`, `NOM_VILLE`, `REGION`) VALUES
('VIL-YDE',  'Yaoundé',     'Centre'),
('VIL-DLA',  'Douala',      'Littoral'),
('VIL-EDEA', 'Édéa',        'Littoral'),
('VIL-BOU',  'Boumnyébel',  'Centre'),
('VIL-BFM',  'Bafoussam',   'Ouest'),
('VIL-KRB',  'Kribi',       'Sud'),
('VIL-BDA',  'Bamenda',     'Nord-Ouest'),
('VIL-BTA',  'Bertoua',     'Est'),
('VIL-NGA',  'Ngaoundéré',  'Adamaoua'),
('VIL-DSG',  'Dschang',     'Ouest'),
('VIL-LMB',  'Limbe',       'Sud-Ouest'),
('VIL-EBW',  'Ebolowa',     'Sud'),
('VIL-FMB',  'Foumban',     'Ouest')
ON DUPLICATE KEY UPDATE `NOM_VILLE` = VALUES(`NOM_VILLE`), `REGION` = VALUES(`REGION`);

-- -----------------------------------------------------------------------------
-- 2. AGENCES DE VOYAGE GOD TRAVEL
-- -----------------------------------------------------------------------------
INSERT INTO `AGENCE` (`ID_AGENCE`, `ID_COMPAGNIE`, `ID_VILLE`, `NOM_AGENCE`, `CODE_AGENCE`, `ADRESSE_QUARTIER`, `TELEPHONE`, `ONDULEUR_CONFORME`) VALUES
('AGC-001', 'CMP-001', 'VIL-YDE', 'Agence Centrale Mvan',        'YDE-MVAN', 'Face Carrefour Mvan Express',         '+237 690 00 00 10', 1),
('AGC-002', 'CMP-001', 'VIL-DLA', 'Agence Bépanda Douala',       'DLA-BEP',  'Carrefour Bépanda Omnisports',        '+237 690 00 00 20', 1),
('AGC-003', 'CMP-001', 'VIL-DLA', 'Agence Bonabéri Douala',      'DLA-BNB',  'Rond-point 4ème Bonabéri',            '+237 690 00 00 21', 1),
('AGC-004', 'CMP-001', 'VIL-BFM', 'Agence Étoile Bafoussam',     'BFM-ETO',  'Rond-point Total Étoile',             '+237 690 00 00 30', 1),
('AGC-005', 'CMP-001', 'VIL-KRB', 'Agence Océan Kribi',          'KRB-OCN',  'Boulevard du Débarcadère Plage',      '+237 690 00 00 40', 1),
('AGC-006', 'CMP-001', 'VIL-YDE', 'Agence Nsam Escale',          'YDE-NSM',  'Carrefour Nsam Escale',               '+237 690 00 00 11', 1),
('AGC-007', 'CMP-001', 'VIL-BTA', 'Agence Soleil Bertoua',        'BTA-SOL',  'Carrefour Mokolo',                    '+237 690 00 00 50', 1),
('AGC-008', 'CMP-001', 'VIL-NGA', 'Agence Château Ngaoundéré',   'NGA-CHT',  'Avenue de la Gare Voyageurs',         '+237 690 00 00 60', 1),
('AGC-009', 'CMP-001', 'VIL-LMB', 'Agence Half-Mile Limbe',       'LMB-HFM',  'Commercial Avenue Half-Mile',         '+237 690 00 00 70', 1),
('AGC-010', 'CMP-001', 'VIL-DSG', 'Agence Menoua Dschang',       'DSG-MEN',  'Face Campus Universitaire',           '+237 690 00 00 80', 1)
ON DUPLICATE KEY UPDATE `NOM_AGENCE` = VALUES(`NOM_AGENCE`), `ADRESSE_QUARTIER` = VALUES(`ADRESSE_QUARTIER`);

-- -----------------------------------------------------------------------------
-- 3. LIGNES INTERURBAINES
-- -----------------------------------------------------------------------------
INSERT INTO `LIGNE` (`ID_LIGNE`, `ID_VILLE_DEPART`, `ID_VILLE_ARRIVEE`, `CODE_LIGNE`, `DISTANCE_KM`, `DUREE_ESTIMEE_MIN`) VALUES
('LGN-YDE-DLA', 'VIL-YDE', 'VIL-DLA', 'LIGNE-YDE-DLA', 240, 210),
('LGN-DLA-YDE', 'VIL-DLA', 'VIL-YDE', 'LIGNE-DLA-YDE', 240, 210),
('LGN-YDE-BFM', 'VIL-YDE', 'VIL-BFM', 'LIGNE-YDE-BFM', 290, 270),
('LGN-BFM-YDE', 'VIL-BFM', 'VIL-YDE', 'LIGNE-BFM-YDE', 290, 270),
('LGN-DLA-BFM', 'VIL-DLA', 'VIL-BFM', 'LIGNE-DLA-BFM', 220, 240),
('LGN-BFM-DLA', 'VIL-BFM', 'VIL-DLA', 'LIGNE-BFM-DLA', 220, 240),
('LGN-YDE-KRB', 'VIL-YDE', 'VIL-KRB', 'LIGNE-YDE-KRB', 280, 210),
('LGN-KRB-YDE', 'VIL-KRB', 'VIL-YDE', 'LIGNE-KRB-YDE', 280, 210),
('LGN-DLA-KRB', 'VIL-DLA', 'VIL-KRB', 'LIGNE-DLA-KRB', 170, 150),
('LGN-KRB-DLA', 'VIL-KRB', 'VIL-DLA', 'LIGNE-KRB-DLA', 170, 150),
('LGN-YDE-BTA', 'VIL-YDE', 'VIL-BTA', 'LIGNE-YDE-BTA', 340, 300),
('LGN-BTA-YDE', 'VIL-BTA', 'VIL-YDE', 'LIGNE-BTA-YDE', 340, 300),
('LGN-DLA-LMB', 'VIL-DLA', 'VIL-LMB', 'LIGNE-DLA-LMB',  75,  90),
('LGN-LMB-DLA', 'VIL-LMB', 'VIL-DLA', 'LIGNE-LMB-DLA',  75,  90),
('LGN-BFM-DSG', 'VIL-BFM', 'VIL-DSG', 'LIGNE-BFM-DSG',  52,  60),
('LGN-DSG-BFM', 'VIL-DSG', 'VIL-BFM', 'LIGNE-DSG-BFM',  52,  60)
ON DUPLICATE KEY UPDATE `DISTANCE_KM` = VALUES(`DISTANCE_KM`), `DUREE_ESTIMEE_MIN` = VALUES(`DUREE_ESTIMEE_MIN`);

-- -----------------------------------------------------------------------------
-- 4. HORAIRES DE DÉPART HABITUELS
-- -----------------------------------------------------------------------------
INSERT INTO `HORAIRE_DEPART` (`ID_HORAIRE`, `ID_LIGNE`, `ID_AGENCE`, `HEURE_DEPART`, `JOURS_APPLICABLES`, `EST_ACTIF`) VALUES
('HOR-YDE-0600', 'LGN-YDE-DLA', 'AGC-001', '06:00:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-0730', 'LGN-YDE-DLA', 'AGC-001', '07:30:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-0900', 'LGN-YDE-DLA', 'AGC-001', '09:00:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-1100', 'LGN-YDE-DLA', 'AGC-001', '11:00:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-1330', 'LGN-YDE-DLA', 'AGC-001', '13:30:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-1530', 'LGN-YDE-DLA', 'AGC-001', '15:30:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-1730', 'LGN-YDE-DLA', 'AGC-001', '17:30:00', 'TOUS_LES_JOURS', 1),
('HOR-DLA-0630', 'LGN-DLA-YDE', 'AGC-002', '06:30:00', 'TOUS_LES_JOURS', 1),
('HOR-DLA-0830', 'LGN-DLA-YDE', 'AGC-002', '08:30:00', 'TOUS_LES_JOURS', 1),
('HOR-DLA-1100', 'LGN-DLA-YDE', 'AGC-002', '11:00:00', 'TOUS_LES_JOURS', 1),
('HOR-DLA-1400', 'LGN-DLA-YDE', 'AGC-002', '14:00:00', 'TOUS_LES_JOURS', 1),
('HOR-DLA-1630', 'LGN-DLA-YDE', 'AGC-002', '16:30:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-BFM-1', 'LGN-YDE-BFM', 'AGC-001', '08:00:00', 'TOUS_LES_JOURS', 1),
('HOR-BFM-YDE-1', 'LGN-BFM-YDE', 'AGC-004', '13:30:00', 'TOUS_LES_JOURS', 1),
('HOR-DLA-BFM-1', 'LGN-DLA-BFM', 'AGC-002', '09:30:00', 'TOUS_LES_JOURS', 1),
('HOR-YDE-KRB-1', 'LGN-YDE-KRB', 'AGC-001', '08:30:00', 'TOUS_LES_JOURS', 1),
('HOR-KRB-YDE-1', 'LGN-KRB-YDE', 'AGC-005', '14:00:00', 'TOUS_LES_JOURS', 1)
ON DUPLICATE KEY UPDATE `HEURE_DEPART` = VALUES(`HEURE_DEPART`);

-- -----------------------------------------------------------------------------
-- 5. TARIFS APPLIQUÉS (en Francs CFA / XAF)
-- -----------------------------------------------------------------------------
INSERT INTO `TARIF` (`ID_TARIF`, `ID_LIGNE`, `ID_CLASSE`, `ID_CATEGORIE`, `PRIX_XAF`, `DATE_DEBUT_VALIDITE`, `DATE_FIN_VALIDITE`) VALUES
('TRF-YDE-DLA-VIP', 'LGN-YDE-DLA', 'CLS-VIP', 'CAT-ADULTE', 6000.00, '2026-01-01', '2026-12-31'),
('TRF-YDE-DLA-STD', 'LGN-YDE-DLA', 'CLS-STD', 'CAT-ADULTE', 4000.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-YDE-VIP', 'LGN-DLA-YDE', 'CLS-VIP', 'CAT-ADULTE', 6000.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-YDE-STD', 'LGN-DLA-YDE', 'CLS-STD', 'CAT-ADULTE', 4000.00, '2026-01-01', '2026-12-31'),
('TRF-YDE-BFM-VIP', 'LGN-YDE-BFM', 'CLS-VIP', 'CAT-ADULTE', 7000.00, '2026-01-01', '2026-12-31'),
('TRF-YDE-BFM-STD', 'LGN-YDE-BFM', 'CLS-STD', 'CAT-ADULTE', 4500.00, '2026-01-01', '2026-12-31'),
('TRF-BFM-YDE-VIP', 'LGN-BFM-YDE', 'CLS-VIP', 'CAT-ADULTE', 7000.00, '2026-01-01', '2026-12-31'),
('TRF-BFM-YDE-STD', 'LGN-BFM-YDE', 'CLS-STD', 'CAT-ADULTE', 4500.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-BFM-VIP', 'LGN-DLA-BFM', 'CLS-VIP', 'CAT-ADULTE', 6500.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-BFM-STD', 'LGN-DLA-BFM', 'CLS-STD', 'CAT-ADULTE', 4000.00, '2026-01-01', '2026-12-31'),
('TRF-BFM-DLA-VIP', 'LGN-BFM-DLA', 'CLS-VIP', 'CAT-ADULTE', 6500.00, '2026-01-01', '2026-12-31'),
('TRF-BFM-DLA-STD', 'LGN-BFM-DLA', 'CLS-STD', 'CAT-ADULTE', 4000.00, '2026-01-01', '2026-12-31'),
('TRF-YDE-KRB-VIP', 'LGN-YDE-KRB', 'CLS-VIP', 'CAT-ADULTE', 6000.00, '2026-01-01', '2026-12-31'),
('TRF-YDE-KRB-STD', 'LGN-YDE-KRB', 'CLS-STD', 'CAT-ADULTE', 4000.00, '2026-01-01', '2026-12-31'),
('TRF-KRB-YDE-VIP', 'LGN-KRB-YDE', 'CLS-VIP', 'CAT-ADULTE', 6000.00, '2026-01-01', '2026-12-31'),
('TRF-KRB-YDE-STD', 'LGN-KRB-YDE', 'CLS-STD', 'CAT-ADULTE', 4000.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-KRB-VIP', 'LGN-DLA-KRB', 'CLS-VIP', 'CAT-ADULTE', 5500.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-KRB-STD', 'LGN-DLA-KRB', 'CLS-STD', 'CAT-ADULTE', 3500.00, '2026-01-01', '2026-12-31'),
('TRF-YDE-BTA-VIP', 'LGN-YDE-BTA', 'CLS-VIP', 'CAT-ADULTE', 8000.00, '2026-01-01', '2026-12-31'),
('TRF-YDE-BTA-STD', 'LGN-YDE-BTA', 'CLS-STD', 'CAT-ADULTE', 5000.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-LMB-VIP', 'LGN-DLA-LMB', 'CLS-VIP', 'CAT-ADULTE', 3500.00, '2026-01-01', '2026-12-31'),
('TRF-DLA-LMB-STD', 'LGN-DLA-LMB', 'CLS-STD', 'CAT-ADULTE', 2000.00, '2026-01-01', '2026-12-31'),
('TRF-BFM-DSG-STD', 'LGN-BFM-DSG', 'CLS-STD', 'CAT-ADULTE', 1500.00, '2026-01-01', '2026-12-31')
ON DUPLICATE KEY UPDATE `PRIX_XAF` = VALUES(`PRIX_XAF`);

-- -----------------------------------------------------------------------------
-- 6. FLOTTE D'AUTOBUS RÉCENTS
-- -----------------------------------------------------------------------------
INSERT INTO `BUS` (`ID_BUS`, `ID_COMPAGNIE`, `ID_CLASSE`, `IMMATRICULATION`, `MARQUE`, `MODELE`, `NB_PLACES`, `ANNEE_MISE_SERVICE`, `KILOMETRAGE_TOTAL`, `STATUT_BUS`) VALUES
('BUS-001', 'CMP-001', 'CLS-VIP', 'LT-542-AA', 'Yutong',        'ZK6122H VIP',         70, 2023,  65000, 'DISPONIBLE'),
('BUS-002', 'CMP-001', 'CLS-STD', 'CE-892-BC', 'Toyota',        'Coaster Intercity',   50, 2022,  92000, 'DISPONIBLE'),
('BUS-003', 'CMP-001', 'CLS-VIP', 'LT-441-AA', 'Marcopolo',     'Paradiso G7',         70, 2024,  38000, 'DISPONIBLE'),
('BUS-004', 'CMP-001', 'CLS-VIP', 'CE-105-AF', 'Marcopolo',     'Paradiso 1200 New-G', 70, 2023,  45000, 'DISPONIBLE'),
('BUS-005', 'CMP-001', 'CLS-VIP', 'OU-318-BA', 'Mercedes-Benz', 'Travego VIP Comfort', 60, 2023,  52000, 'DISPONIBLE'),
('BUS-006', 'CMP-001', 'CLS-STD', 'LT-722-BB', 'Higer',         'Golden Dragon Inter', 55, 2022, 110000, 'DISPONIBLE'),
('BUS-007', 'CMP-001', 'CLS-VIP', 'CE-450-CD', 'Yutong',        'Master Cruiser 70S',  70, 2024,  29000, 'DISPONIBLE'),
('BUS-008', 'CMP-001', 'CLS-STD', 'OU-604-AC', 'Toyota',        'Coaster Deluxe 50',   50, 2023,  41000, 'DISPONIBLE'),
('BUS-009', 'CMP-001', 'CLS-VIP', 'SU-215-AA', 'Scania',        'Touring HD Star',     65, 2024,  18000, 'DISPONIBLE'),
('BUS-010', 'CMP-001', 'CLS-VIP', 'LT-910-CA', 'Mercedes-Benz', 'Tourismo Prestige',   70, 2024,  12000, 'DISPONIBLE'),
('BUS-011', 'CMP-001', 'CLS-STD', 'CE-633-DE', 'Marcopolo',     'Viaggio 1050 Climat', 60, 2022,  98000, 'DISPONIBLE'),
('BUS-012', 'CMP-001', 'CLS-VIP', 'OU-840-BF', 'Yutong',        'ZK6129H Longue-Dist', 70, 2023,  54000, 'DISPONIBLE')
ON DUPLICATE KEY UPDATE `STATUT_BUS` = VALUES(`STATUT_BUS`), `KILOMETRAGE_TOTAL` = VALUES(`KILOMETRAGE_TOTAL`);

-- -----------------------------------------------------------------------------
-- 7. BALISES GPS (MTN / Orange Cameroun)
-- -----------------------------------------------------------------------------
INSERT INTO `BALISE_GPS` (`ID_BALISE`, `ID_BUS`, `CODE_IMEI`, `NUM_SIM`, `DATE_POSE`, `EST_ACTIVE`) VALUES
('BAL-001', 'BUS-001', '864201048291039', '+237 699 10 20 30', '2024-01-15', 1),
('BAL-002', 'BUS-002', '864201048291040', '+237 699 10 20 31', '2024-01-15', 1),
('BAL-003', 'BUS-003', '864201048291041', '+237 699 10 20 32', '2024-02-01', 1),
('BAL-004', 'BUS-004', '864201048291042', '+237 699 10 20 33', '2024-02-15', 1),
('BAL-005', 'BUS-005', '864201048291043', '+237 699 10 20 34', '2024-03-01', 1),
('BAL-006', 'BUS-006', '864201048291044', '+237 699 10 20 35', '2024-03-15', 1),
('BAL-007', 'BUS-007', '864201048291045', '+237 699 10 20 36', '2024-04-01', 1),
('BAL-008', 'BUS-008', '864201048291046', '+237 699 10 20 37', '2024-04-15', 1),
('BAL-009', 'BUS-009', '864201048291047', '+237 699 10 20 38', '2024-05-01', 1),
('BAL-010', 'BUS-010', '864201048291048', '+237 699 10 20 39', '2024-05-15', 1),
('BAL-011', 'BUS-011', '864201048291049', '+237 699 10 20 40', '2024-06-01', 1),
('BAL-012', 'BUS-012', '864201048291050', '+237 699 10 20 41', '2024-06-15', 1)
ON DUPLICATE KEY UPDATE `EST_ACTIVE` = VALUES(`EST_ACTIVE`);

-- -----------------------------------------------------------------------------
-- 8. PERSONNEL & CHAUFFEURS DE LIGNE
-- -----------------------------------------------------------------------------
INSERT INTO `EMPLOYE` (`ID_EMPLOYE`, `ID_COMPAGNIE`, `ID_AGENCE`, `MATRICULE`, `NOM`, `PRENOM`, `NUMERO_CNI`, `TELEPHONE`, `FONCTION`, `DATE_EMBAUCHE`, `STATUT_EMPLOYE`) VALUES
('EMP-001', 'CMP-001', 'AGC-001', 'EMP-ADM-01', 'DJIONANG',   'Berlin',           '100234567', '+237 690 00 00 01', 'Directeur Général',           '2024-01-01', 'ACTIF'),
('EMP-002', 'CMP-001', 'AGC-001', 'EMP-CHF-01', 'FOMEKONG',   'Evaris',           '100234568', '+237 690 00 00 02', 'Chef d''Agence Yaoundé',       '2024-01-01', 'ACTIF'),
('EMP-003', 'CMP-001', 'AGC-001', 'EMP-GUI-01', 'BIYONG',     'Paul Guichet',     '100234569', '+237 690 00 00 03', 'Guichetier Titulaire',        '2024-02-01', 'ACTIF'),
('EMP-004', 'CMP-001', 'AGC-001', 'EMP-DRV-01', 'MBALLA',     'Eric Conducteur',  '100234570', '+237 690 00 00 04', 'Chauffeur Ligne N3',          '2024-02-01', 'ACTIF'),
('EMP-005', 'CMP-001', 'AGC-002', 'EMP-CHF-02', 'NGO BAYI',   'Jeannette',        '100234571', '+237 690 00 00 05', 'Chef d''Agence Douala',        '2024-01-15', 'ACTIF'),
('EMP-006', 'CMP-001', 'AGC-002', 'EMP-GUI-02', 'FOTSO',      'Alain Guichet',    '100234572', '+237 690 00 00 06', 'Guichetier Douala',           '2024-02-10', 'ACTIF'),
('EMP-007', 'CMP-001', 'AGC-001', 'EMP-DRV-02', 'ENOW',       'Samuel Chauffeur', '100234573', '+237 690 00 00 07', 'Chauffeur VIP Yaoundé-Douala', '2024-03-01', 'ACTIF'),
('EMP-008', 'CMP-001', 'AGC-004', 'EMP-DRV-03', 'ABOUBAKAR',  'Ousmanou Chauff.', '100234574', '+237 690 00 00 08', 'Chauffeur Grand Ouest',        '2024-03-15', 'ACTIF'),
('EMP-009', 'CMP-001', 'AGC-001', 'EMP-MEC-01', 'TCHINDA',    'Roger Mecano',     '100234575', '+237 690 00 00 09', 'Chef Atelier Maintenance',    '2024-01-20', 'ACTIF'),
('EMP-010', 'CMP-001', 'AGC-001', 'EMP-HOT-01', 'NDOMBE',     'Carine Hôtesse',   '100234576', '+237 690 00 00 12', 'Hôtesse de Bord VIP',         '2024-04-01', 'ACTIF'),
('EMP-011', 'CMP-001', 'AGC-004', 'EMP-CHF-03', 'MBOUENDEU',  'Guy-Roland',       '100234577', '+237 690 00 00 13', 'Chef d''Agence Bafoussam',     '2024-02-01', 'ACTIF'),
('EMP-012', 'CMP-001', 'AGC-005', 'EMP-GUI-03', 'EPOH',       'Sandrine',         '100234578', '+237 690 00 00 14', 'Guichetière Kribi',           '2024-03-10', 'ACTIF')
ON DUPLICATE KEY UPDATE `NOM` = VALUES(`NOM`), `TELEPHONE` = VALUES(`TELEPHONE`);

-- Inscription des chauffeurs agréés
INSERT INTO `CHAUFFEUR` (`ID_CHAUFFEUR`, `ID_EMPLOYE`, `NUM_PERMIS`, `CATEGORIE_PERMIS`, `DATE_EXPIRATION_PERMIS`, `VISITE_MEDICALE_VALIDE`) VALUES
('CHF-001', 'EMP-004', 'PERM-LT-2021-9921', 'D', '2028-06-30', 1),
('CHF-002', 'EMP-007', 'PERM-CE-2020-4102', 'D', '2027-12-31', 1),
('CHF-003', 'EMP-008', 'PERM-OU-2022-7815', 'D', '2028-09-30', 1)
ON DUPLICATE KEY UPDATE `VISITE_MEDICALE_VALIDE` = VALUES(`VISITE_MEDICALE_VALIDE`);

-- -----------------------------------------------------------------------------
-- 9. RÔLES VOYAGE
-- -----------------------------------------------------------------------------
INSERT INTO `ROLE_VOYAGE` (`ID_ROLE_VOYAGE`, `CODE_ROLE`, `LIBELLE_ROLE`) VALUES
('ROL-DRV-01',  'CHAUFFEUR_PRINCIPAL', 'Chauffeur Principal'),
('ROL-DRV-02',  'CHAUFFEUR_RELAIS',    'Chauffeur de Relais'),
('ROL-CONV-01', 'CONVOYEUR',           'Convoyeur de Bord'),
('ROL-HOT-01',  'HOTESSE_BORD',        'Hôtesse de Bord')
ON DUPLICATE KEY UPDATE `LIBELLE_ROLE` = VALUES(`LIBELLE_ROLE`);

-- -----------------------------------------------------------------------------
-- 10. VOYAGES AUJOURD'HUI & PROCHAINS JOURS (Dates dynamiques pour visibilité immédiate)
-- -----------------------------------------------------------------------------
-- Nettoyage des anciens voyages de test périmés
DELETE FROM `POSITION_GPS` WHERE `ID_VOYAGE` IN ('VOY-001', 'VOY-002', 'VOY-003');
DELETE FROM `PAIEMENT` WHERE `ID_BILLET` IN (SELECT `ID_BILLET` FROM `BILLET` WHERE `ID_VOYAGE` IN ('VOY-001', 'VOY-002', 'VOY-003'));
DELETE FROM `BILLET` WHERE `ID_VOYAGE` IN ('VOY-001', 'VOY-002', 'VOY-003');
DELETE FROM `COLIS` WHERE `ID_VOYAGE` IN ('VOY-001', 'VOY-002', 'VOY-003');
DELETE FROM `VOYAGE` WHERE `ID_VOYAGE` IN ('VOY-001', 'VOY-002', 'VOY-003');

INSERT INTO `VOYAGE` (`ID_VOYAGE`, `ID_LIGNE`, `ID_BUS`, `ID_AGENCE`, `ID_HORAIRE`, `CODE_VOYAGE`, `DATE_HEURE_DEPART_PREVUE`, `DATE_HEURE_ARRIVEE_PREVUE`, `STATUT_VOYAGE`) VALUES
-- Départs d'aujourd'hui
('VOY-101', 'LGN-YDE-DLA', 'BUS-001', 'AGC-001', 'HOR-YDE-0600', 'VOY-YDE-DLA-06H00', DATE_ADD(CURDATE(), INTERVAL '06:00:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '09:30:00' HOUR_SECOND), 'CONFIRME'),
('VOY-102', 'LGN-DLA-YDE', 'BUS-003', 'AGC-002', 'HOR-DLA-0630', 'VOY-DLA-YDE-06H30', DATE_ADD(CURDATE(), INTERVAL '06:30:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '10:00:00' HOUR_SECOND), 'CONFIRME'),
('VOY-103', 'LGN-YDE-DLA', 'BUS-004', 'AGC-001', 'HOR-YDE-0900', 'VOY-YDE-DLA-09H00', DATE_ADD(CURDATE(), INTERVAL '09:00:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '12:30:00' HOUR_SECOND), 'OUVERT'),
('VOY-104', 'LGN-DLA-YDE', 'BUS-007', 'AGC-002', 'HOR-DLA-1100', 'VOY-DLA-YDE-11H00', DATE_ADD(CURDATE(), INTERVAL '11:00:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '14:30:00' HOUR_SECOND), 'OUVERT'),
('VOY-105', 'LGN-YDE-BFM', 'BUS-005', 'AGC-001', 'HOR-YDE-BFM-1', 'VOY-YDE-BFM-08H00', DATE_ADD(CURDATE(), INTERVAL '08:00:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '12:30:00' HOUR_SECOND), 'OUVERT'),
('VOY-106', 'LGN-BFM-YDE', 'BUS-008', 'AGC-004', 'HOR-BFM-YDE-1', 'VOY-BFM-YDE-13H30', DATE_ADD(CURDATE(), INTERVAL '13:30:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '18:00:00' HOUR_SECOND), 'PROGRAMME'),
('VOY-107', 'LGN-DLA-BFM', 'BUS-006', 'AGC-002', 'HOR-DLA-BFM-1', 'VOY-DLA-BFM-09H30', DATE_ADD(CURDATE(), INTERVAL '09:30:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '13:30:00' HOUR_SECOND), 'OUVERT'),
('VOY-108', 'LGN-YDE-KRB', 'BUS-009', 'AGC-001', 'HOR-YDE-KRB-1', 'VOY-YDE-KRB-08H30', DATE_ADD(CURDATE(), INTERVAL '08:30:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '12:00:00' HOUR_SECOND), 'OUVERT'),
('VOY-109', 'LGN-KRB-YDE', 'BUS-009', 'AGC-005', 'HOR-KRB-YDE-1', 'VOY-KRB-YDE-14H00', DATE_ADD(CURDATE(), INTERVAL '14:00:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '17:30:00' HOUR_SECOND), 'PROGRAMME'),
('VOY-110', 'LGN-YDE-DLA', 'BUS-010', 'AGC-001', 'HOR-YDE-1530', 'VOY-YDE-DLA-15H30', DATE_ADD(CURDATE(), INTERVAL '15:30:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '19:00:00' HOUR_SECOND), 'PROGRAMME'),
('VOY-111', 'LGN-DLA-YDE', 'BUS-001', 'AGC-002', 'HOR-DLA-1630', 'VOY-DLA-YDE-16H30', DATE_ADD(CURDATE(), INTERVAL '16:30:00' HOUR_SECOND), DATE_ADD(CURDATE(), INTERVAL '20:00:00' HOUR_SECOND), 'PROGRAMME'),
-- Départs de demain (J+1)
('VOY-201', 'LGN-YDE-DLA', 'BUS-003', 'AGC-001', 'HOR-YDE-0730', 'VOY-YDE-DLA-J1-07H', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '07:30:00' HOUR_SECOND), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '11:00:00' HOUR_SECOND), 'PROGRAMME'),
('VOY-202', 'LGN-DLA-YDE', 'BUS-004', 'AGC-002', 'HOR-DLA-0830', 'VOY-DLA-YDE-J1-08H', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '08:30:00' HOUR_SECOND), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '12:00:00' HOUR_SECOND), 'PROGRAMME'),
('VOY-203', 'LGN-YDE-BTA', 'BUS-011', 'AGC-001', 'HOR-YDE-0600', 'VOY-YDE-BTA-J1-07H', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '07:00:00' HOUR_SECOND), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '12:00:00' HOUR_SECOND), 'PROGRAMME'),
('VOY-204', 'LGN-DLA-LMB', 'BUS-002', 'AGC-002', 'HOR-DLA-0630', 'VOY-DLA-LMB-J1-09H', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '09:00:00' HOUR_SECOND), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '10:30:00' HOUR_SECOND), 'PROGRAMME'),
('VOY-205', 'LGN-YDE-DLA', 'BUS-012', 'AGC-001', 'HOR-YDE-1330', 'VOY-YDE-DLA-J1-13H', DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '13:30:00' HOUR_SECOND), DATE_ADD(DATE_ADD(CURDATE(), INTERVAL 1 DAY), INTERVAL '17:00:00' HOUR_SECOND), 'PROGRAMME')
ON DUPLICATE KEY UPDATE `STATUT_VOYAGE` = VALUES(`STATUT_VOYAGE`);

-- -----------------------------------------------------------------------------
-- 11. CLIENTS CAMEROUNAIS
-- -----------------------------------------------------------------------------
INSERT INTO `CLIENT` (`ID_CLIENT`, `NOM`, `PRENOM`, `TELEPHONE`, `EMAIL`, `NUMERO_CNI`, `SEXE`) VALUES
('CLI-001', 'BIYONG',    'Paul',          '699001122', 'paul.biyong@gmail.com',     '109283746', 'M'),
('CLI-002', 'KENNE',     'Marie',         '677112233', 'marie.kenne@yahoo.fr',     '108273645', 'F'),
('CLI-003', 'MBARGA',    'Ernest',        '653412316', 'mbargaernest80@gmail.com',  '112093847', 'M'),
('CLI-004', 'KAMGA',     'Jean-Pierre',   '699123456', 'jp.kamga@gmail.com',        '115829103', 'M'),
('CLI-005', 'NGO BIYONG','Thérèse',       '677234567', 't.ngobiyong@yahoo.cm',     '114728192', 'F'),
('CLI-006', 'ABOUBAKAR', 'Ousmanou',      '698345678', 'o.aboubakar@gmail.com',    '113617283', 'M'),
('CLI-007', 'ENOW',      'Samuel',        '675456789', 's.enow@outlook.com',        '112506374', 'M'),
('CLI-008', 'EYENGA',    'Marcelle',      '696567890', 'marcelle.eyenga@gmail.com', '111495465', 'F'),
('CLI-009', 'NDONGO',    'Sylvain',       '672890123', 'sylvain.ndongo@gmail.com',  '110384556', 'M')
ON DUPLICATE KEY UPDATE `NOM` = VALUES(`NOM`), `TELEPHONE` = VALUES(`TELEPHONE`);

-- Compte client pour Ernest MBARGA (Nash_2006)
INSERT INTO `COMPTE_CLIENT` (`ID_CLIENT`, `EMAIL`, `MOT_DE_PASSE_HASH`, `EST_ACTIF`, `DATE_CREATION`) VALUES
('CLI-003', 'mbargaernest80@gmail.com', '$2a$12$Sj56wBs0AOiM2k.aoWmy3e0a5KF.f.Uor.jmMiUNCT.THn4RH3JpS', 1, NOW())
ON DUPLICATE KEY UPDATE `EST_ACTIF` = 1;

-- -----------------------------------------------------------------------------
-- 12. BILLETS ET PAIEMENTS
-- -----------------------------------------------------------------------------
INSERT INTO `BILLET` (`ID_BILLET`, `ID_CLIENT`, `ID_VOYAGE`, `ID_CATEGORIE`, `ID_EMPLOYE`, `CODE_BILLET`, `CODE_RESERVATION`, `NUM_SIEGE`, `TYPE_BILLET`, `CANAL_VENTE`, `DATE_EMISSION`, `DATE_VALIDITE`, `PRIX_APPLIQUE_XAF`, `EST_GRATUIT`, `VOYAGE_PAR_TIERS`, `COPIE_PIECE_VERIFIEE`, `SIGNATURE_HMAC`, `STATUT_BILLET`) VALUES
('BLT-101-01', 'CLI-001', 'VOY-101', 'CAT-ADULTE', 'EMP-003', 'GT-2611-01-A42', 'RES-892182', 1, 'ALLER_SIMPLE', 'GUICHET', NOW(), CURDATE(), 6000.00, 0, 0, 1, 'HMAC_TEST_SIG_001_VALIDE_CM', 'VALIDE'),
('BLT-101-02', 'CLI-002', 'VOY-101', 'CAT-ADULTE', 'EMP-003', 'GT-2611-02-B73', 'RES-892183', 2, 'ALLER_SIMPLE', 'GUICHET', NOW(), CURDATE(), 6000.00, 0, 0, 1, 'HMAC_TEST_SIG_002_VALIDE_CM', 'VALIDE'),
('BLT-101-03', 'CLI-003', 'VOY-101', 'CAT-ADULTE', 'EMP-003', 'GT-2611-03-C81', 'RES-892184', 3, 'ALLER_SIMPLE', 'EN_LIGNE', NOW(), CURDATE(), 6000.00, 0, 0, 1, 'HMAC_TEST_SIG_003_VALIDE_CM', 'VALIDE'),
('BLT-103-01', 'CLI-004', 'VOY-103', 'CAT-ADULTE', 'EMP-003', 'GT-2611-04-D19', 'RES-892185', 5, 'ALLER_SIMPLE', 'GUICHET', NOW(), CURDATE(), 6000.00, 0, 0, 1, 'HMAC_TEST_SIG_004_VALIDE_CM', 'VALIDE'),
('BLT-105-01', 'CLI-005', 'VOY-105', 'CAT-ADULTE', 'EMP-003', 'GT-2611-05-E55', 'RES-892186', 8, 'ALLER_SIMPLE', 'EN_LIGNE', NOW(), CURDATE(), 7000.00, 0, 0, 1, 'HMAC_TEST_SIG_005_VALIDE_CM', 'VALIDE')
ON DUPLICATE KEY UPDATE `STATUT_BILLET` = VALUES(`STATUT_BILLET`);

INSERT INTO `PAIEMENT` (`ID_PAIEMENT`, `ID_MODE`, `ID_BILLET`, `REFERENCE_TRANSACTION`, `MONTANT_PAYE_XAF`, `DATE_PAIEMENT`, `STATUT_PAIEMENT`) VALUES
('PAI-101-01', 'MOD-ESP',      'BLT-101-01', 'TXN-CASH-20261119-01', 6000.00, NOW(), 'VALIDE'),
('PAI-101-02', 'MOD-MOMO',     'BLT-101-02', 'TXN-MOMO-20261119-02', 6000.00, NOW(), 'VALIDE'),
('PAI-101-03', 'MOD-MONETBIL', 'BLT-101-03', 'TXN-MNTB-20261119-03', 6000.00, NOW(), 'VALIDE'),
('PAI-103-01', 'MOD-OM',       'BLT-103-01', 'TXN-ORNG-20261119-04', 6000.00, NOW(), 'VALIDE'),
('PAI-105-01', 'MOD-MOMO',     'BLT-105-01', 'TXN-MOMO-20261119-05', 7000.00, NOW(), 'VALIDE')
ON DUPLICATE KEY UPDATE `STATUT_PAIEMENT` = VALUES(`STATUT_PAIEMENT`);

-- -----------------------------------------------------------------------------
-- 13. FRET ET COLIS (Flux régionaux camerounais)
-- -----------------------------------------------------------------------------
INSERT INTO `COLIS` (`ID_COLIS`, `ID_CLIENT_EXPEDITEUR`, `ID_AGENCE_DEPOT`, `ID_AGENCE_RETRAIT`, `ID_VOYAGE`, `ID_EMPLOYE`, `CODE_SUIVI`, `NOM_DESTINATAIRE`, `PRENOM_DESTINATAIRE`, `TELEPHONE_DESTINATAIRE`, `CNI_DESTINATAIRE`, `DESCRIPTION_CONTENU`, `POIDS_KG`, `VALEUR_DECLAREE_XAF`, `FRAIS_EXPEDITION_XAF`, `STATUT_COLIS`, `DATE_ENREGISTREMENT`) VALUES
('CLS-001', 'CLI-001', 'AGC-001', 'AGC-002', 'VOY-101', 'EMP-003', 'TRK-2611-7821', 'KENNE',     'Marie',       '+237 677 11 22 33', '108273645', 'Carton matériel informatique & accessoires', 14.50, 150000.00, 7500.00, 'EN_TRANSIT', NOW()),
('CLS-002', 'CLI-004', 'AGC-004', 'AGC-002', 'VOY-107', 'EMP-006', 'TRK-2611-9104', 'FOTSO',     'Alain',       '+237 674 67 89 01', '109384726', 'Sacs de vivres frais et condiments Ouest',   28.00,  60000.00, 5000.00, 'ENREGISTRE', NOW()),
('CLS-003', 'CLI-005', 'AGC-002', 'AGC-001', 'VOY-102', 'EMP-006', 'TRK-2611-3312', 'MBARGA',    'Ernest',      '+237 653 41 23 16', '112093847', 'Dossiers administratifs & documents légaux',   2.00,  20000.00, 2500.00, 'LIVRE',       NOW()),
('CLS-004', 'CLI-002', 'AGC-002', 'AGC-004', 'VOY-107', 'EMP-006', 'TRK-2611-4560', 'KAMGA',     'Jean-Pierre', '+237 699 12 34 56', '115829103', 'Pièces de rechange automobile en carton',    18.50, 220000.00, 8500.00, 'ENREGISTRE', NOW()),
('CLS-005', 'CLI-008', 'AGC-005', 'AGC-001', 'VOY-109', 'EMP-012', 'TRK-2611-8891', 'EYENGA',    'Marcelle',    '+237 696 56 78 90', '111495465', 'Colis frais poissons fumés de Kribi',        12.00,  80000.00, 4500.00, 'EN_TRANSIT', NOW()),
('CLS-006', 'CLI-003', 'AGC-001', 'AGC-007', NULL,      'EMP-003', 'TRK-2611-1209', 'ABOUBAKAR', 'Ousmanou',    '+237 698 34 56 78', '113617283', 'Bagages personnels et effets vestimentaires', 22.00, 100000.00, 6000.00, 'ENREGISTRE', NOW())
ON DUPLICATE KEY UPDATE `STATUT_COLIS` = VALUES(`STATUT_COLIS`);

-- -----------------------------------------------------------------------------
-- 14. TRACÉ GPS EN DIRECT (Axe Nationale 3 Yaoundé -> Douala)
-- -----------------------------------------------------------------------------
INSERT INTO `POSITION_GPS` (`ID_POSITION`, `ID_BALISE`, `ID_VOYAGE`, `DATE_HEURE_RELEVE`, `LATITUDE`, `LONGITUDE`, `VITESSE_KMH`) VALUES
('POS-101-1', 'BAL-001', 'VOY-101', DATE_SUB(NOW(), INTERVAL 90 MINUTE), 3.8480, 11.5021, 55),
('POS-101-2', 'BAL-001', 'VOY-101', DATE_SUB(NOW(), INTERVAL 60 MINUTE), 3.7800, 11.3800, 82),
('POS-101-3', 'BAL-001', 'VOY-101', DATE_SUB(NOW(), INTERVAL 35 MINUTE), 3.8500, 11.0200, 88),
('POS-101-4', 'BAL-001', 'VOY-101', DATE_SUB(NOW(), INTERVAL 10 MINUTE), 3.8000, 10.1300, 78)
ON DUPLICATE KEY UPDATE `VITESSE_KMH` = VALUES(`VITESSE_KMH`), `DATE_HEURE_RELEVE` = VALUES(`DATE_HEURE_RELEVE`);

-- -----------------------------------------------------------------------------
-- 15. PROMOTIONS & PACKS (Fidélité et remises locales)
-- -----------------------------------------------------------------------------
INSERT INTO `PACK` (`ID_PACK`, `ID_COMPAGNIE`, `CODE_PACK`, `LIBELLE_PACK`, `NB_VOYAGES_INCLUS`, `PRIX_PACK_XAF`, `DUREE_VALIDITE_JOURS`, `EST_ACTIF`) VALUES
('PCK-GOLD',   'CMP-001', 'PACK-GOLD-10', 'Pack Gold 10 VIP Corridor N3', 10, 50000.00, 180, 1),
('PCK-SILVER', 'CMP-001', 'PACK-SILVER-5', 'Pack Silver 5 Trajets Interurbains', 5, 18000.00, 90, 1),
('PCK-PRO',    'CMP-001', 'PACK-PRO-8',    'Pack Affaires Hebdomadaire N3', 8, 42000.00, 60, 1)
ON DUPLICATE KEY UPDATE `PRIX_PACK_XAF` = VALUES(`PRIX_PACK_XAF`);

INSERT INTO `PROMOTION` (`ID_PROMOTION`, `ID_COMPAGNIE`, `CODE_PROMO`, `LIBELLE_PROMO`, `TYPE_REMISE`, `VALEUR_REMISE`, `DATE_DEBUT`, `DATE_FIN`, `USAGES_MAX`, `EST_ACTIVE`) VALUES
('PRM-NOEL',  'CMP-001', 'NOEL2026',    'Remise spéciale fêtes de fin d''année', 'POURCENTAGE', 10.00, '2026-11-01', '2026-12-31', 500, 1),
('PRM-ETUD',  'CMP-001', 'ETUDIANT26',  'Tarif Réduit Campus Universitaire',     'MONTANT_FIXE', 1000.00, '2026-10-01', '2026-12-31', 300, 1),
('PRM-CORR',  'CMP-001', 'CORRIDOR-AR', 'Remise Aller-Retour Yaoundé - Douala',  'MONTANT_FIXE', 2000.00, '2026-11-01', '2026-12-31', 400, 1)
ON DUPLICATE KEY UPDATE `EST_ACTIVE` = VALUES(`EST_ACTIVE`);

-- -----------------------------------------------------------------------------
-- 16. CARNET D'ENTRETIEN & MAINTENANCE DES BUS
-- -----------------------------------------------------------------------------
INSERT INTO `MAINTENANCE` (`ID_MAINTENANCE`, `ID_BUS`, `ID_EMPLOYE`, `DATE_MAINTENANCE`, `NATURE_INTERVENTION`, `COUT_INTERVENTION_XAF`, `KILOMETRAGE_AU_MOMENT`, `OBSERVATIONS_MECANO`) VALUES
('MNT-001', 'BUS-001', 'EMP-009', '2026-11-10', 'Vidange complète & filtres',       120000.00, 60000, 'Huile moteur 15W40 changée. Plaquettes de frein contrôlées conformes.'),
('MNT-002', 'BUS-003', 'EMP-009', '2026-11-12', 'Pneumatiques train avant',         350000.00, 35000, 'Deux pneus neufs Michelin 295/80 R22.5 montés. Géométrie et équilibrage OK.'),
('MNT-003', 'BUS-005', 'EMP-009', '2026-11-15', 'Révision système climatisation',   180000.00, 50000, 'Recharge gaz R134a et remplacement filtre habitacle.')
ON DUPLICATE KEY UPDATE `NATURE_INTERVENTION` = VALUES(`NATURE_INTERVENTION`);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
