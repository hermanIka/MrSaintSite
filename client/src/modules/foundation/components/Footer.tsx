import { Link } from "wouter";
import { Plane, Facebook, Instagram, Linkedin, Mail, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Plane className="w-8 h-8 text-primary" />
              <span className="text-2xl font-heading font-bold">Mr Saint</span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Expert voyagiste avec 7 ans d'expérience. Votre partenaire de
              confiance pour tous vos projets de voyage et de création
              d'agence.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                data-testid="link-facebook"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 hover-elevate active-elevate-2 text-white hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                data-testid="link-instagram"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 hover-elevate active-elevate-2 text-white hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                data-testid="link-linkedin"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 hover-elevate active-elevate-2 text-white hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <Link href="/reservation">
                <span
                  data-testid="link-whatsapp-footer"
                  className="w-10 h-10 flex items-center justify-center rounded-md bg-white/5 hover-elevate active-elevate-2 text-white hover:text-primary transition-colors"
                  aria-label="WhatsApp - Réserver"
                >
                  <SiWhatsapp className="w-5 h-5" />
                </span>
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-6 text-primary">
              Liens rapides
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <span
                    data-testid="link-footer-home"
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Accueil
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/facilitation-visa">
                  <span
                    data-testid="link-footer-visa"
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Facilitation Visa
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/creation-agence">
                  <span
                    data-testid="link-footer-agency"
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Création d'agence
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/voyages">
                  <span
                    data-testid="link-footer-trips"
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Voyages organisés
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-6 text-primary">
              Services
            </h3>
            <ul className="space-y-3">
              <li className="text-muted-foreground">Visa Tourisme</li>
              <li className="text-muted-foreground">Visa Business</li>
              <li className="text-muted-foreground">Visa Études</li>
              <li className="text-muted-foreground">Formation agence</li>
              <li className="text-muted-foreground">Voyages business</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-heading font-semibold mb-6 text-primary">
              Contact
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <Link href="/reservation">
                  <span
                    data-testid="link-phone-footer"
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Réserver un appel
                  </span>
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <a
                  href="mailto:matandusaint@gmail.com"
                  data-testid="link-email-footer"
                  className="text-muted-foreground hover:text-primary transition-colors break-all"
                >
                  matandusaint@gmail.com
                </a>
              </li>
              <li className="text-muted-foreground">France</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Mr Saint. Tous droits réservés.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                data-testid="link-privacy"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Politique de confidentialité
              </a>
              <a
                href="#"
                data-testid="link-terms"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Conditions d'utilisation
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
