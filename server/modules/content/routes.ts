/**
 * CONTENT MODULE - Routes
 * 
 * Routes API pour le contenu:
 * - GET /api/trips
 * - GET /api/trips/:id
 * - GET /api/testimonials
 * - GET /api/portfolio
 */

import type { Express } from "express";
import { contentStorage } from "./storage";

export function registerContentRoutes(app: Express): void {
  app.get("/api/trips", async (_req, res) => {
    try {
      const trips = await contentStorage.getAllTrips();
      res.json(trips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/featured", async (_req, res) => {
    try {
      const featuredTrips = await contentStorage.getFeaturedTrips();
      res.json(featuredTrips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured trips" });
    }
  });

  app.get("/api/trips/:id", async (req, res) => {
    try {
      const trip = await contentStorage.getTripById(req.params.id);
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(trip);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });

  app.get("/api/trips/:id/gallery", async (req, res) => {
    try {
      const photos = await contentStorage.getTripGalleryPhotos(req.params.id);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch gallery" });
    }
  });

  app.get("/api/testimonials", async (_req, res) => {
    try {
      const testimonials = await contentStorage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/portfolio", async (req, res) => {
    try {
      const { serviceType } = req.query;
      let portfolio;
      
      if (serviceType && typeof serviceType === "string") {
        portfolio = await contentStorage.getPortfolioByServiceType(serviceType);
      } else {
        portfolio = await contentStorage.getPublishedPortfolio();
      }
      
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });

  app.get("/api/services", async (_req, res) => {
    try {
      const services = await contentStorage.getPublishedServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:slug", async (req, res) => {
    try {
      const service = await contentStorage.getServiceBySlug(req.params.slug);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.get("/api/prices", async (_req, res) => {
    try {
      const prices = await contentStorage.getAllPrices();
      const priceMap: Record<string, number> = {};
      for (const p of prices) {
        priceMap[p.key] = p.amount;
      }
      res.json(priceMap);
    } catch {
      res.status(500).json({ error: "Failed to fetch prices" });
    }
  });
}
