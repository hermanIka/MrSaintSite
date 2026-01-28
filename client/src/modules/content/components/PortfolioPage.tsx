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
        className="py-24 bg-black text-white"
        style={{ marginTop: "80px" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1
              data-testid="text-page-title"
              className="text-4xl sm:text-5xl font-heading font-bold mb-6"
            >
              Réalisations et Entrepreneurs Accompagnés
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Skeleton className="w-32 h-32 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {portfolioItems.map((item) => (
                <Card
                  key={item.id}
                  data-testid={`card-portfolio-${item.id}`}
                  className="overflow-hidden hover-elevate transition-all duration-300 border-primary/10"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.businessName}
                          className="w-full h-full object-cover"
                        />
                        {item.clientLogo && (
                          <div className="absolute bottom-2 right-2 bg-white rounded-lg p-1 shadow-md">
                            <img 
                              src={item.clientLogo} 
                              alt={`Logo ${item.businessName}`}
                              className="w-8 h-8 object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className="bg-primary text-primary-foreground">
                            {SERVICE_TYPES.find(t => t.value === item.serviceType)?.label || item.serviceType}
                          </Badge>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        
                        <h3 className="text-xl font-heading font-semibold mb-2">
                          {item.businessName}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {item.description}
                        </p>
                        
                        <div className="flex items-start gap-2 mb-3 p-3 bg-primary/5 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm font-medium text-foreground">
                            {item.result}
                          </p>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-1" />
                          {item.year}
                        </div>
                      </div>
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
