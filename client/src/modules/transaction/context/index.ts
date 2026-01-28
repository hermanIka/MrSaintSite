/**
 * TRANSACTION MODULE CONTEXT
 * 
 * Domaine: Paiements et réservations
 * 
 * Responsabilités:
 * - Intégration Calendly pour les réservations
 * - Intégration Stripe/Lemon Squeezy pour les paiements
 * - Gestion du flux de paiement AVANT réservation
 * - Confirmation de transaction
 * 
 * RÈGLES STRICTES:
 * - Paiement OBLIGATOIRE avant réservation
 * - Confirmation uniquement via backend
 * - Aucune clé API exposée côté frontend
 * - Architecture extensible pour Mobile Money (futur)
 * 
 * STATUT: En préparation - pas encore implémenté
 */

export const TRANSACTION_MODULE = {
  name: 'transaction',
  description: 'Paiements et réservations',
  status: 'preparation',
  integrations: {
    current: [],
    planned: ['calendly', 'stripe', 'lemon_squeezy'],
    future: ['mobile_money']
  },
  flow: [
    '1. Sélection du service',
    '2. Paiement (Stripe/Lemon Squeezy)',
    '3. Confirmation paiement (backend)',
    '4. Réservation créneau (Calendly)',
    '5. Confirmation finale'
  ]
} as const;
