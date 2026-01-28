/**
 * INTERACTION MODULE CONTEXT
 * 
 * Domaine: Points de contact utilisateur
 * 
 * Responsabilités:
 * - Formulaires de contact
 * - Pages de contact
 * - Demandes d'information
 * 
 * Ce module gère les interactions utilisateur
 * qui ne sont PAS des transactions financières.
 */

export const INTERACTION_MODULE = {
  name: 'interaction',
  description: 'Points de contact - formulaires, contact',
  components: ['ContactForm', 'ContactPage'],
  futureFeatures: ['LiveChat', 'FAQ']
} as const;
