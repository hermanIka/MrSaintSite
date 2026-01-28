/**
 * CONTENT MODULE CONTEXT
 * 
 * Domaine: Gestion du contenu dynamique
 * 
 * Responsabilités:
 * - Page d'accueil (HomePage)
 * - Page À propos (AboutPage)
 * - Affichage des voyages (TripsPage, TripDetailPage)
 * - Témoignages clients (Testimonials)
 * - Portfolio des réalisations (PortfolioPage)
 * - Page 404 (NotFoundPage)
 * 
 * Ce module gère l'affichage du contenu.
 * La logique de récupération des données est dans api/.
 */

export const CONTENT_MODULE = {
  name: 'content',
  description: 'Contenu dynamique - accueil, à propos, voyages, témoignages, portfolio',
  pages: ['HomePage', 'AboutPage', 'TripsPage', 'TripDetailPage', 'PortfolioPage', 'NotFoundPage'],
  entities: ['Trip', 'Testimonial', 'Portfolio'],
  apiEndpoints: [
    '/api/trips',
    '/api/testimonials', 
    '/api/portfolio'
  ]
} as const;
