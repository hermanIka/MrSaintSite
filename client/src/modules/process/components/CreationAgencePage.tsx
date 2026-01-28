import { Layout } from "@/modules/foundation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, TrendingUp, Users, Rocket, DollarSign } from "lucide-react";
import { Link } from "wouter";
import agencyImage from "@assets/generated_images/Agency_coaching_service_image_40575f0c.png";

export default function CreationAgencePage() {
  const modules = [
    {
      title: "Formation complète",
      description: "Toutes les compétences pour gérer une agence de voyage professionnelle",
    },
    {
      title: "Coaching personnalisé",
      description: "Accompagnement individuel adapté à votre projet et vos objectifs",
    },
    {
      title: "Parrainage",
      description: "Mentorat continu et partage d'expérience pour votre réussite",
    },
    {
      title: "Financement",
      description: "Solutions de financement et aide au démarrage de votre activité",
    },
  ];

  const learnings = [
    "Gestion administrative et légale d'une agence",
    "Stratégies de marketing digital et acquisition clients",
    "Négociation avec les prestataires et fournisseurs",
    "Conception de packages voyage attractifs",
    "Gestion financière et comptabilité",
    "Service client excellence et fidélisation",
    "Outils digitaux et logiciels métier",
    "Développement de votre réseau professionnel",
  ];

  const results = [
    {
      metric: "+50",
      label: "Entrepreneurs accompagnés",
    },
    {
      metric: "85%",
      label: "Taux de réussite",
    },
    {
      metric: "6 mois",
      label: "Durée moyenne avant rentabilité",
    },
  ];

  return (
    <Layout>
      <section
        className="relative h-[50vh] flex items-center justify-center overflow-hidden"
        style={{ marginTop: "80px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${agencyImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            data-testid="text-page-title"
            className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4"
          >
            Créez votre agence de voyage
          </h1>
          <p className="text-lg sm:text-xl text-white/90">
            Formation, coaching et accompagnement complet
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
              Lancez votre agence de voyage avec un expert
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Fort de 7 ans d'expérience et fondateur de Go Fly, l'une des
              agences leaders du marché, je vous accompagne dans la création et
              le développement de votre propre agence de voyage.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Mon programme complet vous donne toutes les clés pour réussir :
              formation, coaching, parrainage et même des solutions de
              financement pour démarrer sereinement.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Le programme complet
            </h2>
            <p className="text-lg text-white/70">
              Tout ce dont vous avez besoin pour réussir
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {modules.map((module, index) => {
              const icons = [Users, TrendingUp, Rocket, DollarSign];
              const Icon = icons[index];
              return (
                <Card
                  key={index}
                  data-testid={`card-module-${index}`}
                  className="bg-white/5 border-white/10 hover-elevate active-elevate-2 transition-all"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-heading font-semibold mb-3 text-white">
                      {module.title}
                    </h3>
                    <p className="text-sm text-white/70 leading-relaxed">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Ce que vous allez apprendre
            </h2>
            <p className="text-lg text-muted-foreground">
              Un programme exhaustif pour maîtriser tous les aspects du métier
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learnings.map((learning, index) => (
              <div
                key={index}
                data-testid={`item-learning-${index}`}
                className="flex items-start gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-foreground text-lg">{learning}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Résultats obtenus
            </h2>
            <p className="text-lg text-white/70">
              Des chiffres qui parlent d'eux-mêmes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {results.map((result, index) => (
              <div
                key={index}
                data-testid={`card-result-${index}`}
                className="text-center"
              >
                <div className="text-5xl font-heading font-bold text-primary mb-3">
                  {result.metric}
                </div>
                <div className="text-lg text-white/80">{result.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-primary/20">
            <CardContent className="p-12">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">
                  Investissement
                </h3>
                <p className="text-4xl font-heading font-bold text-primary mb-2">
                  2 500€
                </p>
                <p className="text-muted-foreground mb-8">
                  Formation complète + Coaching + Parrainage + Financement
                </p>
                <Link href="/contact">
                  <Button
                    data-testid="button-buy-formation"
                    size="lg"
                    className="w-full rounded-full text-lg py-6"
                  >
                    Démarrer mon projet
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-4">
                  * Paiement sécurisé - Système de paiement disponible prochainement
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
