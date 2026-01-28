import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { buildSystemPrompt } from "./knowledgeBase";

const router = Router();

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
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

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const client = getOpenAIClient();
    
    if (!client) {
      return res.status(503).json({
        success: false,
        error: "Service de chat temporairement indisponible. Veuillez nous contacter directement.",
        suggestion: "Visitez notre page de contact: /contact"
      });
    }

    const { message, conversationHistory = [] }: ChatRequest = req.body;

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

    const trimmedHistory = conversationHistory.slice(-MAX_HISTORY_LENGTH);

    const systemPrompt = buildSystemPrompt();

    const messages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...trimmedHistory,
      { role: "user", content: message }
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0]?.message?.content || 
      "Je suis désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer ou nous contacter directement.";

    res.json({
      success: true,
      message: assistantMessage,
      conversationId: Date.now().toString()
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

    res.status(500).json({
      success: false,
      error: "Une erreur est survenue. Veuillez réessayer ou nous contacter directement.",
      suggestion: "Visitez notre page de contact: /contact"
    });
  }
});

router.get("/status", (_req: Request, res: Response) => {
  const client = getOpenAIClient();
  res.json({
    available: !!client,
    message: client 
      ? "Assistant disponible 24/7" 
      : "Assistant temporairement indisponible"
  });
});

export default router;
