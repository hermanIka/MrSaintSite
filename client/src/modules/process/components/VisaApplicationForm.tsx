import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { PAWAPAY_COUNTRIES, type PawaPayCountry } from "@shared/pawapay-countries";
import { VISA_TYPES } from "@shared/schema";
import {
  CheckCircle,
  Upload,
  Loader2,
  CreditCard,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  FileText,
  User,
  Lock,
  Crown,
} from "lucide-react";
import { useGoPlusCard } from "@/hooks/useGoPlusCard";

interface VisaFormData {
  lastName: string;
  firstName: string;
  email: string;
  phone: string;
  nationality: string;
  birthDate: string;
  visaType: string;
  destination: string;
  passportUrl: string;
  photoUrl: string;
  supportingDocUrl: string;
}

interface VisaApplicationFormProps {
  pendingPaymentId?: string;
  pendingProvider?: string;
}

const SESSION_KEY = "visa_form_data";
const POLLING_INTERVAL = 4000;
const POLLING_TIMEOUT = 10 * 60 * 1000;

export function VisaApplicationForm({ pendingPaymentId, pendingProvider }: VisaApplicationFormProps) {
  const { toast } = useToast();
  const { card, isGold } = useGoPlusCard();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"maishapay" | "pawapay">("maishapay");
  const [selectedCountry, setSelectedCountry] = useState<PawaPayCountry | null>(null);
  const [selectedCorrespondent, setSelectedCorrespondent] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingTransactionId, setPollingTransactionId] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<VisaFormData>({
    defaultValues: {
      lastName: "", firstName: "", email: "", phone: "", nationality: "",
      birthDate: "", visaType: "", destination: "",
      passportUrl: "", photoUrl: "", supportingDocUrl: "",
    },
  });

  const formValues = watch();
  const goldEmailMatch = isGold && formValues.email?.toLowerCase() === card?.email;

  // Handle returning from MaishaPay redirect
  useEffect(() => {
    if (pendingPaymentId && pendingProvider === "maishapay") {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored) as VisaFormData & { paymentMethod: string };
          submitVisaRequest(data, pendingPaymentId, data.paymentMethod || "maishapay");
        } catch {
          toast({ title: "Erreur", description: "Données du formulaire introuvables. Veuillez recommencer.", variant: "destructive" });
        }
      }
    }
  }, [pendingPaymentId, pendingProvider]);

  async function submitVisaRequest(data: VisaFormData, paymentId: string, method: string) {
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/visa-requests", {
        ...data,
        paymentId,
        paymentMethod: method,
        amount: 75,
      });
      const result = await res.json();
      if (result.success) {
        sessionStorage.removeItem(SESSION_KEY);
        setRequestId(result.requestId);
        setSucceeded(true);
      } else {
        toast({ title: "Erreur", description: result.error || "Erreur lors de la soumission.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de soumettre la demande. Contactez le support.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function startPolling(transactionId: string, data: VisaFormData) {
    setIsPolling(true);
    setPollingTransactionId(transactionId);
    pollingStartRef.current = Date.now();

    pollingRef.current = setInterval(async () => {
      if (Date.now() - pollingStartRef.current > POLLING_TIMEOUT) {
        clearInterval(pollingRef.current!);
        setIsPolling(false);
        toast({ title: "Délai dépassé", description: "Le paiement n'a pas été confirmé. Veuillez réessayer.", variant: "destructive" });
        return;
      }
      try {
        const res = await fetch(`/api/payments/verify/${transactionId}`);
        const result = await res.json();
        if (result.status === "success" || result.status === "paid") {
          clearInterval(pollingRef.current!);
          setIsPolling(false);
          await submitVisaRequest(data, transactionId, "pawapay");
        } else if (result.status === "failed") {
          clearInterval(pollingRef.current!);
          setIsPolling(false);
          toast({ title: "Paiement échoué", description: "Le paiement Mobile Money a échoué. Veuillez réessayer.", variant: "destructive" });
        }
      } catch {
        // continue polling
      }
    }, POLLING_INTERVAL);
  }

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, fieldName: keyof VisaFormData) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(fieldName);
    try {
      const res = await apiRequest("POST", "/api/upload/request-url", {
        name: file.name, size: file.size, contentType: file.type,
      });
      const { uploadURL, objectPath } = await res.json() as { uploadURL: string; objectPath: string };
      await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setValue(fieldName, objectPath);
      setUploadedFiles(prev => ({ ...prev, [fieldName]: file.name }));
      toast({ title: "Document téléchargé", description: `${file.name} téléchargé avec succès.` });
    } catch {
      toast({ title: "Erreur", description: "Erreur lors du téléchargement.", variant: "destructive" });
    } finally {
      setUploadingField(null);
    }
  }

  async function submitVisaGoldFree() {
    const data = formValues;
    if (!data.passportUrl || !data.photoUrl) {
      toast({ title: "Documents manquants", description: "Passeport et photo sont obligatoires.", variant: "destructive" });
      return;
    }
    if (!card?.cardNumber) {
      toast({ title: "Erreur", description: "Carte GO+ Gold introuvable. Vérifiez votre carte sur /go-plus.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await apiRequest("POST", "/api/visa-requests", {
        ...data,
        paymentId: `GOLD-FREE-${card.cardNumber}`,
        paymentMethod: "go-plus-gold",
        amount: 0,
      });
      const json = await res.json();
      setRequestId(json.id?.toString() || null);
      setSucceeded(true);
      toast({ title: "Demande soumise !", description: "Votre demande visa gratuite (GO+ Gold) a été transmise." });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la soumission.";
      toast({ title: "Erreur", description: msg, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePayAndSubmit() {
    const data = formValues;
    if (!data.passportUrl || !data.photoUrl) {
      toast({ title: "Documents manquants", description: "Passeport et photo sont obligatoires.", variant: "destructive" });
      return;
    }

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
        amount: 75,
        currency: "EUR",
        serviceId: "visa",
        serviceName: "Facilitation Visa",
        customerEmail: data.email,
        customerName: `${data.firstName} ${data.lastName}`,
        customerPhone: fullPhone,
        correspondent,
        countryCode: paymentMethod === "pawapay" ? selectedCountry?.code : undefined,
        paymentMode: "direct",
        source: "visa",
      });
      const result = await res.json();

      if (!result.success) {
        toast({ title: "Erreur paiement", description: result.message || "Impossible d'initier le paiement.", variant: "destructive" });
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
        toast({ title: "Confirmez sur votre téléphone", description: "Vous allez recevoir une invite de paiement Mobile Money." });
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
      if (!d.firstName || !d.lastName || !d.email || !d.phone || !d.nationality || !d.birthDate || !d.visaType || !d.destination) {
        toast({ title: "Champs manquants", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
        return false;
      }
      if (!d.email.includes("@")) {
        toast({ title: "Email invalide", description: "Veuillez entrer un email valide.", variant: "destructive" });
        return false;
      }
    }
    if (currentStep === 1) {
      if (!d.passportUrl || !d.photoUrl) {
        toast({ title: "Documents manquants", description: "Le passeport et la photo récente sont obligatoires.", variant: "destructive" });
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
          Votre demande de visa a été reçue et transmise à notre équipe. Vous serez contacté par email dans les 24 à 48 heures.
        </p>
        {requestId && (
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 mb-6">
            <p className="text-xs text-muted-foreground mb-1">Numéro de référence</p>
            <p className="text-sm font-mono font-semibold text-primary">{requestId}</p>
          </div>
        )}
        <p className="text-sm text-muted-foreground">Conservez ce numéro de référence pour tout suivi de votre dossier.</p>
      </div>
    );
  }

  if (isPolling) {
    return (
      <div className="text-center py-12 px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
        <h3 className="text-xl font-heading font-semibold text-foreground mb-3">En attente de confirmation</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Vérifiez votre téléphone et confirmez le paiement Mobile Money de <strong>75€</strong>.
        </p>
        <p className="text-xs text-muted-foreground mt-4">ID : {pollingTransactionId}</p>
      </div>
    );
  }

  if (isSubmitting && !pendingPaymentId) {
    return (
      <div className="text-center py-12 px-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
        <p className="text-muted-foreground">Traitement en cours...</p>
      </div>
    );
  }

  const steps = [
    { label: "Informations", icon: User },
    { label: "Documents", icon: FileText },
    { label: "Paiement", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Gold banner */}
      {isGold && (
        <div className={`rounded-lg border p-3 flex items-start gap-3 ${goldEmailMatch ? "border-primary/40 bg-primary/5" : "border-amber-500/30 bg-amber-500/5"}`}>
          <Crown className={`w-4 h-4 flex-shrink-0 mt-0.5 ${goldEmailMatch ? "text-primary" : "text-amber-600 dark:text-amber-400"}`} />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {goldEmailMatch
              ? <><strong className="text-foreground">Avantage GO+ Gold actif :</strong> votre facilitation visa est <strong className="text-green-600 dark:text-green-400">100% gratuite</strong> avec votre carte Gold.</>
              : <>Porteur GO+ Gold détecté. Entrez l'email associé à votre carte à l'étape 1 pour <strong className="text-foreground">activer la gratuité visa</strong>.</>
            }
          </p>
        </div>
      )}
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
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
          <h3 className="text-lg font-heading font-semibold text-foreground">Informations personnelles</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
              <Input id="firstName" data-testid="input-visa-firstName" placeholder="Jean" {...register("firstName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
              <Input id="lastName" data-testid="input-visa-lastName" placeholder="Dupont" {...register("lastName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input id="email" data-testid="input-visa-email" type="email" placeholder="jean@exemple.com" {...register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Téléphone <span className="text-red-500">*</span></Label>
              <Input id="phone" data-testid="input-visa-phone" placeholder="+33 6 00 00 00 00" {...register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nationality">Nationalité <span className="text-red-500">*</span></Label>
              <Input id="nationality" data-testid="input-visa-nationality" placeholder="Française" {...register("nationality")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">Date de naissance <span className="text-red-500">*</span></Label>
              <Input id="birthDate" data-testid="input-visa-birthDate" type="date" {...register("birthDate")} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type de visa <span className="text-red-500">*</span></Label>
              <Select value={formValues.visaType} onValueChange={v => setValue("visaType", v)}>
                <SelectTrigger data-testid="select-visa-type">
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {VISA_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="destination">Destination <span className="text-red-500">*</span></Label>
              <Input id="destination" data-testid="input-visa-destination" placeholder="Dubaï, Canada, États-Unis..." {...register("destination")} />
            </div>
          </div>
        </div>
      )}

      {/* Step 1 — Documents */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-heading font-semibold text-foreground">Documents requis</h3>
          <p className="text-sm text-muted-foreground">Formats acceptés : PDF, JPG, PNG (max 10 Mo par fichier)</p>

          {[
            { field: "passportUrl" as const, label: "Copie du passeport", required: true, hint: "Pages d'identité + tampons récents" },
            { field: "photoUrl" as const, label: "Photo d'identité récente", required: true, hint: "Fond blanc, moins de 6 mois" },
            { field: "supportingDocUrl" as const, label: "Document justificatif (optionnel)", required: false, hint: "Invitation, réservation hôtel, relevé bancaire..." },
          ].map(({ field, label, required, hint }) => (
            <div key={field} className="space-y-2">
              <Label>
                {label} {required && <span className="text-red-500">*</span>}
              </Label>
              <p className="text-xs text-muted-foreground">{hint}</p>
              <div className="flex items-center gap-3">
                <label
                  htmlFor={`upload-${field}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border cursor-pointer text-sm transition-colors ${
                    formValues[field]
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 text-muted-foreground"
                  }`}
                >
                  {uploadingField === field ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : formValues[field] ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {uploadingField === field
                    ? "Envoi en cours..."
                    : formValues[field]
                    ? uploadedFiles[field] || "Fichier téléchargé"
                    : "Choisir un fichier"}
                </label>
                <input
                  id={`upload-${field}`}
                  data-testid={`input-upload-${field}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={e => handleFileUpload(e, field)}
                  disabled={uploadingField !== null}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 2 — Paiement */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-muted/40 rounded-lg p-4 border border-border">
            <h4 className="text-sm font-semibold text-foreground mb-2">Récapitulatif de la demande</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">Nom :</span>
              <span className="font-medium">{formValues.firstName} {formValues.lastName}</span>
              <span className="text-muted-foreground">Type de visa :</span>
              <span className="font-medium">{VISA_TYPES.find(t => t.value === formValues.visaType)?.label || formValues.visaType}</span>
              <span className="text-muted-foreground">Destination :</span>
              <span className="font-medium">{formValues.destination}</span>
              <span className="text-muted-foreground">Montant :</span>
              {goldEmailMatch ? (
                <span className="font-bold text-base flex items-center gap-2">
                  <span className="line-through text-muted-foreground">75€</span>
                  <span className="text-green-600 dark:text-green-400">GRATUIT</span>
                  <Crown className="w-4 h-4 text-primary" />
                </span>
              ) : (
                <span className="font-bold text-primary text-base">75€</span>
              )}
            </div>
          </div>

          {goldEmailMatch ? (
            <div className="rounded-lg border border-primary/40 bg-primary/5 p-4 space-y-3" data-testid="banner-gold-free-visa">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="font-semibold text-foreground text-sm">Avantage GO+ Gold : facilitation visa offerte</p>
              </div>
              <p className="text-xs text-muted-foreground">Votre carte GO+ Gold (<strong className="text-foreground">{card?.cardNumber}</strong>) couvre l'intégralité des frais de facilitation visa. Aucun paiement requis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-heading font-semibold text-foreground">Mode de paiement</h3>
              {isGold && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Entrez l'email associé à votre carte GO+ Gold à l'étape 1 pour activer la gratuité.
                </p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="button-payment-maishapay"
                  onClick={() => setPaymentMethod("maishapay")}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                    paymentMethod === "maishapay"
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
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
                    paymentMethod === "pawapay"
                      ? "border-primary bg-primary/5"
                      : "border-border hover-elevate"
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
          )}

          {paymentMethod === "pawapay" && !goldEmailMatch && (
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
            data-testid="button-visa-prev"
            onClick={() => setStep(s => s - 1)}
            disabled={isSubmitting || isPolling}
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Précédent
          </Button>
        ) : (
          <div />
        )}

        {step < 2 ? (
          <Button
            type="button"
            data-testid="button-visa-next"
            onClick={() => {
              if (validateStep(step)) setStep(s => s + 1);
            }}
          >
            Suivant <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : goldEmailMatch ? (
          <Button
            type="button"
            data-testid="button-visa-submit-gold"
            onClick={submitVisaGoldFree}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
            ) : (
              <><Crown className="w-4 h-4" /> Soumettre gratuitement (GO+ Gold)</>
            )}
          </Button>
        ) : (
          <Button
            type="button"
            data-testid="button-visa-submit"
            onClick={handlePayAndSubmit}
            disabled={isSubmitting || isPolling}
            className="gap-2"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
            ) : (
              <><Lock className="w-4 h-4" /> Confirmer et Payer 75€</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
