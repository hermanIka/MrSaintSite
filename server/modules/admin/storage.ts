/**
 * ADMIN MODULE - Storage
 * 
 * Gestion du stockage PostgreSQL pour l'administration:
 * - Admins (authentification)
 * - Activity Logs (traçabilité)
 * - FAQ (questions fréquentes)
 */

import {
  type Admin,
  type InsertAdmin,
  type ActivityLog,
  type InsertActivityLog,
  type Faq,
  type InsertFaq,
  type Service,
  type InsertService,
  admins,
  activityLogs,
  faqs,
  services,
} from "@shared/schema";
import { db } from "../../db";
import { eq, desc } from "drizzle-orm";
import * as crypto from "crypto";

export interface IAdminStorage {
  getAdminByUsername(username: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  validatePassword(admin: Admin, password: string): boolean;
  hashPassword(password: string): string;

  getAllLogs(): Promise<ActivityLog[]>;
  createLog(log: InsertActivityLog): Promise<ActivityLog>;

  getAllFaqs(): Promise<Faq[]>;
  getFaqById(id: string): Promise<Faq | undefined>;
  createFaq(faq: InsertFaq): Promise<Faq>;
  updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq | undefined>;
  deleteFaq(id: string): Promise<boolean>;

  getAllServices(): Promise<Service[]>;
  getServiceById(id: string): Promise<Service | undefined>;
  getServiceBySlug(slug: string): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: string, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: string): Promise<boolean>;
}

export class AdminDbStorage implements IAdminStorage {
  hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  validatePassword(admin: Admin, password: string): boolean {
    return admin.passwordHash === this.hashPassword(password);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async getAllLogs(): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt));
  }

  async createLog(log: InsertActivityLog): Promise<ActivityLog> {
    const [newLog] = await db
      .insert(activityLogs)
      .values({
        ...log,
        entityId: log.entityId ?? null,
        details: log.details ?? null,
      })
      .returning();
    return newLog;
  }

  async getAllFaqs(): Promise<Faq[]> {
    return await db.select().from(faqs).orderBy(faqs.order);
  }

  async getFaqById(id: string): Promise<Faq | undefined> {
    const [faq] = await db.select().from(faqs).where(eq(faqs.id, id));
    return faq;
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const [newFaq] = await db
      .insert(faqs)
      .values({ ...faq, order: faq.order ?? 0 })
      .returning();
    return newFaq;
  }

  async updateFaq(id: string, faqData: Partial<InsertFaq>): Promise<Faq | undefined> {
    const [updated] = await db
      .update(faqs)
      .set(faqData)
      .where(eq(faqs.id, id))
      .returning();
    return updated;
  }

  async deleteFaq(id: string): Promise<boolean> {
    const result = await db.delete(faqs).where(eq(faqs.id, id)).returning();
    return result.length > 0;
  }

  // ============ SERVICES ============

  async getAllServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.order);
  }

  async getServiceById(id: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async getServiceBySlug(slug: string): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.slug, slug));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db
      .insert(services)
      .values({ ...service, order: service.order ?? 0, status: service.status ?? "published" })
      .returning();
    return newService;
  }

  async updateService(id: string, serviceData: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db
      .update(services)
      .set(serviceData)
      .where(eq(services.id, id))
      .returning();
    return updated;
  }

  async deleteService(id: string): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id)).returning();
    return result.length > 0;
  }
}

export const adminStorage = new AdminDbStorage();
