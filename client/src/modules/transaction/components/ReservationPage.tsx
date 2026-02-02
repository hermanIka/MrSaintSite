import { useState, useEffect } from "react";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { FileText, Briefcase, Plane, CheckCircle, Calendar as CalendarIcon, CreditCard, Lock, ArrowLeft, PartyPopper, Clock } from "lucide-react";
import CalendarBooking from "./CalendarBooking";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import reservationHero from "@/assets/images/reservation-hero.png";

type ServiceType = "visa" | "agence" | "voyage" | null;
type Step = "select" | "calendar" | "payment" | "success";

interface SelectedSlotInfo {
  date: Date;
  time: string;
  schedulingUrl: string;
}

export default function ReservationPage() {
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(null);
  const searchString = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const paymentStatus = params.get("payment");
    const id = params.get("id");
    
    if (paymentStatus === "success" && id) {
      setPaymentId(id);
      const savedSlot = localStorage.getItem('mr-saint-selected-slot');
      if (savedSlot) {
        try {
          const parsed = JSON.parse(savedSlot);
          setSelectedSlot({
            date: new Date(parsed.date),
            time: parsed.time,
            schedulingUrl: parsed.schedulingUrl
          });
        } catch (e) {
          console.error('Failed to parse saved slot:', e);
        }
      }
      setCurrentStep("success");
    } else if (paymentStatus === "cancelled" || paymentStatus === "failed") {
      setCurrentStep("select");
    }
  }, [searchString]);

  const services = [
    {
      id: "visa" as const,
      icon: FileText,
      title: "Facilitation Visa",
      description: "Demande de visa pour votre destination",
      price: 75,
      priceLabel: "À partir de 75€",
      features: ["Analyse du dossier", "Constitution des documents", "Suivi de la demande"],
    },
    {
      id: "agence" as const,
      icon: Briefcase,
      title: "Création d'Agence",
      description: "Formation et accompagnement complet",
      price: 750,
      priceLabel: "750€",
      features: ["Formation 4 semaines", "Coaching 6 mois", "Accès au réseau"],
    },
    {
      id: "voyage" as const,
      icon: Plane,
      title: "Voyage Organisé",
      description: "Voyage business clé en main",
      price: 1200,
      priceLabel: "À partir de 1 200€",
      features: ["Vol + Hébergement", "Transferts inclus", "Guide francophone"],
    },
  ];

  const steps = [
    {
      number: 1,
      title: "Choisir un service",
      description: "Sélectionnez le service qui correspond à vos besoins",
      icon: CheckCircle,
      active: currentStep === "select",
    },
    {
      number: 2,
      title: "Paiement sécurisé",
      description: "Carte, Mobile Money ou PayPal",
      icon: CreditCard,
      active: currentStep === "payment",
    },
    {
      number: 3,
      title: "Réservation confirmée",
      description: "Choisissez votre créneau et recevez votre confirmation",
      icon: CalendarIcon,
      active: currentStep === "calendar" || currentStep === "success",
    },
  ];

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const handlePaymentSuccess = (id: string) => {
    setPaymentId(id);
    if (selectedSlot) {
      localStorage.setItem('mr-saint-selected-slot', JSON.stringify({
        date: selectedSlot.date.toISOString(),
        time: selectedSlot.time,
        schedulingUrl: selectedSlot.schedulingUrl
      }));
    }
    setCurrentStep("success");
  };

  const handleSlotSelected = (date: Date, time: string, schedulingUrl: string) => {
    const slotInfo = { date, time, schedulingUrl };
    setSelectedSlot(slotInfo);
    localStorage.setItem('mr-saint-selected-slot', JSON.stringify({
      date: date.toISOString(),
      time: time,
      schedulingUrl: schedulingUrl
    }));
    setCurrentStep("payment");
  };

  const handleContactFirst = () => {
    if (selectedService) {
      setCurrentStep("calendar");
    }
  };

  return (
    <Layout>
      <SEO 
        title="Réservation"
        description="Réservez votre consultation avec Mr Saint. Paiement sécurisé par carte, Mobile Money ou PayPal. Confirmation instantanée."
        keywords="réservation, consultation, paiement, rendez-vous, Mr Saint"
      />
      <section className="relative py-32 bg-black text-white overflow-hidden">
        <img 
          src={reservationHero} 
          alt="Entrepreneur au téléphone" 
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-transparent" />
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
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    step.active ? "bg-primary" : "bg-muted"
                  }`}>
                    <span className={`text-lg font-bold ${
                      step.active ? "text-primary-foreground" : "text-muted-foreground"
                    }`}>
                      {step.number}
                    </span>
                  </div>
                  <div>
                    <h3 data-testid={`text-step-title-${step.number}`} className={`text-lg font-heading font-semibold mb-1 ${
                      step.active ? "text-foreground" : "text-muted-foreground"
                    }`}>
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
          {currentStep === "success" && (
            <Card className="border-primary/20 bg-card mb-8">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <PartyPopper className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 data-testid="text-success-title" className="text-2xl font-heading font-bold text-foreground mb-4">
                  Paiement réussi !
                </h2>
                <p className="text-muted-foreground mb-6">
                  Votre paiement a été confirmé. Vous pouvez maintenant réserver votre créneau.
                </p>
                <Button onClick={() => setCurrentStep("calendar")} data-testid="button-book-slot">
                  <CalendarIcon className="w-5 h-5 mr-2" />
                  Réserver mon créneau
                </Button>
              </CardContent>
            </Card>
          )}

          {(currentStep === "select" || currentStep === "payment") && (
            <>
              <div className="text-center mb-12">
                <h2 data-testid="text-choose-service-title" className="text-3xl font-heading font-bold text-foreground mb-4">
                  {currentStep === "select" ? "Choisissez votre service" : "Finalisez votre paiement"}
                </h2>
                <p data-testid="text-choose-service-subtitle" className="text-muted-foreground">
                  {currentStep === "select" 
                    ? "Sélectionnez le service pour lequel vous souhaitez effectuer une réservation"
                    : `Service sélectionné : ${selectedServiceData?.title}`
                  }
                </p>
              </div>

              {currentStep === "select" && (
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
                            {service.priceLabel}
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
              )}

              {selectedService && currentStep === "select" && (
                <Card className="border-primary/20 bg-card">
                  <CardContent className="p-8">
                    <div className="text-center mb-8">
                      <h3 data-testid="text-payment-title" className="text-2xl font-heading font-bold text-foreground mb-2">
                        Prochaine étape : Paiement
                      </h3>
                      <p className="text-muted-foreground">
                        Vous avez sélectionné :{" "}
                        <span data-testid="text-selected-service" className="font-medium text-primary">
                          {selectedServiceData?.title}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                      <Button
                        data-testid="button-proceed-payment"
                        size="lg"
                        className="gap-2"
                        onClick={() => setCurrentStep("payment")}
                      >
                        <CreditCard className="w-5 h-5" />
                        Procéder au paiement
                      </Button>
                      <Button
                          data-testid="button-contact-first"
                          variant="outline"
                          size="lg"
                          onClick={handleContactFirst}
                        >
                          <CalendarIcon className="w-5 h-5 mr-2" />
                          Consulter d'abord
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedService && currentStep === "payment" && (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentStep("calendar")}
                    className="gap-2"
                    data-testid="button-back-to-calendar"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Retour au calendrier
                  </Button>
                  
                  {selectedSlot && (
                    <Card className="border-primary/20 bg-card mb-6">
                      <CardContent className="p-4">
                        <h3 className="font-heading font-semibold mb-3">Créneau sélectionné</h3>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            <span>{selectedSlot.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{selectedSlot.time}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="border-primary/20 bg-card">
                    <CardHeader>
                      <CardTitle className="text-xl font-heading">
                        Paiement pour : {selectedServiceData?.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <PaymentMethodSelector
                        serviceId={selectedService}
                        serviceName={selectedServiceData?.title || ""}
                        amount={selectedServiceData?.price || 0}
                        currency="EUR"
                        onSuccess={handlePaymentSuccess}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}

          {currentStep === "calendar" && selectedService && (
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
              
              <div className="text-center mb-6">
                <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
                  Réserver selon votre créneau
                </h2>
                <p className="text-muted-foreground">
                  Sélectionnez une date et un créneau disponible pour {selectedServiceData?.title}
                </p>
              </div>

              <CalendarBooking
                serviceType={selectedService}
                serviceName={selectedServiceData?.title || ""}
                onSlotSelected={handleSlotSelected}
              />
            </div>
          )}

          {currentStep === "success" && (
            <Card className="border-green-500/20 bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h2 data-testid="text-final-success-title" className="text-2xl font-heading font-bold text-foreground mb-4">
                  Réservation confirmée !
                </h2>
                <p className="text-muted-foreground mb-6">
                  Votre paiement a été effectué et votre créneau est réservé. Finalisez votre réservation sur Calendly dans la nouvelle fenêtre.
                </p>
                {selectedSlot && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6 inline-block text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="font-medium">
                        {selectedSlot.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-medium">{selectedSlot.time}</span>
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {selectedSlot && (
                    <Button 
                      onClick={() => window.open(selectedSlot.schedulingUrl, '_blank')}
                      className="gap-2"
                    >
                      <CalendarIcon className="w-5 h-5" />
                      Ouvrir Calendly
                    </Button>
                  )}
                  <Button 
                    variant="outline"
                    onClick={() => {
                      localStorage.removeItem('mr-saint-selected-slot');
                      setCurrentStep("select");
                      setSelectedService(null);
                      setSelectedSlot(null);
                      setPaymentId(null);
                    }}
                  >
                    Nouvelle réservation
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                Carte, Mobile Money ou PayPal
              </p>
            </div>
            <div data-testid="feature-confirmation">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-6 h-6 text-primary" />
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
