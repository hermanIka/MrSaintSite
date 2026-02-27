import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Award, Globe, Users, Target, CheckCircle, Plane } from "lucide-react";
import mrSaintPhoto from "@assets/Mr_saint_photo_profil_1769639553577.jfif";
import aboutHeroBanner from "@/assets/images/about-hero-banner.png";

export default function AboutPage() {
  const milestones = [
    { year: "2018", title: "Création de Mr Saint", description: "Lancement de l'agence avec une vision premium" },
    { year: "2020", title: "Expansion internationale", description: "Ouverture de partenariats à Dubaï et Istanbul" },
    { year: "2022", title: "Programme de formation", description: "Lancement du coaching pour créateurs d'agences" },
    { year: "2024", title: "500+ clients satisfaits", description: "Une communauté grandissante de voyageurs" },
  ];

  const values = [
    {
      icon: Award,
      title: "Excellence",
      description: "Nous visons la perfection dans chaque service que nous offrons à nos clients.",
    },
    {
      icon: Users,
      title: "Accompagnement",
      description: "Un suivi personnalisé du début à la fin de votre projet.",
    },
    {
      icon: Globe,
      title: "Accessibilité",
      description: "Rendre le voyage et l'entrepreneuriat accessibles à tous.",
    },
    {
      icon: Target,
      title: "Résultats",
      description: "Des solutions concrètes qui transforment vos rêves en réalité.",
    },
  ];

  const stats = [
    { value: "7+", label: "Années d'expérience" },
    { value: "500+", label: "Clients accompagnés" },
    { value: "15+", label: "Agences créées" },
    { value: "98%", label: "Taux de satisfaction" },
  ];

  return (
    <Layout>
      <SEO 
        title="À Propos"
        description="Découvrez Mr Saint, expert voyagiste depuis 2018. Plus de 500 clients accompagnés, 50+ agences créées. Une vision premium du tourisme et de l'accompagnement business."
        keywords="Mr Saint, expert voyage, histoire, parcours, agence voyage premium"
      />
      <section className="relative py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={aboutHeroBanner} 
            alt="" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/80" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-testid="badge-since-2018" className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
            <Plane className="w-4 h-4" />
            <span className="text-sm font-medium">Depuis 2018</span>
          </div>
          <h1
            data-testid="text-about-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
          >
            À propos de Mr Saint
          </h1>
          <p
            data-testid="text-about-subtitle"
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Une passion pour le voyage transformée en expertise au service de vos ambitions.
          </p>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <img
                    src={mrSaintPhoto}
                    alt="Mr Saint - Fondateur"
                    data-testid="img-mr-saint-profile"
                    className="w-28 h-28 rounded-full object-cover border-4 border-primary/30"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h2
                    data-testid="text-story-title"
                    className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-2"
                  >
                    Notre Histoire
                  </h2>
                  <p data-testid="text-founder-name" className="text-primary font-medium">Mr Saint, Fondateur</p>
                </div>
              </div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Mr Saint est né d'une passion profonde pour le voyage et d'une volonté 
                  d'aider les autres à réaliser leurs rêves. Après des années d'expérience 
                  dans le secteur du tourisme, j'ai décidé de créer une agence différente.
                </p>
                <p>
                  Notre mission est simple : rendre le voyage accessible, éliminer les 
                  obstacles administratifs, et accompagner ceux qui souhaitent créer leur 
                  propre entreprise dans ce domaine passionnant.
                </p>
                <p>
                  Aujourd'hui, Mr Saint c'est plus de 500 clients satisfaits, des dizaines d'agences créées grâce à notre programme de formation, et une réputation d'excellence dans la facilitation visa.
                </p>
                <p>
                  Je suis également le fondateur de plusieurs plateformes et entreprises innovantes :
                </p>
                <ul className="space-y-2">
                  <li><strong className="text-foreground">Go Fly</strong> : la première OTA offrant aux agences de voyage et aux agents indépendants du monde entier la possibilité de créer, gérer et vendre leurs propres forfaits touristiques, connectant ainsi des milliers de voyageurs.</li>
                  <li><strong className="text-foreground">Go Send</strong> : une application mobile qui facilite la livraison et l'expédition de colis à travers le monde.</li>
                  <li><strong className="text-foreground">Go House</strong> : un marketplace immobilier.</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/services">
                  <Button data-testid="button-discover-services" size="lg">
                    Découvrir nos services
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button data-testid="button-contact-us" variant="outline" size="lg">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card
                  key={index}
                  data-testid={`card-stat-${index}`}
                  className="border-primary/20 overflow-visible hover-elevate"
                >
                  <CardContent className="p-6 text-center">
                    <div data-testid={`text-stat-value-${index}`} className="text-4xl font-heading font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div data-testid={`text-stat-label-${index}`} className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-testid="text-values-title" className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Nos Valeurs
            </h2>
            <p data-testid="text-values-subtitle" className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident chacune de nos actions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card
                  key={index}
                  data-testid={`card-value-${index}`}
                  className="border-primary/20 overflow-visible hover-elevate"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 data-testid={`text-value-title-${index}`} className="text-lg font-heading font-semibold mb-2 text-foreground">
                      {value.title}
                    </h3>
                    <p data-testid={`text-value-desc-${index}`} className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 data-testid="text-journey-title" className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Notre Parcours
            </h2>
            <p data-testid="text-journey-subtitle" className="text-lg text-muted-foreground">
              Les étapes clés de notre développement
            </p>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <div
                key={index}
                data-testid={`milestone-${index}`}
                className="flex items-start gap-6"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1 pt-2">
                  <div data-testid={`text-milestone-year-${index}`} className="text-sm font-medium text-primary mb-1">{milestone.year}</div>
                  <h3 data-testid={`text-milestone-title-${index}`} className="text-xl font-heading font-semibold text-foreground mb-2">
                    {milestone.title}
                  </h3>
                  <p data-testid={`text-milestone-desc-${index}`} className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            Prêt à nous rejoindre ?
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Que vous souhaitiez voyager ou créer votre agence, nous sommes là pour vous accompagner.
          </p>
          <Link href="/reservation">
            <Button
              data-testid="button-cta-contact"
              size="lg"
              variant="secondary"
            >Consultez Maintenant</Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
