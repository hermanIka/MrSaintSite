import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  FileText, 
  Briefcase, 
  Plane, 
  CheckCircle, 
  ArrowRight, 
  MessageCircle,
  CreditCard,
  type LucideIcon 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Service } from "@shared/schema";
import servicesHeroBanner from "@/assets/images/services-hero-banner.png";

const iconMap: Record<string, LucideIcon> = {
  FileText,
  Briefcase,
  Plane,
  MessageCircle,
  CreditCard,
};

function formatPrice(service: Service): string {
  const parts: string[] = [];
  if (service.priceLabel) {
    parts.push(service.priceLabel);
  }
  parts.push(`${service.price}€`);
  if (service.priceUnit) {
    parts.push(service.priceUnit);
  }
  return parts.join(" ");
}

function ServiceCardSkeleton() {
  return (
    <Card className="border-primary/20 flex flex-col h-full">
      <CardHeader className="bg-primary/5 border-b border-primary/10">
        <Skeleton className="w-14 h-14 rounded-lg mb-4" />
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-6 flex-1 flex flex-col">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />
        <div className="space-y-2 mb-6 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <div className="pt-4 border-t border-primary/10 mt-auto">
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ServicesPage() {
  const { data: services, isLoading, isError } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  return (
    <Layout>
      <SEO 
        title="Nos Services"
        description="Découvrez nos services: facilitation visa, création d'agence de voyage, voyages business organisés et consultation stratégique. Solutions complètes."
        keywords="services, visa, agence voyage, voyages business, consultation, formation"
      />
      <section className="relative py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={servicesHeroBanner} 
            alt="" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            data-testid="text-services-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
          >
            Nos Services
          </h1>
          <p
            data-testid="text-services-subtitle"
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Des solutions complètes pour tous vos projets de voyage et d'entrepreneuriat
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <>
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
              </>
            ) : isError ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Une erreur est survenue lors du chargement des services. Veuillez réessayer.
              </div>
            ) : services && services.length > 0 ? (
              services.filter(s => s.slug !== "voyage").map((service) => {
                const Icon = iconMap[service.iconName || "FileText"] || FileText;
                
                return (
                  <Card
                    key={service.id}
                    data-testid={`section-service-${service.slug}`}
                    className="border-primary/20 flex flex-col h-full transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                  >
                    <CardHeader className="bg-primary/5 border-b border-primary/10">
                      <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-4">
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <CardTitle>
                        <div data-testid={`text-service-title-${service.slug}`} className="text-2xl font-heading mb-1">{service.name}</div>
                        <div data-testid={`text-service-subtitle-${service.slug}`} className="text-sm text-muted-foreground font-normal">
                          {service.shortDescription}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <p data-testid={`text-service-desc-${service.slug}`} className="text-muted-foreground mb-6 leading-relaxed">
                        {service.fullDescription}
                      </p>
                      
                      <ul className="space-y-2 mb-6 flex-1">
                        {(service.features || []).slice(0, 4).map((feature, i) => (
                          <li key={i} data-testid={`text-feature-${service.slug}-${i}`} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="pt-4 border-t border-primary/10 mt-auto">
                        <div data-testid={`text-service-price-${service.slug}`} className="text-lg font-semibold text-primary mb-4">
                          {formatPrice(service)}
                        </div>
                        <Link href={service.ctaLink || "/reservation"}>
                          <Button
                            data-testid={`button-service-${service.slug}`}
                            className="w-full gap-2"
                          >
                            {service.ctaText || "Commencer Maintenant"}
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Aucun service disponible pour le moment.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            Besoin d'un service personnalisé ?
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Contactez-nous pour discuter de vos besoins spécifiques. 
            Nous créons des solutions sur mesure pour chaque client.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link href="/reservation">
              <Button
                data-testid="button-reserve-now"
                size="lg"
                variant="secondary"
              >
                Réserver maintenant
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                data-testid="button-contact"
                size="lg"
                variant="outline"
              >
                Nous contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
