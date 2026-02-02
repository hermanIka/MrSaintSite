/**
 * TRANSACTION MODULE - Routes
 * 
 * Routes API pour les réservations et le statut du module.
 * 
 * NOTE: Les paiements sont gérés par le module /server/modules/payment/
 * 
 * ROUTES:
 * - GET /api/transaction/status - Statut du module
 * - POST /api/bookings/create - Créer une réservation (futur)
 * - GET /api/bookings/:id - Détails d'une réservation (futur)
 */

import type { Express } from "express";

export function registerTransactionRoutes(app: Express): void {
  app.get("/api/transaction/status", (_req, res) => {
    res.json({
      status: "active",
      message: "Module de transaction actif",
      paymentProviders: ["powerpay", "lemonsqueezy", "paypal"],
      features: {
        payments: true,
        bookings: false,
        calendly: !!process.env.CALENDLY_URL,
      },
    });
  });
}
