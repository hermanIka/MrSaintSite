import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/schema";
import { Calendar, MapPin } from "lucide-react";
import { Link } from "wouter";

export default function Voyages() {
  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section
        className="py-24 bg-black text-white"
        style={{ marginTop: "80px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              data-testid="text-page-title"
              className="text-4xl sm:text-5xl font-heading font-bold mb-6"
            >
              Voyages Organisés Premium
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Découvrez nos voyages business exclusifs. Destinations
              prestigieuses, expériences uniques et accompagnement sur mesure
              pour développer votre réseau international.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-64 w-full rounded-t-lg" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : trips.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-4">
                Aucun voyage disponible pour le moment
              </p>
              <p className="text-sm text-muted-foreground">
                Revenez bientôt pour découvrir nos prochaines destinations
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {trips.map((trip) => (
                <Card
                  key={trip.id}
                  data-testid={`card-trip-${trip.id}`}
                  className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 hover:-translate-y-1 border-primary/20"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={trip.imageUrl}
                      alt={trip.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground">
                        {trip.date}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.destination}</span>
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-3 text-foreground">
                      {trip.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                      {trip.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          À partir de
                        </div>
                        <div className="text-2xl font-heading font-bold text-primary">
                          {trip.price}€
                        </div>
                      </div>
                      <Link href={`/voyages/${trip.id}`}>
                        <Button
                          data-testid={`button-view-program-${trip.id}`}
                          variant="outline"
                        >
                          Voir le programme
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            Voyage sur mesure ?
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Vous avez un projet de voyage spécifique ? Contactez-moi pour créer
            ensemble le voyage qui correspond parfaitement à vos attentes.
          </p>
          <Link href="/contact">
            <Button
              data-testid="button-custom-trip"
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary border-white hover:bg-white/90"
            >
              Créer mon voyage
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
