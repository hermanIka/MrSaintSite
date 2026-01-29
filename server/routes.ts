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

export async function registerRoutes(app: Express): Promise<Server> {
  // Enregistrement des routes par module
  registerContentRoutes(app);
  registerTransactionRoutes(app);
  registerAdminRoutes(app);
  registerInteractionRoutes(app);
  
  // Object Storage routes
  registerObjectStorageRoutes(app);
  
  // Module Chatbot
  app.use("/api/chatbot", chatbotRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
