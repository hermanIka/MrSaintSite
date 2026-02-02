/**
 * PAYMENT MODULE - CONTEXT
 * 
 * Domaine: Système de paiement modulaire
 * 
 * PROVIDERS SUPPORTÉS:
 * - PowerPay (Mobile Money) - Paiements africains
 * - LemonSqueezy (Carte bancaire) - Paiements internationaux
 * - PayPal - Paiements universels
 * 
 * ARCHITECTURE:
 * - Chaque provider est isolé dans son propre fichier
 * - Interface commune : initPayment, verifyPayment, handleWebhook
 * - Service central orchestre les providers
 * - Aucune clé API en dur - tout via variables d'environnement
 * 
 * VARIABLES D'ENVIRONNEMENT:
 * 
 * PowerPay:
 * - POWERPAY_API_KEY
 * - POWERPAY_BASE_URL
 * 
 * LemonSqueezy:
 * - LEMONSQUEEZY_API_KEY
 * - LEMONSQUEEZY_STORE_ID
 * - LEMONSQUEEZY_VARIANT_ID (optionnel)
 * - LEMONSQUEEZY_WEBHOOK_SECRET
 * 
 * PayPal:
 * - PAYPAL_CLIENT_ID
 * - PAYPAL_CLIENT_SECRET
 * - PAYPAL_ENV (sandbox | production)
 * 
 * ROUTES API:
 * - GET /api/payments/providers - Liste des providers disponibles
 * - POST /api/payments/init - Initialiser un paiement
 * - GET /api/payments/verify/:paymentId - Vérifier un paiement
 * - GET /api/payments/paypal/capture - Callback PayPal
 * - POST /api/webhooks/powerpay - Webhook PowerPay
 * - POST /api/webhooks/lemonsqueezy - Webhook LemonSqueezy
 * - POST /api/webhooks/paypal - Webhook PayPal
 * 
 * SÉCURITÉ:
 * - Toute la logique de paiement est côté serveur
 * - Validation des signatures webhook
 * - Aucun SDK frontend avec accès direct
 */

export const PAYMENT_MODULE = {
  name: "payment",
  description: "Système de paiement modulaire multi-providers",
  status: "active",
  providers: ["powerpay", "lemonsqueezy", "paypal"],
  routes: [
    "GET /api/payments/providers",
    "POST /api/payments/init",
    "GET /api/payments/verify/:paymentId",
    "GET /api/payments/paypal/capture",
    "POST /api/webhooks/powerpay",
    "POST /api/webhooks/lemonsqueezy",
    "POST /api/webhooks/paypal",
  ],
} as const;
