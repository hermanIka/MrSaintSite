import { useState } from "react";
import { Layout } from "@/modules/foundation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Portfolio } from "@shared/schema";
import { SERVICE_TYPES } from "@shared/schema";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";
import portfolioBanner from "@/assets/images/portfolio-banner.png";

export default function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const queryKey = activeFilter !== "all" 
    ? `/api/portfolio?serviceType=${activeFilter}` 
    : "/api/portfolio";

  const { data: portfolioItems = [], isLoading } = useQuery<Portfolio[]>({
    queryKey: [queryKey],
  });

  const filters = [
    { value: "all", label: "Tous les projets" },
    ...SERVICE_TYPES,
  ];

  return (
    <Layout>
      <section
        className="relative py-32 text-white overflow-hidden"
        style={{ marginTop: "80px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${portfolioBanner})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              data-testid="text-page-title"
              className="text-4xl sm:text-5xl font-heading font-bold mb-6"
            >
              Réalisations et Entrepreneurs Accompagnés
            </h1>
            <p className="text-lg sm:text-xl text-white/90 leading-relaxed">
              Découvrez les success stories des entrepreneurs que j'ai accompagnés. 
              Chaque projet est une preuve concrète de résultats.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-muted/30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {filters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter(filter.value)}
                data-testid={`button-filter-${filter.value}`}
                className="rounded-full"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-4">
                {activeFilter !== "all" 
                  ? "Aucun projet dans cette catégorie" 
                  : "Portfolio en cours de construction"}
              </p>
              {activeFilter !== "all" && (
                <Button variant="outline" onClick={() => setActiveFilter("all")}>
                  Voir tous les projets
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <Card
                  key={item.id}
                  data-testid={`card-portfolio-${item.id}`}
                  className="overflow-hidden hover-elevate transition-all duration-300 border-primary/10 group"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.businessName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          {SERVICE_TYPES.find(t => t.value === item.serviceType)?.label || item.serviceType}
                        </Badge>
                        <Badge variant="secondary" className="bg-white/90 text-black text-xs">
                          {item.year}
                        </Badge>
                      </div>
                    </div>
                    {item.clientLogo && (
                      <div className="absolute top-3 right-3 bg-white rounded-lg p-1.5 shadow-md">
                        <img 
                          src={item.clientLogo} 
                          alt={`Logo ${item.businessName}`}
                          className="w-6 h-6 object-contain"
                        />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-heading font-semibold mb-2 line-clamp-1">
                      {item.businessName}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex items-start gap-2 p-2.5 bg-primary/5 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-foreground line-clamp-2">
                        {item.result}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">
            Des résultats, pas des promesses
          </h2>
          <p className="text-muted-foreground mb-8">
            Chaque projet présenté est une réussite réelle. Des entrepreneurs comme vous 
            qui ont fait le choix de se faire accompagner.
          </p>
          <div className="grid grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Projets accompagnés</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">95%</div>
              <div className="text-sm text-muted-foreground">Taux de réussite</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-primary">8+</div>
              <div className="text-sm text-muted-foreground">Années d'expérience</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            Vous aussi, lancez votre projet
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Rejoignez les entrepreneurs qui ont réussi avec mon accompagnement.
            Formation, coaching et parrainage personnalisés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/creation-agence">
              <Button
                data-testid="button-discover-formation"
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full bg-white text-primary border-white hover:bg-white/90"
              >
                Découvrir la formation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                data-testid="button-contact-portfolio"
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full bg-transparent text-white border-2 border-white hover:bg-white/10"
              >
                Me contacter
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
