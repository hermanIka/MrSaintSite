import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Loader2 } from "lucide-react";
import { SiPaypal } from "react-icons/si";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type PaymentProvider = "powerpay" | "lemonsqueezy" | "paypal";

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
    id: "powerpay" as PaymentProvider,
    label: "Mobile Money",
    description: "Orange Money, MTN, etc.",
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
  const { toast } = useToast();

  const initPaymentMutation = useMutation({
    mutationFn: async (provider: PaymentProvider) => {
      const response = await apiRequest("POST", "/api/payments/init", {
        provider,
        amount,
        currency,
        serviceId,
        serviceName,
        customerEmail,
        customerName,
        customerPhone,
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

    if (selectedMethod === "powerpay" && !customerPhone) {
      toast({
        title: "Téléphone requis",
        description: "Veuillez entrer votre numéro de téléphone pour Mobile Money.",
        variant: "destructive",
      });
      return;
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
        
        {selectedMethod === "powerpay" && (
          <div className="space-y-2">
            <Label htmlFor="customerPhone">Numéro de téléphone (Mobile Money) *</Label>
            <Input
              id="customerPhone"
              type="tel"
              data-testid="input-customer-phone"
              placeholder="+225 XX XX XX XX XX"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
        )}
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between mb-4">
          <span className="text-muted-foreground">Total à payer :</span>
          <span data-testid="text-payment-total" className="text-2xl font-bold text-primary">
            {amount} {currency}
          </span>
        </div>
        
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
              Payer {amount} {currency}
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
