import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { buildSystemPrompt } from "./knowledgeBase";
import { generateRuleBasedResponse } from "./ruleEngine";

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

function isAIEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

router.post("/chat", async (req: Request, res: Response) => {
  try {
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

    const client = getOpenAIClient();

    if (client) {
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
        generateRuleBasedResponse(message);

      return res.json({
        success: true,
        message: assistantMessage,
        mode: "ai",
        conversationId: Date.now().toString()
      });
    }

    const ruleResponse = generateRuleBasedResponse(message);
    
    return res.json({
      success: true,
      message: ruleResponse,
      mode: "rules",
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

    const fallbackResponse = generateRuleBasedResponse(req.body.message || "aide");
    
    return res.json({
      success: true,
      message: fallbackResponse,
      mode: "rules",
      conversationId: Date.now().toString()
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

export default router;
