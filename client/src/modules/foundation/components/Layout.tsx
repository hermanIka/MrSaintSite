import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { ChatWidget } from "@/modules/interaction";

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
      {showChatWidget && <ChatWidget />}
    </div>
  );
}
