/**
 * CONTENT MODULE CONTEXT
 * 
 * Domaine: Gestion du contenu dynamique
 * 
 * Responsabilités:
 * - Affichage des voyages (Trips)
 * - Témoignages clients (Testimonials)
 * - Portfolio des réalisations
 * - Pages statiques de contenu
 * 
 * Ce module gère l'affichage du contenu.
 * La logique de récupération des données est dans api/.
 */

export const CONTENT_MODULE = {
  name: 'content',
  description: 'Contenu dynamique - voyages, témoignages, portfolio',
  entities: ['Trip', 'Testimonial', 'Portfolio'],
  apiEndpoints: [
    '/api/trips',
    '/api/testimonials', 
    '/api/portfolio'
  ]
} as const;
