import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Trip } from "@shared/schema";
import { MapPin, Crown } from "lucide-react";
import { Link } from "wouter";
import tripsHeroBanner from "@/assets/images/trips-hero-banner.png";
import { useGoPlusCard } from "@/hooks/useGoPlusCard";
import { useTranslation } from "react-i18next";
import { formatTripDates } from "@/lib/tripUtils";

export default function TripsPage() {
  const { data: trips = [], isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/trips"],
  });
  const { isGold } = useGoPlusCard();
  const { t, i18n } = useTranslation();

  return (
    <Layout>
      <SEO 
        title="Voyages Organisés"
        description="Découvrez nos voyages business exclusifs vers Dubaï, Istanbul, Chine et plus. Expériences premium, destinations prestigieuses et accompagnement sur mesure."
        keywords="voyages business, Dubaï, Istanbul, Chine, voyage organisé, voyage premium"
      />
      <section
        className="relative py-24 bg-black text-white overflow-hidden"
        style={{ marginTop: "80px" }}
      >
        <div className="absolute inset-0">
          <img 
            src={tripsHeroBanner} 
            alt="" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              data-testid="text-page-title"
              className="text-4xl sm:text-5xl font-heading font-bold mb-6"
            >
              {t("trips.pageTitle")}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              {t("trips.pageSubtitle")}
            </p>
          </div>
        </div>
      </section>
      <section className="py-20 bg-background">
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
                {t("trips.noTrips")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("trips.noTripsSub")}
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
                      loading="lazy"
                    />
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      <Badge className="bg-primary text-primary-foreground">
                        {formatTripDates(trip.startDate, trip.endDate, i18n.language)}
                      </Badge>
                      {isGold && trip.isFeatured && (
                        <Badge data-testid={`badge-gold-priority-${trip.id}`} className="bg-amber-600 text-white gap-1">
                          <Crown className="w-3 h-3" /> {t("trips.goldPriority")}
                        </Badge>
                      )}
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
                          {t("trips.from")}
                        </div>
                        <div className="text-2xl font-heading font-bold text-primary">
                          {trip.price}€
                        </div>
                        {trip.hasDeposit && trip.depositAmount > 0 && (
                          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                            {t("trips.depositFrom", { amount: trip.depositAmount })}
                          </div>
                        )}
                      </div>
                      <Link href={`/voyages/${trip.id}`}>
                        <Button
                          data-testid={`button-view-program-${trip.id}`}
                          variant="outline"
                        >
                          {t("trips.viewTrip")}
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
            {t("trips.ctaTitle")}
          </h2>
          <p className="text-lg mb-10 opacity-90">
            {t("trips.ctaSubtitle")}
          </p>
          <Link href="/reservation">
            <Button
              data-testid="button-custom-trip"
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary border-white hover:bg-white/90"
            >{t("trips.ctaBtn")}</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
