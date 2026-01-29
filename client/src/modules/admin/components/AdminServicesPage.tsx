import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Euro } from "lucide-react";
import type { Service } from "@shared/schema";
import { SERVICE_CATEGORIES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  priceLabel: string;
  priceUnit: string;
  category: string;
  features: string[];
  imageUrl: string;
  iconName: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  status: string;
}

const emptyFormData: FormData = {
  name: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  price: 0,
  priceLabel: "À partir de",
  priceUnit: "",
  category: "visa",
  features: [],
  imageUrl: "",
  iconName: "FileText",
  ctaText: "En savoir plus",
  ctaLink: "/contact",
  order: 0,
  status: "published",
};

const iconOptions = [
  { value: "FileText", label: "Document (Visa)" },
  { value: "Briefcase", label: "Mallette (Business)" },
  { value: "GraduationCap", label: "Formation" },
  { value: "Plane", label: "Avion (Voyage)" },
  { value: "MessageCircle", label: "Message (Consultation)" },
  { value: "Users", label: "Groupe" },
  { value: "Star", label: "Étoile" },
  { value: "Trophy", label: "Trophée" },
];

const priceLabelOptions = [
  { value: "À partir de", label: "À partir de" },
  { value: "Programme complet :", label: "Programme complet" },
  { value: "", label: "Prix fixe (pas de label)" },
];

export function AdminServicesPage() {
  const { getAuthHeaders } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [featuresText, setFeaturesText] = useState("");

  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ["/api/admin/services"],
    queryFn: async () => {
      const res = await fetch("/api/admin/services", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          priceUnit: data.priceUnit || null,
          imageUrl: data.imageUrl || null,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Erreur de création");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Service créé avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          priceUnit: data.priceUnit || null,
          imageUrl: data.imageUrl || null,
        }),
      });
      if (!res.ok) throw new Error("Erreur de modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Service modifié avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Service supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const newStatus = status === "published" ? "draft" : "published";
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
      toast({ title: "Statut mis à jour" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setFormData(emptyFormData);
    setFeaturesText("");
  };

  const openEditDialog = (item: Service) => {
    setEditing(item);
    setFormData({
      name: item.name,
      slug: item.slug,
      shortDescription: item.shortDescription,
      fullDescription: item.fullDescription,
      price: item.price,
      priceLabel: item.priceLabel,
      priceUnit: item.priceUnit || "",
      category: item.category,
      features: item.features,
      imageUrl: item.imageUrl || "",
      iconName: item.iconName,
      ctaText: item.ctaText,
      ctaLink: item.ctaLink,
      order: item.order,
      status: item.status,
    });
    setFeaturesText(item.features.join("\n"));
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const features = featuresText.split("\n").map(f => f.trim()).filter(f => f.length > 0);
    const submitData = { ...formData, features };
    
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const getCategoryLabel = (value: string) => {
    return SERVICE_CATEGORIES.find((c) => c.value === value)?.label || value;
  };

  const formatPrice = (service: Service) => {
    const parts = [];
    if (service.priceLabel) parts.push(service.priceLabel);
    parts.push(`${service.price}€`);
    if (service.priceUnit) parts.push(service.priceUnit);
    return parts.join(" ");
  };

  return (
    <AdminLayout title="Gestion des Services & Prix">
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <p className="text-muted-foreground">
            Gérez tous vos services et leurs prix. Les modifications sont visibles immédiatement sur le site.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-service" onClick={() => { setEditing(null); setFormData(emptyFormData); setFeaturesText(""); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le service" : "Nouveau service"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du service</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} 
                      required 
                      data-testid="input-service-name"
                      placeholder="Facilitation Visa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Identifiant unique (slug)</Label>
                    <Input 
                      id="slug" 
                      value={formData.slug} 
                      onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} 
                      required 
                      data-testid="input-service-slug"
                      placeholder="visa"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Description courte</Label>
                  <Input 
                    id="shortDescription" 
                    value={formData.shortDescription} 
                    onChange={(e) => setFormData((p) => ({ ...p, shortDescription: e.target.value }))} 
                    required 
                    data-testid="input-service-short-desc"
                    placeholder="Obtenez votre visa sans stress"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Description complète</Label>
                  <Textarea 
                    id="fullDescription" 
                    value={formData.fullDescription} 
                    onChange={(e) => setFormData((p) => ({ ...p, fullDescription: e.target.value }))} 
                    rows={3} 
                    required 
                    data-testid="input-service-full-desc"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (€)</Label>
                    <div className="relative">
                      <Euro className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        id="price" 
                        type="number" 
                        value={formData.price} 
                        onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))} 
                        required 
                        data-testid="input-service-price"
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceLabel">Préfixe prix</Label>
                    <Select value={formData.priceLabel} onValueChange={(value) => setFormData((p) => ({ ...p, priceLabel: value }))}>
                      <SelectTrigger data-testid="select-service-price-label">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priceLabelOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value || "fixed"}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priceUnit">Unité (optionnel)</Label>
                    <Input 
                      id="priceUnit" 
                      value={formData.priceUnit} 
                      onChange={(e) => setFormData((p) => ({ ...p, priceUnit: e.target.value }))} 
                      data-testid="input-service-price-unit"
                      placeholder="/ session"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData((p) => ({ ...p, category: value }))}>
                      <SelectTrigger data-testid="select-service-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iconName">Icône</Label>
                    <Select value={formData.iconName} onValueChange={(value) => setFormData((p) => ({ ...p, iconName: value }))}>
                      <SelectTrigger data-testid="select-service-icon">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="features">Avantages (un par ligne)</Label>
                  <Textarea 
                    id="features" 
                    value={featuresText} 
                    onChange={(e) => setFeaturesText(e.target.value)} 
                    rows={4} 
                    data-testid="input-service-features"
                    placeholder="Analyse de votre dossier personnalisé&#10;Constitution des documents requis&#10;Suivi de votre demande en temps réel"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Texte du bouton</Label>
                    <Input 
                      id="ctaText" 
                      value={formData.ctaText} 
                      onChange={(e) => setFormData((p) => ({ ...p, ctaText: e.target.value }))} 
                      required 
                      data-testid="input-service-cta-text"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">Lien du bouton</Label>
                    <Input 
                      id="ctaLink" 
                      value={formData.ctaLink} 
                      onChange={(e) => setFormData((p) => ({ ...p, ctaLink: e.target.value }))} 
                      required 
                      data-testid="input-service-cta-link"
                      placeholder="/contact"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order">Ordre d'affichage</Label>
                    <Input 
                      id="order" 
                      type="number" 
                      value={formData.order} 
                      onChange={(e) => setFormData((p) => ({ ...p, order: Number(e.target.value) }))} 
                      data-testid="input-service-order"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Statut</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData((p) => ({ ...p, status: value }))}>
                      <SelectTrigger data-testid="select-service-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Publié</SelectItem>
                        <SelectItem value="draft">Brouillon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
                  <Button type="submit" disabled={isPending} data-testid="button-save-service">
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editing ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Chargement...</div>
        ) : services && services.length > 0 ? (
          <div className="space-y-3">
            {services.map((item) => (
              <Card key={item.id} data-testid={`card-service-${item.id}`} className={item.status === "draft" ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <Badge variant={item.status === "published" ? "default" : "secondary"}>
                          {item.status === "published" ? "Publié" : "Brouillon"}
                        </Badge>
                        <Badge variant="outline">
                          {getCategoryLabel(item.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">#{item.order}</span>
                      </div>
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{item.shortDescription}</p>
                      <div className="flex items-center gap-2">
                        <Euro className="w-4 h-4 text-primary" />
                        <span className="text-lg font-bold text-primary">{formatPrice(item)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => toggleStatusMutation.mutate({ id: item.id, status: item.status })}
                        title={item.status === "published" ? "Masquer" : "Publier"}
                        data-testid={`button-toggle-service-${item.id}`}
                      >
                        {item.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(item)} data-testid={`button-edit-service-${item.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-service-${item.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Aucun service configuré</p>
              <p className="text-sm text-muted-foreground">Ajoutez vos services pour qu'ils apparaissent sur le site avec leurs prix.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
