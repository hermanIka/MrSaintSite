/**
 * ADMIN MODULE - Storage
 * 
 * Gestion du stockage pour l'administration:
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
} from "@shared/schema";
import { randomUUID } from "crypto";
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
}

export class AdminMemStorage implements IAdminStorage {
  private admins: Map<string, Admin>;
  private logs: Map<string, ActivityLog>;
  private faqs: Map<string, Faq>;

  constructor() {
    this.admins = new Map();
    this.logs = new Map();
    this.faqs = new Map();
    this.seedData();
  }

  private seedData() {
    const defaultAdmin: Admin = {
      id: randomUUID(),
      username: "admin",
      passwordHash: this.hashPassword("admin123"),
      createdAt: new Date().toISOString(),
    };
    this.admins.set(defaultAdmin.id, defaultAdmin);

    const faqsData: InsertFaq[] = [
      {
        question: "Comment fonctionne la facilitation visa ?",
        answer: "Nous analysons votre dossier, préparons tous les documents nécessaires, et vous accompagnons jusqu'à l'obtention de votre visa. Notre taux de réussite est de 98%.",
        category: "visa",
        order: 1,
      },
      {
        question: "Quels sont les délais pour obtenir un visa ?",
        answer: "Les délais varient selon la destination : Dubaï (3-5 jours), Canada (2-4 semaines), USA (2-3 semaines), Schengen (10-15 jours), Turquie (3-5 jours).",
        category: "visa",
        order: 2,
      },
      {
        question: "Proposez-vous des facilités de paiement ?",
        answer: "Oui, nous proposons un paiement en plusieurs fois pour les voyages d'affaires et les formations. Contactez-nous pour discuter des options.",
        category: "paiement",
        order: 3,
      },
      {
        question: "Comment se déroule un voyage d'affaires ?",
        answer: "Nos voyages incluent : vols, hébergement premium, transferts, visites de fournisseurs/partenaires, traducteur si nécessaire, et accompagnement personnalisé.",
        category: "voyages",
        order: 4,
      },
      {
        question: "Qu'inclut la formation création d'agence ?",
        answer: "Formation complète : étude de marché, business plan, aspects juridiques, fournisseurs, marketing digital, et accompagnement pendant 3 mois après création.",
        category: "formation",
        order: 5,
      },
      {
        question: "Comment réserver une consultation ?",
        answer: "Cliquez sur 'Réserver' sur notre site, effectuez le paiement de 20€, puis accédez au calendrier pour choisir votre créneau.",
        category: "reservation",
        order: 6,
      },
    ];

    faqsData.forEach((faq) => {
      const id = randomUUID();
      this.faqs.set(id, { ...faq, id, order: faq.order ?? 0 });
    });
  }

  hashPassword(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  validatePassword(admin: Admin, password: string): boolean {
    return admin.passwordHash === this.hashPassword(password);
  }

  async getAdminByUsername(username: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find((a) => a.username === username);
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const id = randomUUID();
    const newAdmin: Admin = { ...admin, id };
    this.admins.set(id, newAdmin);
    return newAdmin;
  }

  async getAllLogs(): Promise<ActivityLog[]> {
    return Array.from(this.logs.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createLog(log: InsertActivityLog): Promise<ActivityLog> {
    const id = randomUUID();
    const newLog: ActivityLog = { 
      ...log, 
      id, 
      entityId: log.entityId ?? null,
      details: log.details ?? null,
    };
    this.logs.set(id, newLog);
    return newLog;
  }

  async getAllFaqs(): Promise<Faq[]> {
    return Array.from(this.faqs.values()).sort((a, b) => a.order - b.order);
  }

  async getFaqById(id: string): Promise<Faq | undefined> {
    return this.faqs.get(id);
  }

  async createFaq(faq: InsertFaq): Promise<Faq> {
    const id = randomUUID();
    const newFaq: Faq = { ...faq, id, order: faq.order ?? 0 };
    this.faqs.set(id, newFaq);
    return newFaq;
  }

  async updateFaq(id: string, faq: Partial<InsertFaq>): Promise<Faq | undefined> {
    const existing = this.faqs.get(id);
    if (!existing) return undefined;
    const updated: Faq = { ...existing, ...faq };
    this.faqs.set(id, updated);
    return updated;
  }

  async deleteFaq(id: string): Promise<boolean> {
    return this.faqs.delete(id);
  }
}

export const adminStorage = new AdminMemStorage();
