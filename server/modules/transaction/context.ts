/**
 * TRANSACTION MODULE - BACKEND CONTEXT
 * 
 * Domaine: Gestion des réservations côté serveur
 * 
 * Responsabilités:
 * - Intégration Calendly API
 * - Gestion des réservations
 * - Coordination avec le module de paiement
 * 
 * NOTE: Les paiements sont gérés par le module /server/modules/payment/
 * qui supporte 3 providers : PawaPay, LemonSqueezy, PayPal
 * 
 * RÈGLES DE SÉCURITÉ:
 * - Toutes les clés API sont stockées en secrets
 * - Aucune logique de paiement côté frontend
 * 
 * STATUT: Actif - Réservations en préparation
 */

export const TRANSACTION_BACKEND_MODULE = {
  name: 'transaction-backend',
  description: 'Backend pour réservations (paiements dans module payment)',
  status: 'active',
  routes: [
    'GET /api/transaction/status',
    'POST /api/bookings/create (futur)',
    'GET /api/bookings/:id (futur)'
  ],
  requiredSecrets: [
    'CALENDLY_API_KEY'
  ]
} as const;
