import { useState } from "react";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { Trip, TripGalleryPhoto } from "@shared/schema";
import { useRoute, Link, useSearch } from "wouter";
import { Calendar, MapPin, CheckCircle2, XCircle, Images } from "lucide-react";
import { TripReservationModal } from "@/modules/transaction/components/TripReservationModal";
import { useTranslation } from "react-i18next";
import { formatTripDates } from "@/lib/tripUtils";

export default function TripDetailPage() {
  const [, params] = useRoute("/voyages/:id");
  const tripId = params?.id;
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const pendingPaymentId = searchParams.get("payment") === "success" ? (searchParams.get("id") || undefined) : undefined;
  const pendingProvider = searchParams.get("provider") || undefined;
  const { t, i18n } = useTranslation();

  const [modalOpen, setModalOpen] = useState(!!pendingPaymentId);

  const { data: trip, isLoading } = useQuery<Trip>({
    queryKey: ["/api/trips", tripId],
    enabled: !!tripId,
  });

  const { data: galleryPhotos = [] } = useQuery<TripGalleryPhoto[]>({
    queryKey: ["/api/trips", tripId, "gallery"],
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
            {t("tripDetail.notFound")}
          </h1>
          <Link href="/voyages">
            <Button>{t("tripDetail.backToTrips")}</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={trip.title}
        description={trip.description.substring(0, 160)}
        keywords={`voyage ${trip.destination}, voyage business, ${trip.destination}`}
        image={trip.imageUrl}
      />
      <div className="pt-24">
        <div
          className="relative h-96 bg-cover bg-center"
          style={{ backgroundImage: `url(${trip.imageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
          <div className="absolute bottom-8 left-0 right-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Badge className="bg-primary text-primary-foreground mb-4">
                {formatTripDates(trip.startDate, trip.endDate, i18n.language)}
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
                  {t("tripDetail.description")}
                </h2>
                <p
                  data-testid="text-trip-description"
                  className="text-lg text-muted-foreground leading-relaxed"
                >
                  {trip.description}
                </p>
              </section>

              {galleryPhotos.length > 0 && (
                <section className="mb-12">
                  <h2 className="text-2xl font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                    <Images className="w-6 h-6 text-primary" />
                    {t("tripDetail.gallery")}
                  </h2>
                  <div
                    data-testid="gallery-mosaic"
                    className="grid grid-cols-2 md:grid-cols-3 gap-3"
                  >
                    {galleryPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        data-testid={`gallery-photo-${photo.id}`}
                        className="relative group rounded-md overflow-hidden"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || trip.destination}
                          className="w-full h-48 object-cover rounded-md"
                          loading="lazy"
                        />
                        {photo.caption && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end rounded-md">
                            <p className="text-white text-sm p-3 font-medium">
                              {photo.caption}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="border-primary/20">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-heading font-semibold">
                          {t("tripDetail.included")}
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
                          {t("tripDetail.notIncluded")}
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
                      {t("tripDetail.from")}
                    </div>
                    <div
                      data-testid="text-trip-price"
                      className="text-4xl font-heading font-bold text-primary mb-1"
                    >
                      {trip.price}€
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t("tripDetail.perPerson")}
                    </div>
                    {trip.hasDeposit && trip.depositAmount > 0 && (
                      <div className="mt-3 p-2.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          {t("trips.depositRequired")}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                          {t("trips.depositFrom", { amount: trip.depositAmount })}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">{formatTripDates(trip.startDate, trip.endDate, i18n.language)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-5 h-5 text-primary" />
                      <span className="text-muted-foreground">
                        {trip.destination}
                      </span>
                    </div>
                  </div>

                  <Button
                    data-testid="button-reserve-trip"
                    size="lg"
                    className="w-full rounded-full text-lg py-6 mb-4"
                    onClick={() => setModalOpen(true)}
                  >
                    {t("tripDetail.reserveBtn")}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    {t("tripDetail.securePayment")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <TripReservationModal
        trip={trip}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        pendingPaymentId={pendingPaymentId}
        pendingProvider={pendingProvider}
      />
    </Layout>
  );
}
