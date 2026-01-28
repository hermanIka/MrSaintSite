import { Layout } from "@/modules/foundation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileText, Briefcase, Plane, CheckCircle, ArrowRight } from "lucide-react";
import servicesHeroBanner from "@/assets/images/services-hero-banner.png";

export default function ServicesPage() {
  const services = [
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
          <div className="space-y-24">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              
              return (
                <div
                  key={service.id}
                  data-testid={`section-service-${service.id}`}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    isEven ? "" : "lg:flex-row-reverse"
                  }`}
                >
                  <div className={isEven ? "" : "lg:order-2"}>
                    <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                      <Icon className="w-4 h-4" />
                      <span data-testid={`text-service-subtitle-${service.id}`} className="text-sm font-medium">{service.subtitle}</span>
                    </div>
                    <h2 data-testid={`text-service-title-${service.id}`} className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
                      {service.title}
                    </h2>
                    <p data-testid={`text-service-desc-${service.id}`} className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} data-testid={`text-feature-${service.id}-${i}`} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center gap-4">
                      <Link href={service.link}>
                        <Button
                          data-testid={`button-service-${service.id}`}
                          size="lg"
                          className="gap-2"
                        >
                          En savoir plus
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                      <span data-testid={`text-service-price-${service.id}`} className="text-lg font-semibold text-primary">{service.price}</span>
                    </div>
                  </div>

                  <div className={isEven ? "lg:order-2" : ""}>
                    <Card className="border-primary/20 overflow-hidden">
                      <CardHeader className="bg-primary/5 border-b border-primary/10">
                        <CardTitle className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
                            <Icon className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <div>
                            <div data-testid={`text-card-title-${service.id}`} className="text-xl font-heading">{service.title}</div>
                            <div data-testid={`text-card-subtitle-${service.id}`} className="text-sm text-muted-foreground font-normal">
                              {service.subtitle}
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {"destinations" in service && service.destinations && (
                          <div className="mb-4">
                            <div data-testid={`text-destinations-label-${service.id}`} className="text-sm font-medium text-foreground mb-2">
                              Destinations populaires
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {service.destinations.map((dest) => (
                                <span
                                  key={dest}
                                  data-testid={`chip-destination-${dest.toLowerCase().replace(/\s+/g, '-')}`}
                                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                >
                                  {dest}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {"benefits" in service && service.benefits && (
                          <div>
                            <div data-testid={`text-benefits-label-${service.id}`} className="text-sm font-medium text-foreground mb-2">
                              Avantages
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {service.benefits.map((benefit) => (
                                <span
                                  key={benefit}
                                  data-testid={`chip-benefit-${benefit.toLowerCase().replace(/\s+/g, '-')}`}
                                  className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                                >
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
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
