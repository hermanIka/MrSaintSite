/**
 * TRANSACTION MODULE - Exports
 * 
 * Ce module gère les paiements et réservations.
 * 
 * PROVIDERS DE PAIEMENT:
 * - MaishaPay (Carte bancaire)
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
export { PaymentMethodSelector } from "./components/PaymentMethodSelector";
export { default as GoPlusPage } from "./components/GoPlusPage";
export { default as GoPlusSuccessPage } from "./components/GoPlusSuccessPage";
export { default as GoPlusFailedPage } from "./components/GoPlusFailedPage";

export const TRANSACTION_STATUS = {
  calendly: true,
  paymentProviders: ['maishapay', 'pawapay'],
} as const;
