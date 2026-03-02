import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PAWAPAY_COUNTRIES, type PawaPayCountry } from "@shared/pawapay-countries";
import {
  CheckCircle,
  Loader2,
  CreditCard,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  User,
  Lock,
  Star,
} from "lucide-react";

interface AgencyFormData {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  nationality: string;
  birthDate: string;
  message: string;
}

interface AgencyApplicationFormProps {
  packName: string;
  packLabel: string;
  packPrice: number;
  packRevenue: string;
  packDescription: string;
  pendingPaymentId?: string;
  pendingProvider?: string;
}

const SESSION_KEY = "agency_form_data";
const POLLING_INTERVAL = 4000;
const POLLING_TIMEOUT = 10 * 60 * 1000;

export function AgencyApplicationForm({
  packName,
  packLabel,
  packPrice,
  packRevenue,
  packDescription,
  pendingPaymentId,
  pendingProvider,
}: AgencyApplicationFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"maishapay" | "pawapay">("maishapay");
  const [selectedCountry, setSelectedCountry] = useState<PawaPayCountry | null>(null);
  const [selectedCorrespondent, setSelectedCorrespondent] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingTransactionId, setPollingTransactionId] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);

  const { register, watch } = useForm<AgencyFormData>({
    defaultValues: {
      lastName: "", firstName: "", email: "", phone: "",
      nationality: "", birthDate: "", message: "",
    },
  });

  const formValues = watch();

  useEffect(() => {
    if (pendingPaymentId && pendingProvider === "maishapay") {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored) as AgencyFormData & { paymentMethod: string };
          submitAgencyRequest(data, pendingPaymentId, "maishapay");
        } catch {
          toast({
            title: "Erreur",
            description: "Données du formulaire introuvables. Veuillez recommencer.",
            variant: "destructive",
          });
        }
      }
    }
  }, [pendingPaymentId, pendingProvider]);

  async function submitAgencyRequest(data: AgencyFormData, paymentId: string, method: string) {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/agency-requests", {
        ...data,
        packName,
        packPrice,
        paymentId,
        paymentMethod: method,
        amount: packPrice,
      });
      const result = await res.json();
      if (result.success) {
        sessionStorage.removeItem(SESSION_KEY);
        setRequestId(result.requestId);
        setSucceeded(true);
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la soumission.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de soumettre la demande. Contactez le support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function startPolling(transactionId: string, data: AgencyFormData) {
    setIsPolling(true);
    setPollingTransactionId(transactionId);
    pollingStartRef.current = Date.now();

    pollingRef.current = setInterval(async () => {
      if (Date.now() - pollingStartRef.current > POLLING_TIMEOUT) {
        clearInterval(pollingRef.current!);
        setIsPolling(false);
        toast({
          title: "Délai dépassé",
          description: "Le paiement n'a pas été confirmé. Veuillez réessayer.",
          variant: "destructive",
        });
        return;
      }
      try {
        const res = await fetch(`/api/payments/verify/${transactionId}`);
        const result = await res.json();
        if (result.status === "success" || result.status === "paid") {
          clearInterval(pollingRef.current!);
          setIsPolling(false);
          await submitAgencyRequest(data, transactionId, "pawapay");
        } else if (result.status === "failed") {
          clearInterval(pollingRef.current!);
          setIsPolling(false);
          toast({
            title: "Paiement échoué",
            description: "Le paiement Mobile Money a échoué. Veuillez réessayer.",
            variant: "destructive",
          });
        }
      } catch {
        // continue polling
      }
    }, POLLING_INTERVAL);
  }

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  async function handlePayAndSubmit() {
    const data = formValues;

    if (paymentMethod === "pawapay") {
      if (!selectedCountry) {
        toast({ title: "Pays requis", description: "Veuillez sélectionner votre pays.", variant: "destructive" });
        return;
      }
      if (selectedCountry.operators.length > 1 && !selectedCorrespondent) {
        toast({ title: "Opérateur requis", description: "Veuillez choisir votre opérateur Mobile Money.", variant: "destructive" });
        return;
      }
      if (!localPhone || localPhone.trim().length < 6) {
        toast({ title: "Numéro requis", description: "Veuillez entrer votre numéro Mobile Money.", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const fullPhone = paymentMethod === "pawapay" && selectedCountry
        ? selectedCountry.phonePrefix + localPhone.replace(/^0+/, "").replace(/\s/g, "")
        : data.phone;

      const correspondent = paymentMethod === "pawapay"
        ? (selectedCorrespondent || selectedCountry?.operators[0]?.code)
        : undefined;

      const res = await apiRequest("POST", "/api/payments/init", {
        provider: paymentMethod,
        amount: packPrice,
        currency: "EUR",
        serviceId: "agence",
        serviceName: `Création Agence — ${packLabel}`,
        customerEmail: data.email,
        customerName: `${data.firstName} ${data.lastName}`,
        customerPhone: fullPhone,
        correspondent,
        countryCode: paymentMethod === "pawapay" ? selectedCountry?.code : undefined,
        paymentMode: "direct",
        source: "agence",
      });
      const result = await res.json();

      if (!result.success) {
        toast({
          title: "Erreur paiement",
          description: result.message || "Impossible d'initier le paiement.",
          variant: "destructive",
        });
        return;
      }

      if (paymentMethod === "maishapay") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, paymentMethod: "maishapay" }));
        const checkoutUrl = result.checkoutUrl || result.redirectUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast({ title: "Erreur", description: "URL de paiement introuvable.", variant: "destructive" });
        }
      } else {
        toast({
          title: "Confirmez sur votre téléphone",
          description: "Vous allez recevoir une invite de paiement Mobile Money.",
        });
        startPolling(result.paymentId || result.transactionId, data);
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'initiation du paiement.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function validateStep(currentStep: number): boolean {
    const d = formValues;
    if (currentStep === 0) {
      if (!d.firstName || !d.lastName || !d.email || !d.phone || !d.nationality || !d.birthDate) {
        toast({
          title: "Champs manquants",
          description: "Veuillez remplir tous les champs obligatoires.",
          variant: "destructive",
        });
        return false;
      }
      if (!d.email.includes("@")) {
        toast({ title: "Email invalide", description: "Veuillez entrer un email valide.", variant: "destructive" });
        return false;
      }
    }
    return true;
  }

  if (succeeded) {
    return (
      <div className="text-center py-12 px-4">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-heading font-bold text-foreground mb-3">Demande soumise avec succès !</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Votre demande pour le pack <strong>{packLabel}</strong> a été reçue. Notre équipe vous contactera dans les 24 à 48 heures pour démarrer votre accompagnement.
        </p>
        {requestId && (
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 mb-6">
            <p className="text-xs text-muted-foreground mb-1">Numéro de référence</p>
            <p className="text-sm font-mono font-semibold text-primary">{requestId}</p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Conservez ce numéro pour le suivi de votre dossier.</p>
      </div>
    );
  }

  if (isPolling) {
    return (
      <div className="text-center py-12 px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
        <h3 className="text-xl font-heading font-semibold text-foreground mb-3">En attente de confirmation</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Vérifiez votre téléphone et confirmez le paiement Mobile Money de <strong>{packPrice}€</strong>.
        </p>
      </div>
    );
  }

  if (isSubmitting && pendingPaymentId) {
    return (
      <div className="text-center py-12 px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
        <p className="text-muted-foreground">Traitement de votre demande...</p>
      </div>
    );
  }

  const steps = [
    { label: "Informations", icon: User },
    { label: "Paiement", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Pack recap banner */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
        <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{packLabel}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{packDescription}</p>
        </div>
        <span className="text-lg font-bold text-primary flex-shrink-0">{packPrice}€</span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}>
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 0 — Informations personnelles */}
      {step === 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-heading font-semibold text-foreground">Vos informations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
              <Input id="firstName" data-testid="input-agency-firstName" placeholder="Jean" {...register("firstName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
              <Input id="lastName" data-testid="input-agency-lastName" placeholder="Dupont" {...register("lastName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input id="email" data-testid="input-agency-email" type="email" placeholder="jean@exemple.com" {...register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone <span className="text-red-500">*</span></Label>
              <Input id="phone" data-testid="input-agency-phone" placeholder="+33 6 00 00 00 00" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nationality">Nationalité <span className="text-red-500">*</span></Label>
              <Input id="nationality" data-testid="input-agency-nationality" placeholder="Française" {...register("nationality")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">Date de naissance <span className="text-red-500">*</span></Label>
              <Input id="birthDate" data-testid="input-agency-birthDate" type="date" {...register("birthDate")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Votre motivation (optionnel)</Label>
            <Textarea
              id="message"
              data-testid="input-agency-message"
              placeholder="Décrivez votre projet, votre expérience, vos objectifs..."
              rows={3}
              {...register("message")}
            />
          </div>
        </div>
      )}

      {/* Step 1 — Paiement */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3">Récapitulatif</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Nom :</span>
              <span className="font-medium">{formValues.firstName} {formValues.lastName}</span>
              <span className="text-muted-foreground">Pack :</span>
              <span className="font-medium">{packLabel}</span>
              <span className="text-muted-foreground">CA estimé :</span>
              <span className="font-medium text-green-600 dark:text-green-400">{packRevenue}</span>
              <span className="text-muted-foreground">Accompagnement :</span>
              <span className="font-bold text-primary text-base">{packPrice}€</span>
              <span className="text-muted-foreground col-span-2 text-xs mt-1 italic">{packDescription}</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-heading font-semibold text-foreground">Mode de paiement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                data-testid="button-payment-maishapay"
                onClick={() => setPaymentMethod("maishapay")}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === "maishapay" ? "border-primary bg-primary/5" : "border-border hover-elevate"
                }`}
              >
                <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">Carte bancaire</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, UnionPay</p>
                </div>
              </button>
              <button
                type="button"
                data-testid="button-payment-pawapay"
                onClick={() => setPaymentMethod("pawapay")}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  paymentMethod === "pawapay" ? "border-primary bg-primary/5" : "border-border hover-elevate"
                }`}
              >
                <Smartphone className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm text-foreground">Mobile Money</p>
                  <p className="text-xs text-muted-foreground">MTN, Orange, M-Pesa...</p>
                </div>
              </button>
            </div>
          </div>

          {paymentMethod === "pawapay" && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="space-y-1.5">
                <Label>Pays</Label>
                <Select
                  value={selectedCountry?.code || ""}
                  onValueChange={code => {
                    const c = PAWAPAY_COUNTRIES.find(p => p.code === code) || null;
                    setSelectedCountry(c);
                    setSelectedCorrespondent(c?.operators.length === 1 ? c.operators[0].code : "");
                    setLocalPhone("");
                  }}
                >
                  <SelectTrigger data-testid="select-pawapay-country">
                    <SelectValue placeholder="Sélectionner votre pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAWAPAY_COUNTRIES.map(c => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCountry && selectedCountry.operators.length > 1 && (
                <div className="space-y-1.5">
                  <Label>Opérateur</Label>
                  <Select value={selectedCorrespondent} onValueChange={setSelectedCorrespondent}>
                    <SelectTrigger data-testid="select-pawapay-operator">
                      <SelectValue placeholder="Choisir l'opérateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCountry.operators.map(op => (
                        <SelectItem key={op.code} value={op.code}>{op.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedCountry && (
                <div className="space-y-1.5">
                  <Label>Numéro Mobile Money</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 bg-muted rounded-md border border-input text-sm text-muted-foreground whitespace-nowrap">
                      {selectedCountry.flag} {selectedCountry.phonePrefix}
                    </div>
                    <Input
                      data-testid="input-pawapay-phone"
                      placeholder="600 000 000"
                      value={localPhone}
                      onChange={e => setLocalPhone(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {step > 0 ? (
          <Button
            type="button"
            variant="outline"
            data-testid="button-agency-prev"
            onClick={() => setStep(s => s - 1)}
            disabled={isSubmitting || isPolling}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
          </Button>
        ) : (
          <div />
        )}

        {step < 1 ? (
          <Button
            type="button"
            data-testid="button-agency-next"
            onClick={() => { if (validateStep(step)) setStep(s => s + 1); }}
          >
            Suivant <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            data-testid="button-agency-submit"
            onClick={handlePayAndSubmit}
            disabled={isSubmitting || isPolling}
            className="gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
            ) : (
              <><Lock className="w-4 h-4" /> Confirmer et Payer {packPrice}€</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
