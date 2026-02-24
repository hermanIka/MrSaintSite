/**
 * CHATBOT MODULE - Storage
 * 
 * Gestion du stockage PostgreSQL pour le chatbot:
 * - Conversations (historique des échanges)
 * - System Prompts (prompts versionnés et sécurisés)
 * 
 * SÉCURITÉ:
 * - Ce module ne gère que les données du chatbot
 * - Aucun accès aux API de paiement, clés secrètes, admin ou logs sensibles
 * - Lecture seule pour les données publiques injectées dans le contexte
 */

import {
  type ChatbotConversation,
  type InsertChatbotConversation,
  type ChatbotSystemPrompt,
  type InsertChatbotSystemPrompt,
  chatbotConversations,
  chatbotSystemPrompts,
} from "@shared/schema";
import { db } from "../../db";
import { eq, desc, and, lt } from "drizzle-orm";

export interface IChatbotStorage {
  getConversationBySessionId(sessionId: string): Promise<ChatbotConversation | undefined>;
  createConversation(conversation: InsertChatbotConversation): Promise<ChatbotConversation>;
  updateConversation(sessionId: string, messages: string, messageCount: number, mode: string): Promise<ChatbotConversation | undefined>;
  deleteConversation(sessionId: string): Promise<boolean>;
  purgeOldConversations(daysOld: number): Promise<number>;
  
  getActiveSystemPrompt(): Promise<ChatbotSystemPrompt | undefined>;
  getAllSystemPrompts(): Promise<ChatbotSystemPrompt[]>;
  getSystemPromptById(id: string): Promise<ChatbotSystemPrompt | undefined>;
  createSystemPrompt(prompt: InsertChatbotSystemPrompt): Promise<ChatbotSystemPrompt>;
  updateSystemPrompt(id: string, prompt: Partial<InsertChatbotSystemPrompt>): Promise<ChatbotSystemPrompt | undefined>;
  setActivePrompt(id: string): Promise<boolean>;
  deleteSystemPrompt(id: string): Promise<boolean>;
}

export class ChatbotDbStorage implements IChatbotStorage {
  async getConversationBySessionId(sessionId: string): Promise<ChatbotConversation | undefined> {
    const [conversation] = await db
      .select()
      .from(chatbotConversations)
      .where(eq(chatbotConversations.sessionId, sessionId));
    return conversation;
  }

  async createConversation(conversation: InsertChatbotConversation): Promise<ChatbotConversation> {
    const [newConversation] = await db
      .insert(chatbotConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateConversation(
    sessionId: string, 
    messages: string, 
    messageCount: number,
    mode: string
  ): Promise<ChatbotConversation | undefined> {
    const [updated] = await db
      .update(chatbotConversations)
      .set({ 
        messages, 
        messageCount,
        mode,
        updatedAt: new Date().toISOString() 
      })
      .where(eq(chatbotConversations.sessionId, sessionId))
      .returning();
    return updated;
  }

  async deleteConversation(sessionId: string): Promise<boolean> {
    const result = await db
      .delete(chatbotConversations)
      .where(eq(chatbotConversations.sessionId, sessionId))
      .returning();
    return result.length > 0;
  }

  async purgeOldConversations(daysOld: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffStr = cutoffDate.toISOString();

    const result = await db
      .delete(chatbotConversations)
      .where(lt(chatbotConversations.updatedAt, cutoffStr))
      .returning();
    return result.length;
  }

  async getActiveSystemPrompt(): Promise<ChatbotSystemPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(chatbotSystemPrompts)
      .where(eq(chatbotSystemPrompts.active, true));
    return prompt;
  }

  async getAllSystemPrompts(): Promise<ChatbotSystemPrompt[]> {
    return await db
      .select()
      .from(chatbotSystemPrompts)
      .orderBy(desc(chatbotSystemPrompts.createdAt));
  }

  async getSystemPromptById(id: string): Promise<ChatbotSystemPrompt | undefined> {
    const [prompt] = await db
      .select()
      .from(chatbotSystemPrompts)
      .where(eq(chatbotSystemPrompts.id, id));
    return prompt;
  }

  async createSystemPrompt(prompt: InsertChatbotSystemPrompt): Promise<ChatbotSystemPrompt> {
    if (prompt.active) {
      await db
        .update(chatbotSystemPrompts)
        .set({ active: false, updatedAt: new Date().toISOString() })
        .where(eq(chatbotSystemPrompts.active, true));
    }
    
    const [newPrompt] = await db
      .insert(chatbotSystemPrompts)
      .values(prompt)
      .returning();
    return newPrompt;
  }

  async updateSystemPrompt(
    id: string, 
    promptData: Partial<InsertChatbotSystemPrompt>
  ): Promise<ChatbotSystemPrompt | undefined> {
    if (promptData.active) {
      await db
        .update(chatbotSystemPrompts)
        .set({ active: false, updatedAt: new Date().toISOString() })
        .where(eq(chatbotSystemPrompts.active, true));
    }
    
    const [updated] = await db
      .update(chatbotSystemPrompts)
      .set({ ...promptData, updatedAt: new Date().toISOString() })
      .where(eq(chatbotSystemPrompts.id, id))
      .returning();
    return updated;
  }

  async setActivePrompt(id: string): Promise<boolean> {
    await db
      .update(chatbotSystemPrompts)
      .set({ active: false, updatedAt: new Date().toISOString() })
      .where(eq(chatbotSystemPrompts.active, true));
    
    const [updated] = await db
      .update(chatbotSystemPrompts)
      .set({ active: true, updatedAt: new Date().toISOString() })
      .where(eq(chatbotSystemPrompts.id, id))
      .returning();
    
    return !!updated;
  }

  async deleteSystemPrompt(id: string): Promise<boolean> {
    const result = await db
      .delete(chatbotSystemPrompts)
      .where(eq(chatbotSystemPrompts.id, id))
      .returning();
    return result.length > 0;
  }
}

export const chatbotStorage = new ChatbotDbStorage();
