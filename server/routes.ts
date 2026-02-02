/**
 * ROUTES PRINCIPAL
 * 
 * Ce fichier enregistre toutes les routes des modules.
 * Chaque module gère ses propres routes dans server/modules/<module>/routes.ts
 */

import type { Express } from "express";
import { createServer, type Server } from "http";
import { registerContentRoutes } from "./modules/content";
import { registerTransactionRoutes } from "./modules/transaction";
import { registerAdminRoutes } from "./modules/admin";
import { chatbotRoutes } from "./modules/chatbot";
import { registerInteractionRoutes } from "./modules/interaction";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerPaymentRoutes } from "./modules/payment";

export async function registerRoutes(app: Express): Promise<Server> {
  // Enregistrement des routes par module
  registerContentRoutes(app);
  registerTransactionRoutes(app);
  registerAdminRoutes(app);
  registerInteractionRoutes(app);
  
  // Module de paiement (PowerPay, LemonSqueezy, PayPal)
  registerPaymentRoutes(app);
  
  // Object Storage routes
  registerObjectStorageRoutes(app);
  
  // Module Chatbot
  app.use("/api/chatbot", chatbotRoutes);

  // Configuration endpoint for Calendly URL
  app.get("/api/config/calendly", (req, res) => {
    res.json({
      url: process.env.CALENDLY_URL || null,
      configured: !!process.env.CALENDLY_URL && process.env.CALENDLY_URL !== "https://calendly.com/your-calendly-link",
    });
  });

  const httpServer = createServer(app);

  return httpServer;
}
