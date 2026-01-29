import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, FileText, Plane } from "lucide-react";
import { Link } from "wouter";
import visaImage from "@assets/generated_images/Visa_facilitation_service_image_24df3a0c.png";

export default function FacilitationVisaPage() {
  const visaTypes = [
    { type: "Tourisme", description: "Pour vos vacances et découvertes" },
    { type: "Business", description: "Pour vos déplacements professionnels" },
    { type: "Études", description: "Pour vos projets académiques" },
    { type: "Travail", description: "Pour vos opportunités professionnelles" },
  ];

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

  const advantages = [
    "Taux de réussite de 95%",
    "Traitement rapide et efficace",
    "Accompagnement personnalisé",
    "Gestion complète des démarches",
    "Support 7j/7",
    "Garantie satisfaction",
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

      <section className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Types de visa
            </h2>
            <p className="text-lg text-white/70">
              Nous traitons tous les types de demandes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {visaTypes.map((visa, index) => (
              <Card
                key={index}
                data-testid={`card-visa-${visa.type.toLowerCase()}`}
                className="bg-white/5 border-white/10 hover-elevate active-elevate-2 transition-all"
              >
                <CardContent className="p-6 text-center">
                  <Plane className="w-10 h-10 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-heading font-semibold mb-2 text-white">
                    {visa.type}
                  </h3>
                  <p className="text-sm text-white/70">{visa.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">
              Notre processus
            </h2>
            <p className="text-lg text-muted-foreground">
              Un accompagnement en 4 étapes simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step) => (
              <div
                key={step.step}
                data-testid={`card-step-${step.step}`}
                className="relative"
              >
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-heading font-bold mx-auto mb-6">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-heading font-semibold mb-3 text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
              Nos avantages
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {advantages.map((advantage, index) => (
              <div
                key={index}
                data-testid={`item-advantage-${index}`}
                className="flex items-center gap-3"
              >
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                <span className="text-lg">{advantage}</span>
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
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-heading font-bold mb-4">
                  Tarification
                </h3>
                <p className="text-4xl font-heading font-bold text-primary mb-2">
                  À partir de 150€
                </p>
                <p className="text-muted-foreground mb-8">
                  Prix variable selon le type de visa et la destination
                </p>
                <Link href="/contact">
                  <Button
                    data-testid="button-start-request"
                    size="lg"
                    className="w-full rounded-full text-lg py-6"
                  >
                    Commencer ma demande
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
