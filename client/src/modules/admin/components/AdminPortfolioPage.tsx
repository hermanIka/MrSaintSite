import { useState, useRef } from "react";
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
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Upload, Image as ImageIcon } from "lucide-react";
import type { Portfolio } from "@shared/schema";
import { SERVICE_TYPES } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  businessName: string;
  description: string;
  serviceType: string;
  category: string;
  result: string;
  year: string;
  imageUrl: string;
  clientLogo: string;
  status: string;
}

const emptyFormData: FormData = {
  businessName: "",
  description: "",
  serviceType: "agence",
  category: "",
  result: "",
  year: new Date().getFullYear().toString(),
  imageUrl: "",
  clientLogo: "",
  status: "published",
};

export function AdminPortfolioPage() {
  const { getAuthHeaders } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  
  // Upload states
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (
    file: File,
    setUploading: (v: boolean) => void,
    setPreview: (v: string | null) => void,
    fieldName: "imageUrl" | "clientLogo"
  ) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast({ title: "Fichier trop volumineux (max 5 Mo)", variant: "destructive" });
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Seules les images sont acceptées", variant: "destructive" });
      return;
    }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const response = await fetch("/api/admin/upload/request-url", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la demande d'upload");
      }

      const { uploadURL, objectPath } = await response.json();

      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload du fichier");
      }

      setFormData((p) => ({ ...p, [fieldName]: objectPath }));
      toast({ title: "Image uploadée avec succès" });
    } catch (error) {
      toast({ title: error instanceof Error ? error.message : "Erreur d'upload", variant: "destructive" });
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, setIsUploadingImage, setImagePreview, "imageUrl");
    }
  };

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file, setIsUploadingLogo, setLogoPreview, "clientLogo");
    }
  };

  const { data: portfolio, isLoading } = useQuery<Portfolio[]>({
    queryKey: ["/api/admin/portfolio"],
    queryFn: async () => {
      const res = await fetch("/api/admin/portfolio", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/admin/portfolio", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clientLogo: data.clientLogo || null,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("Erreur de création");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Projet créé avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          clientLogo: data.clientLogo || null,
        }),
      });
      if (!res.ok) throw new Error("Erreur de modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Projet modifié avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Projet supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const res = await fetch(`/api/admin/portfolio/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Erreur de modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({ title: "Statut modifié" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setFormData(emptyFormData);
    setImagePreview(null);
    setLogoPreview(null);
  };

  const openEditDialog = (item: Portfolio) => {
    setEditing(item);
    setFormData({
      businessName: item.businessName,
      description: item.description,
      serviceType: item.serviceType,
      category: item.category,
      result: item.result,
      year: item.year,
      imageUrl: item.imageUrl,
      clientLogo: item.clientLogo || "",
      status: item.status,
    });
    setImagePreview(null);
    setLogoPreview(null);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage || isUploadingLogo) {
      toast({ title: "Veuillez attendre la fin de l'upload", variant: "destructive" });
      return;
    }
    if (!formData.imageUrl) {
      toast({ title: "Une image est requise", variant: "destructive" });
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const isUploading = isUploadingImage || isUploadingLogo;

  const getServiceLabel = (value: string) => {
    return SERVICE_TYPES.find(t => t.value === value)?.label || value;
  };

  return (
    <AdminLayout title="Gestion du Portfolio">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {portfolio?.length || 0} projet(s) • {portfolio?.filter(p => p.status === "published").length || 0} publié(s)
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-portfolio" onClick={() => { setEditing(null); setFormData(emptyFormData); }}>
                <Plus className="w-4 h-4 mr-2" />
                Nouveau projet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le projet" : "Nouveau projet client"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nom du client / projet *</Label>
                    <Input 
                      id="businessName" 
                      value={formData.businessName} 
                      onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))} 
                      required 
                      data-testid="input-portfolio-name" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Année / Période *</Label>
                    <Input 
                      id="year" 
                      value={formData.year} 
                      onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))} 
                      placeholder="2024" 
                      required 
                      data-testid="input-portfolio-year" 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Type de service *</Label>
                    <Select 
                      value={formData.serviceType} 
                      onValueChange={(value) => setFormData((p) => ({ ...p, serviceType: value }))}
                    >
                      <SelectTrigger data-testid="select-portfolio-service">
                        <SelectValue placeholder="Sélectionner un service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie client</Label>
                    <Input 
                      id="category" 
                      value={formData.category} 
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} 
                      placeholder="Agence de voyage, Entrepreneur..." 
                      required 
                      data-testid="input-portfolio-category" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description de l'accompagnement *</Label>
                  <Textarea 
                    id="description" 
                    value={formData.description} 
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} 
                    placeholder="Décrivez l'accompagnement réalisé..." 
                    className="min-h-[100px]"
                    required 
                    data-testid="input-portfolio-description" 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="result">Résultat obtenu *</Label>
                  <Textarea 
                    id="result" 
                    value={formData.result} 
                    onChange={(e) => setFormData((p) => ({ ...p, result: e.target.value }))} 
                    placeholder="Résultats concrets, chiffres clés..." 
                    className="min-h-[80px]"
                    required 
                    data-testid="input-portfolio-result" 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Image du projet *</Label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    data-testid="input-portfolio-image-file"
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploadingImage}
                      data-testid="button-upload-portfolio-image"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isUploadingImage ? "Upload en cours..." : "Choisir une image"}
                    </Button>
                    {(imagePreview || formData.imageUrl) && (
                      <div className="flex items-center gap-2">
                        <img
                          src={imagePreview || formData.imageUrl}
                          alt="Aperçu"
                          className="w-16 h-16 object-cover rounded border"
                          data-testid="img-portfolio-preview"
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
                </div>

                <div className="space-y-2">
                  <Label>Logo client (optionnel)</Label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                    data-testid="input-portfolio-logo-file"
                  />
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      data-testid="button-upload-portfolio-logo"
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {isUploadingLogo ? "Upload en cours..." : "Choisir un logo"}
                    </Button>
                    {(logoPreview || formData.clientLogo) && (
                      <div className="flex items-center gap-2">
                        <img
                          src={logoPreview || formData.clientLogo}
                          alt="Logo"
                          className="w-12 h-12 object-contain rounded border"
                          data-testid="img-portfolio-logo-preview"
                        />
                        <span className="text-sm text-muted-foreground">Logo sélectionné</span>
                      </div>
                    )}
                    {!logoPreview && !formData.clientLogo && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Aucun logo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Statut de publication</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData((p) => ({ ...p, status: value }))}
                  >
                    <SelectTrigger data-testid="select-portfolio-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="draft">Brouillon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
                  <Button type="submit" disabled={isPending || isUploading} data-testid="button-save-portfolio">
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
        ) : portfolio && portfolio.length > 0 ? (
          <div className="grid gap-4">
            {portfolio.map((item) => (
              <Card key={item.id} data-testid={`card-portfolio-${item.id}`} className={item.status === "draft" ? "opacity-60" : ""}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <img 
                      src={item.imageUrl} 
                      alt={item.businessName} 
                      className="w-24 h-24 object-cover rounded flex-shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg">{item.businessName}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge variant="outline">{getServiceLabel(item.serviceType)}</Badge>
                            <Badge variant="secondary">{item.category}</Badge>
                            <Badge variant="outline">{item.year}</Badge>
                            {item.status === "draft" && (
                              <Badge variant="destructive">Brouillon</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 flex-shrink-0">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => toggleStatusMutation.mutate({ id: item.id, currentStatus: item.status })}
                            disabled={toggleStatusMutation.isPending}
                            title={item.status === "published" ? "Dépublier" : "Publier"}
                            data-testid={`button-toggle-portfolio-${item.id}`}
                          >
                            {item.status === "published" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => openEditDialog(item)} 
                            data-testid={`button-edit-portfolio-${item.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => deleteMutation.mutate(item.id)} 
                            disabled={deleteMutation.isPending} 
                            data-testid={`button-delete-portfolio-${item.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
                      <p className="text-sm font-medium text-primary mt-2">{item.result}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">Aucun projet dans le portfolio</div>
        )}
      </div>
    </AdminLayout>
  );
}
