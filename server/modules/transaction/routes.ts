/**
 * TRANSACTION MODULE - Routes
 * 
 * Routes API pour les paiements et réservations.
 * 
 * STATUT: En préparation
 * 
 * ROUTES FUTURES:
 * - POST /api/payments/create-session
 * - POST /api/webhooks/stripe
 * - POST /api/bookings/create
 * - GET /api/bookings/:id
 * 
 * INTÉGRATIONS PRÉVUES:
 * - Stripe / Lemon Squeezy pour les paiements
 * - Calendly pour les réservations
 */

import type { Express } from "express";

export function registerTransactionRoutes(app: Express): void {
  // Placeholder route pour vérifier que le module est chargé
  app.get("/api/transaction/status", (_req, res) => {
    res.json({
      status: "preparation",
      message: "Module de transaction en préparation",
      plannedIntegrations: ["calendly", "stripe", "lemon_squeezy"],
      futureIntegrations: ["mobile_money"]
    });
  });
}
