/**
 * TRANSACTION MODULE - Exports
 * 
 * Ce module gère les paiements et réservations.
 * 
 * PROVIDERS DE PAIEMENT:
 * - LemonSqueezy (Carte bancaire + PayPal intégré)
 * - PawaPay (Mobile Money - Afrique)
 * 
 * INTÉGRATIONS:
 * - Calendly (réservation) - INTÉGRÉ via API Calendly v2
 * 
 * FLUX DE RÉSERVATION:
 * 1. Sélection du service
 * 2. Sélection du créneau (Calendly)
 * 3. Choix du mode de paiement
 * 4. Paiement via le provider choisi
 * 5. Confirmation backend
 * 6. Finalisation réservation
 * 
 * CONFIGURATION:
 * - CALENDLY_API_KEY pour l'intégration API
 */

export { default as ReservationPage } from "./components/ReservationPage";
export { default as CalendarBooking } from "./components/CalendarBooking";
export { default as CalendlyEmbed } from "./components/CalendlyEmbed";
export { PaymentMethodSelector } from "./components/PaymentMethodSelector";

export const TRANSACTION_STATUS = {
  calendly: true,
  paymentProviders: ['lemonsqueezy', 'pawapay'],
} as const;
