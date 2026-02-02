import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, Smartphone, Loader2, Globe, Radio } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PAWAPAY_COUNTRIES, type PawaPayCountry, type MobileOperator } from "@shared/pawapay-countries";

type PaymentProvider = "pawapay" | "lemonsqueezy" | "paypal";

interface PaymentMethodSelectorProps {
  serviceId: string;
  serviceName: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (message: string) => void;
}

interface PaymentInitResponse {
  success: boolean;
  paymentId: string;
  provider: PaymentProvider;
  status: string;
  redirectUrl?: string;
  checkoutUrl?: string;
  message?: string;
}

const paymentMethods = [
  {
    id: "lemonsqueezy" as PaymentProvider,
    label: "Carte bancaire",
    description: "Visa, Mastercard, etc.",
    icon: CreditCard,
  },
  {
    id: "pawapay" as PaymentProvider,
    label: "Mobile Money",
    description: "Orange Money, MTN, Airtel, etc.",
    icon: Smartphone,
  },
  {
    id: "paypal" as PaymentProvider,
    label: "PayPal",
    description: "Payer avec votre compte PayPal",
    icon: SiPaypal,
  },
];

export function PaymentMethodSelector({
  serviceId,
  serviceName,
  amount,
  currency = "EUR",
  onSuccess,
  onError,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentProvider | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("CMR");
  const [selectedOperator, setSelectedOperator] = useState<string>("MTN_MOMO_CMR");
  const { toast } = useToast();

  const currentCountry = useMemo(() => {
    return PAWAPAY_COUNTRIES.find(c => c.code === selectedCountry) || PAWAPAY_COUNTRIES[0];
  }, [selectedCountry]);

  const availableOperators = useMemo(() => {
    return currentCountry?.operators || [];
  }, [currentCountry]);

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    const country = PAWAPAY_COUNTRIES.find(c => c.code === countryCode);
    if (country && country.operators.length > 0) {
      setSelectedOperator(country.operators[0].code);
    } else {
      setSelectedOperator("");
    }
    setCustomerPhone("");
  };

  const getAmountAndCurrency = (provider: PaymentProvider) => {
    if (provider === "pawapay" && currentCountry) {
      return {
        amount: Math.round(amount * currentCountry.eurRate),
        currency: currentCountry.currency
      };
    }
    return { amount, currency };
  };

  const getDisplayAmount = () => {
    if (selectedMethod === "pawapay" && currentCountry) {
      const localAmount = Math.round(amount * currentCountry.eurRate);
      return `${localAmount.toLocaleString()} ${currentCountry.currency}`;
    }
    return `${amount} ${currency}`;
  };

  const initPaymentMutation = useMutation({
    mutationFn: async (provider: PaymentProvider) => {
      const { amount: paymentAmount, currency: paymentCurrency } = getAmountAndCurrency(provider);
      const response = await apiRequest("POST", "/api/payments/init", {
        provider,
        amount: paymentAmount,
        currency: paymentCurrency,
        serviceId,
        serviceName,
        customerEmail,
        customerName,
        customerPhone,
        correspondent: provider === "pawapay" ? selectedOperator : undefined,
        countryCode: provider === "pawapay" ? selectedCountry : undefined,
      });
      return response.json() as Promise<PaymentInitResponse>;
    },
    onSuccess: (data) => {
      if (data.success) {
        if (data.redirectUrl || data.checkoutUrl) {
          window.location.href = data.redirectUrl || data.checkoutUrl || "";
        } else {
          toast({
            title: "Paiement initié",
            description: data.message || "Veuillez confirmer le paiement sur votre appareil.",
          });
          onSuccess?.(data.paymentId);
        }
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Impossible d'initialiser le paiement.",
          variant: "destructive",
        });
        onError?.(data.message || "Erreur de paiement");
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
      onError?.(error.message);
    },
  });

  const handlePayment = () => {
    if (!selectedMethod) {
      toast({
        title: "Mode de paiement requis",
        description: "Veuillez sélectionner un mode de paiement.",
        variant: "destructive",
      });
      return;
    }

    if (!customerEmail) {
      toast({
        title: "Email requis",
        description: "Veuillez entrer votre adresse email.",
        variant: "destructive",
      });
      return;
    }

    if (selectedMethod === "pawapay") {
      if (!selectedOperator) {
        toast({
          title: "Opérateur requis",
          description: "Veuillez sélectionner votre opérateur Mobile Money.",
          variant: "destructive",
        });
        return;
      }

      if (!customerPhone) {
        toast({
          title: "Téléphone requis",
          description: "Veuillez entrer votre numéro de téléphone pour Mobile Money.",
          variant: "destructive",
        });
        return;
      }

      const cleanPhone = customerPhone.replace(/\D/g, "");
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        toast({
          title: "Numéro invalide",
          description: `Le numéro doit avoir entre 8 et 15 chiffres (ex: ${currentCountry?.phonePrefix}XXXXXXXX).`,
          variant: "destructive",
        });
        return;
      }
    }

    initPaymentMutation.mutate(selectedMethod);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 data-testid="text-payment-method-title" className="text-lg font-heading font-semibold mb-4">
          Choisissez votre mode de paiement
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = selectedMethod === method.id;
            
            return (
              <Card
                key={method.id}
                data-testid={`card-payment-${method.id}`}
                className={`cursor-pointer transition-all duration-200 overflow-visible hover-elevate ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border"
                }`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <CardContent className="p-4 flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div data-testid={`text-payment-label-${method.id}`} className="font-medium">
                    {method.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {method.description}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Nom complet</Label>
            <Input
              id="customerName"
              data-testid="input-customer-name"
              placeholder="Votre nom"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              data-testid="input-customer-email"
              placeholder="votre@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
            />
          </div>
        </div>
        
        {selectedMethod === "pawapay" && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
              <Globe className="w-4 h-4" />
              <span>Configuration Mobile Money</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Pays *</Label>
                <Select value={selectedCountry} onValueChange={handleCountryChange}>
                  <SelectTrigger data-testid="select-country">
                    <SelectValue placeholder="Sélectionnez votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAWAPAY_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        <span className="flex items-center gap-2">
                          <span>{country.flag}</span>
                          <span>{country.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operator">Opérateur Mobile Money *</Label>
                <Select 
                  value={selectedOperator} 
                  onValueChange={setSelectedOperator}
                  disabled={availableOperators.length === 0}
                >
                  <SelectTrigger data-testid="select-operator">
                    <SelectValue placeholder="Sélectionnez l'opérateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableOperators.map((op) => (
                      <SelectItem key={op.code} value={op.code}>
                        <span className="flex items-center gap-2">
                          <Radio className="w-3 h-3" />
                          <span>{op.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Numéro de téléphone *</Label>
              <div className="flex gap-2">
                <div className="flex items-center px-3 bg-muted rounded-md border text-sm font-medium min-w-[70px] justify-center">
                  +{currentCountry?.phonePrefix}
                </div>
                <Input
                  id="customerPhone"
                  type="tel"
                  data-testid="input-customer-phone"
                  placeholder="XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ""))}
                  className="flex-1"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Entrez votre numéro sans le code pays (ex: 690123456)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Total à payer :</span>
          <span data-testid="text-payment-total" className="text-2xl font-bold text-primary">
            {getDisplayAmount()}
          </span>
        </div>
        {selectedMethod === "pawapay" && currentCountry && (
          <p className="text-xs text-muted-foreground text-center mb-2">
            Équivalent de {amount} EUR (taux: 1 EUR = {currentCountry.eurRate} {currentCountry.currency})
          </p>
        )}
        
        <Button
          data-testid="button-pay-now"
          size="lg"
          className="w-full"
          onClick={handlePayment}
          disabled={initPaymentMutation.isPending || !selectedMethod}
        >
          {initPaymentMutation.isPending ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Traitement en cours...
            </>
          ) : (
            <>
              Payer {getDisplayAmount()}
            </>
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          Paiement sécurisé. Vos données sont protégées.
        </p>
      </div>
    </div>
  );
}
