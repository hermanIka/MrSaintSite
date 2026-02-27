import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/modules/foundation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  PROFESSIONAL_STATUS_OPTIONS,
  TRIP_TYPE_OPTIONS,
  CREDIT_DURATION_OPTIONS,
  REPAYMENT_METHOD_OPTIONS,
  REPAYMENT_FREQUENCY_OPTIONS,
} from "@shared/schema";
import {
  CreditCard,
  Users,
  Globe,
  Shield,
  Clock,
  FileText,
  CheckCircle,
  Upload,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Wallet,
  Plane,
  User,
  Briefcase,
  Crown,
  Lock,
} from "lucide-react";
import { Link } from "wouter";
import voyageCreditHeroBanner from "@/assets/images/voyage-credit-hero-banner.png";
import { useGoPlusCard } from "@/hooks/useGoPlusCard";

const formSchema = z.object({
  lastName: z.string().min(2, "Nom requis"),
  firstName: z.string().min(2, "Prénom requis"),
  birthDate: z.string().min(1, "Date de naissance requise"),
  nationality: z.string().min(2, "Nationalité requise"),
  countryOfResidence: z.string().min(2, "Pays de résidence requis"),
  phone: z.string().min(8, "Numéro de téléphone requis"),
  email: z.string().email("Email invalide"),
  address: z.string().min(5, "Adresse requise"),
  professionalStatus: z.string().min(1, "Statut professionnel requis"),
  profession: z.string().min(2, "Profession requise"),
  monthlyIncome: z.string().min(1, "Revenu mensuel requis"),
  professionalSeniority: z.string().min(1, "Ancienneté requise"),
  destination: z.string().min(2, "Destination requise"),
  tripType: z.string().min(1, "Type de voyage requis"),
  departureDate: z.string().min(1, "Date de départ requise"),
  stayDuration: z.string().min(1, "Durée du séjour requise"),
  estimatedBudget: z.number().min(100, "Budget minimum 100 EUR"),
  creditAmount: z.number().min(100, "Montant minimum 100 EUR"),
  hasPersonalContribution: z.boolean(),
  personalContributionAmount: z.number().optional(),
  creditDuration: z.string().min(1, "Durée du crédit requise"),
  repaymentMethod: z.string().min(1, "Mode de remboursement requis"),
  repaymentFrequency: z.string().min(1, "Fréquence requise"),
  identityDocumentUrl: z.string().min(1, "Pièce d'identité requise"),
  incomeProofUrl: z.string().min(1, "Justificatif de revenus requis"),
  addressProofUrl: z.string().min(1, "Justificatif de domicile requis"),
  recentPhotoUrl: z.string().min(1, "Photo récente requise"),
  explanatoryLetterUrl: z.string().optional(),
  acceptConditions: z.boolean().refine((val) => val === true, "Vous devez accepter les conditions"),
});

type FormData = z.infer<typeof formSchema>;

const advantages = [
  {
    icon: CreditCard,
    title: "Paiement échelonné",
    description: "Étalez le coût de votre voyage sur plusieurs mois",
  },
  {
    icon: Users,
    title: "Accompagnement personnalisé",
    description: "Un conseiller dédié pour votre projet",
  },
  {
    icon: Globe,
    title: "Voyages accessibles",
    description: "Accédez à des destinations autrement inaccessibles",
  },
  {
    icon: Shield,
    title: "Étude confidentielle",
    description: "Traitement discret et sécurisé de votre dossier",
  },
  {
    icon: Clock,
    title: "Flexibilité",
    description: "Modalités adaptées à votre profil financier",
  },
];

export function VoyageCreditPage() {
  const [step, setStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const { toast } = useToast();
  const { isGold, saveCard } = useGoPlusCard();
  const [goldGateState, setGoldGateState] = useState<"landing" | "verify" | "denied">("landing");
  const [goldCheckEmail, setGoldCheckEmail] = useState("");
  const [goldCheckLoading, setGoldCheckLoading] = useState(false);

  useEffect(() => {
    if (isGold) setGoldGateState("landing");
  }, [isGold]);

  const handleStartRequest = () => {
    if (isGold) {
      setShowForm(true);
    } else {
      setGoldGateState("verify");
    }
  };

  const checkGoldCard = async () => {
    if (!goldCheckEmail.includes("@")) {
      toast({ title: "Email requis", description: "Entrez un email valide.", variant: "destructive" });
      return;
    }
    setGoldCheckLoading(true);
    try {
      const res = await fetch(`/api/go-plus/card/${encodeURIComponent(goldCheckEmail.toLowerCase())}`);
      const data = await res.json();
      if (data.status === "active" && data.card?.planName === "Gold") {
        saveCard(goldCheckEmail, data.card);
        setShowForm(true);
      } else {
        setGoldGateState("denied");
      }
    } catch {
      setGoldGateState("denied");
    } finally {
      setGoldCheckLoading(false);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastName: "",
      firstName: "",
      birthDate: "",
      nationality: "",
      countryOfResidence: "",
      phone: "",
      email: "",
      address: "",
      professionalStatus: "",
      profession: "",
      monthlyIncome: "",
      professionalSeniority: "",
      destination: "",
      tripType: "",
      departureDate: "",
      stayDuration: "",
      estimatedBudget: 0,
      creditAmount: 0,
      hasPersonalContribution: false,
      personalContributionAmount: 0,
      creditDuration: "",
      repaymentMethod: "",
      repaymentFrequency: "",
      identityDocumentUrl: "",
      incomeProofUrl: "",
      addressProofUrl: "",
      recentPhotoUrl: "",
      explanatoryLetterUrl: "",
      acceptConditions: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const { acceptConditions, ...requestData } = data;
      const res = await apiRequest("POST", "/api/credit-requests", requestData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Demande envoyée",
        description: "Votre demande a été soumise avec succès. Nous vous contacterons sous 48 à 72 heures.",
      });
      setShowForm(false);
      setStep(0);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof FormData
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);

    try {
      const response = await apiRequest("POST", "/api/upload/request-url", {
        name: file.name,
        size: file.size,
        contentType: file.type,
      });

      const { uploadURL, objectPath } = (await response.json()) as { uploadURL: string; objectPath: string };

      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      form.setValue(fieldName as any, objectPath);
      toast({
        title: "Fichier téléchargé",
        description: `${file.name} a été téléchargé avec succès.`,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Erreur lors du téléchargement du fichier.",
        variant: "destructive",
      });
    } finally {
      setUploadingField(null);
    }
  };

  const onSubmit = (data: FormData) => {
    submitMutation.mutate(data);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Informations personnelles
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="lastName">Nom *</Label>
                <Input
                  id="lastName"
                  data-testid="input-lastName"
                  {...form.register("lastName")}
                  placeholder="Votre nom"
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="firstName">Prénom *</Label>
                <Input
                  id="firstName"
                  data-testid="input-firstName"
                  {...form.register("firstName")}
                  placeholder="Votre prénom"
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="birthDate">Date de naissance *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  data-testid="input-birthDate"
                  {...form.register("birthDate")}
                />
                {form.formState.errors.birthDate && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.birthDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="nationality">Nationalité *</Label>
                <Input
                  id="nationality"
                  data-testid="input-nationality"
                  {...form.register("nationality")}
                  placeholder="Votre nationalité"
                />
                {form.formState.errors.nationality && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.nationality.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="countryOfResidence">Pays de résidence *</Label>
                <Input
                  id="countryOfResidence"
                  data-testid="input-countryOfResidence"
                  {...form.register("countryOfResidence")}
                  placeholder="Votre pays de résidence"
                />
                {form.formState.errors.countryOfResidence && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.countryOfResidence.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Téléphone / WhatsApp *</Label>
                <Input
                  id="phone"
                  data-testid="input-phone"
                  {...form.register("phone")}
                  placeholder="+237 6XX XXX XXX"
                />
                {form.formState.errors.phone && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  data-testid="input-email"
                  {...form.register("email")}
                  placeholder="votre@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Adresse actuelle *</Label>
                <Textarea
                  id="address"
                  data-testid="input-address"
                  {...form.register("address")}
                  placeholder="Votre adresse complète"
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Situation professionnelle
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Statut professionnel *</Label>
                <Select
                  value={form.watch("professionalStatus")}
                  onValueChange={(val) => form.setValue("professionalStatus", val)}
                >
                  <SelectTrigger data-testid="select-professionalStatus">
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONAL_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.professionalStatus && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.professionalStatus.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="profession">Profession / Activité *</Label>
                <Input
                  id="profession"
                  data-testid="input-profession"
                  {...form.register("profession")}
                  placeholder="Votre profession"
                />
                {form.formState.errors.profession && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.profession.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="monthlyIncome">Revenu mensuel estimé (EUR) *</Label>
                <Input
                  id="monthlyIncome"
                  data-testid="input-monthlyIncome"
                  {...form.register("monthlyIncome")}
                  placeholder="Ex: 500 - 1000 EUR"
                />
                {form.formState.errors.monthlyIncome && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.monthlyIncome.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="professionalSeniority">Ancienneté professionnelle *</Label>
                <Input
                  id="professionalSeniority"
                  data-testid="input-professionalSeniority"
                  {...form.register("professionalSeniority")}
                  placeholder="Ex: 3 ans"
                />
                {form.formState.errors.professionalSeniority && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.professionalSeniority.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Plane className="w-5 h-5 text-primary" />
              Projet de voyage
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="destination">Destination souhaitée *</Label>
                <Input
                  id="destination"
                  data-testid="input-destination"
                  {...form.register("destination")}
                  placeholder="Ex: France, Dubaï, Turquie..."
                />
                {form.formState.errors.destination && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.destination.message}</p>
                )}
              </div>
              <div>
                <Label>Type de voyage *</Label>
                <Select
                  value={form.watch("tripType")}
                  onValueChange={(val) => form.setValue("tripType", val)}
                >
                  <SelectTrigger data-testid="select-tripType">
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIP_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.tripType && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.tripType.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="departureDate">Date de départ souhaitée *</Label>
                <Input
                  id="departureDate"
                  type="date"
                  data-testid="input-departureDate"
                  {...form.register("departureDate")}
                />
                {form.formState.errors.departureDate && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.departureDate.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="stayDuration">Durée du séjour *</Label>
                <Input
                  id="stayDuration"
                  data-testid="input-stayDuration"
                  {...form.register("stayDuration")}
                  placeholder="Ex: 2 semaines, 1 mois..."
                />
                {form.formState.errors.stayDuration && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.stayDuration.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="estimatedBudget">Budget estimé (EUR) *</Label>
                <Input
                  id="estimatedBudget"
                  type="number"
                  data-testid="input-estimatedBudget"
                  {...form.register("estimatedBudget", { valueAsNumber: true })}
                  placeholder="Ex: 3000"
                />
                {form.formState.errors.estimatedBudget && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.estimatedBudget.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="creditAmount">Montant demandé à crédit (EUR) *</Label>
                <Input
                  id="creditAmount"
                  type="number"
                  data-testid="input-creditAmount"
                  {...form.register("creditAmount", { valueAsNumber: true })}
                  placeholder="Ex: 2000"
                />
                {form.formState.errors.creditAmount && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.creditAmount.message}</p>
                )}
              </div>
              <div className="sm:col-span-2 flex items-center gap-3">
                <Checkbox
                  id="hasPersonalContribution"
                  data-testid="checkbox-hasPersonalContribution"
                  checked={form.watch("hasPersonalContribution")}
                  onCheckedChange={(checked) => form.setValue("hasPersonalContribution", !!checked)}
                />
                <Label htmlFor="hasPersonalContribution">J'ai un apport personnel</Label>
              </div>
              {form.watch("hasPersonalContribution") && (
                <div className="sm:col-span-2">
                  <Label htmlFor="personalContributionAmount">Montant de l'apport (EUR)</Label>
                  <Input
                    id="personalContributionAmount"
                    type="number"
                    data-testid="input-personalContributionAmount"
                    {...form.register("personalContributionAmount", { valueAsNumber: true })}
                    placeholder="Ex: 500"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Modalités de remboursement
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Durée du crédit *</Label>
                <Select
                  value={form.watch("creditDuration")}
                  onValueChange={(val) => form.setValue("creditDuration", val)}
                >
                  <SelectTrigger data-testid="select-creditDuration">
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.creditDuration && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.creditDuration.message}</p>
                )}
              </div>
              <div>
                <Label>Mode de remboursement *</Label>
                <Select
                  value={form.watch("repaymentMethod")}
                  onValueChange={(val) => form.setValue("repaymentMethod", val)}
                >
                  <SelectTrigger data-testid="select-repaymentMethod">
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAYMENT_METHOD_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.repaymentMethod && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.repaymentMethod.message}</p>
                )}
              </div>
              <div>
                <Label>Fréquence de remboursement *</Label>
                <Select
                  value={form.watch("repaymentFrequency")}
                  onValueChange={(val) => form.setValue("repaymentFrequency", val)}
                >
                  <SelectTrigger data-testid="select-repaymentFrequency">
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REPAYMENT_FREQUENCY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.repaymentFrequency && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.repaymentFrequency.message}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Documents requis
            </h3>
            <p className="text-muted-foreground text-sm">
              Téléchargez vos documents au format PDF ou image (max 10 Mo chacun)
            </p>
            <div className="grid gap-4">
              {[
                { name: "identityDocumentUrl" as const, label: "Pièce d'identité (Passeport ou Carte) *", required: true },
                { name: "incomeProofUrl" as const, label: "Justificatif de revenus *", required: true },
                { name: "addressProofUrl" as const, label: "Justificatif de domicile *", required: true },
                { name: "recentPhotoUrl" as const, label: "Photo récente *", required: true },
                { name: "explanatoryLetterUrl" as const, label: "Lettre explicative (optionnelle)", required: false },
              ].map((doc) => (
                <div key={doc.name} className="border rounded-md p-4">
                  <Label className="mb-2 block">{doc.label}</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*,.pdf"
                      data-testid={`input-${doc.name}`}
                      onChange={(e) => handleFileUpload(e, doc.name)}
                      disabled={uploadingField === doc.name}
                      className="flex-1"
                    />
                    {uploadingField === doc.name && (
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    )}
                    {form.watch(doc.name) && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  {form.formState.errors[doc.name] && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors[doc.name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Confirmation
            </h3>
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="acceptConditions"
                      data-testid="checkbox-acceptConditions"
                      checked={form.watch("acceptConditions")}
                      onCheckedChange={(checked) => form.setValue("acceptConditions", !!checked)}
                    />
                    <Label htmlFor="acceptConditions" className="text-sm leading-relaxed">
                      Je certifie que les informations fournies sont exactes et complètes.
                      J'accepte que ma demande soit étudiée par l'équipe de Mr Saint Travel Agency.
                      Je comprends que l'acceptation de ma demande n'est pas automatique et sera
                      communiquée sous 48 à 72 heures.
                    </Label>
                  </div>
                  {form.formState.errors.acceptConditions && (
                    <p className="text-sm text-destructive">{form.formState.errors.acceptConditions.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  if (!showForm) {
    const seo = (
      <SEO
        title="Voyage à Crédit - Financement de voyage"
        description="Réalisez votre rêve de voyage avec notre solution de financement flexible. Étalez le coût sur plusieurs mois et partez sereinement."
        keywords="voyage crédit, financement voyage, paiement échelonné, voyage à crédit"
      />
    );

    if (goldGateState === "verify") {
      return (
        <Layout>
          {seo}
          <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20" style={{ marginTop: "80px" }}>
            <div className="w-full max-w-md space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Crown className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-heading font-bold">Voyage à Crédit</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Cette option est réservée aux porteurs de la carte <strong className="text-foreground">GO+ Gold</strong>. Vérifiez votre carte pour accéder au formulaire.
                </p>
              </div>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="gold-check-email">Email associé à votre carte GO+ Gold</Label>
                    <Input
                      id="gold-check-email"
                      data-testid="input-gold-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={goldCheckEmail}
                      onChange={e => setGoldCheckEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && checkGoldCard()}
                    />
                  </div>
                  <Button
                    data-testid="button-verify-gold"
                    className="w-full"
                    onClick={checkGoldCard}
                    disabled={goldCheckLoading || !goldCheckEmail.includes("@")}
                  >
                    {goldCheckLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Vérification...</>
                    ) : (
                      <><Crown className="w-4 h-4 mr-2" /> Vérifier ma carte GO+ Gold</>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Pas encore de carte GO+ Gold ?{" "}
                    <Link href="/go-plus" className="text-primary font-medium hover:underline">
                      Obtenir la carte Gold (299€/an)
                    </Link>
                  </p>
                </CardContent>
              </Card>
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={() => setGoldGateState("landing")}
              >
                Retour
              </Button>
            </div>
          </div>
        </Layout>
      );
    }

    if (goldGateState === "denied") {
      return (
        <Layout>
          {seo}
          <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20" style={{ marginTop: "80px" }}>
            <div className="w-full max-w-lg space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-heading font-bold">Accès Réservé GO+ Gold</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Le service <strong className="text-foreground">Voyage à Crédit</strong> est exclusivement disponible pour les porteurs de la carte GO+ Gold. Pour y accéder, obtenez votre carte GO+ Gold et bénéficiez également de la facilitation visa gratuite et de l'assistance personnalisée.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/go-plus">
                  <Button data-testid="button-get-gold" size="lg" className="gap-2 w-full sm:w-auto">
                    <Crown className="w-4 h-4" /> Obtenir la carte GO+ Gold
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setGoldGateState("verify")}
                  className="w-full sm:w-auto"
                  data-testid="button-retry-verify"
                >
                  Réessayer avec un autre email
                </Button>
              </div>
              <div className="border border-border rounded-lg p-4 bg-muted/30 text-left space-y-2">
                <p className="text-sm font-medium text-foreground">Avantages inclus avec GO+ Gold (299€/an) :</p>
                <ul className="space-y-1">
                  {["Facilitation visa 100% gratuite", "Accès au Voyage à Crédit", "Assistance personnalisée", "Accès prioritaire aux offres exclusives"].map(adv => (
                    <li key={adv} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      {adv}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Layout>
      );
    }

    return (
      <Layout>
        <SEO 
          title="Voyage à Crédit - Financement de voyage"
          description="Réalisez votre rêve de voyage avec notre solution de financement flexible. Étalez le coût sur plusieurs mois et partez sereinement."
          keywords="voyage crédit, financement voyage, paiement échelonné, voyage à crédit"
        />
        <section className="relative py-32 bg-black text-white overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={voyageCreditHeroBanner}
              alt="Voyage à crédit"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                Nouveau Service
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold mb-6">
                Voyage à Crédit
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Réalisez votre rêve de voyage sans attendre. Grâce à notre solution de financement
                flexible, étalez le coût de votre voyage sur plusieurs mois et partez sereinement.
              </p>
              <Button
                size="lg"
                data-testid="button-start-request-hero"
                onClick={handleStartRequest}
              >
                Faire une demande
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 bg-card/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-heading font-bold text-center mb-4">
              Comment ça fonctionne ?
            </h2>
            <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-12">
              Le voyage à crédit est une solution de financement permettant d'étaler le paiement de votre
              voyage. Votre demande est étudiée personnellement par Monsieur Santhe. L'acceptation n'est
              pas automatique et dépend de votre profil. Une réponse vous sera communiquée sous 48 à 72 heures.
            </p>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
              {advantages.map((adv, idx) => (
                <Card key={idx} className="text-center">
                  <CardContent className="pt-6">
                    <adv.icon className="w-10 h-10 mx-auto mb-4 text-primary" />
                    <h3 className="font-semibold mb-2">{adv.title}</h3>
                    <p className="text-sm text-muted-foreground">{adv.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-heading font-bold mb-6">
              Prêt à concrétiser votre projet ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Remplissez le formulaire de demande ci-dessous. Notre équipe étudiera votre dossier
              avec attention et vous contactera dans les plus brefs délais.
            </p>
            <Button
              size="lg"
              data-testid="button-start-request"
              onClick={handleStartRequest}
            >
              Faire une demande
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="Demande de Voyage à Crédit"
        description="Remplissez votre demande de financement de voyage."
        keywords="voyage crédit, financement voyage, demande crédit"
      />
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => {
                if (step === 0) {
                  setShowForm(false);
                } else {
                  setStep(step - 1);
                }
              }}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>

        {isGold && (
          <div className="mb-4 rounded-lg border border-primary/40 bg-primary/5 p-3 flex items-center gap-3" data-testid="banner-gold-credit">
            <Crown className="w-4 h-4 text-primary flex-shrink-0" />
            <p className="text-sm text-foreground">
              <strong>Accès GO+ Gold :</strong> votre dossier Voyage à Crédit est traité en priorité par notre équipe.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Demande de voyage à crédit</span>
              <span className="text-sm font-normal text-muted-foreground">
                Étape {step + 1} / 6
              </span>
            </CardTitle>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${((step + 1) / 6) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {renderStep()}

              <div className="flex justify-between mt-8 pt-6 border-t">
                {step > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    data-testid="button-prev-step"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Précédent
                  </Button>
                )}
                {step < 5 ? (
                  <Button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="ml-auto"
                    data-testid="button-next-step"
                  >
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="ml-auto"
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        Soumettre ma demande
                        <CheckCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    </Layout>
  );
}
