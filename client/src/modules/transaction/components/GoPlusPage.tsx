import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/modules/foundation";
import goPlusCardImage from "@assets/go-plus-card.png";
import { SEO } from "@/components/SEO";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Star, Zap, CreditCard, Smartphone, Shield, Loader2, AlertCircle, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { PAWAPAY_COUNTRIES, type PawaPayCountry } from "@shared/pawapay-countries";
import { useGoPlusCard } from "@/hooks/useGoPlusCard";

interface GoPlusPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  discountPercentage: number;
  privileges: string[];
  durationDays: number;
  isActive: boolean;
}

interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  provider?: string;
  redirectUrl?: string;
  checkoutUrl?: string;
  status?: string;
  message?: string;
}

export default function GoPlusPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isGold, saveCard } = useGoPlusCard();
  const [selectedPlan, setSelectedPlan] = useState<GoPlusPlan | null>(null);
  const [provider, setProvider] = useState<"maishapay" | "pawapay">("maishapay");
  const [email, setEmail] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<PawaPayCountry | null>(null);
  const [selectedCorrespondent, setSelectedCorrespondent] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [checkEmail, setCheckEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: plansData, isLoading: plansLoading } = useQuery<{ plans: GoPlusPlan[] }>({
    queryKey: ["/api/go-plus/plans"],
  });

  const { data: cardData, isLoading: cardLoading, refetch: refetchCard } = useQuery<{
    status: string;
    card?: { cardNumber: string; endDate: string; planName?: string; discountPercentage?: number };
    plan?: GoPlusPlan;
  }>({
    queryKey: ["/api/go-plus/card", checkEmail],
    enabled: checkEmail.includes("@"),
  });

  const purchaseMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      planId: string;
      provider: "maishapay" | "pawapay";
      phoneNumber?: string;
      correspondent?: string;
      countryCode?: string;
    }) => {
      const res = await apiRequest("POST", "/api/go-plus/purchase", data);
      return res.json() as Promise<PurchaseResult>;
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({ title: t("goplus.toastError"), description: data.message || t("goplus.toastErrorDesc"), variant: "destructive" });
        return;
      }

      if (data.redirectUrl || data.checkoutUrl) {
        window.location.href = data.redirectUrl || data.checkoutUrl || "/go-plus";
      } else if (data.provider === "pawapay") {
        toast({
          title: t("goplus.toastPurchaseSent"),
          description: t("goplus.toastPurchaseSentDesc"),
        });
        setIsModalOpen(false);
        setLocation(`/go-plus/success?transactionId=${data.transactionId}&pending=1`);
      }
    },
    onError: () => {
      toast({ title: t("goplus.toastError"), description: t("goplus.toastErrorDesc"), variant: "destructive" });
    },
  });

  const handleBuy = (plan: GoPlusPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCountryChange = (countryCode: string) => {
    const country = PAWAPAY_COUNTRIES.find(c => c.code === countryCode) || null;
    setSelectedCountry(country);
    setSelectedCorrespondent(country?.operators.length === 1 ? country.operators[0].code : "");
    setLocalPhone("");
  };

  const handleSubmitPurchase = () => {
    if (!selectedPlan) return;
    if (!email || !email.includes("@")) {
      toast({ title: t("goplus.toastEmailRequired"), description: t("goplus.toastEmailRequiredDesc"), variant: "destructive" });
      return;
    }
    if (provider === "pawapay") {
      if (!selectedCountry) {
        toast({ title: t("goplus.toastCountryRequired"), description: t("goplus.toastCountryRequiredDesc"), variant: "destructive" });
        return;
      }
      if (selectedCountry.operators.length > 1 && !selectedCorrespondent) {
        toast({ title: t("goplus.toastOperatorRequired"), description: t("goplus.toastOperatorRequiredDesc"), variant: "destructive" });
        return;
      }
      if (!localPhone || localPhone.trim().length < 6) {
        toast({ title: t("goplus.toastPhoneRequired"), description: t("goplus.toastPhoneRequiredDesc"), variant: "destructive" });
        return;
      }
    }

    const fullPhone = provider === "pawapay" && selectedCountry
      ? selectedCountry.phonePrefix + localPhone.replace(/^0+/, "").replace(/\s/g, "")
      : undefined;

    const correspondent = provider === "pawapay"
      ? (selectedCorrespondent || selectedCountry?.operators[0]?.code)
      : undefined;

    purchaseMutation.mutate({
      userId: email,
      planId: selectedPlan.id,
      provider,
      phoneNumber: fullPhone,
      correspondent,
      countryCode: provider === "pawapay" ? selectedCountry?.code : undefined,
    });
  };

  // Persister la carte Gold dans localStorage après vérification réussie
  useEffect(() => {
    if (cardData?.status === "active" && cardData.card && checkEmail.includes("@")) {
      saveCard(checkEmail, cardData.card);
    }
  }, [cardData, checkEmail]);

  const plans = plansData?.plans || [];

  return (
    <Layout>
      <SEO
        title="Carte GO+ | Mr Saint Travel"
        description="Obtenez votre carte virtuelle GO+ et profitez de réductions exclusives sur tous les services Mr Saint."
      />

      <section className="relative bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-[#1a1200]" />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #F2C94C 0%, transparent 60%)" }}
        />
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 text-center md:text-left order-2 md:order-1">
              <Badge className="mb-5 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
                {t("goplus.loyaltyBadge")}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-5 leading-tight">
                {t("goplus.heroTitle")}
              </h1>
              <div className="text-lg text-white/70 max-w-md space-y-4">
                <p>
                  {t("goplus.heroDesc1")}{" "}
                  <span className="text-primary font-semibold">-15%</span> {t("goplus.heroDesc2")}
                </p>
                <p>{t("goplus.heroDesc3")}</p>
                <p className="font-medium text-white/90">{t("goplus.heroDesc4")}</p>
              </div>
            </div>

            <div className="flex-1 flex justify-center md:justify-end order-1 md:order-2">
              <div
                className="relative w-full max-w-sm"
                style={{
                  filter: "drop-shadow(0 20px 60px rgba(242, 201, 76, 0.35))",
                  transform: "perspective(900px) rotateY(-8deg) rotateX(4deg)",
                  transition: "transform 0.4s ease",
                }}
              >
                <img
                  src={goPlusCardImage}
                  alt="Carte virtuelle GO+ Mr Saint"
                  data-testid="img-goplus-card"
                  className="w-full rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold mb-3">{t("goplus.plansTitle")}</h2>
            <p className="text-muted-foreground">{t("goplus.plansSubtitle")}</p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => {
                const isPremium = plan.name.toLowerCase() === "premium";
                return (
                  <Card
                    key={plan.id}
                    data-testid={`card-goplus-${plan.id}`}
                    className={`relative overflow-hidden ${isPremium ? "border-primary/50" : "border-border"}`}
                  >
                    {isPremium && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-primary text-primary-foreground">
                          <Star className="w-3 h-3 mr-1" /> {t("goplus.popular")}
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isPremium ? "bg-primary/20" : "bg-muted"}`}>
                          {isPremium ? <Zap className="w-5 h-5 text-primary" /> : <Shield className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <CardTitle className="text-xl font-heading">GO+ {plan.name}</CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-foreground">{plan.price}€</span>
                        <span className="text-muted-foreground mb-1">{t("goplus.perYear")}</span>
                        <Badge
                          data-testid={`badge-discount-${plan.id}`}
                          className="ml-auto bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30"
                        >
                          -{plan.discountPercentage}%
                        </Badge>
                      </div>

                      <ul className="space-y-2.5">
                        {plan.privileges.map((priv, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{priv}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        data-testid={`button-buy-${plan.id}`}
                        className="w-full"
                        size="default"
                        onClick={() => handleBuy(plan)}
                      >
                        {t("goplus.choosePlan")} GO+ {plan.name}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl font-heading font-bold text-center mb-6">{t("goplus.checkCardTitle")}</h2>
          <div className="flex gap-3">
            <Input
              data-testid="input-check-email"
              type="email"
              placeholder={t("goplus.checkCardPlaceholder")}
              value={checkEmail}
              onChange={(e) => setCheckEmail(e.target.value)}
            />
            <Button
              data-testid="button-check-card"
              variant="outline"
              onClick={() => refetchCard()}
              disabled={!checkEmail.includes("@")}
            >
              {t("goplus.checkCardBtn")}
            </Button>
          </div>

          {checkEmail.includes("@") && !cardLoading && cardData && (
            <div className="mt-6">
              {cardData.status === "active" && cardData.card ? (
                <Card className="border-primary/40 bg-primary/5">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-foreground">{t("goplus.cardActive")} {cardData.card.planName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      N° <span className="font-mono text-foreground">{cardData.card.cardNumber}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("goplus.expiry")} : {new Date(cardData.card.endDate).toLocaleDateString("fr-FR")}
                    </p>
                    <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30">
                      -{cardData.card.discountPercentage}% {t("goplus.discountAll")}
                    </Badge>
                  </CardContent>
                </Card>
              ) : cardData.status === "expired" ? (
                <Card>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-muted-foreground">{t("goplus.cardExpired")}</span>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">{t("goplus.cardNotFound")}</span>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {t("goplus.buyTitle")} {selectedPlan?.name} ({selectedPlan?.price}€)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div>
              <Label htmlFor="email-purchase">{t("goplus.emailLabel")}</Label>
              <Input
                id="email-purchase"
                data-testid="input-purchase-email"
                type="email"
                placeholder={t("goplus.emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="mb-2 block">{t("goplus.paymentMode")}</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  data-testid="button-provider-maishapay"
                  onClick={() => setProvider("maishapay")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-md border transition-all ${
                    provider === "maishapay" ? "border-primary bg-primary/10" : "border-border hover-elevate"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">{t("goplus.creditCard")}</span>
                  <span className="text-xs text-muted-foreground">MaishaPay</span>
                </button>
                <button
                  data-testid="button-provider-pawapay"
                  onClick={() => setProvider("pawapay")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-md border transition-all ${
                    provider === "pawapay" ? "border-primary bg-primary/10" : "border-border hover-elevate"
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">{t("goplus.mobileMoney")}</span>
                  <span className="text-xs text-muted-foreground">PawaPay</span>
                </button>
              </div>
            </div>

            {provider === "pawapay" && (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="country-purchase">{t("goplus.country")}</Label>
                  <Select onValueChange={handleCountryChange} value={selectedCountry?.code || ""}>
                    <SelectTrigger id="country-purchase" data-testid="select-country" className="mt-1.5">
                      <SelectValue placeholder={t("goplus.countryPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PAWAPAY_COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name} (+{country.phonePrefix})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCountry && selectedCountry.operators.length > 1 && (
                  <div>
                    <Label htmlFor="operator-purchase">{t("goplus.operator")}</Label>
                    <Select onValueChange={setSelectedCorrespondent} value={selectedCorrespondent}>
                      <SelectTrigger id="operator-purchase" data-testid="select-operator" className="mt-1.5">
                        <SelectValue placeholder={t("goplus.operatorPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCountry.operators.map(op => (
                          <SelectItem key={op.code} value={op.code}>
                            {op.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedCountry && (
                  <div>
                    <Label htmlFor="phone-purchase">{t("goplus.phone")}</Label>
                    <div className="flex gap-2 mt-1.5">
                      <div className="flex items-center px-3 rounded-md border bg-muted text-muted-foreground text-sm font-mono min-w-fit">
                        +{selectedCountry.phonePrefix}
                      </div>
                      <Input
                        id="phone-purchase"
                        data-testid="input-purchase-phone"
                        type="tel"
                        placeholder="6 00 00 00 00"
                        value={localPhone}
                        onChange={(e) => setLocalPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button
              data-testid="button-confirm-purchase"
              className="w-full"
              onClick={handleSubmitPurchase}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t("goplus.processing")}</>
              ) : (
                `${t("goplus.pay")} ${selectedPlan?.price}€`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              {t("goplus.securePayment")}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
