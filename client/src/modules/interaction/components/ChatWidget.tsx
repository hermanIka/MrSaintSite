import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User, Loader2, RotateCcw } from "lucide-react";
import chatBtnImage from "@assets/Mr_saint_photo_profil_1771948755492.jfif";
import { useTranslation } from "react-i18next";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: "ai" | "rules";
}

const SESSION_STORAGE_KEY = "mr_saint_chat_session";

export default function ChatWidget() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [chatMode, setChatMode] = useState<"ai" | "rules">("rules");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getStoredSession = useCallback(() => {
    try {
      return localStorage.getItem(SESSION_STORAGE_KEY);
    } catch {
      return null;
    }
  }, []);

  const storeSession = useCallback((id: string) => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, id);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const clearStoredSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    checkAvailability();
    const storedSession = getStoredSession();
    if (storedSession) {
      setSessionId(storedSession);
      loadSessionHistory(storedSession);
    }
  }, [getStoredSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAvailability = async () => {
    try {
      const response = await fetch("/api/chatbot/status");
      const data = await response.json();
      setIsAvailable(data.available);
      setChatMode(data.mode || "rules");
    } catch {
      setIsAvailable(true);
      setChatMode("rules");
    }
  };

  const loadSessionHistory = async (sid: string) => {
    try {
      const response = await fetch(`/api/chatbot/session/${sid}`);
      const data = await response.json();
      
      if (data.success && data.messages && data.messages.length > 0) {
        const loadedMessages: Message[] = data.messages.map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date(m.timestamp || Date.now()),
          mode: m.mode
        }));
        setMessages(loadedMessages);
        setChatMode(data.mode || "rules");
      }
    } catch {
      // If loading fails, start fresh
    }
  };

  const startNewSession = async () => {
    clearStoredSession();
    setSessionId(null);
    setMessages([]);
    
    try {
      const response = await fetch("/api/chatbot/session/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (data.success && data.sessionId) {
        setSessionId(data.sessionId);
        storeSession(data.sessionId);
      }
    } catch {
      // If creating new session fails, we'll create one on first message
    }

    setMessages([
      {
        role: "assistant",
        content: "Bonjour ! Je suis l'assistant virtuel de Mr Saint. Comment puis-je vous aider aujourd'hui ?\n\nJe peux vous renseigner sur :\n- La facilitation de visa\n- La création d'agence de voyage\n- Nos voyages organisés\n- Le voyage à crédit",
        timestamp: new Date()
      }
    ]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId: sessionId
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.sessionId && data.sessionId !== sessionId) {
          setSessionId(data.sessionId);
          storeSession(data.sessionId);
        }

        const assistantMessage: Message = {
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          mode: data.mode
        };
        setMessages((prev) => [...prev, assistantMessage]);
        if (data.mode) setChatMode(data.mode);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: data.error || "Une erreur est survenue. Veuillez réessayer.",
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: "Impossible de contacter l'assistant. Veuillez nous contacter directement via la page Contact.",
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Bonjour ! Je suis l'assistant virtuel de Mr Saint. Comment puis-je vous aider aujourd'hui ?\n\nJe peux vous renseigner sur :\n- La facilitation de visa\n- La création d'agence de voyage\n- Nos voyages organisés\n- Le voyage à crédit",
          timestamp: new Date()
        }
      ]);
    }
  };

  const formatMessage = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("•") || line.startsWith("-")) {
        return (
          <li key={i} className="ml-4 list-disc">
            {line.replace(/^[•-]\s*/, "")}
          </li>
        );
      }
      return (
        <p key={i} className={line ? "" : "h-2"}>
          {line}
        </p>
      );
    });
  };

  return (
    <>
      {isOpen && (
        <Card
          data-testid="card-chat-widget"
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] z-50 shadow-2xl border-primary/20 flex flex-col"
        >
          <CardHeader className="bg-primary text-primary-foreground rounded-t-lg p-4 flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">{t("chat.title")}</CardTitle>
                <p className="text-xs text-white/70">
                  {isAvailable ? `${t("chat.online")} ${chatMode === "ai" ? `(${t("chat.aiMode")})` : `(${t("chat.rulesMode")})`}` : "Offline"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                data-testid="button-new-chat"
                variant="ghost"
                size="icon"
                onClick={startNewSession}
                className="text-white"
                title={t("chat.newConversation")}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                data-testid="button-close-chat"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 bg-muted/30">
            {messages.map((msg, index) => (
              <div
                key={index}
                data-testid={`message-${msg.role}-${index}`}
                className={`flex flex-wrap gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border"
                  }`}
                >
                  <div className="space-y-1">{formatMessage(msg.content)}</div>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex flex-wrap gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-lg px-4 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-4 border-t bg-background">
            <div className="flex flex-wrap gap-2">
              <Input
                ref={inputRef}
                data-testid="input-chat-message"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t("chat.placeholder")}
                disabled={isLoading || !isAvailable}
                className="flex-1"
                maxLength={500}
              />
              <Button
                data-testid="button-send-message"
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading || !isAvailable}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="fixed bottom-4 right-4 sm:right-6 z-50 flex flex-wrap items-center gap-3">
        {!isOpen && (
          <Badge
            data-testid="label-chat-prompt"
            className="shadow-lg"
          >
            {t("chat.greeting")}
          </Badge>
        )}
        <button
          data-testid="button-toggle-chat"
          onClick={toggleChat}
          className={`w-14 h-14 rounded-full border-2 border-primary overflow-visible cursor-pointer transition-transform ${!isOpen ? "chat-btn-glow" : ""}`}
          style={{ padding: 0, background: "transparent" }}
        >
          {isOpen ? (
            <span className="flex items-center justify-center w-full h-full rounded-full bg-primary text-primary-foreground">
              <X className="w-6 h-6" />
            </span>
          ) : (
            <img
              src={chatBtnImage}
              alt="Mr Saint - Chat"
              className="w-full h-full rounded-full object-cover"
            />
          )}
        </button>
      </div>
    </>
  );
}
