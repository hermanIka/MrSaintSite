import { useLocation, Link } from "wouter";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Plane,
  MessageSquare,
  Briefcase,
  HelpCircle,
  History,
  LogOut,
  Menu,
  X,
  Settings,
  CreditCard,
} from "lucide-react";
import { useState, useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const navItems = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/services", label: "Services & Prix", icon: Settings },
  { href: "/admin/trips", label: "Voyages", icon: Plane },
  { href: "/admin/credit-requests", label: "Demandes crédit", icon: CreditCard },
  { href: "/admin/testimonials", label: "Témoignages", icon: MessageSquare },
  { href: "/admin/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { href: "/admin/logs", label: "Historique", icon: History },
];

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { logout, admin, isAuthenticated, isLoading } = useAdminAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/admin");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    setLocation("/admin");
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between h-16 px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Link href="/admin/dashboard">
              <span className="font-heading font-bold text-xl text-primary cursor-pointer">
                Mr Saint Admin
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Connecté : <span className="font-medium text-foreground">{admin?.username}</span>
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden border-t bg-background p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover-elevate"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <div className="flex">
        <aside className="hidden md:block w-64 min-h-[calc(100vh-4rem)] bg-background border-r p-4">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover-elevate"
                    }`}
                    data-testid={`link-nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 pt-4 border-t">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start" data-testid="link-back-site">
                ← Retour au site
              </Button>
            </Link>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-2xl font-heading font-bold mb-6" data-testid="text-page-title">
            {title}
          </h1>
          {children}
        </main>
      </div>
    </div>
  );
}
