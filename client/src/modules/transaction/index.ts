/**
 * TRANSACTION MODULE - Exports
 * 
 * Ce module gère les paiements et réservations.
 * 
 * INTÉGRATIONS:
 * - Calendly (réservation) - INTÉGRÉ via variable CALENDLY_URL
 * - Stripe/Lemon Squeezy (paiement) - EN ATTENTE de clés API
 * 
 * FLUX DE PAIEMENT PRÉVU:
 * 1. Paiement AVANT réservation (Stripe)
 * 2. Confirmation backend
 * 3. Accès à la réservation Calendly
 * 
 * CONFIGURATION CALENDLY:
 * - Variable d'environnement: CALENDLY_URL
 * - Valeur par défaut: placeholder (affiche message de configuration)
 * - Le client doit fournir son lien Calendly personnel
 */

export { default as ReservationPage } from "./components/ReservationPage";
export { default as CalendarBooking } from "./components/CalendarBooking";
export { default as CalendlyEmbed } from "./components/CalendlyEmbed";

export const TRANSACTION_STATUS = {
  calendly: true,
  stripe: false,
  plannedIntegrations: ['stripe', 'lemon_squeezy'],
  futureIntegrations: ['mobile_money']
} as const;
