import { Crown } from "lucide-react";
import { useGoPlusCard } from "@/hooks/useGoPlusCard";

const WHATSAPP_URL =
  "https://wa.me/33666013866?text=Bonjour%2C%20je%20suis%20porteur%20de%20la%20carte%20GO%2B%20Gold%20et%20j%27ai%20besoin%20d%27une%20assistance%20personnalis%C3%A9e.";

export function GoldAssistanceWidget() {
  const { isGold } = useGoPlusCard();

  if (!isGold) return null;

  return (
    <div
      style={{ zIndex: 9998 }}
      className="fixed bottom-24 right-5 group"
      data-testid="widget-gold-assistance"
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Assistance personnalisée GO+ Gold"
        className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full shadow-lg px-4 py-3 font-semibold text-sm transition-all duration-200 hover:shadow-primary/40"
        style={{ boxShadow: "0 4px 24px rgba(242,201,76,0.35)" }}
      >
        <Crown className="w-4 h-4 flex-shrink-0" />
        <span className="hidden sm:inline whitespace-nowrap">Assistance Gold</span>
      </a>
    </div>
  );
}
