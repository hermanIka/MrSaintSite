import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Star, Zap, CreditCard, Smartphone, Shield, Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

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
  const [selectedPlan, setSelectedPlan] = useState<GoPlusPlan | null>(null);
  const [provider, setProvider] = useState<"maishapay" | "pawapay">("maishapay");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
    }) => {
      const res = await apiRequest("POST", "/api/go-plus/purchase", data);
      return res.json() as Promise<PurchaseResult>;
    },
    onSuccess: (data) => {
      if (!data.success) {
        toast({ title: "Erreur", description: data.message || "Erreur lors de l'achat", variant: "destructive" });
        return;
      }

      if (data.redirectUrl || data.checkoutUrl) {
        window.location.href = data.redirectUrl || data.checkoutUrl || "/go-plus";
      } else if (data.provider === "pawapay") {
        toast({
          title: "Demande envoyée",
          description: "Confirmez le paiement sur votre téléphone mobile.",
        });
        setIsModalOpen(false);
        setLocation(`/go-plus/success?transactionId=${data.transactionId}&pending=1`);
      }
    },
    onError: () => {
      toast({ title: "Erreur", description: "Une erreur est survenue lors de l'achat", variant: "destructive" });
    },
  });

  const handleBuy = (plan: GoPlusPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleSubmitPurchase = () => {
    if (!selectedPlan) return;
    if (!email || !email.includes("@")) {
      toast({ title: "Email requis", description: "Veuillez entrer un email valide", variant: "destructive" });
      return;
    }
    if (provider === "pawapay" && !phoneNumber) {
      toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro de téléphone Mobile Money", variant: "destructive" });
      return;
    }

    purchaseMutation.mutate({
      userId: email,
      planId: selectedPlan.id,
      provider,
      phoneNumber: provider === "pawapay" ? phoneNumber : undefined,
    });
  };

  const plans = plansData?.plans || [];

  return (
    <Layout>
      <SEO
        title="Carte GO+ | Mr Saint Travel"
        description="Obtenez votre carte virtuelle GO+ et profitez de réductions exclusives sur tous les services Mr Saint."
      />

      <section className="relative min-h-[40vh] flex items-center justify-center bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
        <div className="relative z-10 text-center px-4 py-20">
          <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 text-sm px-4 py-1">
            Programme fidélité
          </Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Carte <span className="text-primary">GO+</span>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mx-auto">
            Rejoins le club exclusif Mr Saint et profite de réductions sur tous tes achats.
          </p>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">

          <div className="text-center mb-14">
            <h2 className="text-3xl font-heading font-bold mb-3">Choisis ton plan</h2>
            <p className="text-muted-foreground">Valable 1 an sur tous les services Mr Saint</p>
          </div>

          {plansLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
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
                          <Star className="w-3 h-3 mr-1" /> Populaire
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
                        <span className="text-muted-foreground mb-1">/ an</span>
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
                        Acheter GO+ {plan.name}
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
          <h2 className="text-2xl font-heading font-bold text-center mb-6">Vérifier mon statut GO+</h2>
          <div className="flex gap-3">
            <Input
              data-testid="input-check-email"
              type="email"
              placeholder="Ton email d'achat..."
              value={checkEmail}
              onChange={(e) => setCheckEmail(e.target.value)}
            />
            <Button
              data-testid="button-check-card"
              variant="outline"
              onClick={() => refetchCard()}
              disabled={!checkEmail.includes("@")}
            >
              Vérifier
            </Button>
          </div>

          {checkEmail.includes("@") && !cardLoading && cardData && (
            <div className="mt-6">
              {cardData.status === "active" && cardData.card ? (
                <Card className="border-primary/40 bg-primary/5">
                  <CardContent className="pt-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="font-semibold text-foreground">Carte GO+ {cardData.card.planName} active</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      N° <span className="font-mono text-foreground">{cardData.card.cardNumber}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expire le : {new Date(cardData.card.endDate).toLocaleDateString("fr-FR")}
                    </p>
                    <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30">
                      -{cardData.card.discountPercentage}% sur tous les services
                    </Badge>
                  </CardContent>
                </Card>
              ) : cardData.status === "expired" ? (
                <Card>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-muted-foreground">Ta carte GO+ a expiré. Renouvelle-la ci-dessus.</span>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-5 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                    <span className="text-muted-foreground">Aucune carte GO+ active trouvée pour cet email.</span>
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
              Acheter GO+ {selectedPlan?.name} — {selectedPlan?.price}€
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <div>
              <Label htmlFor="email-purchase">Ton email</Label>
              <Input
                id="email-purchase"
                data-testid="input-purchase-email"
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label className="mb-2 block">Mode de paiement</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  data-testid="button-provider-maishapay"
                  onClick={() => setProvider("maishapay")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-md border transition-all ${
                    provider === "maishapay" ? "border-primary bg-primary/10" : "border-border hover-elevate"
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-primary" />
                  <span className="text-sm font-medium">Carte bancaire</span>
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
                  <span className="text-sm font-medium">Mobile Money</span>
                  <span className="text-xs text-muted-foreground">PawaPay</span>
                </button>
              </div>
            </div>

            {provider === "pawapay" && (
              <div>
                <Label htmlFor="phone-purchase">Numéro Mobile Money</Label>
                <Input
                  id="phone-purchase"
                  data-testid="input-purchase-phone"
                  type="tel"
                  placeholder="+33 6 00 00 00 00"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            )}

            <Button
              data-testid="button-confirm-purchase"
              className="w-full"
              onClick={handleSubmitPurchase}
              disabled={purchaseMutation.isPending}
            >
              {purchaseMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Traitement...</>
              ) : (
                `Payer ${selectedPlan?.price}€`
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Paiement sécurisé — aucune donnée bancaire stockée
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
