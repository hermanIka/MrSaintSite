import { Layout } from "@/modules/foundation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/schema";
import { useRoute, Link } from "wouter";
import { Calendar, MapPin, CheckCircle2, XCircle } from "lucide-react";

export default function TripDetailPage() {
  const [, params] = useRoute("/voyages/:id");
  const tripId = params?.id;

  const { data: trip, isLoading } = useQuery<Trip>({
    queryKey: ["/api/trips", tripId],
    enabled: !!tripId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-96 w-full rounded-lg mb-8" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-2/3" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!trip) {
    return (
      <Layout>
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-4">
            Voyage non trouvé
          </h1>
          <Link href="/voyages">
            <Button>Retour aux voyages</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pt-24">
        <div
          className="relative h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="absolute bottom-8 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Badge className="bg-primary text-primary-foreground mb-4">
                {trip.date}
              </Badge>
              <h1
                data-testid="text-trip-title"
                className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4"
              >
                {trip.title}
              </h1>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{trip.destination}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Description
                </h2>
                <p
                  data-testid="text-trip-description"
                  className="text-lg text-muted-foreground leading-relaxed"
                >
                  {trip.description}
                </p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                  Itinéraire détaillé
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {trip.itinerary.map((day, index) => (
                    <AccordionItem
                      key={index}
                      value={`day-${index}`}
                      data-testid={`accordion-day-${index + 1}`}
                    >
                      <AccordionTrigger className="text-lg font-heading">
                        Jour {index + 1}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {day}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>

              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-heading font-semibold">
                          Inclus
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {trip.included.map((item, index) => (
                          <li
                            key={index}
                            data-testid={`item-included-${index}`}
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-destructive/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <XCircle className="w-6 h-6 text-destructive" />
                        <h3 className="text-lg font-heading font-semibold">
                          Non inclus
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {trip.notIncluded.map((item, index) => (
                          <li
                            key={index}
                            data-testid={`item-not-included-${index}`}
                            className="flex items-start gap-2 text-muted-foreground"
                          >
                            <XCircle className="w-4 h-4 text-destructive mt-1 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-28 border-primary/20">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <div className="text-sm text-muted-foreground mb-2">
                      À partir de
                    </div>
                    <div
                      data-testid="text-trip-price"
                      className="text-4xl font-heading font-bold text-primary mb-1"
                    >
                      {trip.price}€
                    </div>
                    <div className="text-sm text-muted-foreground">
                      par personne
                    </div>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{trip.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">
                        {trip.destination}
                      </span>
                    </div>
                  </div>

                  <Link href="/contact">
                    <Button
                      data-testid="button-reserve-trip"
                      size="lg"
                      className="w-full rounded-full text-lg py-6 mb-4"
                    >
                      Réserver ma place
                    </Button>
                  </Link>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    * Système de réservation disponible prochainement
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
