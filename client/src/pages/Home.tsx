import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@shared/schema";
import { Plane, FileText, Briefcase, Shield, Users, Globe, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import heroImage from "@assets/generated_images/Luxury_travel_hero_image_4477beea.png";

export default function Home() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  
  const { data: testimonials = [], isLoading: testimonialsLoading, isError: testimonialsError } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const nextTestimonial = () => {
    setTestimonialIndex((prev) => (prev + 1) % Math.max(testimonials.length, 1));
  };

  const prevTestimonial = () => {
    setTestimonialIndex(
      (prev) => (prev - 1 + Math.max(testimonials.length, 1)) % Math.max(testimonials.length, 1)
    );
  };

  const services = [
    {
      icon: FileText,
      title: "Facilitation Visa",
      description:
        "Obtenez votre visa facilement. Tourisme, business ou études, nous gérons toutes vos démarches administratives.",
      link: "/facilitation-visa",
      testId: "card-service-visa",
    },
    {
      icon: Briefcase,
      title: "Création d'agence",
      description:
        "Formation complète pour lancer votre propre agence de voyage. Accompagnement, financement et parrainage inclus.",
      link: "/creation-agence",
      testId: "card-service-agency",
    },
    {
      icon: Plane,
      title: "Voyages organisés",
      description:
        "Découvrez nos voyages business exclusifs vers Dubaï, Istanbul, la Chine et plus encore. Expériences premium.",
      link: "/voyages",
      testId: "card-service-trips",
    },
  ];

  const benefits = [
    {
      icon: Shield,
      title: "7 ans d'expertise",
      description: "Une expérience solide dans le secteur du tourisme premium",
    },
    {
      icon: Users,
      title: "Accompagnement personnalisé",
      description: "Un suivi sur mesure pour tous vos projets de voyage",
    },
    {
      icon: Globe,
      title: "Réseau international",
      description: "Des partenaires de confiance dans le monde entier",
    },
    {
      icon: Briefcase,
      title: "Solutions complètes",
      description: "De la facilitation visa au voyage organisé clé en main",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            data-testid="text-hero-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight"
          >
            Voyager n'a jamais été aussi simple
          </h1>
          <p
            data-testid="text-hero-subtitle"
            className="text-lg sm:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Expert voyagiste depuis 7 ans, je vous accompagne dans tous vos
            projets : facilitation visa, création d'agence, voyages organisés.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/facilitation-visa">
              <Button
                data-testid="button-hero-visa"
                size="lg"
                className="text-lg px-8 py-6 rounded-full"
              >
                Facilitation Visa
              </Button>
            </Link>
            <Link href="/creation-agence">
              <Button
                data-testid="button-hero-agency"
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
              >
                Créer mon agence
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              data-testid="text-services-title"
              className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4"
            >
              Nos Services Premium
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des solutions sur mesure pour tous vos besoins en voyage et entrepreneuriat
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <Card
                  key={service.testId}
                  data-testid={service.testId}
                  className="hover-elevate active-elevate-2 transition-all duration-300 hover:-translate-y-1 border-primary/20"
                >
                  <CardContent className="p-8">
                    <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-3 text-foreground">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <Link href={service.link}>
                      <Button
                        data-testid={`button-${service.testId}`}
                        variant="outline"
                        className="w-full"
                      >
                        En savoir plus
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Pourquoi choisir Mr Saint ?
            </h2>
            <p className="text-lg text-white/70 max-w-2xl mx-auto">
              Une expertise reconnue au service de vos ambitions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  data-testid={`card-benefit-${index}`}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-heading font-semibold mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Témoignages
            </h2>
            <p className="text-lg text-muted-foreground">
              Ce que disent nos clients
            </p>
          </div>

          {testimonialsLoading ? (
            <Card className="border-primary/20">
              <CardContent className="p-12">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-muted animate-pulse mb-6" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-4 animate-pulse" />
                  <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ) : testimonialsError ? (
            <Card className="border-destructive/20">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">
                  Impossible de charger les témoignages
                </p>
              </CardContent>
            </Card>
          ) : testimonials.length > 0 ? (
            <div className="relative">
              <Card className="border-primary/20">
                <CardContent className="p-12">
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={testimonials[testimonialIndex]?.imageUrl}
                      alt={testimonials[testimonialIndex]?.name}
                      className="w-20 h-20 rounded-full object-cover mb-6"
                      data-testid="img-testimonial-avatar"
                    />
                    <p
                      data-testid="text-testimonial-content"
                      className="text-lg text-muted-foreground mb-6 italic leading-relaxed"
                    >
                      "{testimonials[testimonialIndex]?.content}"
                    </p>
                    <h4
                      data-testid="text-testimonial-name"
                      className="text-lg font-heading font-semibold text-foreground"
                    >
                      {testimonials[testimonialIndex]?.name}
                    </h4>
                    <p
                      data-testid="text-testimonial-business"
                      className="text-sm text-muted-foreground"
                    >
                      {testimonials[testimonialIndex]?.business}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {testimonials.length > 1 && (
                <div className="flex justify-center gap-4 mt-8">
                  <Button
                    data-testid="button-testimonial-prev"
                    onClick={prevTestimonial}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    data-testid="button-testimonial-next"
                    onClick={nextTestimonial}
                    variant="outline"
                    size="icon"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="py-24 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
            Prêt à réaliser votre projet ?
          </h2>
          <p className="text-lg mb-10 opacity-90">
            Contactez-moi dès aujourd'hui pour discuter de votre projet de
            voyage ou de création d'agence.
          </p>
          <Link href="/contact">
            <Button
              data-testid="button-cta-contact"
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 rounded-full bg-white text-primary border-white hover:bg-white/90"
            >
              Me contacter
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
