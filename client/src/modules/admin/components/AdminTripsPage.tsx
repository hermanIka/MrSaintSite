import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Plus, Pencil, Trash2, Loader2, Upload, Image as ImageIcon, Star } from "lucide-react";
import type { Trip } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface TripFormData {
  title: string;
  destination: string;
  date: string;
  price: number;
  description: string;
  imageUrl: string;
  itinerary: string[];
  included: string[];
  notIncluded: string[];
  isFeatured: boolean;
}

const emptyFormData: TripFormData = {
  title: "",
  destination: "",
  date: "",
  price: 0,
  description: "",
  imageUrl: "",
  itinerary: [""],
  included: [""],
  notIncluded: [""],
  isFeatured: false,
};

export function AdminTripsPage() {
  const { getAuthHeaders } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<TripFormData>(emptyFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: trips, isLoading } = useQuery<Trip[]>({
    queryKey: ["/api/admin/trips"],
    queryFn: async () => {
      const res = await fetch("/api/admin/trips", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TripFormData) => {
      const res = await fetch("/api/admin/trips", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de création");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Voyage créé avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TripFormData }) => {
      const res = await fetch(`/api/admin/trips/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Voyage modifié avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/trips/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Voyage supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingTrip(null);
    setFormData(emptyFormData);
    setImagePreview(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Veuillez sélectionner une image", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "L'image ne doit pas dépasser 5 Mo", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const urlRes = await fetch("/api/admin/upload/request-url", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!urlRes.ok) {
        throw new Error("Erreur lors de la demande d'upload");
      }

      const { uploadURL, objectPath } = await urlRes.json();

      const uploadRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      setFormData((p) => ({ ...p, imageUrl: objectPath }));
      setImagePreview(URL.createObjectURL(file));
      toast({ title: "Image uploadée avec succès" });
    } catch (error) {
      toast({ title: "Erreur lors de l'upload de l'image", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, isFeatured }: { id: string; isFeatured: boolean }) => {
      const res = await fetch(`/api/admin/trips/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      });
      if (!res.ok) throw new Error("Erreur de modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/trips/featured"] });
      toast({ title: "Statut mis à jour" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la mise à jour", variant: "destructive" });
    },
  });

  const openEditDialog = (trip: Trip) => {
    setEditingTrip(trip);
    setFormData({
      title: trip.title,
      destination: trip.destination,
      date: trip.date,
      price: trip.price,
      description: trip.description,
      imageUrl: trip.imageUrl,
      itinerary: trip.itinerary.length > 0 ? trip.itinerary : [""],
      included: trip.included.length > 0 ? trip.included : [""],
      notIncluded: trip.notIncluded.length > 0 ? trip.notIncluded : [""],
      isFeatured: trip.isFeatured,
    });
    setImagePreview(trip.imageUrl);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      itinerary: formData.itinerary.filter((i) => i.trim() !== ""),
      included: formData.included.filter((i) => i.trim() !== ""),
      notIncluded: formData.notIncluded.filter((i) => i.trim() !== ""),
    };

    if (editingTrip) {
      updateMutation.mutate({ id: editingTrip.id, data: cleanedData });
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const addArrayItem = (field: "itinerary" | "included" | "notIncluded") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const updateArrayItem = (field: "itinerary" | "included" | "notIncluded", index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const removeArrayItem = (field: "itinerary" | "included" | "notIncluded", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Gestion des Voyages">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-trip" onClick={() => { setEditingTrip(null); setFormData(emptyFormData); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un voyage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTrip ? "Modifier le voyage" : "Nouveau voyage"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input id="title" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} required data-testid="input-trip-title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="destination">Destination</Label>
                    <Input id="destination" value={formData.destination} onChange={(e) => setFormData((p) => ({ ...p, destination: e.target.value }))} required data-testid="input-trip-destination" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" value={formData.date} onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))} placeholder="15-25 Mars 2025" required data-testid="input-trip-date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Prix (€)</Label>
                    <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))} required data-testid="input-trip-price" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Image du voyage</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    data-testid="input-trip-image-file"
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      data-testid="button-upload-image"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isUploading ? "Upload en cours..." : "Choisir une image"}
                    </Button>
                    {(imagePreview || formData.imageUrl) && (
                      <div className="flex items-center gap-2">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Aperçu"
                          className="w-16 h-16 object-cover rounded border"
                          data-testid="img-trip-preview"
                        />
                        <span className="text-sm text-muted-foreground">Image sélectionnée</span>
                      </div>
                    )}
                    {!imagePreview && !formData.imageUrl && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Aucune image</span>
                      </div>
                    )}
                  </div>
                  {formData.imageUrl && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Chemin: {formData.imageUrl}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} required data-testid="input-trip-description" />
                </div>

                <div className="space-y-2">
                  <Label>Itinéraire</Label>
                  {formData.itinerary.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateArrayItem("itinerary", idx, e.target.value)} placeholder={`Jour ${idx + 1}`} data-testid={`input-itinerary-${idx}`} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("itinerary", idx)} data-testid={`button-remove-itinerary-${idx}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("itinerary")} data-testid="button-add-itinerary">
                    <Plus className="w-4 h-4 mr-1" /> Ajouter un jour
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Inclus</Label>
                  {formData.included.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateArrayItem("included", idx, e.target.value)} data-testid={`input-included-${idx}`} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("included", idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("included")} data-testid="button-add-included">
                    <Plus className="w-4 h-4 mr-1" /> Ajouter
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Non inclus</Label>
                  {formData.notIncluded.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input value={item} onChange={(e) => updateArrayItem("notIncluded", idx, e.target.value)} data-testid={`input-not-included-${idx}`} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeArrayItem("notIncluded", idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => addArrayItem("notIncluded")} data-testid="button-add-not-included">
                    <Plus className="w-4 h-4 mr-1" /> Ajouter
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-primary" />
                    <div>
                      <Label htmlFor="isFeatured" className="font-medium">Voyage Phare</Label>
                      <p className="text-sm text-muted-foreground">Ce voyage apparaîtra dans le carrousel sur la page d'accueil</p>
                    </div>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData((p) => ({ ...p, isFeatured: checked }))}
                    data-testid="switch-featured"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
                  <Button type="submit" disabled={isPending} data-testid="button-save-trip">
                    {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingTrip ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Chargement...</div>
        ) : trips && trips.length > 0 ? (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <Card key={trip.id} data-testid={`card-trip-${trip.id}`} className={trip.isFeatured ? "border-primary/50 bg-primary/5" : ""}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className="relative">
                    <img src={trip.imageUrl} alt={trip.title} className="w-20 h-20 object-cover rounded" />
                    {trip.isFeatured && (
                      <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Star className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{trip.title}</h3>
                      {trip.isFeatured && (
                        <Badge variant="default" className="text-xs">
                          Phare
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{trip.destination} • {trip.date}</p>
                    <p className="text-primary font-bold">{trip.price}€</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:inline">Phare</span>
                      <Switch
                        checked={trip.isFeatured}
                        onCheckedChange={(checked) => toggleFeaturedMutation.mutate({ id: trip.id, isFeatured: checked })}
                        disabled={toggleFeaturedMutation.isPending}
                        data-testid={`switch-featured-${trip.id}`}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(trip)} data-testid={`button-edit-trip-${trip.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(trip.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-trip-${trip.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">Aucun voyage</div>
        )}
      </div>
    </AdminLayout>
  );
}
