/**
 * PAYMENT MODULE - Entry Point
 * 
 * Système de paiement modulaire avec 3 providers :
 * - PawaPay (Mobile Money - Afrique)
 * - MaishaPay (Carte bancaire)
 * - PayPal
 */

export { registerPaymentRoutes } from "./routes";
export { paymentService } from "./service";
export * from "./types";
