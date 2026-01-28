import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import type { Faq } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface FormData {
  question: string;
  answer: string;
  category: string;
  order: number;
}

const emptyFormData: FormData = {
  question: "",
  answer: "",
  category: "general",
  order: 0,
};

const categories = [
  { value: "visa", label: "Visa" },
  { value: "voyages", label: "Voyages" },
  { value: "formation", label: "Formation" },
  { value: "paiement", label: "Paiement" },
  { value: "reservation", label: "Réservation" },
  { value: "general", label: "Général" },
];

export function AdminFaqPage() {
  const { getAuthHeaders } = useAdminAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const { data: faqs, isLoading } = useQuery<Faq[]>({
    queryKey: ["/api/admin/faqs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/faqs", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de création");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "FAQ créée avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la création", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de modification");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      toast({ title: "FAQ modifiée avec succès" });
      closeDialog();
    },
    onError: () => {
      toast({ title: "Erreur lors de la modification", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/faqs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "FAQ supprimée" });
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

  const openEditDialog = (item: Faq) => {
    setEditing(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category,
      order: item.order,
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

  const getCategoryLabel = (value: string) => {
    return categories.find((c) => c.value === value)?.label || value;
  };

  return (
    <AdminLayout title="Gestion de la FAQ">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-faq" onClick={() => { setEditing(null); setFormData(emptyFormData); }}>
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier la question" : "Nouvelle question"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input id="question" value={formData.question} onChange={(e) => setFormData((p) => ({ ...p, question: e.target.value }))} required data-testid="input-faq-question" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Réponse</Label>
                  <Textarea id="answer" value={formData.answer} onChange={(e) => setFormData((p) => ({ ...p, answer: e.target.value }))} rows={4} required data-testid="input-faq-answer" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Catégorie</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData((p) => ({ ...p, category: value }))}>
                      <SelectTrigger data-testid="select-faq-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="order">Ordre</Label>
                    <Input id="order" type="number" value={formData.order} onChange={(e) => setFormData((p) => ({ ...p, order: Number(e.target.value) }))} data-testid="input-faq-order" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={closeDialog}>Annuler</Button>
                  <Button type="submit" disabled={isPending} data-testid="button-save-faq">
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
        ) : faqs && faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map((item) => (
              <Card key={item.id} data-testid={`card-faq-${item.id}`}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                          {getCategoryLabel(item.category)}
                        </span>
                        <span className="text-xs text-muted-foreground">#{item.order}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{item.question}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.answer}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => openEditDialog(item)} data-testid={`button-edit-faq-${item.id}`}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => deleteMutation.mutate(item.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-faq-${item.id}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">Aucune question dans la FAQ</div>
        )}
      </div>
    </AdminLayout>
  );
}
