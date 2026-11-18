# Audit et état du frontend God Travel

Mis à jour le 18 novembre 2026 après la refonte guidée par `frontend.md`. Le périmètre reste strictement frontend : aucune entité, route, règle de sécurité ni migration de base n’a été modifiée.

## Architecture et source des données

- React 18, Vite 5, React Router 6, Zustand persisté, Axios, Tailwind CSS et composants CSS maison.
- Leaflet pour l’itinéraire et la carte des positions ; Three.js / React Three Fiber pour le bus ; GSAP ScrollTrigger et Lenis pour synchroniser le défilement et la scène.
- L’API utilise `/api`. Le proxy de développement prend `VITE_API_PROXY_TARGET` et `VITE_WS_PROXY_TARGET` depuis l’environnement, avec `http://localhost:8080` comme valeur locale par défaut.
- Le backend Spring Security utilise JWT Bearer. Le front appelle désormais `GET /auth/me` pour réhydrater le rôle et le profil de la session.
- Le token et le profil restent persistés sous `god-travel-auth` dans `localStorage`, conformément à la pratique existante. Ce stockage expose le jeton en cas de XSS ; aucun changement de protocole ou de stockage n’a été fait ici.
- Le schéma de référence de ce dépôt est `god_travel_complet_master.sql`. La base active et les données locales ne sont pas embarquées avec le frontend.

## Authentification et rôles constatés

- Voyageur : `POST /auth/client/inscription` avec `{ prenom, nom, telephone, email, password }`, puis `POST /auth/client/connexion` avec `{ login, password }`. Le JWT client est converti en `ROLE_CLIENT` dans le front.
- Équipe : `POST /auth/login` avec `{ login, password }`. Le profil et l’agence sont ceux renvoyés par le serveur ; l’accès employé refuse le rôle client.
- Rôles employés présents : `ROLE_ADMIN`, `ROLE_CHEF_AGENCE`, `ROLE_GUICHETIER`, `ROLE_HOTESSE`, `ROLE_CHAUFFEUR`, `ROLE_MECANICIEN`, `ROLE_COMPTABLE`.
- Les routes privées reviennent à la destination demandée après connexion. Les routes et menus équipe sont filtrés par rôle ; les réponses 401 déconnectent et redirigent vers le bon formulaire, les 403 affichent un message distinct.
- L’API n’expose pas de récupération de mot de passe, de révocation de JWT ni de stockage du consentement d’inscription. Le front le dit au lieu de prétendre fournir ces actions.

## Contrat backend consommé par les écrans

| Domaine | Routes consommées | Écrans concernés |
|---|---|---|
| Authentification | `/auth/login`, `/auth/client/connexion`, `/auth/client/inscription`, `/auth/me` | Connexions équipe et voyageur, session |
| Départs / sièges | `GET /voyages`, `GET /voyages/{id}/sieges` | Accueil, réservation, guichet |
| Billets | `POST /billets`, `POST /billets/client`, `GET /billets/mes-billets`, `GET /billets/consulter`, `PUT /billets/{id}/annuler`, `GET /billets/{code}/qr` | Vente, espace voyageur, consultation et impression |
| Monetbil | `POST /paiements/monetbil/initier`, `GET /paiements/monetbil/statut`, notification webhook gérée par l’API | Parcours et retour de paiement |
| Caisse | `/sessions-caisse/active`, `/ouvrir`, `/releves`, `/{id}/paiements`, `/{id}/fermer` | Caisse, guichet |
| Colis | `GET /colis`, `GET /colis/suivi/{code}`, `POST /colis`, `PUT /colis/{id}/remise` | Fret et suivi |
| GPS / alertes | `GET /positions-gps/live`, `GET /positions-gps/alertes`, `PUT /positions-gps/alertes/{id}/acquitter` | Flotte |
| Maintenance | `GET /maintenance`, `/maintenance/bus`, `POST /maintenance` | Mécanicien |
| Administration | `/admin/stats`, `/compagnies`, `/agences`, `/villes`, `/lignes`, `/bus`, `/utilisateurs`, `/profils`, `POST /admin/utilisateurs` | Tableau admin |

Les valeurs d’opérateur de Monetbil sont `MTN` et `ORANGE`, selon le DTO backend. Le front envoie ces valeurs, et non les codes télécom `CM_*`.

## Écrans livrés

- Accueil en français : navigation persistante, scène de bus pilotée par le scroll, repli statique si WebGL indisponible ou si le mouvement réduit est activé, départs réellement publiés, réservation, carte Leaflet indicative, services et confidentialité.
- Voyageur : inscription et connexion séparées des comptes équipe, cinq étapes de réservation pour un passager, plan SVG basé sur la capacité et la disponibilité API, opérateur/numéro Mobile Money, retour et vérification du statut, billets consultables et imprimables.
- Équipe : menus RBAC, tableau de bord admin, vente guichet et impression, caisse et clôture de session, registre et suivi colis, carte GPS et alertes, maintenance et administration.
- Profils hôtesse et chauffeur : le rôle est reconnu mais les fonctions opérationnelles ne sont pas exposées par l’API. L’interface explique cette limite au lieu de montrer des opérations fictives.
- Thème clair/sombre (préférence système et choix manuel), dates affichées en `Africa/Douala`, montants XAF, états de chargement/vide/erreur et styles d’impression.

## Limites et vérifications

- Voir `BACKEND_GAPS.md` pour les comportements impossibles à livrer sans contrat API supplémentaire.
- Les réservations client exigent un compte et un seul passager, comme le permettent les DTO actuels. Le serveur confirme le billet après notification Monetbil.
- Les billets sont imprimés avec les champs et le QR signé renvoyés par le backend ; les champs non disponibles ne sont pas inventés.
- Vérifications du dépôt : `npm run lint`, `npm test`, `npm run build` depuis `god-travel-frontend/`.
