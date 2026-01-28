import { Layout } from "@/modules/foundation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Portfolio } from "@shared/schema";

export default function PortfolioPage() {
  const { data: portfolioItems = [], isLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/portfolio"],
  });

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
              Réalisations et Entrepreneurs accompagnés
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Découvrez les success stories des entrepreneurs que j'ai
              accompagnés dans la création et le développement de leur agence
              de voyage.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <Skeleton className="h-64 w-full rounded-t-lg" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-3" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground mb-4">
                Portfolio en cours de construction
              </p>
              <p className="text-sm text-muted-foreground">
                Revenez bientôt pour découvrir les réalisations
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {portfolioItems.map((item) => (
                <Card
                  key={item.id}
                  data-testid={`card-portfolio-${item.id}`}
                  className="overflow-hidden hover-elevate active-elevate-2 transition-all duration-300 hover:-translate-y-1 hover:scale-105 border-primary/20"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.businessName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <Badge className="bg-primary text-primary-foreground mb-3">
                        {item.category}
                      </Badge>
                      <h3 className="text-xl font-heading font-semibold text-white">
                        {item.businessName}
                      </h3>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            Vous aussi, lancez votre agence
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
