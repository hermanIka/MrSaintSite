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
  insertServiceSchema,
  insertCreditTravelRequestSchema,
  insertChatbotSystemPromptSchema,
} from "@shared/schema";
import { chatbotStorage } from "../chatbot/storage";
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

  // ============ SERVICES ============

  // Public endpoint to get all published services
  app.get("/api/services", async (_req, res) => {
    try {
      const allServices = await adminStorage.getAllServices();
      const publishedServices = allServices.filter(s => s.status === "published");
      res.json(publishedServices);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Public endpoint to get a service by slug
  app.get("/api/services/:slug", async (req, res) => {
    try {
      const service = await adminStorage.getServiceBySlug(req.params.slug);
      if (!service || service.status !== "published") {
        return res.status(404).json({ error: "Service non trouvé" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // Admin - get all services (including drafts)
  app.get("/api/admin/services", authMiddleware, async (_req, res) => {
    try {
      const services = await adminStorage.getAllServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/admin/services", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const validatedData = insertServiceSchema.parse(req.body);
      const service = await adminStorage.createService(validatedData);

      await adminStorage.createLog({
        action: "CREATE",
        entityType: "service",
        entityId: service.id,
        details: `Service créé: ${service.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/services/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertServiceSchema.partial().parse(req.body);
      const service = await adminStorage.updateService(id, validatedData);

      if (!service) {
        return res.status(404).json({ error: "Service non trouvé" });
      }

      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "service",
        entityId: service.id,
        details: `Service modifié: ${service.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/admin/services/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const service = await adminStorage.getServiceById(id);

      if (!service) {
        return res.status(404).json({ error: "Service non trouvé" });
      }

      await adminStorage.deleteService(id);

      await adminStorage.createLog({
        action: "DELETE",
        entityType: "service",
        entityId: id,
        details: `Service supprimé: ${service.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true });
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

  // ============ PUBLIC UPLOAD FOR CREDIT REQUESTS ============
  
  app.post("/api/upload/request-url", async (req, res) => {
    try {
      const { name, size, contentType } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Nom de fichier requis" });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      if (!contentType || !allowedTypes.includes(contentType)) {
        return res.status(400).json({ error: "Type de fichier non supporté (images ou PDF uniquement)" });
      }

      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
        return res.status(400).json({ error: "Taille de fichier invalide (max 10 Mo)" });
      }

      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);

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

  // ============ CREDIT TRAVEL REQUESTS (Public submission) ============

  app.post("/api/credit-requests", async (req, res) => {
    try {
      const now = new Date().toISOString();
      const requestData = {
        ...req.body,
        createdAt: now,
        updatedAt: now,
      };
      
      const validatedData = insertCreditTravelRequestSchema.parse(requestData);
      const request = await adminStorage.createCreditRequest(validatedData);
      
      res.status(201).json({ 
        success: true, 
        message: "Votre demande a été soumise avec succès. Nous vous contacterons sous 48 à 72 heures.",
        requestId: request.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating credit request:", error);
      res.status(500).json({ error: "Erreur lors de la soumission de votre demande" });
    }
  });

  // ============ CREDIT TRAVEL REQUESTS (Admin) ============

  app.get("/api/admin/credit-requests", authMiddleware, async (_req, res) => {
    try {
      const requests = await adminStorage.getAllCreditRequests();
      res.json(requests);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/credit-requests/:id", authMiddleware, async (req, res) => {
    try {
      const request = await adminStorage.getCreditRequestById(req.params.id);
      if (!request) {
        return res.status(404).json({ error: "Demande non trouvée" });
      }
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/credit-requests/:id/status", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }

      const request = await adminStorage.updateCreditRequestStatus(id, status, adminNotes);
      
      if (!request) {
        return res.status(404).json({ error: "Demande non trouvée" });
      }

      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "credit_request",
        entityId: id,
        details: `Demande de crédit voyage mise à jour: ${status}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============ CHATBOT SYSTEM PROMPTS ============

  app.get("/api/admin/chatbot/prompts", authMiddleware, async (_req, res) => {
    try {
      const prompts = await chatbotStorage.getAllSystemPrompts();
      res.json(prompts);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/chatbot/prompts/:id", authMiddleware, async (req, res) => {
    try {
      const prompt = await chatbotStorage.getSystemPromptById(req.params.id);
      if (!prompt) {
        return res.status(404).json({ error: "Prompt non trouvé" });
      }
      res.json(prompt);
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/admin/chatbot/prompts", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const now = new Date().toISOString();
      const data = insertChatbotSystemPromptSchema.parse({
        ...req.body,
        createdAt: now,
        updatedAt: now,
      });
      
      const prompt = await chatbotStorage.createSystemPrompt(data);

      await adminStorage.createLog({
        action: "CREATE",
        entityType: "chatbot_prompt",
        entityId: prompt.id,
        details: `Prompt système créé: ${prompt.name} (v${prompt.version})`,
        adminId: req.admin!.adminId,
        createdAt: now,
      });

      res.status(201).json(prompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/chatbot/prompts/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const data = insertChatbotSystemPromptSchema.partial().parse(req.body);
      
      const prompt = await chatbotStorage.updateSystemPrompt(id, data);
      
      if (!prompt) {
        return res.status(404).json({ error: "Prompt non trouvé" });
      }

      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "chatbot_prompt",
        entityId: id,
        details: `Prompt système modifié: ${prompt.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json(prompt);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/chatbot/prompts/:id/activate", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const success = await chatbotStorage.setActivePrompt(id);
      
      if (!success) {
        return res.status(404).json({ error: "Prompt non trouvé" });
      }

      await adminStorage.createLog({
        action: "ACTIVATE",
        entityType: "chatbot_prompt",
        entityId: id,
        details: "Prompt système activé",
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.delete("/api/admin/chatbot/prompts/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const prompt = await chatbotStorage.getSystemPromptById(id);
      
      if (!prompt) {
        return res.status(404).json({ error: "Prompt non trouvé" });
      }

      if (prompt.active) {
        return res.status(400).json({ error: "Impossible de supprimer le prompt actif" });
      }

      await chatbotStorage.deleteSystemPrompt(id);

      await adminStorage.createLog({
        action: "DELETE",
        entityType: "chatbot_prompt",
        entityId: id,
        details: `Prompt système supprimé: ${prompt.name}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
}
