/**
 * PAYMENT MODULE - Entry Point
 * 
 * Système de paiement modulaire avec 3 providers :
 * - PowerPay (Mobile Money)
 * - LemonSqueezy (Carte bancaire)
 * - PayPal
 */

export { registerPaymentRoutes } from "./routes";
export { paymentService } from "./service";
export * from "./types";
