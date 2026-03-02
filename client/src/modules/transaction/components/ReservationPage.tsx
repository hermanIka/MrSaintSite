import { useState, useEffect, useCallback, useRef } from "react";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useSearch, useLocation } from "wouter";
import { FileText, Briefcase, CheckCircle, Calendar as CalendarIcon, CreditCard, Lock, ArrowLeft, Clock, Loader2, XCircle, Smartphone, Banknote } from "lucide-react";
import CalendarBooking from "./CalendarBooking";
import CalendlyWidget from "./CalendlyWidget";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { useToast } from "@/hooks/use-toast";
import { usePrices } from "@/hooks/usePrices";
import reservationHero from "@/assets/images/reservation-hero.png";

type ServiceType = "visa" | "agence" | "credit" | null;
type Step = "select" | "calendar" | "payment" | "verifying" | "success";
type PaymentMode = "direct" | "consultation";

interface SelectedSlotInfo {
  date: Date;
  time: string;
  schedulingUrl: string;
}

export default function ReservationPage() {
  const [, setLocation] = useLocation();
  const { prices } = usePrices();
  const [selectedService, setSelectedService] = useState<ServiceType>(null);
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("direct");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"polling" | "success" | "failed" | "timeout">("polling");
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotInfo | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollCountRef = useRef(0);
  const { toast } = useToast();
  const searchString = useSearch();

  useEffect(() => {
    const params = new URLSearchParams(searchString);
    const paymentStatus = params.get("payment");
    const id = params.get("id");
    const serviceParam = params.get("service");

    if (!paymentStatus && serviceParam && ["visa", "agence"].includes(serviceParam)) {
      setSelectedService(serviceParam as ServiceType);
      setPaymentMode("consultation");
      setCurrentStep("calendar");
      return;
    }

    if (paymentStatus === "success" && id) {
      setPaymentId(id);
      fetch(`/api/payments/status/${encodeURIComponent(id)}`)
        .then(r => r.json())
        .then(data => {
          if (data.success && data.status === "success") {
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
          } else {
            toast({ title: "Paiement non confirmé", description: "Le paiement n'a pas été validé.", variant: "destructive" });
            setCurrentStep("select");
          }
        })
        .catch(() => {
          toast({ title: "Erreur", description: "Impossible de vérifier le paiement.", variant: "destructive" });
          setCurrentStep("select");
        });
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
      price: prices.visa,
      priceLabel: `${prices.visa}€`,
      features: ["Analyse du dossier", "Constitution des documents", "Suivi de la demande"],
      externalUrl: undefined as string | undefined,
    },
    {
      id: "agence" as const,
      icon: Briefcase,
      title: "Création d'Agence",
      description: "Formation et accompagnement complet",
      price: prices.agence_classique,
      priceLabel: `À partir de ${prices.agence_classique}€`,
      features: ["Formation intensive", "Coaching personnalisé", "Accès au réseau partenaires"],
      externalUrl: undefined as string | undefined,
    },
    {
      id: "credit" as const,
      icon: Banknote,
      title: "Voyage à Crédit",
      description: "Financement de voyage sur mesure",
      price: 0,
      priceLabel: "Sur demande",
      features: ["Financement personnalisé", "Durée flexible", "Réservé GO+ Gold"],
      externalUrl: "/voyage-credit",
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
      description: "Carte bancaire, PayPal ou Mobile Money",
      icon: CreditCard,
      active: currentStep === "payment",
    },
    {
      number: 3,
      title: "Réservation confirmée",
      description: "Choisissez votre créneau et recevez votre confirmation",
      icon: CalendarIcon,
      active: currentStep === "calendar" || currentStep === "verifying" || currentStep === "success",
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

  const CONSULTATION_PRICE = prices.consultation;

  const handleContactFirst = () => {
    if (selectedService) {
      setPaymentMode("consultation");
      setCurrentStep("calendar");
    }
  };

  const handleDirectPayment = () => {
    setPaymentMode("direct");
    setCurrentStep("payment");
  };

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollCountRef.current = 0;
  }, []);

  const handlePendingVerification = useCallback((pId: string, provider: string, externalId?: string) => {
    setPaymentId(pId);
    setPendingProvider(provider);
    setVerificationStatus("polling");
    setCurrentStep("verifying");
    pollCountRef.current = 0;

    const MAX_POLLS = 40;
    const POLL_INTERVAL = 5000;

    pollingRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      if (pollCountRef.current > MAX_POLLS) {
        stopPolling();
        setVerificationStatus("timeout");
        return;
      }

      try {
        const res = await fetch(`/api/payments/verify/${encodeURIComponent(pId)}?provider=${provider}`);
        const data = await res.json();

        if (data.status === "success") {
          stopPolling();
          setVerificationStatus("success");
          setTimeout(() => {
            if (selectedSlot) {
              localStorage.setItem('mr-saint-selected-slot', JSON.stringify({
                date: selectedSlot.date.toISOString(),
                time: selectedSlot.time,
                schedulingUrl: selectedSlot.schedulingUrl
              }));
            }
            setCurrentStep("success");
          }, 2000);
        } else if (data.status === "failed") {
          stopPolling();
          setVerificationStatus("failed");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, POLL_INTERVAL);
  }, [stopPolling, selectedSlot]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const paymentAmount = paymentMode === "consultation" ? CONSULTATION_PRICE : (selectedServiceData?.price || 0);
  const paymentLabel = paymentMode === "consultation" 
    ? "Consultation (rendez-vous)" 
    : (selectedServiceData?.title || "");

  return (
    <Layout>
      <SEO 
        title="Réservation"
        description="Réservez votre consultation avec Mr Saint. Paiement sécurisé par carte bancaire, PayPal ou Mobile Money. Confirmation instantanée."
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
          >Réservez votre consultation</h1>
          <p
            data-testid="text-reservation-subtitle"
            className="text-xl text-white/80 max-w-2xl mx-auto"
          >Un expert voyagiste je t'aide de débloquer ton voyage , ton visa... et si tu souhaites lancer ton agence de voyage rentable je t'aide à le réaliser 

          Prends rendez-vous et on démarre</p>
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
                        onClick={() => service.externalUrl ? setLocation(service.externalUrl) : setSelectedService(service.id as ServiceType)}
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
                      <p className="text-muted-foreground">
                        Vous avez sélectionné :{" "}
                        <span data-testid="text-selected-service" className="font-medium text-primary">
                          {selectedServiceData?.title}
                        </span>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                      <Button
                          data-testid="button-contact-first"
                          size="lg"
                          className="bg-primary text-primary-foreground"
                          onClick={handleContactFirst}
                        >
                          <CalendarIcon className="w-5 h-5 mr-2" />
                          Consultez Maintenant ({prices.consultation}€)
                        </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedService && currentStep === "payment" && (
                <div className="space-y-6">
                  <Button
                    variant="ghost"
                    onClick={() => paymentMode === "consultation" ? setCurrentStep("calendar") : setCurrentStep("select")}
                    className="gap-2"
                    data-testid="button-back-to-calendar"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {paymentMode === "consultation" ? "Retour au calendrier" : "Retour aux services"}
                  </Button>
                  
                  {selectedSlot && paymentMode === "consultation" && (
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
                        {paymentMode === "consultation" 
                          ? `Consultation pour : ${selectedServiceData?.title} (${prices.consultation}€)`
                          : `Paiement pour : ${selectedServiceData?.title}`
                        }
                      </CardTitle>
                      {paymentMode === "consultation" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Le prix de la consultation est de {prices.consultation}€, quel que soit le service choisi.
                        </p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <PaymentMethodSelector
                        serviceId={selectedService}
                        serviceName={paymentLabel}
                        amount={paymentAmount}
                        currency="EUR"
                        paymentMode={paymentMode}
                        onSuccess={handlePaymentSuccess}
                        onPendingVerification={handlePendingVerification}
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

          {currentStep === "verifying" && (
            <div className="space-y-6">
              <Card className="border-primary/20 bg-card">
                <CardContent className="p-8 text-center">
                  {verificationStatus === "polling" && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Smartphone className="w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <h2 data-testid="text-verifying-title" className="text-2xl font-heading font-bold text-foreground mb-4">
                        En attente de confirmation
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Veuillez confirmer le paiement sur votre téléphone en entrant votre code PIN Mobile Money.
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Vérification du paiement en cours...</span>
                      </div>
                    </>
                  )}

                  {verificationStatus === "success" && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      <h2 data-testid="text-verified-title" className="text-2xl font-heading font-bold text-foreground mb-4">
                        Paiement confirmé !
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Votre paiement a bien été reçu. Redirection en cours...
                      </p>
                    </>
                  )}

                  {verificationStatus === "failed" && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-destructive" />
                      </div>
                      <h2 data-testid="text-payment-failed-title" className="text-2xl font-heading font-bold text-foreground mb-4">
                        Paiement échoué
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Le paiement n'a pas pu être confirmé. Veuillez réessayer.
                      </p>
                      <Button
                        data-testid="button-retry-payment"
                        onClick={() => setCurrentStep("payment")}
                      >
                        Réessayer le paiement
                      </Button>
                    </>
                  )}

                  {verificationStatus === "timeout" && (
                    <>
                      <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <h2 data-testid="text-payment-timeout-title" className="text-2xl font-heading font-bold text-foreground mb-4">
                        Délai d'attente dépassé
                      </h2>
                      <p className="text-muted-foreground mb-6">
                        Nous n'avons pas reçu la confirmation de votre paiement. Si vous avez validé sur votre téléphone, veuillez patienter ou contactez-nous.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
                        <Button
                          data-testid="button-retry-payment-timeout"
                          onClick={() => setCurrentStep("payment")}
                        >
                          Réessayer le paiement
                        </Button>
                        <Button
                          data-testid="button-contact-support"
                          variant="outline"
                          asChild
                        >
                          <a href="/contact">Contacter le support</a>
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === "success" && (
            <div className="space-y-6">
              <Card className="border-green-500/20 bg-card">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 data-testid="text-final-success-title" className="text-2xl font-heading font-bold text-foreground mb-4">
                    Paiement confirmé !
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Votre paiement a été effectué avec succès. Finalisez votre réservation en remplissant le formulaire ci-dessous.
                  </p>
                  {selectedSlot && (
                    <div className="bg-muted/50 rounded-lg p-4 mb-4 inline-block text-left">
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
                </CardContent>
              </Card>

              {selectedSlot && (
                <CalendlyWidget
                  schedulingUrl={selectedSlot.schedulingUrl}
                  selectedDate={selectedSlot.date}
                  selectedTime={selectedSlot.time}
                />
              )}

              <div className="flex justify-center">
                <Button 
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('mr-saint-selected-slot');
                    setCurrentStep("select");
                    setSelectedService(null);
                    setSelectedSlot(null);
                    setPaymentId(null);
                    setPaymentMode("direct");
                  }}
                  data-testid="button-new-reservation"
                >
                  Nouvelle réservation
                </Button>
              </div>
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
                Carte bancaire, PayPal ou Mobile Money
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
