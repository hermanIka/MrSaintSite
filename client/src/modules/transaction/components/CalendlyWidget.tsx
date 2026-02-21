import { useMemo } from "react";
import { useTheme } from "@/modules/foundation/components/ThemeProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InlineWidget } from "react-calendly";

interface CalendlyWidgetProps {
  schedulingUrl: string;
  selectedDate?: Date;
  selectedTime?: string;
  serviceName?: string;
  height?: number;
}

export default function CalendlyWidget({
  schedulingUrl,
  selectedDate,
  selectedTime,
  serviceName,
  height = 700,
}: CalendlyWidgetProps) {
  const { theme } = useTheme();

  const pageSettings = useMemo(() => {
    if (theme === "dark") {
      return {
        primaryColor: "e6a817",
        backgroundColor: "0d0d0d",
        textColor: "fafafa",
        hideGdprBanner: true,
        hideLandingPageDetails: true,
      };
    }
    return {
      primaryColor: "e6a817",
      backgroundColor: "ffffff",
      textColor: "0d0d0d",
      hideGdprBanner: true,
      hideLandingPageDetails: true,
    };
  }, [theme]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <Card
      data-testid="card-calendly-branded"
      className="border-primary/30 overflow-visible"
    >
      <div
        data-testid="container-calendly-header"
        className="bg-primary/10 border-b border-primary/20 px-6 py-4"
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3
                data-testid="text-calendly-widget-title"
                className="font-heading font-semibold text-foreground"
              >
                Finalisez votre réservation
              </h3>
              <p
                data-testid="text-calendly-widget-subtitle"
                className="text-sm text-muted-foreground"
              >
                Remplissez vos informations pour confirmer le créneau
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            asChild
            data-testid="link-open-calendly"
          >
            <a href={schedulingUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5" />
              Ouvrir dans Calendly
            </a>
          </Button>
        </div>

        {(selectedDate || selectedTime || serviceName) && (
          <div
            data-testid="container-calendly-meta"
            className="flex flex-wrap items-center gap-3 mt-3 text-sm"
          >
            {serviceName && (
              <span
                data-testid="text-calendly-service"
                className="inline-flex items-center gap-1.5 bg-primary/15 text-primary px-3 py-1 rounded-full font-medium"
              >
                {serviceName}
              </span>
            )}
            {selectedDate && (
              <span
                data-testid="text-calendly-date"
                className="inline-flex items-center gap-1.5 text-muted-foreground"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                {formatDate(selectedDate)}
              </span>
            )}
            {selectedTime && (
              <span
                data-testid="text-calendly-time"
                className="inline-flex items-center gap-1.5 text-muted-foreground"
              >
                <Clock className="w-3.5 h-3.5 text-primary" />
                {selectedTime}
              </span>
            )}
          </div>
        )}
      </div>

      <CardContent className="p-0" data-testid="calendly-inline-widget">
        <InlineWidget
          url={schedulingUrl}
          pageSettings={pageSettings}
          styles={{
            height: `${height}px`,
            minWidth: "320px",
          }}
          iframeTitle="Calendly - Finaliser la réservation"
        />
      </CardContent>
    </Card>
  );
}
