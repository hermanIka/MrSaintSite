import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { SiWhatsapp } from "react-icons/si";

const WHATSAPP_URL = "https://wa.me/33666013866";

function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="button-whatsapp-float"
      aria-label="Contacter Mr Saint sur WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover-elevate active-elevate-2 transition-transform"
    >
      <SiWhatsapp className="w-7 h-7 text-white" />
    </a>
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
  showChatWidget = true
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
