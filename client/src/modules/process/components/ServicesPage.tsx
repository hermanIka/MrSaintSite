import { Layout } from "@/modules/foundation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileText, Briefcase, Plane, CheckCircle, ArrowRight, MessageSquare } from "lucide-react";
import servicesHeroBanner from "@/assets/images/services-hero-banner.png";

export default function ServicesPage() {
  const services = [
    {
      id: "consultation",
      icon: MessageSquare,
      title: "Consultation Stratégique",
      subtitle: "Votre projet mérite un expert",
      description:
        "Une session personnalisée avec Mr Saint pour analyser votre projet, répondre à vos questions et définir une feuille de route claire. Idéal pour démarrer du bon pied.",
      features: [
        "Appel vidéo privé de 45 minutes",
        "Analyse personnalisée de votre situation",
        "Recommandations concrètes et actionnables",
        "Accès à des ressources exclusives",
        "Suivi par email pendant 7 jours",
      ],
      benefits: ["Clarté immédiate", "Gain de temps", "Expertise reconnue"],
      link: "/reservation",
      price: "95€ / session",
    },
    {
      id: "visa",
      icon: FileText,
      title: "Facilitation Visa",
      subtitle: "Obtenez votre visa sans stress",
      description:
        "Nous prenons en charge toutes vos démarches administratives pour l'obtention de votre visa. Tourisme, affaires, études ou travail, notre expertise garantit un traitement rapide et efficace.",
      features: [
        "Analyse de votre dossier personnalisé",
        "Constitution des documents requis",
        "Suivi de votre demande en temps réel",
        "Accompagnement jusqu'à l'obtention",
        "Conseils pour maximiser vos chances",
      ],
      destinations: ["Dubaï", "Canada", "États-Unis", "Europe", "Chine"],
      link: "/facilitation-visa",
      price: "À partir de 75€",
    },
    {
      id: "agence",
      icon: Briefcase,
      title: "Création d'Agence de Voyage",
      subtitle: "Devenez entrepreneur du voyage",
      description:
        "Un programme complet de formation et d'accompagnement pour lancer votre propre agence de voyage. Bénéficiez de notre expertise et de notre réseau pour réussir.",
      features: [
        "Formation complète au métier",
        "Accompagnement administratif",
        "Accès à notre réseau de partenaires",
        "Outils et templates professionnels",
        "Coaching personnalisé pendant 6 mois",
      ],
      benefits: ["Indépendance financière", "Flexibilité horaire", "Marché en croissance"],
      link: "/creation-agence",
      price: "Programme complet : 750€",
    },
    {
      id: "voyages",
      icon: Plane,
      title: "Voyages Organisés",
      subtitle: "Expériences de voyage premium",
      description:
        "Des voyages d'affaires et de découverte organisés clé en main vers les destinations les plus prisées. Hébergement de qualité, programme optimisé et accompagnement sur place.",
      features: [
        "Itinéraires optimisés",
        "Hébergement 4-5 étoiles",
        "Guide francophone",
        "Transferts inclus",
        "Activités exclusives",
      ],
      destinations: ["Dubaï", "Istanbul", "Canton", "Bangkok", "Marrakech"],
      link: "/voyages",
      price: "À partir de 1 200€",
    },
  ];

  return (
    <Layout>
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
            {services.map((service) => {
              const Icon = service.icon;
              
              return (
                <Card
                  key={service.id}
                  data-testid={`section-service-${service.id}`}
                  className="border-primary/20 flex flex-col h-full transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                >
                  <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <div className="w-14 h-14 rounded-lg bg-primary flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <CardTitle>
                      <div data-testid={`text-service-title-${service.id}`} className="text-2xl font-heading mb-1">{service.title}</div>
                      <div data-testid={`text-service-subtitle-${service.id}`} className="text-sm text-muted-foreground font-normal">
                        {service.subtitle}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <p data-testid={`text-service-desc-${service.id}`} className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <ul className="space-y-2 mb-6 flex-1">
                      {service.features.slice(0, 4).map((feature, i) => (
                        <li key={i} data-testid={`text-feature-${service.id}-${i}`} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {"destinations" in service && service.destinations && (
                      <div className="mb-4">
                        <div data-testid={`text-destinations-label-${service.id}`} className="text-xs font-medium text-foreground mb-2">
                          Destinations populaires
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {service.destinations.slice(0, 3).map((dest) => (
                            <span
                              key={dest}
                              data-testid={`chip-destination-${dest.toLowerCase().replace(/\s+/g, '-')}`}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {dest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {"benefits" in service && service.benefits && (
                      <div className="mb-4">
                        <div data-testid={`text-benefits-label-${service.id}`} className="text-xs font-medium text-foreground mb-2">
                          Avantages
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {service.benefits.map((benefit) => (
                            <span
                              key={benefit}
                              data-testid={`chip-benefit-${benefit.toLowerCase().replace(/\s+/g, '-')}`}
                              className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-primary/10 mt-auto">
                      <div data-testid={`text-service-price-${service.id}`} className="text-lg font-semibold text-primary mb-4">{service.price}</div>
                      <Link href={service.link}>
                        <Button
                          data-testid={`button-service-${service.id}`}
                          className="w-full gap-2"
                        >
                          Commencer Maintenant
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
