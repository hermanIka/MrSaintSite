import { useState, useEffect } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_URL = "https://wa.me/33666013866";

function WhatsAppButton() {
  const [showLabel, setShowLabel] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 800);
    const hideTimer = setTimeout(() => setShowLabel(false), 6000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      <div
        className="flex items-center"
        style={{
          opacity: showLabel ? 1 : 0,
          transform: showLabel ? "translateX(0)" : "translateX(20px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
          pointerEvents: showLabel ? "auto" : "none",
        }}
      >
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="label-whatsapp-float"
          className="text-sm font-medium text-white px-4 py-2.5 rounded-full whitespace-nowrap"
          style={{
            background: "rgba(18, 18, 18, 0.88)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(37, 211, 102, 0.35)",
            boxShadow: "0 0 12px rgba(37, 211, 102, 0.2)",
          }}
        >
          Comment puis-je vous aider ?
        </a>
        <div
          className="w-3 h-0 border-t-8 border-b-8 border-l-8 border-transparent"
          style={{ borderLeftColor: "rgba(18, 18, 18, 0.88)" }}
        />
      </div>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        data-testid="button-whatsapp-float"
        aria-label="Contacter Mr Saint sur WhatsApp"
        onMouseEnter={() => setShowLabel(true)}
        onMouseLeave={() => setShowLabel(false)}
        className="relative flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #25D366 0%, #1aad52 100%)",
          boxShadow:
            "0 0 0 0 rgba(37, 211, 102, 0.5), 0 4px 24px rgba(37, 211, 102, 0.45)",
          animation: "whatsapp-pulse 2.5s ease-in-out infinite",
        }}
      >
        <SiWhatsapp className="w-8 h-8 text-white relative z-10" />
      </a>

      <style>{`
        @keyframes whatsapp-pulse {
          0%   { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.55), 0 4px 24px rgba(37, 211, 102, 0.45); }
          50%  { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0), 0 4px 32px rgba(37, 211, 102, 0.6); }
          100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.0), 0 4px 24px rgba(37, 211, 102, 0.45); }
        }
      `}</style>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  showChatWidget?: boolean;
}

export function Layout({
  children,
  showNavigation = true,
  showFooter = true,
  showChatWidget = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation />}
      {children}
      {showFooter && <Footer />}
      {showChatWidget && <WhatsAppButton />}
    </div>
  );
}
