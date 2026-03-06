import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import type { Trip } from "@shared/schema";

interface TripReservationModalProps {
  trip: Trip;
  open: boolean;
  onClose: () => void;
  pendingPaymentId?: string;
  pendingProvider?: string;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  numberOfPeople: number;
  travelDate: string;
  notes: string;
}

const SESSION_KEY = "trip_reservation_form";
const POLLING_INTERVAL = 4000;
const POLLING_TIMEOUT = 10 * 60 * 1000;

export function TripReservationModal({
  trip,
  open,
  onClose,
  pendingPaymentId,
  pendingProvider,
}: TripReservationModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"maishapay" | "pawapay">("maishapay");
  const [selectedCountry, setSelectedCountry] = useState<PawaPayCountry | null>(null);
  const [selectedCorrespondent, setSelectedCorrespondent] = useState("");
  const [localPhone, setLocalPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollingStartRef = useRef<number>(0);

  const { register, watch, setValue } = useForm<FormData>({
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      numberOfPeople: 1,
      travelDate: "",
      notes: "",
    },
  });

  const formValues = watch();
  const numberOfPeople = Number(formValues.numberOfPeople) || 1;
  const totalPrice = trip.price * numberOfPeople;

  useEffect(() => {
    if (pendingPaymentId && pendingProvider === "maishapay" && open) {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const data = JSON.parse(stored) as FormData;
          Object.entries(data).forEach(([k, v]) => setValue(k as keyof FormData, v as any));
          finalizeMaishaPayReservation(data, pendingPaymentId);
        } catch {
          toast({ title: "Erreur", description: "Données introuvables. Veuillez recommencer.", variant: "destructive" });
        }
      }
    }
  }, [pendingPaymentId, pendingProvider, open]);

  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  async function finalizeMaishaPayReservation(data: FormData, paymentId: string) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trips/reservations/verify/${paymentId}?provider=maishapay`);
      const result = await res.json();
      if (result.status === "success") {
        sessionStorage.removeItem(SESSION_KEY);
        setSucceeded(true);
        setStep(2);
        toast({ title: "Réservation confirmée !", description: "Vous allez recevoir un email de confirmation." });
      } else {
        toast({ title: "Paiement non confirmé", description: "Veuillez réessayer.", variant: "destructive" });
        setStep(1);
      }
    } catch {
      toast({ title: "Erreur", description: "Impossible de vérifier le paiement.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function startPolling(paymentId: string) {
    setIsPolling(true);
    pollingStartRef.current = Date.now();
    pollingRef.current = setInterval(async () => {
      if (Date.now() - pollingStartRef.current > POLLING_TIMEOUT) {
        clearInterval(pollingRef.current!);
        setIsPolling(false);
        toast({ title: "Délai dépassé", description: "Le paiement n'a pas été confirmé.", variant: "destructive" });
        return;
      }
      try {
        const res = await fetch(`/api/trips/reservations/verify/${paymentId}?provider=pawapay`);
        const result = await res.json();
        if (result.status === "success") {
          clearInterval(pollingRef.current!);
          setIsPolling(false);
          setSucceeded(true);
          setStep(2);
          toast({ title: "Réservation confirmée !", description: "Vous allez recevoir un email de confirmation." });
        } else if (result.status === "failed") {
          clearInterval(pollingRef.current!);
          setIsPolling(false);
          toast({ title: "Paiement échoué", description: "Veuillez réessayer.", variant: "destructive" });
        }
      } catch {
        // continue polling
      }
    }, POLLING_INTERVAL);
  }

  async function handlePayAndSubmit() {
    const data = formValues;
    if (paymentMethod === "pawapay") {
      if (!selectedCountry) {
        toast({ title: "Pays requis", description: "Sélectionnez votre pays.", variant: "destructive" });
        return;
      }
      if (selectedCountry.operators.length > 1 && !selectedCorrespondent) {
        toast({ title: "Opérateur requis", description: "Choisissez votre opérateur Mobile Money.", variant: "destructive" });
        return;
      }
      if (!localPhone || localPhone.trim().length < 6) {
        toast({ title: "Numéro requis", description: "Entrez votre numéro Mobile Money.", variant: "destructive" });
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

      const res = await apiRequest("POST", `/api/trips/${trip.id}/reserve`, {
        provider: paymentMethod,
        fullName: data.fullName,
        email: data.email,
        phone: fullPhone,
        numberOfPeople,
        travelDate: data.travelDate || undefined,
        notes: data.notes || undefined,
        correspondent,
        countryCode: paymentMethod === "pawapay" ? selectedCountry?.code : undefined,
      });
      const result = await res.json();

      if (!result.success) {
        toast({ title: "Erreur paiement", description: result.message || "Impossible d'initier le paiement.", variant: "destructive" });
        return;
      }

      if (paymentMethod === "maishapay") {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
        const checkoutUrl = result.checkoutUrl || result.redirectUrl;
        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        } else {
          toast({ title: "Erreur", description: "URL de paiement introuvable.", variant: "destructive" });
        }
      } else {
        toast({ title: "Confirmez sur votre téléphone", description: "Vous allez recevoir une invite Mobile Money." });
        startPolling(result.paymentId);
      }
    } catch {
      toast({ title: "Erreur", description: "Erreur lors de l'initiation du paiement.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  function validateStep0(): boolean {
    const d = formValues;
    if (!d.fullName.trim() || !d.email.trim() || !d.phone.trim()) {
      toast({ title: "Champs requis", description: "Veuillez remplir nom, email et téléphone.", variant: "destructive" });
      return false;
    }
    if (!d.email.includes("@")) {
      toast({ title: "Email invalide", description: "Veuillez entrer une adresse email valide.", variant: "destructive" });
      return false;
    }
    if (numberOfPeople < 1) {
      toast({ title: "Nombre invalide", description: "Au moins 1 personne requise.", variant: "destructive" });
      return false;
    }
    return true;
  }

  const steps = [
    { label: "Informations", icon: User },
    { label: "Paiement", icon: CreditCard },
    { label: "Confirmation", icon: Star },
  ];

  function handleClose() {
    if (!isPolling && !isSubmitting) {
      setStep(0);
      setSucceeded(false);
      setInvoiceNumber(null);
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">
            {succeeded ? "Réservation confirmée" : "Réserver ce voyage"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Pack recap */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <Star className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{trip.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{trip.destination} · {trip.date}</p>
            </div>
            <span className="text-lg font-bold text-primary flex-shrink-0">{trip.price}€<span className="text-xs font-normal text-muted-foreground">/pers.</span></span>
          </div>

          {/* Step indicator */}
          {!succeeded && (
            <div className="flex items-center justify-center gap-2">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      i === step ? "bg-primary text-primary-foreground" : i < step ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{s.label}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`h-px w-6 ${i < step ? "bg-primary" : "bg-border"}`} />}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 0 — Informations */}
          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullName">Nom complet <span className="text-red-500">*</span></Label>
                <Input id="fullName" data-testid="input-trip-fullName" placeholder="Jean Dupont" {...register("fullName")} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                  <Input id="email" data-testid="input-trip-email" type="email" placeholder="jean@exemple.com" {...register("email")} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Téléphone <span className="text-red-500">*</span></Label>
                  <Input id="phone" data-testid="input-trip-phone" placeholder="+33 6 00 00 00 00" {...register("phone")} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="numberOfPeople">Nombre de personnes <span className="text-red-500">*</span></Label>
                  <Input
                    id="numberOfPeople"
                    data-testid="input-trip-numberOfPeople"
                    type="number"
                    min={1}
                    max={50}
                    {...register("numberOfPeople", { valueAsNumber: true })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="travelDate">Date souhaitée</Label>
                  <Input id="travelDate" data-testid="input-trip-travelDate" type="date" {...register("travelDate")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Message (optionnel)</Label>
                <Textarea id="notes" data-testid="input-trip-notes" placeholder="Questions, préférences particulières..." rows={3} {...register("notes")} />
              </div>
              <div className="bg-muted/40 rounded-lg p-3 border border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prix unitaire</span>
                  <span>{trip.price}€ / personne</span>
                </div>
                <div className="flex justify-between font-semibold mt-1">
                  <span>Total ({numberOfPeople} pers.)</span>
                  <span className="text-primary">{totalPrice}€</span>
                </div>
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
                  <span className="font-medium">{formValues.fullName}</span>
                  <span className="text-muted-foreground">Email :</span>
                  <span className="font-medium">{formValues.email}</span>
                  <span className="text-muted-foreground">Personnes :</span>
                  <span className="font-medium">{numberOfPeople}</span>
                  <span className="text-muted-foreground">Total à payer :</span>
                  <span className="font-bold text-primary text-base">{totalPrice}€</span>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-heading font-semibold text-foreground">Mode de paiement</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-testid="button-trip-payment-maishapay"
                    onClick={() => setPaymentMethod("maishapay")}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === "maishapay" ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}
                  >
                    <CreditCard className="w-5 h-5 text-primary flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-foreground">Carte bancaire</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, UnionPay</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    data-testid="button-trip-payment-pawapay"
                    onClick={() => setPaymentMethod("pawapay")}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === "pawapay" ? "border-primary bg-primary/5" : "border-border hover-elevate"}`}
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
                      onValueChange={(code) => {
                        const c = PAWAPAY_COUNTRIES.find((p) => p.code === code) || null;
                        setSelectedCountry(c);
                        setSelectedCorrespondent(c?.operators.length === 1 ? c.operators[0].code : "");
                        setLocalPhone("");
                      }}
                    >
                      <SelectTrigger data-testid="select-trip-pawapay-country">
                        <SelectValue placeholder="Sélectionner votre pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAWAPAY_COUNTRIES.map((c) => (
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
                        <SelectTrigger data-testid="select-trip-pawapay-operator">
                          <SelectValue placeholder="Choisir l'opérateur" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCountry.operators.map((op) => (
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
                          data-testid="input-trip-pawapay-phone"
                          placeholder="600 000 000"
                          value={localPhone}
                          onChange={(e) => setLocalPhone(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isPolling && (
                <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  <p className="text-sm text-muted-foreground">En attente de confirmation sur votre téléphone...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2 — Succès */}
          {step === 2 && succeeded && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 data-testid="text-trip-reservation-success" className="text-xl font-heading font-bold text-foreground">
                Réservation confirmée !
              </h3>
              <p className="text-muted-foreground text-sm">
                Votre réservation pour <strong>{trip.title}</strong> a été confirmée avec succès.
                Un email de confirmation et votre facture vous ont été envoyés à <strong>{formValues.email}</strong>.
              </p>
              <p className="text-sm text-muted-foreground">Notre équipe vous contactera dans les 24h pour finaliser les détails.</p>
              <Button data-testid="button-trip-reservation-close" onClick={handleClose} className="mt-2">
                Fermer
              </Button>
            </div>
          )}

          {/* Navigation */}
          {!succeeded && (
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {step > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  data-testid="button-trip-prev"
                  onClick={() => setStep((s) => s - 1)}
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
                  data-testid="button-trip-next"
                  onClick={() => { if (validateStep0()) setStep(1); }}
                >
                  Suivant <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : step === 1 ? (
                <Button
                  type="button"
                  data-testid="button-trip-submit"
                  onClick={handlePayAndSubmit}
                  disabled={isSubmitting || isPolling}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Traitement...</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Payer {totalPrice}€</>
                  )}
                </Button>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
