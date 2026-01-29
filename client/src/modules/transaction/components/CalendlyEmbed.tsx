import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, AlertCircle } from "lucide-react";

interface CalendlyEmbedProps {
  serviceType: string;
  serviceName: string;
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: {
          name?: string;
          email?: string;
          customAnswers?: Record<string, string>;
        };
        utm?: Record<string, string>;
      }) => void;
    };
  }
}

export default function CalendlyEmbed({ serviceType, serviceName }: CalendlyEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendlyUrl = async () => {
      try {
        const response = await fetch("/api/config/calendly");
        const data = await response.json();
        if (data.url && data.url !== "https://calendly.com/your-calendly-link") {
          setCalendlyUrl(data.url);
        } else {
          setError("Le lien Calendly n'est pas encore configuré.");
        }
      } catch (err) {
        setError("Impossible de charger la configuration.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendlyUrl();
  }, []);

  useEffect(() => {
    if (!calendlyUrl || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    
    script.onload = () => {
      if (window.Calendly && containerRef.current) {
        window.Calendly.initInlineWidget({
          url: `${calendlyUrl}?hide_gdpr_banner=1&primary_color=f2c94c`,
          parentElement: containerRef.current,
          prefill: {
            customAnswers: {
              a1: serviceName,
            },
          },
          utm: {
            utmSource: "website",
            utmMedium: "reservation_page",
            utmCampaign: serviceType,
          },
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [calendlyUrl, serviceType, serviceName]);

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto" data-testid="card-calendly-loading">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto" />
            <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-yellow-500/20" data-testid="card-calendly-not-configured">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-xl font-heading font-bold mb-2">
            Réservation en cours de configuration
          </h3>
          <p className="text-muted-foreground mb-6">
            Le système de réservation en ligne sera disponible très prochainement.
            En attendant, vous pouvez nous contacter directement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Button asChild data-testid="button-contact-whatsapp">
              <a 
                href="https://wa.me/33600000000" 
                target="_blank" 
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Contacter via WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild data-testid="button-contact-email">
              <a href="mailto:matandusaint@gmail.com" className="gap-2">
                <Calendar className="w-4 h-4" />
                Envoyer un email
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto" data-testid="calendly-embed-container">
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium">Réservation pour : {serviceName}</p>
              <p className="text-sm text-muted-foreground">
                Sélectionnez un créneau disponible dans le calendrier ci-dessous
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div 
        ref={containerRef}
        className="calendly-inline-widget rounded-lg overflow-hidden"
        style={{ minWidth: "320px", height: "700px" }}
        data-testid="calendly-widget"
      />
    </div>
  );
}
