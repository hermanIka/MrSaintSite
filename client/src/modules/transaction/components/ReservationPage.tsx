import { useState } from "react";
import { Layout } from "@/modules/foundation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { FileText, Briefcase, Plane, CheckCircle, Calendar, CreditCard, Lock, ArrowLeft } from "lucide-react";
import CalendarBooking from "./CalendarBooking";

type ServiceType = "visa" | "agence" | "voyage" | null;
type Step = "select" | "calendar";

export default function ReservationPage() {
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [currentStep, setCurrentStep] = useState<Step>("select");

  const services = [
    {
      id: "visa" as const,
      icon: FileText,
      title: "Facilitation Visa",
      description: "Demande de visa pour votre destination",
      price: "À partir de 75€",
      features: ["Analyse du dossier", "Constitution des documents", "Suivi de la demande"],
    },
    {
      id: "agence" as const,
      icon: Briefcase,
      title: "Création d'Agence",
      description: "Formation et accompagnement complet",
      price: "750€",
      features: ["Formation 4 semaines", "Coaching 6 mois", "Accès au réseau"],
    },
    {
      id: "voyage" as const,
      icon: Plane,
      title: "Voyage Organisé",
      description: "Voyage business clé en main",
      price: "À partir de 1 200€",
      features: ["Vol + Hébergement", "Transferts inclus", "Guide francophone"],
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Choisir un service",
      description: "Sélectionnez le service qui correspond à vos besoins",
      icon: CheckCircle,
    },
    {
      number: 2,
      title: "Paiement sécurisé",
      description: "Effectuez le paiement via notre plateforme sécurisée",
      icon: CreditCard,
    },
    {
      number: 3,
      title: "Réservation confirmée",
      description: "Choisissez votre créneau et recevez votre confirmation",
      icon: Calendar,
    },
  ];

  return (
    <Layout>
      <section className="relative py-32 bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div data-testid="badge-secure-payment" className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-2 rounded-full mb-6">
            <Lock className="w-4 h-4" />
            <span className="text-sm font-medium">Paiement 100% sécurisé</span>
          </div>
          <h1
            data-testid="text-reservation-title"
            className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6"
          >
            Réservez votre service
          </h1>
          <p
            data-testid="text-reservation-subtitle"
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >
            Commencez votre projet en quelques clics. Paiement sécurisé, confirmation immédiate.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.number} data-testid={`step-${step.number}`} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h3 data-testid={`text-step-title-${step.number}`} className="text-lg font-heading font-semibold text-foreground mb-1">
                      {step.title}
                    </h3>
                    <p data-testid={`text-step-desc-${step.number}`} className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 data-testid="text-choose-service-title" className="text-3xl font-heading font-bold text-foreground mb-4">
              Choisissez votre service
            </h2>
            <p data-testid="text-choose-service-subtitle" className="text-muted-foreground">
              Sélectionnez le service pour lequel vous souhaitez effectuer une réservation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {services.map((service) => {
              const Icon = service.icon;
              const isSelected = selectedService === service.id;
              
              return (
                <Card
                  key={service.id}
                  data-testid={`card-service-${service.id}`}
                  className={`cursor-pointer transition-all duration-300 overflow-visible hover-elevate ${
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-primary/20"
                  }`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <CardTitle data-testid={`text-title-${service.id}`} className="text-xl font-heading">{service.title}</CardTitle>
                    <p data-testid={`text-desc-${service.id}`} className="text-sm text-muted-foreground">{service.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div data-testid={`text-price-${service.id}`} className="text-lg font-semibold text-primary mb-4">
                      {service.price}
                    </div>
                    <ul className="space-y-2">
                      {service.features.map((feature, i) => (
                        <li key={i} data-testid={`text-feature-${service.id}-${i}`} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selectedService && currentStep === "select" && (
            <Card className="border-primary/20 bg-card">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 data-testid="text-payment-title" className="text-2xl font-heading font-bold text-foreground mb-2">
                    Prochaine étape : Réserver un créneau
                  </h3>
                  <p className="text-muted-foreground">
                    Vous avez sélectionné :{" "}
                    <span data-testid="text-selected-service" className="font-medium text-primary">
                      {services.find((s) => s.id === selectedService)?.title}
                    </span>
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-6 mb-8">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span data-testid="text-calendar-notice">
                      Choisissez un créneau disponible pour votre consultation avec Mr Saint.
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                  <Button
                    data-testid="button-choose-slot"
                    size="lg"
                    className="gap-2"
                    onClick={() => setCurrentStep("calendar")}
                  >
                    <Calendar className="w-5 h-5" />
                    Choisir un créneau
                  </Button>
                  <Link href="/contact">
                    <Button
                      data-testid="button-contact-first"
                      variant="outline"
                      size="lg"
                    >
                      Me contacter d'abord
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedService && currentStep === "calendar" && (
            <div className="space-y-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep("select")}
                className="gap-2"
                data-testid="button-back-to-services"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour aux services
              </Button>
              
              <CalendarBooking
                serviceType={selectedService}
                serviceName={services.find((s) => s.id === selectedService)?.title || ""}
                onSlotSelected={(date, time) => {
                  console.log("Slot selected:", date, time);
                }}
              />
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-testid="feature-secure-payment">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 data-testid="text-feature-secure-title" className="font-heading font-semibold text-foreground mb-2">
                Paiement sécurisé
              </h3>
              <p data-testid="text-feature-secure-desc" className="text-sm text-muted-foreground">
                Transactions cryptées et protégées
              </p>
            </div>
            <div data-testid="feature-confirmation">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 data-testid="text-feature-confirm-title" className="font-heading font-semibold text-foreground mb-2">
                Confirmation immédiate
              </h3>
              <p data-testid="text-feature-confirm-desc" className="text-sm text-muted-foreground">
                Recevez votre confirmation par email
              </p>
            </div>
            <div data-testid="feature-satisfaction">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 data-testid="text-feature-satisfaction-title" className="font-heading font-semibold text-foreground mb-2">
                Satisfaction garantie
              </h3>
              <p data-testid="text-feature-satisfaction-desc" className="text-sm text-muted-foreground">
                Service client disponible 7j/7
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
