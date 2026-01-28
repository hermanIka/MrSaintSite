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
└── transaction/         # Paiements et réservations
    ├── components/      # ReservationPage (paiement en attente d'intégration)
    ├── context/         # Contexte du module
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
└── transaction/         # API pour les paiements (EN PRÉPARATION)
    ├── routes.ts        # Routes API (futur)
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
- **In-Memory Storage** (MemStorage) actuellement
- **Drizzle ORM** préparé pour PostgreSQL

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

## Notes de Développement

### Dernière Mise à Jour (Module 3 - Chatbot Hybride)
- Ajout du ChatWidget flottant intégré au Layout
- Système de chatbot hybride :
  - **Mode Règles** (par défaut) : Fonctionne sans API externe, utilise le matching de mots-clés avec la FAQ
  - **Mode IA** : Activé automatiquement quand OPENAI_API_KEY est configurée
- Moteur de règles avec 15+ catégories de réponses prédéfinies
- Base de connaissances complète sur les services Mr Saint
- Fallback automatique vers le mode règles en cas d'erreur IA
- Indicateur de mode visible dans l'en-tête du chat (FAQ / IA)

### Module 1 (Complété)
- Ajout de AboutPage (À propos)
- Ajout de ServicesPage (Offres de services)
- Ajout de FAQPage (Foire aux questions)
- Ajout de ReservationPage (Réservation avec sélection de service)
- Navigation mise à jour avec nouvelles pages
- Fichiers de contexte mis à jour pour chaque module

### Prochaines Étapes
1. Intégration Calendly pour les réservations
2. Intégration Stripe/Lemon Squeezy pour les paiements
3. Migration vers PostgreSQL pour la persistence
4. Module de gestion admin (futur)
