import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Portfolio } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  businessName: string;
  category: string;
  imageUrl: string;
}

const emptyFormData: FormData = {
  businessName: "",
  category: "",
  imageUrl: "",
};

export function AdminPortfolioPage() {
  const { getAuthHeaders } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Portfolio | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);

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
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de création");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Portfolio créé avec succès" });
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
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/portfolio"] });
      toast({ title: "Portfolio modifié avec succès" });
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
      toast({ title: "Portfolio supprimé" });
    },
    onError: () => {
      toast({ title: "Erreur lors de la suppression", variant: "destructive" });
    },
  });

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditing(null);
    setFormData(emptyFormData);
  };

  const openEditDialog = (item: Portfolio) => {
    setEditing(item);
    setFormData({
      businessName: item.businessName,
      category: item.category,
      imageUrl: item.imageUrl,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout title="Gestion du Portfolio">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-portfolio" onClick={() => { setEditing(null); setFormData(emptyFormData); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un cas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le cas" : "Nouveau cas"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Nom de l'entreprise</Label>
                  <Input id="businessName" value={formData.businessName} onChange={(e) => setFormData((p) => ({ ...p, businessName: e.target.value }))} required data-testid="input-portfolio-name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input id="category" value={formData.category} onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))} placeholder="Agence de voyage, Facilitation visa..." required data-testid="input-portfolio-category" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL de l'image</Label>
                  <Input id="imageUrl" value={formData.imageUrl} onChange={(e) => setFormData((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://..." required data-testid="input-portfolio-image" />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
                  <Button type="submit" disabled={isPending} data-testid="button-save-portfolio">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((item) => (
              <Card key={item.id} data-testid={`card-portfolio-${item.id}`}>
                <CardContent className="p-4">
                  <img src={item.imageUrl} alt={item.businessName} className="w-full h-32 object-cover rounded mb-3" />
                  <h3 className="font-semibold">{item.businessName}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="icon" onClick={() => openEditDialog(item)} data-testid={`button-edit-portfolio-${item.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-portfolio-${item.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">Aucun cas dans le portfolio</div>
        )}
      </div>
    </AdminLayout>
  );
}
