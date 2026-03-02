import { useState } from "react";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, FileText, ChevronRight } from "lucide-react";
import { Link, useLocation } from "wouter";
import visaImage from "@assets/generated_images/Visa_facilitation_service_image_24df3a0c.png";
import { VisaApplicationForm } from "./VisaApplicationForm";
import { usePrices } from "@/hooks/usePrices";

export default function FacilitationVisaPage() {
  const [location] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const { prices } = usePrices();

  const urlParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const paymentStatus = urlParams.get("payment");
  const paymentId = urlParams.get("id") || undefined;
  const paymentProvider = urlParams.get("provider") || undefined;

  const isPendingReturn = paymentStatus === "success" && paymentProvider === "maishapay";

  const processSteps = [
    {
      step: "1",
      title: "Consultation",
      description: "Nous analysons votre projet et déterminons le type de visa adapté",
    },
    {
      step: "2",
      title: "Constitution du dossier",
      description: "Nous préparons tous les documents nécessaires avec vous",
    },
    {
      step: "3",
      title: "Dépôt et suivi",
      description: "Nous déposons votre demande et assurons le suivi complet",
    },
    {
      step: "4",
      title: "Obtention",
      description: "Vous recevez votre visa et êtes prêt à voyager",
    },
  ];

  return (
    <Layout>
      <SEO
        title="Facilitation Visa"
        description="Service de facilitation visa pour Dubaï, Canada, États-Unis, Europe. Taux de réussite 95%. Accompagnement complet de votre dossier."
        keywords="visa, facilitation visa, Dubaï, Canada, États-Unis, Europe, Chine, démarches visa"
      />
      <section
        className="relative h-[50vh] flex items-center justify-center overflow-hidden"
        style={{ marginTop: "80px" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${visaImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1
            data-testid="text-page-title"
            className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4"
          >
            Facilitation Visa
          </h1>
          <p className="text-lg sm:text-xl text-white/90">
            Obtenez votre visa rapidement et sans stress
          </p>
        </div>
      </section>
      <section className="py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose max-w-none">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-6">
              Un service complet pour tous vos besoins en visa
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Avec 7 ans d'expérience dans le secteur du tourisme, je vous
              accompagne dans toutes vos démarches d'obtention de visa. Que ce
              soit pour le tourisme, le business ou les études, je gère
              l'intégralité du processus pour vous garantir une expérience
              sereine et efficace.
            </p>
          </div>
        </div>
      </section>
      <section className="py-6 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row flex-wrap justify-center items-center gap-x-2 gap-y-2">
            {processSteps.map((step, i) => (
              <div key={step.step} className="flex items-center gap-x-2">
                <div
                  data-testid={`card-step-${step.step}`}
                  className="flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {step.step}
                  </span>
                  <span className="text-sm font-medium text-foreground">{step.title}</span>
                </div>
                {i < processSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Section principale : choix ou formulaire */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Si retour MaishaPay ou formulaire ouvert → afficher le formulaire */}
          {(isPendingReturn || showForm) ? (
            <Card className="border-primary/20">
              <CardContent className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold text-foreground">
                      Demande de visa · {prices.visa}€
                    </h3>
                    <p className="text-sm text-muted-foreground">Remplissez le formulaire ci-dessous</p>
                  </div>
                </div>
                <VisaApplicationForm
                  pendingPaymentId={isPendingReturn ? paymentId : undefined}
                  pendingProvider={isPendingReturn ? paymentProvider : undefined}
                />
                {!isPendingReturn && (
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="mt-6 text-sm text-muted-foreground underline underline-offset-4"
                  >
                    Retour au choix
                  </button>
                )}
              </CardContent>
            </Card>
          ) : (
            /* Carte de choix — deux options */
            (<Card className="border-primary/20">
              <CardContent className="p-8 sm:p-12">
                <div className="text-center mb-10">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold text-foreground mb-2">
                    Commencez votre démarche visa
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Vous hésitez ? Consultez d'abord un expert pour évaluer votre dossier,
                    ou déposez directement votre demande.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Option 1 : Consulter d'abord */}
                  <div className="flex flex-col p-6 rounded-xl border border-border bg-muted/20 hover-elevate">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-heading font-semibold text-foreground mb-2">
                      Consulter D'abord
                    </h4>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">
                      Un expert analyse votre dossier et vous guide sur la marche à suivre. Consultation à <strong>{prices.consultation}€</strong>.
                    </p>
                    <Link href="/reservation?service=visa">
                      <Button
                        data-testid="button-consult-first"
                        variant="outline"
                        className="w-full"
                      >
                        Prendre rendez-vous · {prices.consultation}€
                      </Button>
                    </Link>
                  </div>

                  {/* Option 2 : Commencer la demande */}
                  <div className="flex flex-col p-6 rounded-xl border border-primary/30 bg-primary/5">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-heading font-semibold text-foreground mb-2">Commencer la facilitation de votre voyage
</h4>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">
                      Je t'aide à réaliser ton projet de voyage avec succès
                    </p>
                    <Button
                      data-testid="button-start-request"
                      className="w-full"
                      onClick={() => setShowForm(true)}
                    >
                      Facilitation visa · {prices.visa}€
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-8">
                  Paiement sécurisé · carte bancaire ou Mobile Money
                </p>
              </CardContent>
            </Card>)
          )}
        </div>
      </section>
    </Layout>
  );
}
