# Mr Saint Travel Agency Website

## Overview

Mr Saint is a premium travel agency website offering three core services: visa facilitation, travel agency creation consulting/coaching, and organized business trips. The site is built as a modern, full-stack web application with a luxury design aesthetic featuring gold and black color schemes.

The application follows a **modular domain-driven architecture** with clear separation between frontend and backend, organized by business domains.

## User Preferences

Preferred communication style: Simple, everyday language (French preferred).

## Architecture Modulaire par Domaines

### Structure des Modules Frontend (`client/src/modules/`)

```
modules/
├── foundation/          # Infrastructure de base
│   ├── components/      # Layout, Navigation, Footer, Theme
│   ├── context/         # Contexte du module
│   └── index.ts         # Exports du module
│
├── content/             # Contenu dynamique
│   ├── components/      # HomePage, AboutPage, TripsPage, PortfolioPage, NotFoundPage
│   ├── context/         # Contexte du module
│   ├── api/             # Logique d'appels API (si nécessaire)
│   └── index.ts         # Exports du module
│
├── interaction/         # Points de contact utilisateur
│   ├── components/      # ContactPage, FAQPage
│   ├── context/         # Contexte du module
│   └── index.ts         # Exports du module
│
├── process/             # Processus métier
│   ├── components/      # ServicesPage, FacilitationVisaPage, CreationAgencePage
│   ├── context/         # Contexte du module
│   └── index.ts         # Exports du module
│
├── transaction/         # Paiements et réservations
│   ├── components/      # ReservationPage, CalendarBooking
│   ├── context/         # Contexte du module
│   └── index.ts         # Exports du module
│
└── admin/               # Administration et supervision
    ├── components/      # AdminLoginPage, AdminDashboard, CRUD pages
    ├── hooks/           # useAdminAuth (authentification)
    ├── context.ts       # Documentation du module
    └── index.ts         # Exports du module
```

### Structure des Modules Backend (`server/modules/`)

```
modules/
├── content/             # API pour le contenu
│   ├── routes.ts        # Routes API (trips, testimonials, portfolio)
│   ├── storage.ts       # Stockage des données
│   ├── context.ts       # Documentation du module
│   └── index.ts         # Exports du module
│
├── transaction/         # API pour les paiements (EN PRÉPARATION)
│   ├── routes.ts        # Routes API (futur)
│   ├── context.ts       # Documentation du module
│   └── index.ts         # Exports du module
│
├── chatbot/             # Chatbot hybride (règles + IA)
│   ├── routes.ts        # API chatbot
│   ├── ruleEngine.ts    # Moteur de règles
│   ├── knowledgeBase.ts # Base de connaissances
│   └── index.ts         # Exports du module
│
└── admin/               # Administration et supervision
    ├── routes.ts        # Routes API protégées (CRUD admin)
    ├── storage.ts       # Stockage admins, logs, FAQ
    ├── auth.ts          # Authentification par token
    ├── context.ts       # Documentation du module
    └── index.ts         # Exports du module
```

## Règles d'Architecture

### Règles Strictes

1. **Séparation Frontend/Backend**
   - Aucune logique métier dans le frontend
   - Les API keys ne sont JAMAIS exposées côté client
   - Validation côté serveur obligatoire

2. **Un fichier = Un module**
   - Chaque composant appartient à un seul domaine
   - Pas de mélange entre modules

3. **Fichiers de contexte obligatoires**
   - Chaque module contient un fichier de contexte documentant sa responsabilité
   - Les contextes sont mis à jour à chaque modification majeure

4. **Extensions futures**
   - L'architecture permet l'ajout de Mobile Money sans refactoring massif
   - Le module transaction est préparé pour Calendly + Stripe/Lemon Squeezy

## API Endpoints

### Module Content
- `GET /api/trips` - Liste tous les voyages
- `GET /api/trips/:id` - Détails d'un voyage
- `GET /api/testimonials` - Liste les témoignages
- `GET /api/portfolio` - Liste le portfolio

### Module Transaction (Futur)
- `GET /api/transaction/status` - Statut du module
- `POST /api/payments/create-session` (prévu)
- `POST /api/webhooks/stripe` (prévu)
- `POST /api/bookings/create` (prévu)

### Module Admin (Protégé)
- `POST /api/admin/login` - Connexion admin
- `POST /api/admin/logout` - Déconnexion (auth requise)
- `GET /api/admin/me` - Info admin connecté (auth requise)
- `GET /api/admin/stats` - Statistiques dashboard (auth requise)
- `GET/POST/PUT/DELETE /api/admin/trips` - Gestion voyages (auth requise)
- `GET/POST/PUT/DELETE /api/admin/testimonials` - Gestion témoignages (auth requise)
- `GET/POST/PUT/DELETE /api/admin/portfolio` - Gestion portfolio (auth requise)
- `GET/POST/PUT/DELETE /api/admin/faqs` - Gestion FAQ (auth requise)
- `GET /api/admin/logs` - Historique activités (auth requise)

### Module FAQ (Public)
- `GET /api/faqs` - Liste toutes les FAQ

## Intégrations Prévues

### Actuelles (Non implémentées)
- **Calendly** - Réservation de créneaux
- **Stripe / Lemon Squeezy** - Paiement en ligne

### Futures
- **Mobile Money** - Extension pour paiements africains

### Flux de Paiement Prévu
1. Sélection du service par l'utilisateur
2. Paiement obligatoire (Stripe/Lemon Squeezy)
3. Confirmation du paiement (backend uniquement)
4. Accès à la réservation (Calendly)
5. Confirmation finale

## Stack Technique

### Frontend
- **React 18** avec TypeScript
- **Vite** comme bundler
- **Wouter** pour le routing
- **TanStack Query** pour la gestion d'état serveur
- **Shadcn UI** + **Radix UI** pour les composants
- **Tailwind CSS** pour le styling

### Backend
- **Express.js** avec TypeScript
- **Architecture modulaire** par domaines
- **PostgreSQL** avec Drizzle ORM (données persistantes)
- **@neondatabase/serverless** pour la connexion DB

### Design System
- Palette: Gold (#F2C94C), Black (#000000), Gray (#1A1A1A)
- Typographie: Poppins/Montserrat (titres), Inter (corps)
- Thème: Light/Dark mode supporté

## Commandes

```bash
npm run dev      # Développement avec HMR
npm run build    # Build production
npm run start    # Démarrer en production
npm run check    # Vérification TypeScript
npm run db:push  # Synchronisation schema DB
```

## Pages et Routes

| Route | Page | Module |
|-------|------|--------|
| `/` | HomePage | content |
| `/a-propos` | AboutPage | content |
| `/services` | ServicesPage | process |
| `/faq` | FAQPage | interaction |
| `/reservation` | ReservationPage | transaction |
| `/facilitation-visa` | FacilitationVisaPage | process |
| `/creation-agence` | CreationAgencePage | process |
| `/voyages` | TripsPage | content |
| `/voyages/:id` | TripDetailPage | content |
| `/portfolio` | PortfolioPage | content |
| `/contact` | ContactPage | interaction |
| `/admin` | AdminLoginPage | admin |
| `/admin/dashboard` | AdminDashboard | admin |
| `/admin/trips` | AdminTripsPage | admin |
| `/admin/testimonials` | AdminTestimonialsPage | admin |
| `/admin/portfolio` | AdminPortfolioPage | admin |
| `/admin/faq` | AdminFaqPage | admin |
| `/admin/logs` | AdminLogsPage | admin |

## Notes de Développement

### Dernière Mise à Jour (Migration PostgreSQL - Janvier 2026)
- Migration complète vers PostgreSQL avec Drizzle ORM
- 6 tables : trips, testimonials, portfolio, faqs, admins, activity_logs
- Script de seed avec données initiales (3 voyages, 3 témoignages, 6 portfolio, 6 FAQ)
- Données persistantes entre redémarrages du serveur
- Pour exécuter le seed : `npx tsx server/seed.ts`

### Module Portfolio Dynamique (Janvier 2026)
- Portfolio enrichi avec champs : description, serviceType, result, year, status, clientLogo
- Filtrage dynamique par type de service (visa, agence, voyage)
- Système de statut draft/published - seuls les projets publiés sont visibles au public
- Page admin avec CRUD complet et toggle de publication
- Intégration chatbot avec exemples concrets de succès
- 6 projets seed réalistes avec résultats mesurables
- Statistiques affichées : 50+ projets, 95% réussite, 8+ ans d'expérience

### Module 6 (Admin & Supervision)
- Système d'authentification par token avec session active
- Dashboard administrateur avec statistiques (voyages, témoignages, portfolio, FAQ)
- Gestion CRUD complète pour voyages, témoignages, portfolio et FAQ
- Historique des activités avec traçabilité des actions
- Toutes les routes admin protégées par middleware d'authentification
- Identifiants par défaut : admin / admin123
- Navigation responsive avec sidebar et menu mobile
- Convention admin : local state pour formulaires, custom queryFn avec auth headers

### Module 4 (Calendrier de Réservation)
- Composant CalendarBooking avec sélection de date et créneau horaire
- Gestion des créneaux disponibles/réservés
- Fuseau horaire affiché (Paris GMT+1)
- Flow complet : sélection service → calendrier → créneau → confirmation
- Préparé pour intégration Calendly API (créneaux actuellement mockés)
- Intégration paiement Stripe prévue (20€ avant accès calendrier)

### Module 3 (Chatbot Hybride - Complété)
- ChatWidget flottant intégré au Layout
- Système de chatbot hybride (Mode Règles par défaut, Mode IA avec clé API)
- 15+ catégories de réponses prédéfinies
- Fallback automatique vers le mode règles en cas d'erreur IA

### Module 1 (Complété)
- Ajout de AboutPage (À propos)
- Ajout de ServicesPage (Offres de services)
- Ajout de FAQPage (Foire aux questions)
- Ajout de ReservationPage (Réservation avec sélection de service)
- Navigation mise à jour avec nouvelles pages
- Fichiers de contexte mis à jour pour chaque module

### Intégration Calendly (Janvier 2026)
- Widget Calendly intégré via CalendlyEmbed component
- Configuration via variable d'environnement CALENDLY_URL
- Message informatif affiché si Calendly non configuré
- Endpoint API: GET /api/config/calendly (vérifie la configuration)
- Pour configurer: Modifier CALENDLY_URL avec le lien Calendly du client

### Prochaines Étapes
1. Intégration Stripe/Lemon Squeezy pour les paiements (en attente des clés API du client)
2. Amélioration chatbot avec OpenAI (optionnel)
