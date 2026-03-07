import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import type { Trip } from "@shared/schema";
import { MapPin, Calendar, ArrowRight, Clock } from "lucide-react";
import { formatTripDates } from "@/lib/tripUtils";

const MAX_FEATURED_TRIPS = 4;

function TripCard({ trip, index, lang }: { trip: Trip; index: number; lang: string }) {
  return (
    <Link href={`/voyages/${trip.id}`}>
      <div
        data-testid={`card-featured-trip-${trip.id}-${index}`}
        className="group flex-shrink-0 w-[340px] rounded-xl overflow-hidden border border-primary/10 bg-card cursor-pointer"
        style={{
          transition: "box-shadow 0.4s ease, transform 0.4s ease, border-color 0.4s ease",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(242,201,76,0.18), 0 2px 12px rgba(0,0,0,0.4)";
          (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(242,201,76,0.4)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.boxShadow = "none";
          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(242,201,76,0.1)";
        }}
      >
        <div className="relative h-[220px] overflow-hidden">
          <img
            src={trip.imageUrl}
            alt={trip.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />

          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-sm text-white text-xs font-medium border border-white/10">
              <Clock className="w-3 h-3" />
              {(trip as any).duration || "7 jours"}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-black text-xs font-bold shadow-lg">
              {trip.price.toLocaleString()} €
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{trip.destination}</span>
            </div>
          </div>
        </div>

        <div className="p-5">
          <h3
            className="text-base font-heading font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors duration-300"
            data-testid={`text-featured-trip-title-${trip.id}`}
          >
            {trip.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formatTripDates(trip.startDate, trip.endDate, lang)}</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {trip.description}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">Voyage organisé</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all duration-300">
              Découvrir <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function FeaturedTripsCarousel() {
  const { i18n } = useTranslation();
  const { data: allFeaturedTrips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips/featured"],
  });

  const featuredTrips = allFeaturedTrips.slice(0, MAX_FEATURED_TRIPS);

  if (isLoading) {
    return (
      <section className="py-20 overflow-hidden relative bg-gradient-to-b from-muted/40 to-background dark:from-black dark:via-[#0a0a0a] dark:to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-foreground mb-2">
              Voyages <span className="text-primary">Phares</span>
            </h2>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
          <div className="flex gap-8 justify-center">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex-shrink-0 w-[340px] h-[380px] rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (featuredTrips.length === 0) return null;

  const duplicatedTrips = [...featuredTrips, ...featuredTrips, ...featuredTrips];
  const cardWidth = 340 + 32;

  return (
    <section
      className="py-20 overflow-hidden relative bg-gradient-to-b from-muted/40 via-muted/10 to-background dark:from-black dark:via-[#0a0a0a] dark:to-background"
      data-testid="section-featured-trips"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(242,201,76,0.06) 0%, transparent 70%)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-14 text-center">
        <span className="inline-block px-4 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-widest uppercase mb-5 border border-primary/20">
          Tendances
        </span>
        <h2
          className="text-4xl sm:text-5xl font-heading font-bold text-foreground mb-4"
          data-testid="text-featured-title"
        >
          Voyages <span className="text-primary">Phares</span>
        </h2>
        <div className="flex items-center justify-center gap-3 mb-5">
          <div className="h-px w-16 bg-primary/30" />
          <div className="h-1 w-8 rounded-full bg-primary" />
          <div className="h-px w-16 bg-primary/30" />
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto text-base">
          Nos destinations les plus prisées, soigneusement sélectionnées par nos experts voyagistes
        </p>
      </div>

      <div className="relative">
        <div
          className="flex gap-8 animate-scroll"
          style={{ width: `${duplicatedTrips.length * cardWidth}px` }}
        >
          {duplicatedTrips.map((trip, index) => (
            <TripCard key={`${trip.id}-${index}`} trip={trip} index={index} lang={i18n.language} />
          ))}
        </div>

        <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10 bg-gradient-to-r from-background dark:from-black to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10 bg-gradient-to-l from-background dark:from-[#0a0a0a] to-transparent" />
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-${cardWidth}px * ${featuredTrips.length})); }
        }
        .animate-scroll {
          animation: scroll ${featuredTrips.length * 10}s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
