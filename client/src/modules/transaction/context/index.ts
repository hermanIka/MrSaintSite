/**
 * TRANSACTION MODULE CONTEXT
 * 
 * Domaine: Paiements et réservations
 * 
 * Responsabilités:
 * - Page de réservation (ReservationPage)
 * - Intégration Calendly pour les réservations
 * - Système de paiement multi-providers
 * - Gestion du flux de paiement AVANT réservation
 * - Confirmation de transaction
 * 
 * PROVIDERS DE PAIEMENT:
 * - PowerPay (Mobile Money)
 * - LemonSqueezy (Carte bancaire)
 * - PayPal
 * 
 * RÈGLES STRICTES:
 * - Paiement OBLIGATOIRE avant réservation
 * - Confirmation uniquement via backend
 * - Aucune clé API exposée côté frontend
 * - Architecture modulaire et extensible
 * 
 * STATUT: Système de paiement implémenté avec 3 providers
 */

export const TRANSACTION_MODULE = {
  name: 'transaction',
  description: 'Paiements et réservations',
  status: 'active',
  pages: ['ReservationPage'],
  paymentProviders: ['powerpay', 'lemonsqueezy', 'paypal'],
  integrations: {
    current: ['powerpay', 'lemonsqueezy', 'paypal'],
    planned: ['calendly'],
  },
  flow: [
    '1. Sélection du service (ReservationPage)',
    '2. Choix du mode de paiement (Carte, Mobile Money, PayPal)',
    '3. Paiement via le provider sélectionné',
    '4. Confirmation paiement (backend)',
    '5. Réservation créneau (Calendly)',
    '6. Confirmation finale'
  ]
} as const;
