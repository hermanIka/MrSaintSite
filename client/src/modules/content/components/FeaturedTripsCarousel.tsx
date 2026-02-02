import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import type { Trip } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, ArrowRight } from "lucide-react";

const MAX_FEATURED_TRIPS = 4;

export function FeaturedTripsCarousel() {
  const { data: allFeaturedTrips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips/featured"],
  });

  const featuredTrips = allFeaturedTrips.slice(0, MAX_FEATURED_TRIPS);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">
              Voyages Phares
            </h2>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </section>
    );
  }

  if (featuredTrips.length === 0) {
    return null;
  }

  const duplicatedTrips = [...featuredTrips, ...featuredTrips, ...featuredTrips];

  return (
    <section 
      className="py-16 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 overflow-hidden"
      data-testid="section-featured-trips"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
            Tendances
          </span>
          <h2 
            className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2"
            data-testid="text-featured-title"
          >
            Voyages Phares
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nos destinations les plus populaires sélectionnées par nos experts
          </p>
        </div>
      </div>

      <div className="relative">
        <div 
          className="flex gap-6 animate-scroll"
          style={{
            width: `${duplicatedTrips.length * 350}px`,
          }}
        >
          {duplicatedTrips.map((trip, index) => (
            <Card
              key={`${trip.id}-${index}`}
              data-testid={`card-featured-trip-${trip.id}`}
              className="flex-shrink-0 w-[320px] border-primary/20"
            >
              <div className="relative h-48">
                <img
                  src={trip.imageUrl}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    {trip.price.toLocaleString()} EUR
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 
                  className="text-lg font-heading font-semibold text-foreground mb-2 line-clamp-1"
                  data-testid={`text-featured-trip-title-${trip.id}`}
                >
                  {trip.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {trip.destination}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {trip.date}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {trip.description}
                </p>
                <Link href={`/voyages/${trip.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    Découvrir
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-350px * ${featuredTrips.length}));
          }
        }
        .animate-scroll {
          animation: scroll ${featuredTrips.length * 8}s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
