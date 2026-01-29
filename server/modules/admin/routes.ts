/**
 * ADMIN MODULE - Routes
 * 
 * Routes API pour l'administration:
 * - POST /api/admin/login - Connexion
 * - POST /api/admin/logout - Déconnexion
 * - GET /api/admin/me - Info admin connecté
 * - GET/POST/PUT/DELETE /api/admin/trips - Gestion voyages
 * - GET/POST/PUT/DELETE /api/admin/testimonials - Gestion témoignages
 * - GET/POST/PUT/DELETE /api/admin/portfolio - Gestion portfolio
 * - GET/POST/PUT/DELETE /api/admin/faqs - Gestion FAQ
 * - GET /api/admin/logs - Historique activités
 * - GET /api/admin/stats - Statistiques dashboard
 */

import type { Express } from "express";
import { adminStorage } from "./storage";
import { contentStorage } from "../content/storage";
import { 
  generateToken, 
  invalidateToken, 
  authMiddleware,
  type AuthenticatedRequest 
} from "./auth";
import { z } from "zod";
import {
  insertTripSchema,
  insertTestimonialSchema,
  insertPortfolioSchema,
  insertFaqSchema,
} from "@shared/schema";
import { ObjectStorageService } from "../../replit_integrations/object_storage";

export function registerAdminRoutes(app: Express) {
  // ============ AUTH ============
  
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Identifiants requis" });
      }
      
      const admin = await adminStorage.getAdminByUsername(username);
      
      if (!admin || !adminStorage.validatePassword(admin, password)) {
        return res.status(401).json({ error: "Identifiants incorrects" });
      }
      
      const token = generateToken(admin.id, admin.username);
      
      await adminStorage.createLog({
        action: "LOGIN",
        entityType: "admin",
        entityId: admin.id,
        details: `Connexion de ${admin.username}`,
        adminId: admin.id,
        createdAt: new Date().toISOString(),
      });
      
      res.json({ token, admin: { id: admin.id, username: admin.username } });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.post("/api/admin/logout", authMiddleware, async (req: AuthenticatedRequest, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.substring(7);
      invalidateToken(token);
      
      if (req.admin) {
        await adminStorage.createLog({
          action: "LOGOUT",
          entityType: "admin",
          entityId: req.admin.adminId,
          details: `Déconnexion de ${req.admin.username}`,
          adminId: req.admin.adminId,
          createdAt: new Date().toISOString(),
        });
      }
    }
    res.json({ success: true });
  });
  
  app.get("/api/admin/me", authMiddleware, (req: AuthenticatedRequest, res) => {
    res.json({ admin: req.admin });
  });
  
  // ============ STATS ============
  
  app.get("/api/admin/stats", authMiddleware, async (_req, res) => {
    try {
      const [trips, testimonials, portfolio, faqs, logs] = await Promise.all([
        contentStorage.getAllTrips(),
        contentStorage.getAllTestimonials(),
        contentStorage.getAllPortfolio(),
        adminStorage.getAllFaqs(),
        adminStorage.getAllLogs(),
      ]);
      
      res.json({
        trips: trips.length,
        testimonials: testimonials.length,
        portfolio: portfolio.length,
        faqs: faqs.length,
        recentLogs: logs.slice(0, 10),
      });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // ============ TRIPS ============
  
  app.get("/api/admin/trips", authMiddleware, async (_req, res) => {
    try {
      const trips = await contentStorage.getAllTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.post("/api/admin/trips", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertTripSchema.parse(req.body);
      const trip = await contentStorage.createTrip(validatedData);
      
      await adminStorage.createLog({
        action: "CREATE",
        entityType: "trip",
        entityId: trip.id,
        details: `Voyage créé: ${trip.title}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.status(201).json(trip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.put("/api/admin/trips/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTripSchema.partial().parse(req.body);
      const trip = await contentStorage.updateTrip(id, validatedData);
      
      if (!trip) {
        return res.status(404).json({ error: "Voyage non trouvé" });
      }
      
      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "trip",
        entityId: trip.id,
        details: `Voyage modifié: ${trip.title}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json(trip);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.delete("/api/admin/trips/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const trip = await contentStorage.getTripById(id);
      
      if (!trip) {
        return res.status(404).json({ error: "Voyage non trouvé" });
      }
      
      await contentStorage.deleteTrip(id);
      
      await adminStorage.createLog({
        action: "DELETE",
        entityType: "trip",
        entityId: id,
        details: `Voyage supprimé: ${trip.title}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // ============ TESTIMONIALS ============
  
  app.get("/api/admin/testimonials", authMiddleware, async (_req, res) => {
    try {
      const testimonials = await contentStorage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.post("/api/admin/testimonials", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      const testimonial = await contentStorage.createTestimonial(validatedData);
      
      await adminStorage.createLog({
        action: "CREATE",
        entityType: "testimonial",
        entityId: testimonial.id,
        details: `Témoignage créé: ${testimonial.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.put("/api/admin/testimonials/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTestimonialSchema.partial().parse(req.body);
      const testimonial = await contentStorage.updateTestimonial(id, validatedData);
      
      if (!testimonial) {
        return res.status(404).json({ error: "Témoignage non trouvé" });
      }
      
      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "testimonial",
        entityId: testimonial.id,
        details: `Témoignage modifié: ${testimonial.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.delete("/api/admin/testimonials/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const testimonial = await contentStorage.getTestimonialById(id);
      
      if (!testimonial) {
        return res.status(404).json({ error: "Témoignage non trouvé" });
      }
      
      await contentStorage.deleteTestimonial(id);
      
      await adminStorage.createLog({
        action: "DELETE",
        entityType: "testimonial",
        entityId: id,
        details: `Témoignage supprimé: ${testimonial.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // ============ PORTFOLIO ============
  
  app.get("/api/admin/portfolio", authMiddleware, async (_req, res) => {
    try {
      const portfolio = await contentStorage.getAllPortfolio();
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.post("/api/admin/portfolio", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertPortfolioSchema.parse(req.body);
      const item = await contentStorage.createPortfolio(validatedData);
      
      await adminStorage.createLog({
        action: "CREATE",
        entityType: "portfolio",
        entityId: item.id,
        details: `Portfolio créé: ${item.businessName}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.put("/api/admin/portfolio/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPortfolioSchema.partial().parse(req.body);
      const item = await contentStorage.updatePortfolio(id, validatedData);
      
      if (!item) {
        return res.status(404).json({ error: "Portfolio non trouvé" });
      }
      
      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "portfolio",
        entityId: item.id,
        details: `Portfolio modifié: ${item.businessName}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.delete("/api/admin/portfolio/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const item = await contentStorage.getPortfolioById(id);
      
      if (!item) {
        return res.status(404).json({ error: "Portfolio non trouvé" });
      }
      
      await contentStorage.deletePortfolio(id);
      
      await adminStorage.createLog({
        action: "DELETE",
        entityType: "portfolio",
        entityId: id,
        details: `Portfolio supprimé: ${item.businessName}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // ============ FAQS ============
  
  app.get("/api/admin/faqs", authMiddleware, async (_req, res) => {
    try {
      const faqs = await adminStorage.getAllFaqs();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // Public FAQ endpoint
  app.get("/api/faqs", async (_req, res) => {
    try {
      const faqs = await adminStorage.getAllFaqs();
      res.json(faqs);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.post("/api/admin/faqs", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertFaqSchema.parse(req.body);
      const faq = await adminStorage.createFaq(validatedData);
      
      await adminStorage.createLog({
        action: "CREATE",
        entityType: "faq",
        entityId: faq.id,
        details: `FAQ créée: ${faq.question.substring(0, 50)}...`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.status(201).json(faq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.put("/api/admin/faqs/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertFaqSchema.partial().parse(req.body);
      const faq = await adminStorage.updateFaq(id, validatedData);
      
      if (!faq) {
        return res.status(404).json({ error: "FAQ non trouvée" });
      }
      
      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "faq",
        entityId: faq.id,
        details: `FAQ modifiée: ${faq.question.substring(0, 50)}...`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json(faq);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  app.delete("/api/admin/faqs/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const faq = await adminStorage.getFaqById(id);
      
      if (!faq) {
        return res.status(404).json({ error: "FAQ non trouvée" });
      }
      
      await adminStorage.deleteFaq(id);
      
      await adminStorage.createLog({
        action: "DELETE",
        entityType: "faq",
        entityId: id,
        details: `FAQ supprimée: ${faq.question.substring(0, 50)}...`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // ============ LOGS ============
  
  app.get("/api/admin/logs", authMiddleware, async (_req, res) => {
    try {
      const logs = await adminStorage.getAllLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
  
  // ============ UPLOAD (Protected) ============
  
  const objectStorageService = new ObjectStorageService();
  
  /**
   * Request a presigned URL for admin file upload.
   * Protected by auth middleware - only admins can upload.
   */
  app.post("/api/admin/upload/request-url", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Nom de fichier requis" });
      }

      if (!contentType || typeof contentType !== "string" || !contentType.startsWith("image/")) {
        return res.status(400).json({ error: "Seules les images sont acceptées" });
      }

      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
        return res.status(400).json({ error: "Taille de fichier invalide (max 5 Mo)" });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

      await adminStorage.createLog({
        action: "UPLOAD",
        entityType: "file",
        entityId: objectPath,
        details: `Upload de fichier: ${name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json({
        uploadURL,
        objectPath,
        metadata: { name, size, contentType },
      });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ error: "Erreur lors de la génération de l'URL d'upload" });
    }
  });
}
