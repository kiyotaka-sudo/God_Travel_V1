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

- Les voyageurs créent un compte distinct des comptes équipe, consultent les départs réellement ouverts, choisissent un siège et paient depuis la page de réservation.
- Après validation de la notification Monetbil par le backend, le billet et son QR signé sont consultables dans « Mes billets » ou avec le code billet et le téléphone. L’impression est prévue depuis ces deux parcours.
- L’accueil affiche une scène de bus pilotée par le défilement avec une version statique pour le mouvement réduit ou l’absence de WebGL, puis les horaires, la recherche, la carte Leaflet de l’itinéraire et les services.
- L’espace équipe sépare les opérations disponibles selon le rôle : billetterie, caisse, colis, GPS, maintenance et administration. Les opérations sans API sont signalées au lieu d’être simulées.
- L’interface existe en thèmes clair et sombre, en français, avec des formats de dates `Africa/Douala` et des montants XAF.

## Vérifications frontend

Depuis `god-travel-frontend/` :

```powershell
npm run lint
npm test
npm run build
```

Le proxy local se règle avec `god-travel-frontend/.env` (copiez `.env.example`). Le client HTTP du navigateur appelle `/api`; il ne contient pas d’URL de backend.

## Capacités à compléter côté backend

- Le paiement Monetbil doit être configuré avec une clé de service et un secret de notification valides. Le frontend ne peut pas confirmer un paiement si la notification signée n’arrive pas au backend.
- L’API ne propose pas encore la retenue temporaire de siège, l’idempotence serveur, la recherche avancée, la réservation de groupe, le consentement enregistré, les packs/fidélité, les règles de promotion, les profils et les workflows opérationnels hôtesse/chauffeur, ni plusieurs informations demandées pour le billet. Les écarts détaillés figurent dans `BACKEND_GAPS.md`.
- Le jeton JWT reste persisté dans `localStorage`, comme dans l’architecture existante ; le frontend ne change pas le mécanisme d’authentification.
