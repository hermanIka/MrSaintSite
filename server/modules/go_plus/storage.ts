import { db } from "../../db";
import { goPlusPlans, goPlusCards, goPlusTransactions } from "@shared/schema";
import type { GoPlusPlan, GoPlusCard, GoPlusTransaction, InsertGoPlusPlan, InsertGoPlusCard, InsertGoPlusTransaction } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IGoPlusStorage {
  getAllGoPlusPlans(): Promise<GoPlusPlan[]>;
  getGoPlusPlanById(id: string): Promise<GoPlusPlan | undefined>;
  createGoPlusPlan(data: InsertGoPlusPlan): Promise<GoPlusPlan>;
  updateGoPlusPlan(id: string, data: Partial<InsertGoPlusPlan>): Promise<GoPlusPlan | undefined>;

  createGoPlusTransaction(data: InsertGoPlusTransaction): Promise<GoPlusTransaction>;
  getGoPlusTransactionById(id: string): Promise<GoPlusTransaction | undefined>;
  getGoPlusTransactionByProviderPaymentId(providerPaymentId: string): Promise<GoPlusTransaction | undefined>;
  updateGoPlusTransactionStatus(id: string, status: string, providerPaymentId?: string): Promise<void>;
  getAllGoPlusTransactions(): Promise<GoPlusTransaction[]>;

  createGoPlusCard(data: InsertGoPlusCard): Promise<GoPlusCard>;
  getUserActiveGoPlusCard(userId: string): Promise<GoPlusCard | undefined>;
  updateGoPlusCardStatus(id: string, status: string): Promise<void>;
  getAllGoPlusCards(): Promise<GoPlusCard[]>;
}

class GoPlusDbStorage implements IGoPlusStorage {
  async getAllGoPlusPlans(): Promise<GoPlusPlan[]> {
    return db.select().from(goPlusPlans).orderBy(goPlusPlans.price);
  }

  async getGoPlusPlanById(id: string): Promise<GoPlusPlan | undefined> {
    const [plan] = await db.select().from(goPlusPlans).where(eq(goPlusPlans.id, id));
    return plan;
  }

  async createGoPlusPlan(data: InsertGoPlusPlan): Promise<GoPlusPlan> {
    const [plan] = await db.insert(goPlusPlans).values(data).returning();
    return plan;
  }

  async updateGoPlusPlan(id: string, data: Partial<InsertGoPlusPlan>): Promise<GoPlusPlan | undefined> {
    const [plan] = await db.update(goPlusPlans).set(data).where(eq(goPlusPlans.id, id)).returning();
    return plan;
  }

  async createGoPlusTransaction(data: InsertGoPlusTransaction): Promise<GoPlusTransaction> {
    const [tx] = await db.insert(goPlusTransactions).values(data).returning();
    return tx;
  }

  async getGoPlusTransactionById(id: string): Promise<GoPlusTransaction | undefined> {
    const [tx] = await db.select().from(goPlusTransactions).where(eq(goPlusTransactions.id, id));
    return tx;
  }

  async getGoPlusTransactionByProviderPaymentId(providerPaymentId: string): Promise<GoPlusTransaction | undefined> {
    const [tx] = await db.select().from(goPlusTransactions).where(eq(goPlusTransactions.providerPaymentId, providerPaymentId));
    return tx;
  }

  async updateGoPlusTransactionStatus(id: string, status: string, providerPaymentId?: string): Promise<void> {
    const now = new Date().toISOString();
    await db.update(goPlusTransactions)
      .set({ status, ...(providerPaymentId ? { providerPaymentId } : {}), updatedAt: now })
      .where(eq(goPlusTransactions.id, id));
  }

  async getAllGoPlusTransactions(): Promise<GoPlusTransaction[]> {
    return db.select().from(goPlusTransactions).orderBy(desc(goPlusTransactions.createdAt));
  }

  async createGoPlusCard(data: InsertGoPlusCard): Promise<GoPlusCard> {
    const [card] = await db.insert(goPlusCards).values(data).returning();
    return card;
  }

  async getUserActiveGoPlusCard(userId: string): Promise<GoPlusCard | undefined> {
    const cards = await db.select().from(goPlusCards)
      .where(eq(goPlusCards.userId, userId));
    return cards.find(c => c.status === "active");
  }

  async updateGoPlusCardStatus(id: string, status: string): Promise<void> {
    const now = new Date().toISOString();
    await db.update(goPlusCards).set({ status, updatedAt: now }).where(eq(goPlusCards.id, id));
  }

  async getAllGoPlusCards(): Promise<GoPlusCard[]> {
    return db.select().from(goPlusCards).orderBy(desc(goPlusCards.createdAt));
  }
}

export const goPlusStorage: IGoPlusStorage = new GoPlusDbStorage();
