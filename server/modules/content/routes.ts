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

  app.get("/api/testimonials", async (_req, res) => {
    try {
      const testimonials = await contentStorage.getAllTestimonials();
      res.json(testimonials);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch testimonials" });
    }
  });

  app.get("/api/portfolio", async (_req, res) => {
    try {
      const portfolio = await contentStorage.getAllPortfolio();
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch portfolio" });
    }
  });
}
