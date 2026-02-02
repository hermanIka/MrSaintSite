/**
 * TRANSACTION MODULE CONTEXT
 * 
 * Domaine: Paiements et réservations
 * 
 * Responsabilités:
 * - Page de réservation (ReservationPage)
 * - Intégration Calendly pour les réservations
 * - Système de paiement multi-providers
 * - Gestion du flux de paiement APRÈS sélection de créneau
 * - Confirmation de transaction
 * 
 * PROVIDERS DE PAIEMENT:
 * - PawaPay (Mobile Money - Afrique)
 * - LemonSqueezy (Carte bancaire)
 * - PayPal
 * 
 * RÈGLES STRICTES:
 * - Sélection de créneau AVANT paiement
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
  paymentProviders: ['pawapay', 'lemonsqueezy', 'paypal'],
  integrations: {
    current: ['pawapay', 'lemonsqueezy', 'paypal'],
    planned: ['calendly'],
  },
  flow: [
    '1. Sélection du service (ReservationPage)',
    '2. Sélection du créneau (CalendarBooking)',
    '3. Choix du mode de paiement (Carte, Mobile Money, PayPal)',
    '4. Paiement via le provider sélectionné',
    '5. Confirmation paiement (backend)',
    '6. Finalisation réservation (Calendly)'
  ]
} as const;
