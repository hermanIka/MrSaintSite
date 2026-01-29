/**
 * CONTENT MODULE - Storage
 * 
 * Gestion du stockage PostgreSQL pour les entités de contenu:
 * - Trips (voyages)
 * - Testimonials (témoignages)
 * - Portfolio (réalisations)
 */

import {
  type Trip,
  type InsertTrip,
  type Testimonial,
  type InsertTestimonial,
  type Portfolio,
  type InsertPortfolio,
  type Service,
  trips,
  testimonials,
  portfolio,
  services,
} from "@shared/schema";
import { db } from "../../db";
import { eq, and, asc } from "drizzle-orm";

export interface IContentStorage {
  getAllTrips(): Promise<Trip[]>;
  getTripById(id: string): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, trip: Partial<InsertTrip>): Promise<Trip | undefined>;
  deleteTrip(id: string): Promise<boolean>;

  getAllTestimonials(): Promise<Testimonial[]>;
  getTestimonialById(id: string): Promise<Testimonial | undefined>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  updateTestimonial(id: string, testimonial: Partial<InsertTestimonial>): Promise<Testimonial | undefined>;
  deleteTestimonial(id: string): Promise<boolean>;

  getAllPortfolio(): Promise<Portfolio[]>;
  getPublishedPortfolio(): Promise<Portfolio[]>;
  getPortfolioByServiceType(serviceType: string): Promise<Portfolio[]>;
  getPortfolioById(id: string): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: string, portfolio: Partial<InsertPortfolio>): Promise<Portfolio | undefined>;
  deletePortfolio(id: string): Promise<boolean>;

  getPublishedServices(): Promise<Service[]>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
}

export class ContentDbStorage implements IContentStorage {
  async getAllTrips(): Promise<Trip[]> {
    return await db.select().from(trips);
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip;
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const [trip] = await db.insert(trips).values(insertTrip).returning();
    return trip;
  }

  async updateTrip(id: string, tripData: Partial<InsertTrip>): Promise<Trip | undefined> {
    const [updated] = await db
      .update(trips)
      .set(tripData)
      .where(eq(trips.id, id))
      .returning();
    return updated;
  }

  async deleteTrip(id: string): Promise<boolean> {
    const result = await db.delete(trips).where(eq(trips.id, id)).returning();
    return result.length > 0;
  }

  async getAllTestimonials(): Promise<Testimonial[]> {
    return await db.select().from(testimonials);
  }

  async getTestimonialById(id: string): Promise<Testimonial | undefined> {
    const [testimonial] = await db
      .select()
      .from(testimonials)
      .where(eq(testimonials.id, id));
    return testimonial;
  }

  async createTestimonial(insertTestimonial: InsertTestimonial): Promise<Testimonial> {
    const [testimonial] = await db
      .insert(testimonials)
      .values(insertTestimonial)
      .returning();
    return testimonial;
  }

  async updateTestimonial(id: string, data: Partial<InsertTestimonial>): Promise<Testimonial | undefined> {
    const [updated] = await db
      .update(testimonials)
      .set(data)
      .where(eq(testimonials.id, id))
      .returning();
    return updated;
  }

  async deleteTestimonial(id: string): Promise<boolean> {
    const result = await db
      .delete(testimonials)
      .where(eq(testimonials.id, id))
      .returning();
    return result.length > 0;
  }

  async getAllPortfolio(): Promise<Portfolio[]> {
    return await db.select().from(portfolio);
  }

  async getPublishedPortfolio(): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.status, "published"));
  }

  async getPortfolioByServiceType(serviceType: string): Promise<Portfolio[]> {
    return await db
      .select()
      .from(portfolio)
      .where(
        and(
          eq(portfolio.status, "published"),
          eq(portfolio.serviceType, serviceType)
        )
      );
  }

  async getPortfolioById(id: string): Promise<Portfolio | undefined> {
    const [item] = await db
      .select()
      .from(portfolio)
      .where(eq(portfolio.id, id));
    return item;
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const [item] = await db
      .insert(portfolio)
      .values({
        ...insertPortfolio,
        clientLogo: insertPortfolio.clientLogo ?? null,
        status: insertPortfolio.status ?? "published",
      })
      .returning();
    return item;
  }

  async updatePortfolio(id: string, data: Partial<InsertPortfolio>): Promise<Portfolio | undefined> {
    const [updated] = await db
      .update(portfolio)
      .set(data)
      .where(eq(portfolio.id, id))
      .returning();
    return updated;
  }

  async deletePortfolio(id: string): Promise<boolean> {
    const result = await db
      .delete(portfolio)
      .where(eq(portfolio.id, id))
      .returning();
    return result.length > 0;
  }

  async getPublishedServices(): Promise<Service[]> {
    return await db
      .select()
      .from(services)
      .where(eq(services.status, "published"))
      .orderBy(asc(services.order));
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db
      .select()
      .from(services)
      .where(and(eq(services.slug, slug), eq(services.status, "published")));
    return service;
  }
}

export const contentStorage = new ContentDbStorage();
