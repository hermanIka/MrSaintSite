/**
 * TRANSACTION MODULE - Exports
 * 
 * Ce module gère les paiements et réservations.
 * 
 * INTÉGRATIONS PRÉVUES:
 * - Calendly (réservation)
 * - Stripe/Lemon Squeezy (paiement)
 * 
 * FLUX DE PAIEMENT:
 * 1. Paiement AVANT réservation
 * 2. Confirmation backend
 * 3. Accès à la réservation Calendly
 * 
 * STATUT: Page de réservation créée, paiement en attente d'intégration
 */

export { default as ReservationPage } from "./components/ReservationPage";

export const TRANSACTION_STATUS = {
  ready: false,
  plannedIntegrations: ['calendly', 'stripe', 'lemon_squeezy'],
  futureIntegrations: ['mobile_money']
} as const;
