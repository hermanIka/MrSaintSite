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
  insertGoPlusPlanSchema,
  insertVisaRequestSchema,
  insertAgencyRequestSchema,
} from "@shared/schema";
import {
  getAllReservationsWithDetails,
  getReservationDetail,
  updateReservationStatus,
} from "../reservation/service";
import { chatbotStorage } from "../chatbot/storage";
import { localStorageService } from "../../services/localStorageService";
import { goPlusStorage } from "../go_plus/storage";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const loginRateLimit = new Map<string, { count: number; resetAt: number }>();
const LOGIN_RATE_LIMIT = 10;
const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000;

function loginRateLimitMiddleware(req: any, res: any, next: any): void {
  const ip = req.ip || req.connection.remoteAddress || "unknown";
  const now = Date.now();
  const entry = loginRateLimit.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= LOGIN_RATE_LIMIT) {
      res.status(429).json({ error: "Trop de tentatives de connexion. Réessayez dans 15 minutes." });
      return;
    }
    entry.count++;
  } else {
    loginRateLimit.set(ip, { count: 1, resetAt: now + LOGIN_RATE_WINDOW_MS });
  }
  next();
}

export function registerAdminRoutes(app: Express) {
  // ============ AUTH ============
  
  app.post("/api/admin/login", loginRateLimitMiddleware, async (req, res) => {
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
  

  // ============ TRIP GALLERY ============

  app.post('/api/admin/trips/:id/gallery', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { url, caption } = req.body;
      if (!url) return res.status(400).json({ error: 'URL requise' });
      const photo = await contentStorage.addTripGalleryPhoto({
        tripId: id,
        url,
        caption: caption || null,
        displayOrder: 0,
      });
      res.json(photo);
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  });

  app.delete('/api/admin/trips/:id/gallery/:photoId', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { photoId } = req.params;
      await contentStorage.deleteTripGalleryPhoto(photoId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Erreur serveur' });
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

      const MAX_SIZE = 5 * 1024 * 1024;
      if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
        return res.status(400).json({ error: "Taille de fichier invalide (max 5 Mo)" });
      }

      const { uploadURL, objectPath } = await localStorageService.getSignedUploadUrl(name, contentType);

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

      const MAX_SIZE = 10 * 1024 * 1024;
      if (typeof size !== "number" || size <= 0 || size > MAX_SIZE) {
        return res.status(400).json({ error: "Taille de fichier invalide (max 10 Mo)" });
      }

      const { uploadURL, objectPath } = await localStorageService.getSignedUploadUrl(name, contentType);

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

  // ============ GO+ ADMIN ============

  app.get("/api/admin/go-plus/plans", authMiddleware, async (_req, res) => {
    try {
      const plans = await goPlusStorage.getAllGoPlusPlans();
      const parsed = plans.map(p => ({ ...p, price: p.price / 100, privileges: JSON.parse(p.privileges) }));
      res.json({ success: true, plans: parsed });
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.post("/api/admin/go-plus/plans", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const body = { ...req.body, price: Math.round(Number(req.body.price) * 100), createdAt: new Date().toISOString() };
      const parsed = insertGoPlusPlanSchema.safeParse(body);
      if (!parsed.success) return res.status(400).json({ error: parsed.error.errors[0].message });
      const plan = await goPlusStorage.createGoPlusPlan(parsed.data);
      res.json({ success: true, plan });
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/go-plus/plans/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const updates: Record<string, unknown> = { ...req.body };
      if (updates.price !== undefined) updates.price = Math.round(Number(updates.price) * 100);
      if (updates.privileges && Array.isArray(updates.privileges)) updates.privileges = JSON.stringify(updates.privileges);
      const plan = await goPlusStorage.updateGoPlusPlan(id, updates as any);
      if (!plan) return res.status(404).json({ error: "Plan introuvable" });
      res.json({ success: true, plan });
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/go-plus/cards", authMiddleware, async (_req, res) => {
    try {
      const cards = await goPlusStorage.getAllGoPlusCards();
      res.json({ success: true, cards });
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/go-plus/cards/:id/suspend", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      await goPlusStorage.updateGoPlusCardStatus(id, "suspended");
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/go-plus/transactions", authMiddleware, async (_req, res) => {
    try {
      const transactions = await goPlusStorage.getAllGoPlusTransactions();
      res.json({ success: true, transactions });
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============ VISA REQUESTS (Public submission) ============

  app.post("/api/visa-requests", async (req, res) => {
    try {
      const now = new Date().toISOString();

      // Vérification Gold pour soumission gratuite
      if (req.body.paymentMethod === "go-plus-gold") {
        const email = req.body.email as string;
        const card = await goPlusStorage.getUserActiveGoPlusCard(email?.toLowerCase?.() || email);
        if (!card) {
          return res.status(403).json({ error: "Carte GO+ Gold active requise pour bénéficier de ce service gratuit." });
        }
        const plan = await goPlusStorage.getGoPlusPlanById(card.planId);
        if (!plan || plan.name !== "Gold") {
          return res.status(403).json({ error: "Ce service est réservé aux porteurs de la carte GO+ Gold." });
        }
      }

      const requestData = {
        ...req.body,
        createdAt: now,
        updatedAt: now,
      };

      const validatedData = insertVisaRequestSchema.parse(requestData);
      const request = await adminStorage.createVisaRequest(validatedData);

      const visaTypeLabels: Record<string, string> = {
        tourisme: "Tourisme",
        business: "Business",
        etudes: "Études",
        travail: "Travail",
      };
      const visaLabel = visaTypeLabels[validatedData.visaType] || validatedData.visaType;

      try {
        await resend.emails.send({
          from: "Mr Saint <onboarding@resend.dev>",
          to: "matandusaint@gmail.com",
          subject: `[Demande Visa] ${validatedData.firstName} ${validatedData.lastName} — ${visaLabel}`,
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
              <div style="background: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #F2C94C; margin: 0; font-size: 24px;">Mr Saint</h1>
                <p style="color: #fff; margin: 4px 0; font-size: 14px;">Nouvelle demande de visa</p>
              </div>
              <div style="border: 1px solid #e0e0e0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333; margin-top: 0;">Informations du demandeur</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #666; width: 40%;"><strong>Nom complet</strong></td><td style="padding: 8px 0;">${validatedData.firstName} ${validatedData.lastName}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Email</strong></td><td style="padding: 8px 0;">${validatedData.email}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Téléphone</strong></td><td style="padding: 8px 0;">${validatedData.phone}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Nationalité</strong></td><td style="padding: 8px 0;">${validatedData.nationality}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Date de naissance</strong></td><td style="padding: 8px 0;">${validatedData.birthDate}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Type de visa</strong></td><td style="padding: 8px 0; color: #F2C94C; font-weight: bold;">${visaLabel}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Destination</strong></td><td style="padding: 8px 0;">${validatedData.destination}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Mode de paiement</strong></td><td style="padding: 8px 0;">${validatedData.paymentMethod === "go-plus-gold" ? "GO+ Gold (Gratuit)" : validatedData.paymentMethod || "N/A"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Montant payé</strong></td><td style="padding: 8px 0; color: ${validatedData.amount === 0 ? "#B8860B" : "green"}; font-weight: bold;">${validatedData.amount === 0 ? "GRATUIT — Porteur GO+ Gold" : validatedData.amount + "€"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>ID Paiement</strong></td><td style="padding: 8px 0; font-size: 12px; font-family: monospace;">${validatedData.paymentId || "N/A"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Réf. Demande</strong></td><td style="padding: 8px 0; font-size: 12px; font-family: monospace;">${request.id}</td></tr>
                </table>
                <div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin-top: 16px;">
                  <p style="margin: 0 0 8px 0; color: #333; font-weight: bold;">Documents uploadés :</p>
                  <ul style="margin: 0; color: #555; line-height: 1.8;">
                    <li>Passeport : ${validatedData.passportUrl ? "✓ Reçu" : "✗ Manquant"}</li>
                    <li>Photo récente : ${validatedData.photoUrl ? "✓ Reçu" : "✗ Manquant"}</li>
                    <li>Document justificatif : ${validatedData.supportingDocUrl ? "✓ Reçu" : "Non fourni"}</li>
                  </ul>
                </div>
                <p style="margin-top: 24px; color: #888; font-size: 12px;">Accédez au tableau de bord admin pour traiter cette demande.</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("[Visa] Email admin notification failed:", emailError);
      }

      try {
        await resend.emails.send({
          from: "Mr Saint <onboarding@resend.dev>",
          to: validatedData.email,
          subject: "Votre demande de facilitation visa a bien été reçue — Mr Saint",
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
              <div style="background: #000; padding: 24px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #F2C94C; margin: 0; font-size: 26px; letter-spacing: 1px;">Mr Saint</h1>
                <p style="color: #fff; margin: 6px 0 0 0; font-size: 14px;">Agence de voyage & facilitation visa</p>
              </div>
              <div style="border: 1px solid #e0e0e0; border-top: none; padding: 32px 24px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #111; margin-top: 0; font-size: 20px;">Bonjour ${validatedData.firstName},</h2>
                <p style="color: #444; line-height: 1.7; font-size: 15px;">
                  Nous avons bien reçu votre demande de facilitation visa pour la destination <strong>${validatedData.destination}</strong>.
                  Votre dossier est maintenant entre les mains de notre équipe.
                </p>
                <div style="background: #F2C94C10; border: 1px solid #F2C94C40; border-radius: 8px; padding: 20px; margin: 24px 0;">
                  <p style="margin: 0; color: #111; font-size: 15px; font-weight: 600;">📞 Prochaine étape</p>
                  <p style="margin: 10px 0 0 0; color: #444; line-height: 1.7; font-size: 14px;">
                    Un agent voyagiste de notre équipe entrera en contact avec vous très prochainement par <strong>appel téléphonique ou vidéoconférence</strong> afin d'entamer la procédure ensemble et vous guider pas à pas dans votre démarche visa.
                  </p>
                </div>
                <div style="background: #f9f9f9; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
                  <p style="margin: 0 0 10px 0; color: #555; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Récapitulatif de votre dossier</p>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr><td style="padding: 5px 0; color: #888;">Nom :</td><td style="padding: 5px 0; color: #111; font-weight: 500;">${validatedData.firstName} ${validatedData.lastName}</td></tr>
                    <tr><td style="padding: 5px 0; color: #888;">Type de visa :</td><td style="padding: 5px 0; color: #111; font-weight: 500;">${visaLabel}</td></tr>
                    <tr><td style="padding: 5px 0; color: #888;">Destination :</td><td style="padding: 5px 0; color: #111; font-weight: 500;">${validatedData.destination}</td></tr>
                    <tr><td style="padding: 5px 0; color: #888;">Référence dossier :</td><td style="padding: 5px 0; color: #F2C94C; font-weight: 700; font-family: monospace;">${request.id}</td></tr>
                  </table>
                </div>
                <p style="color: #666; font-size: 14px; line-height: 1.6;">
                  Conservez votre numéro de référence <strong style="color: #111;">${request.id}</strong> pour tout suivi de votre dossier.<br/>
                  Pour toute question, vous pouvez nous joindre via WhatsApp ou notre formulaire de contact.
                </p>
                <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #eee;">
                  <p style="color: #aaa; font-size: 12px; margin: 0;">© Mr Saint — Agence de voyage & facilitation visa</p>
                </div>
              </div>
            </div>
          `,
        });
      } catch (userEmailError) {
        console.error("[Visa] User email notification failed:", userEmailError);
      }

      res.status(201).json({
        success: true,
        message: "Votre demande de visa a été soumise avec succès. Vous serez contacté dans les 48 heures.",
        requestId: request.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating visa request:", error);
      res.status(500).json({ error: "Erreur lors de la soumission de votre demande" });
    }
  });

  // ============ VISA REQUESTS (Admin) ============

  app.get("/api/admin/visa-requests", authMiddleware, async (_req, res) => {
    try {
      const requests = await adminStorage.getAllVisaRequests();
      res.json(requests);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/visa-requests/:id", authMiddleware, async (req, res) => {
    try {
      const request = await adminStorage.getVisaRequestById(req.params.id);
      if (!request) return res.status(404).json({ error: "Demande non trouvée" });
      res.json(request);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/visa-requests/:id/status", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!["pending", "processing", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }

      const request = await adminStorage.updateVisaRequestStatus(id, status, adminNotes);
      if (!request) return res.status(404).json({ error: "Demande non trouvée" });

      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "visa_request",
        entityId: id,
        details: `Demande visa mise à jour: ${status}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json(request);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============ AGENCY REQUESTS (Public submission) ============

  app.post("/api/agency-requests", async (req, res) => {
    try {
      const now = new Date().toISOString();
      const requestData = { ...req.body, createdAt: now, updatedAt: now };
      const validatedData = insertAgencyRequestSchema.parse(requestData);
      const request = await adminStorage.createAgencyRequest(validatedData);

      const packLabels: Record<string, string> = {
        classique: "Agence Classique",
        premium: "Agence Premium",
        elite: "Agence Elite",
      };
      const packLabel = packLabels[validatedData.packName] || validatedData.packName;

      try {
        await resend.emails.send({
          from: "Mr Saint <onboarding@resend.dev>",
          to: "matandusaint@gmail.com",
          subject: `[Demande Agence] ${validatedData.firstName} ${validatedData.lastName} — ${packLabel}`,
          html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fff;">
              <div style="background: #000; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #F2C94C; margin: 0; font-size: 24px;">Mr Saint</h1>
                <p style="color: #fff; margin: 4px 0; font-size: 14px;">Nouvelle demande de création d'agence</p>
              </div>
              <div style="border: 1px solid #e0e0e0; border-top: none; padding: 24px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333; margin-top: 0;">Forfait choisi : <span style="color: #F2C94C;">${packLabel} — ${validatedData.packPrice}€</span></h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 8px 0; color: #666; width: 40%;"><strong>Nom complet</strong></td><td style="padding: 8px 0;">${validatedData.firstName} ${validatedData.lastName}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Email</strong></td><td style="padding: 8px 0;">${validatedData.email}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Téléphone</strong></td><td style="padding: 8px 0;">${validatedData.phone}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Nationalité</strong></td><td style="padding: 8px 0;">${validatedData.nationality}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Date de naissance</strong></td><td style="padding: 8px 0;">${validatedData.birthDate}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Mode de paiement</strong></td><td style="padding: 8px 0;">${validatedData.paymentMethod || "N/A"}</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Montant payé</strong></td><td style="padding: 8px 0; color: green; font-weight: bold;">${validatedData.amount}€</td></tr>
                  <tr><td style="padding: 8px 0; color: #666;"><strong>Réf. Demande</strong></td><td style="padding: 8px 0; font-size: 12px; font-family: monospace;">${request.id}</td></tr>
                </table>
                ${validatedData.message ? `<div style="background: #f9f9f9; padding: 16px; border-radius: 6px; margin-top: 16px;"><p style="margin: 0 0 8px 0; color: #333; font-weight: bold;">Message du client :</p><p style="margin: 0; color: #555;">${validatedData.message}</p></div>` : ""}
                <p style="margin-top: 24px; color: #888; font-size: 12px;">Accédez au tableau de bord admin pour traiter cette demande.</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("[Agency] Email notification failed:", emailError);
      }

      res.status(201).json({
        success: true,
        message: "Votre demande a été soumise avec succès. Vous serez contacté dans les 24 à 48 heures.",
        requestId: request.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error creating agency request:", error);
      res.status(500).json({ error: "Erreur lors de la soumission de votre demande" });
    }
  });

  // ============ AGENCY REQUESTS (Admin) ============

  app.get("/api/admin/agency-requests", authMiddleware, async (_req, res) => {
    try {
      const requests = await adminStorage.getAllAgencyRequests();
      res.json(requests);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/agency-requests/:id", authMiddleware, async (req, res) => {
    try {
      const request = await adminStorage.getAgencyRequestById(req.params.id);
      if (!request) return res.status(404).json({ error: "Demande non trouvée" });
      res.json(request);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/agency-requests/:id/status", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!["pending", "processing", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }

      const request = await adminStorage.updateAgencyRequestStatus(id, status, adminNotes);
      if (!request) return res.status(404).json({ error: "Demande non trouvée" });

      await adminStorage.createLog({
        action: "UPDATE",
        entityType: "agency_request",
        entityId: id,
        details: `Demande agence mise à jour: ${status}`,
        adminId: req.admin!.adminId,
        createdAt: new Date().toISOString(),
      });

      res.json(request);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============ TARIFS ============

  app.get("/api/admin/prices", authMiddleware, async (_req, res) => {
    try {
      const prices = await contentStorage.getAllPrices();
      res.json(prices);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/prices/:key", authMiddleware, async (req, res) => {
    try {
      const { key } = req.params;
      const { amount } = req.body;
      if (typeof amount !== "number" || amount < 0) {
        return res.status(400).json({ error: "Montant invalide" });
      }
      const updated = await contentStorage.updatePrice(key, amount);
      if (!updated) {
        return res.status(404).json({ error: "Tarif introuvable" });
      }
      res.json(updated);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  // ============ RESERVATIONS VOYAGES ============

  app.get("/api/admin/reservations", authMiddleware, async (_req, res) => {
    try {
      const reservations = await getAllReservationsWithDetails();
      res.json(reservations);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.get("/api/admin/reservations/:id", authMiddleware, async (req, res) => {
    try {
      const detail = await getReservationDetail(req.params.id);
      if (!detail) return res.status(404).json({ error: "Réservation introuvable" });
      res.json(detail);
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });

  app.put("/api/admin/reservations/:id/status", authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "partial", "paid", "cancelled"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }
      await updateReservationStatus(req.params.id, status);
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Erreur serveur" });
    }
  });
}
