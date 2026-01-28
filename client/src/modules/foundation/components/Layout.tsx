import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
}

export function Layout({ 
  children, 
  showNavigation = true, 
  showFooter = true 
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {showNavigation && <Navigation />}
      {children}
      {showFooter && <Footer />}
    </div>
  );
}
