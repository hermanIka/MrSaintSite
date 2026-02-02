/**
 * TRANSACTION MODULE - Exports
 * 
 * Ce module gère les paiements et réservations.
 * 
 * PROVIDERS DE PAIEMENT:
 * - PowerPay (Mobile Money)
 * - LemonSqueezy (Carte bancaire)
 * - PayPal
 * 
 * INTÉGRATIONS:
 * - Calendly (réservation) - INTÉGRÉ via variable CALENDLY_URL
 * 
 * FLUX DE PAIEMENT:
 * 1. Sélection du service
 * 2. Choix du mode de paiement
 * 3. Paiement via le provider choisi
 * 4. Confirmation backend
 * 5. Accès à la réservation Calendly
 * 
 * CONFIGURATION CALENDLY:
 * - Variable d'environnement: CALENDLY_URL
 * - Le client doit fournir son lien Calendly personnel
 */

export { default as ReservationPage } from "./components/ReservationPage";
export { default as CalendarBooking } from "./components/CalendarBooking";
export { default as CalendlyEmbed } from "./components/CalendlyEmbed";
export { PaymentMethodSelector } from "./components/PaymentMethodSelector";

export const TRANSACTION_STATUS = {
  calendly: true,
  paymentProviders: ['powerpay', 'lemonsqueezy', 'paypal'],
} as const;
