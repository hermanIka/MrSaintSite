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

function ServiceCardSkeleton() {
  return (
    <Card className="border-border flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardHeader>
      <CardContent className="space-y-4 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
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
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {isLoading ? (
              <>
                <ServiceCardSkeleton />
                <ServiceCardSkeleton />
              </>
            ) : isError ? (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Une erreur est survenue lors du chargement des services. Veuillez réessayer.
              </div>
            ) : services && services.length > 0 ? (
              services.filter(s => s.slug !== "voyage" && s.slug !== "consultation").map((service) => {
                const Icon = iconMap[service.iconName || "FileText"] || FileText;
                
                return (
                  <Card
                    key={service.id}
                    data-testid={`section-service-${service.slug}`}
                    className="relative border-border flex flex-col"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle data-testid={`text-service-title-${service.slug}`} className="text-xl font-heading">
                          {service.name}
                        </CardTitle>
                      </div>
                      <p data-testid={`text-service-subtitle-${service.slug}`} className="text-sm text-muted-foreground">
                        {service.shortDescription}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <ul className="space-y-2 flex-1">
                        {(service.features || []).slice(0, 3).map((feature, i) => (
                          <li key={i} data-testid={`text-feature-${service.slug}-${i}`} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link href={service.ctaLink || "/reservation"}>
                        <Button
                          data-testid={`button-service-${service.slug}`}
                          className="w-full gap-2"
                        >
                          {service.ctaText || "Commencer Maintenant"}
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
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
              >Consultez maintenant</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
