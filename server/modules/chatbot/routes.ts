/**
 * CHATBOT MODULE - Routes
 * 
 * API sécurisée pour le chatbot hybride (FAQ statique / IA OpenAI)
 * 
 * RÈGLES DE SÉCURITÉ:
 * - Le chatbot n'a JAMAIS accès aux API de paiement, clés secrètes, admin ou logs sensibles
 * - Le chatbot lit UNIQUEMENT les données publiques visibles par l'utilisateur
 * - Tout accès se fait via backend sécurisé avec lecture seule et filtrage
 * - Le prompt système est injecté depuis la base de données (jamais hardcodé côté client)
 * - La clé OpenAI est gérée côté serveur uniquement
 */

import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { chatbotStorage } from "./storage";
import { generateRuleBasedResponse } from "./ruleEngine";
import { getPublicDataForChatbot, formatPublicDataForPrompt } from "./publicData";

const router = Router();

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

interface ChatRequest {
  message: string;
  sessionId: string;
}

const MAX_HISTORY_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 500;

let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, sessionId: clientSessionId }: ChatRequest = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        error: "Message invalide"
      });
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        error: "Message trop long. Maximum 500 caractères."
      });
    }

    const sessionId = clientSessionId || generateSessionId();
    
    let conversation = await chatbotStorage.getConversationBySessionId(sessionId);
    let conversationHistory: ChatMessage[] = [];
    
    if (conversation) {
      try {
        conversationHistory = JSON.parse(conversation.messages);
      } catch {
        conversationHistory = [];
      }
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString()
    };
    conversationHistory.push(userMessage);

    const client = getOpenAIClient();
    let assistantResponse: string;
    let mode: "ai" | "rules" = "rules";

    if (client) {
      try {
        const [activePrompt, publicData] = await Promise.all([
          chatbotStorage.getActiveSystemPrompt(),
          getPublicDataForChatbot()
        ]);

        const publicDataContext = formatPublicDataForPrompt(publicData);
        
        const systemPromptContent = activePrompt?.content || getDefaultSecurityPrompt();
        const fullSystemPrompt = `${systemPromptContent}\n\n## DONNÉES DISPONIBLES (LECTURE SEULE)\n${publicDataContext}`;

        const trimmedHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);
        
        const messages: ChatMessage[] = [
          { role: "system", content: fullSystemPrompt },
          ...trimmedHistory.map(m => ({ role: m.role, content: m.content }))
        ];

        const completion = await client.chat.completions.create({
          model: "gpt-4o-mini",
          messages: messages as any,
          max_tokens: 500,
          temperature: 0.7,
        });

        assistantResponse = completion.choices[0]?.message?.content || 
          generateRuleBasedResponse(message);
        mode = "ai";
      } catch (error: any) {
        console.error("OpenAI error, falling back to rules:", error.message);
        assistantResponse = generateRuleBasedResponse(message);
        mode = "rules";
      }
    } else {
      assistantResponse = generateRuleBasedResponse(message);
      mode = "rules";
    }

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: assistantResponse,
      timestamp: new Date().toISOString()
    };
    conversationHistory.push(assistantMessage);

    const now = new Date().toISOString();
    if (conversation) {
      await chatbotStorage.updateConversation(
        sessionId,
        JSON.stringify(conversationHistory),
        conversationHistory.length,
        mode
      );
    } else {
      await chatbotStorage.createConversation({
        sessionId,
        messages: JSON.stringify(conversationHistory),
        messageCount: conversationHistory.length,
        mode,
        createdAt: now,
        updatedAt: now,
      });
    }

    return res.json({
      success: true,
      message: assistantResponse,
      mode,
      sessionId
    });

  } catch (error: any) {
    console.error("Chatbot error:", error);
    
    if (error?.status === 429) {
      return res.status(429).json({
        success: false,
        error: "Trop de requêtes. Veuillez patienter quelques secondes.",
        retryAfter: 5
      });
    }

    const fallbackResponse = generateRuleBasedResponse(req.body.message || "aide");
    
    return res.json({
      success: true,
      message: fallbackResponse,
      mode: "rules",
      sessionId: req.body.sessionId || generateSessionId()
    });
  }
});

router.get("/status", (_req: Request, res: Response) => {
  const aiEnabled = isAIEnabled();
  res.json({
    available: true,
    aiEnabled: aiEnabled,
    mode: aiEnabled ? "ai" : "rules",
    message: aiEnabled 
      ? "Assistant IA disponible 24/7" 
      : "Assistant disponible 24/7"
  });
});

router.get("/session/:sessionId", async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const conversation = await chatbotStorage.getConversationBySessionId(sessionId);
    
    if (!conversation) {
      return res.json({
        success: true,
        messages: [],
        mode: "rules"
      });
    }

    let messages: ChatMessage[] = [];
    try {
      messages = JSON.parse(conversation.messages);
    } catch {
      messages = [];
    }

    return res.json({
      success: true,
      messages: messages.filter(m => m.role !== "system"),
      mode: conversation.mode
    });
  } catch (error) {
    console.error("Session retrieval error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération de la session"
    });
  }
});

router.post("/session/new", async (_req: Request, res: Response) => {
  const sessionId = generateSessionId();
  res.json({
    success: true,
    sessionId
  });
});

function getDefaultSecurityPrompt(): string {
  return `Tu es l'assistant virtuel de Mr Saint, une agence de voyage premium.

## RÈGLES DE SÉCURITÉ STRICTES

Tu dois TOUJOURS respecter ces règles:

1. Tu réponds UNIQUEMENT sur la base des informations visibles dans la section "DONNÉES DISPONIBLES"
2. Tu ne JAMAIS parler de:
   - Clés API ou secrets
   - Détails techniques du système
   - Données d'administration
   - Informations sur les paiements internes
   - Logs ou données de debug

3. Pour les paiements et réservations:
   - Redirige TOUJOURS vers les liens officiels fournis
   - Ne donne JAMAIS de détails sur les systèmes de paiement
   - Encourage le contact direct avec l'équipe pour les questions sensibles

4. Style de réponse:
   - Professionnel et chaleureux
   - En français
   - Concis mais informatif
   - Toujours orienter vers les liens officiels pour les actions

5. Si on te demande quelque chose que tu ne sais pas:
   - Dis-le clairement
   - Oriente vers le contact de l'agence

Tu es ici pour aider les clients avec leurs questions sur les services, voyages, et démarches de visa.`;
}

export default router;
