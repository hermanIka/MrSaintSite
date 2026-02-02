/**
 * PAYMENT MODULE - Entry Point
 * 
 * Système de paiement modulaire avec 3 providers :
 * - PawaPay (Mobile Money - Afrique)
 * - LemonSqueezy (Carte bancaire)
 * - PayPal
 */

export { registerPaymentRoutes } from "./routes";
export { paymentService } from "./service";
export * from "./types";
