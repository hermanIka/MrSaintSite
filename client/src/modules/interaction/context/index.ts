/**
 * INTERACTION MODULE CONTEXT
 * 
 * Domaine: Points de contact utilisateur
 * 
 * Responsabilités:
 * - Page de contact (ContactPage)
 * - Foire aux questions (FAQPage)
 * - Formulaires de demande d'information
 * 
 * Ce module gère les interactions utilisateur
 * qui ne sont PAS des transactions financières.
 */

export const INTERACTION_MODULE = {
  name: 'interaction',
  description: 'Points de contact - contact, FAQ, formulaires',
  pages: ['ContactPage', 'FAQPage'],
  components: ['ContactForm'],
  futureFeatures: ['LiveChat', 'Chatbot']
} as const;
