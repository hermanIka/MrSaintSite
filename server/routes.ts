/**
 * ROUTES PRINCIPAL
 * 
 * Ce fichier enregistre toutes les routes des modules.
 * Chaque module gère ses propres routes dans server/modules/<module>/routes.ts
 */

import express, { type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { registerContentRoutes } from "./modules/content";
import { registerTransactionRoutes } from "./modules/transaction";
import { registerAdminRoutes } from "./modules/admin";
import { chatbotRoutes } from "./modules/chatbot";
import { registerInteractionRoutes } from "./modules/interaction";
import { registerPaymentRoutes } from "./modules/payment";
import { calendlyRoutes } from "./modules/calendly";
import { registerGoPlusRoutes } from "./modules/go_plus/routes";
import { registerReservationRoutes } from "./modules/reservation/routes";
import { localStorageService } from "./services/localStorageService";
import * as path from "path";
import * as fs from "fs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve local uploaded files
  const uploadsDir = localStorageService.getUploadsDir();
  app.get("/uploads/:filename", (req: Request, res: Response) => {
    localStorageService.serveFile(req, res);
  });

  // Direct upload endpoint (used by localStorageService signed upload URLs)
  // express.raw() middleware bypasses the global express.json() parser so the binary body is preserved
  app.put("/api/upload/direct/:filename", express.raw({ type: "*/*", limit: "20mb" }), (req: Request, res: Response) => {
    const filename = req.params.filename;
    if (!filename || filename.includes("..")) {
      return res.status(400).json({ error: "Nom de fichier invalide" });
    }
    const filePath = path.join(uploadsDir, filename);
    try {
      const buffer: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || "");
      fs.writeFileSync(filePath, buffer);
      res.status(200).json({ success: true });
    } catch (err) {
      console.error("[Upload] Write error:", err);
      res.status(500).json({ error: "Erreur lors de l'upload" });
    }
  });

  // Enregistrement des routes par module
  registerContentRoutes(app);
  registerTransactionRoutes(app);
  registerAdminRoutes(app);
  registerInteractionRoutes(app);
  
  // Module de paiement (PawaPay, MaishaPay, PayPal)
  registerPaymentRoutes(app);

  // Module GO+ (cartes virtuelles de fidélité)
  registerGoPlusRoutes(app);

  // Module Réservation Voyages
  registerReservationRoutes(app);
  
  // Module Chatbot
  app.use("/api/chatbot", chatbotRoutes);
  
  // Module Calendly (intégration API)
  app.use("/api/calendly", calendlyRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
