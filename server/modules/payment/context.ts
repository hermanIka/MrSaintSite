/**
 * PAYMENT MODULE - CONTEXT
 * 
 * Domaine: Système de paiement modulaire
 * 
 * PROVIDERS SUPPORTÉS:
 * - PawaPay (Mobile Money) - Paiements africains (MTN, Orange, Airtel, M-Pesa)
 * - MaishaPay (Carte bancaire) - Paiements internationaux
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
 * PawaPay:
 * - PAWAPAY_API_TOKEN
 * - PAWAPAY_ENV (sandbox | production)
 * - PAWAPAY_CORRESPONDENT (ex: MTN_MOMO_CMR, ORANGE_CMR)
 * 
 * MaishaPay:
 * - MAISHAPAY_PUBLIC_KEY
 * - MAISHAPAY_SECRET_KEY
 * - MAISHAPAY_GATEWAY_MODE (0=sandbox, 1=live)
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
 * - POST /api/webhooks/pawapay - Webhook PawaPay
 * - POST /api/webhooks/maishapay - Webhook MaishaPay
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
  providers: ["pawapay", "maishapay", "paypal"],
  routes: [
    "GET /api/payments/providers",
    "POST /api/payments/init",
    "GET /api/payments/verify/:paymentId",
    "GET /api/payments/paypal/capture",
    "POST /api/webhooks/pawapay",
    "POST /api/webhooks/maishapay",
    "POST /api/webhooks/paypal",
  ],
} as const;
