import { useState, useEffect, useRef } from "react";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Rocket, Star, ArrowLeft, Building2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import agencyImage from "@assets/generated_images/Agency_coaching_service_image_40575f0c.png";
import { AGENCY_PACKS } from "@shared/schema";
import { AgencyApplicationForm } from "./AgencyApplicationForm";
import { usePrices } from "@/hooks/usePrices";
import { useTranslation } from "react-i18next";

export default function CreationAgencePage() {
  const [location] = useLocation();
  const { prices } = usePrices();
  const { t } = useTranslation();
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | undefined>();
  const [pendingProvider, setPendingProvider] = useState<string | undefined>();
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const provider = params.get("provider");
    const id = params.get("id");
    if (payment === "success" && id) {
      const stored = sessionStorage.getItem("agency_form_data");
      if (stored) {
        try {
          const data = JSON.parse(stored) as { packName?: string };
          if (data.packName) setSelectedPack(data.packName);
        } catch {/* ignore */}
      }
      setPendingPaymentId(id);
      setPendingProvider(provider || undefined);
    }
  }, [location]);

  useEffect(() => {
    if (selectedPack && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [selectedPack]);

  const dynamicPacks = AGENCY_PACKS.map(pack => ({
    ...pack,
    price: prices[`agence_${pack.value}` as keyof typeof prices] ?? pack.price,
  }));

  const activePack = dynamicPacks.find(p => p.value === selectedPack);

  const results = [
    { metric: t("agency.resultsLabel0"), label: t("agency.resultsDesc0") },
    { metric: t("agency.resultsLabel1"), label: t("agency.resultsDesc1") },
    { metric: t("agency.resultsLabel2"), label: t("agency.resultsDesc2") },
  ];

  return (
    <Layout>
      <SEO
        title="Création d'Agence de Voyage"
        description="Formation complète pour créer votre agence de voyage. Coaching, parrainage et financement. +50 entrepreneurs accompagnés, 85% de taux de réussite."
        keywords="création agence voyage, formation tourisme, coaching, parrainage, entrepreneur voyage"
      />
      <section
        className="relative h-[50vh] flex items-center justify-center overflow-hidden"
        style={{ marginTop: "80px" }}
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${agencyImage})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 data-testid="text-page-title" className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
            {t("agency.pageTitle")}
          </h1>
          <p className="text-lg sm:text-xl text-white/90">{t("agency.pageSubtitle")}</p>
        </div>
      </section>
      <section className="py-8 bg-background border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-base text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">7 ans d'expérience, fondateur de Go Fly.</span> Formation, coaching et financement pour lancer votre agence. Choisissez votre forfait et démarrez.
          </p>
        </div>
      </section>
      <section className="py-20 bg-background" id="forfaits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Créez votre agence</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4">Choisis le type d'agence que tu veux lancer</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Trois niveaux d'accompagnement pour lancer votre agence de voyage selon votre ambition et votre budget.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {dynamicPacks.map((pack) => (
              <div key={pack.value} className={`relative flex flex-col rounded-xl border-2 transition-all ${
                pack.highlighted
                  ? "border-primary bg-gradient-to-b from-primary/5 to-background shadow-lg shadow-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}>
                {pack.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1 text-xs font-semibold flex items-center gap-1">
                      <Star className="w-3 h-3" /> {t("agency.packHighlighted")}
                    </Badge>
                  </div>
                )}

                <div className={`p-6 ${pack.highlighted ? "pt-8" : ""}`}>
                  <h3 className="text-xl font-heading font-bold text-foreground">{pack.label}</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {t("agency.packStartBudget")} {pack.startBudget}
                  </p>

                  <ul className="space-y-2.5 mb-6">
                    {pack.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{f}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">Ça rapporte entre {pack.revenue}</span>
                    </li>
                  </ul>
                </div>

                <div className="p-6 pt-0 mt-auto flex flex-col gap-2">
                  <Button
                    data-testid={`button-start-${pack.value}`}
                    className={`w-full ${!pack.highlighted ? "hover:bg-primary hover:text-primary-foreground hover:border-primary" : ""}`}
                    variant={pack.highlighted ? "default" : "outline"}
                    onClick={() => setSelectedPack(pack.value)}
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    {t("agency.choosePack")}
                  </Button>
                  <Link href={`/reservation?service=agence&pack=${pack.value}`}>
                    <Button
                      data-testid={`button-consult-${pack.value}`}
                      variant="ghost"
                      className="w-full"
                    >
                      Consulter d'abord
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {selectedPack && activePack && (
            <div ref={formRef} className="max-w-2xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-back-packs"
                  onClick={() => { setSelectedPack(null); setPendingPaymentId(undefined); setPendingProvider(undefined); }}
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h3 className="text-xl font-heading font-semibold text-foreground">
                  {t("agency.selectedPack")} : {activePack.label}
                </h3>
              </div>
              <Card className="border-primary/20">
                <CardHeader />
                <CardContent className="pt-0">
                  <AgencyApplicationForm
                    packName={activePack.value}
                    packLabel={activePack.label}
                    packPrice={activePack.price}
                    packRevenue={activePack.revenue}
                    packDescription={activePack.accompagnementDescription}
                    pendingPaymentId={pendingPaymentId}
                    pendingProvider={pendingProvider}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">Résultats obtenus</h2>
            <p className="text-lg text-white/70">Des chiffres qui parlent d'eux-mêmes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {results.map((result, index) => (
              <div key={index} data-testid={`card-result-${index}`} className="text-center">
                <div className="text-5xl font-heading font-bold text-primary mb-3">{result.metric}</div>
                <div className="text-lg text-white/80">{result.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
