import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Plane } from "lucide-react";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/facilitation-visa", label: "Visa" },
    { href: "/creation-agence", label: "Créer Agences" },
    { href: "/voyages", label: "Voyages" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-black shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link href="/">
              <a data-testid="link-home" className="flex items-center gap-3 hover-elevate active-elevate-2 px-4 py-2 rounded-md -ml-4">
                <Plane className="w-8 h-8 text-primary" />
                <span className="text-xl font-heading font-bold text-white">
                  Mr Saint
                </span>
              </a>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <a
                    data-testid={`link-${link.label.toLowerCase()}`}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate active-elevate-2 ${
                      location === link.href
                        ? "text-primary"
                        : "text-white hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </a>
                </Link>
              ))}
              <ThemeToggle />
              <Link href="/contact">
                <a>
                  <Button
                    data-testid="button-reserve-service"
                    className="ml-4"
                    size="default"
                  >
                    Réserver un service
                  </Button>
                </a>
              </Link>
            </div>

            <button
              data-testid="button-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover-elevate active-elevate-2 rounded-md"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black md:hidden" style={{ top: "80px" }}>
          <div className="flex flex-col p-6 gap-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <a
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                  className={`block px-6 py-4 rounded-lg text-lg font-medium transition-colors hover-elevate active-elevate-2 ${
                    location === link.href
                      ? "text-primary bg-primary/10"
                      : "text-white"
                  }`}
                >
                  {link.label}
                </a>
              </Link>
            ))}
            <Link href="/contact">
              <a>
                <Button
                  data-testid="button-mobile-reserve"
                  className="w-full mt-4"
                  size="lg"
                >
                  Réserver un service
                </Button>
              </a>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
