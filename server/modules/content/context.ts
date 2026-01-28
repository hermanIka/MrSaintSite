/**
 * CONTENT MODULE - BACKEND CONTEXT
 * 
 * Domaine: API pour le contenu dynamique
 * 
 * Responsabilités:
 * - Routes API pour trips, testimonials, portfolio
 * - Storage et persistance des données
 * - Validation des données
 * 
 * Ce module expose les endpoints de contenu.
 * Il utilise le storage pour la persistance.
 */

export const CONTENT_BACKEND_MODULE = {
  name: 'content-backend',
  description: 'API endpoints pour le contenu',
  routes: [
    'GET /api/trips',
    'GET /api/trips/:id',
    'GET /api/testimonials',
    'GET /api/portfolio'
  ]
} as const;
