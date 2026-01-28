/**
 * TRANSACTION MODULE - BACKEND CONTEXT
 * 
 * Domaine: Gestion des paiements et réservations côté serveur
 * 
 * Responsabilités:
 * - Webhooks Stripe/Lemon Squeezy
 * - Validation des paiements
 * - Intégration Calendly API
 * - Confirmation des transactions
 * 
 * RÈGLES DE SÉCURITÉ:
 * - Toutes les clés API sont stockées en secrets
 * - Validation stricte des webhooks
 * - Logs de toutes les transactions
 * - Aucune logique de paiement côté frontend
 * 
 * STATUT: En préparation - structure prête pour l'implémentation
 */

export const TRANSACTION_BACKEND_MODULE = {
  name: 'transaction-backend',
  description: 'Backend pour paiements et réservations',
  status: 'preparation',
  futureRoutes: [
    'POST /api/payments/create-session',
    'POST /api/webhooks/stripe',
    'POST /api/bookings/create',
    'GET /api/bookings/:id'
  ],
  requiredSecrets: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CALENDLY_API_KEY',
    'LEMON_SQUEEZY_API_KEY'
  ]
} as const;
