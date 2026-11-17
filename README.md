# God Travel

Plateforme de réservation et d’exploitation de voyages interurbains : espace client, billetterie, gestion des billets et outils d’agence.

## Technologies

- Backend : Java 17+, Spring Boot, Spring Security, JPA et Maven
- Frontend : React, Vite, Leaflet et React Three Fiber
- Base : MySQL / MariaDB, schéma master `god_travel_complet_master.sql`

## Contenu du dépôt

- `god-travel-backend/` : API et règles métier
- `god-travel-frontend/` : interface client et espace équipe
- `god_travel_complet_master.sql` : schéma et données de démonstration de référence

La base MariaDB active, les identifiants locaux, les `.bat`, les dépendances installées et les runtimes Windows ne sont pas versionnés.

## Configuration

1. Installez Java 17 ou plus récent, Maven, Node.js et MySQL/MariaDB.
2. Créez la base en important `god_travel_complet_master.sql` dans phpMyAdmin ou avec le client MySQL. **Le script recrée les tables du schéma `god_travel_41` : ne l’importez pas sur une base qui contient des données à conserver.**
3. Copiez `god-travel-backend/src/main/resources/application.example.properties` vers `application.properties` au même endroit, puis configurez l’accès à la base.
4. Configurez les secrets localement, sans les ajouter au dépôt : `APP_JWT_SECRET` et `APP_TICKET_HMAC_SECRET` doivent chacun contenir au moins 32 caractères. Au premier démarrage seulement, définissez aussi `APP_BOOTSTRAP_ADMIN_PASSWORD` pour créer le compte administrateur initial. Le master ne contient aucun mot de passe de démonstration.
5. Pour les paiements en ligne, ajoutez `MONETBIL_SERVICE_KEY`, `MONETBIL_SERVICE_SECRET` et une URL HTTPS publique dans `MONETBIL_PUBLIC_BASE_URL` pour recevoir les notifications Monetbil.

Exemple de génération de secrets dans PowerShell :

```powershell
$env:APP_JWT_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:APP_TICKET_HMAC_SECRET = [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:APP_BOOTSTRAP_ADMIN_PASSWORD = Read-Host 'Mot de passe initial administrateur'
```

## Lancement

Backend, depuis `god-travel-backend/` :

```powershell
mvn spring-boot:run
```

Frontend, depuis `god-travel-frontend/` :

```powershell
npm ci
npm run dev
```

Vite sert l’interface sur `http://localhost:5173` et relaie les requêtes API vers le backend sur `http://localhost:8080/api`.

## Parcours principaux

- Les voyageurs créent un compte distinct des comptes employés, choisissent un départ et un siège, puis retrouvent leurs billets dans leur espace.
- Les billets confirmés peuvent être consultés et imprimés avec leur QR code.
- Les ventes en ligne ne sont confirmées qu’après réception d’une notification Monetbil valide.
- Les espaces équipe et administration sont protégés par des rôles côté API.
