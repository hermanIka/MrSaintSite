import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { queryClient } from "@/lib/queryClient";
import { Save, Info, DollarSign } from "lucide-react";

interface ServicePrice {
  key: string;
  label: string;
  amount: number;
}

const PRICE_LABELS: Record<string, string> = {
  visa: "Facilitation Visa",
  consultation: "Consultation voyage",
  agence_classique: "Pack Agence Classique",
  agence_premium: "Pack Agence Premium",
  agence_elite: "Pack Agence Elite",
};

export function AdminPricesPage() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminAuth();
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const { data: prices, isLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/prices"],
  });

  const handleChange = (key: string, value: string) => {
    setEditValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (key: string) => {
    const raw = editValues[key];
    const amount = parseInt(raw, 10);
    if (isNaN(amount) || amount < 0) {
      toast({ title: "Montant invalide", description: "Veuillez saisir un nombre entier positif.", variant: "destructive" });
      return;
    }
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch(`/api/admin/prices/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ amount }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      await queryClient.invalidateQueries({ queryKey: ["/api/prices"] });
      setEditValues(prev => { const next = { ...prev }; delete next[key]; return next; });
      toast({ title: "Tarif mis à jour", description: `${PRICE_LABELS[key] ?? key} : ${amount}€` });
    } catch {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le tarif.", variant: "destructive" });
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const priceKeys = prices ? Object.keys(prices) : Object.keys(PRICE_LABELS);
  const displayKeys = priceKeys.filter(k => PRICE_LABELS[k]);

  return (
    <AdminLayout title="Tarifs des services">
      <div className="space-y-6 max-w-2xl">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex gap-3 items-start">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Ces tarifs s'affichent sur toutes les pages du site en temps réel. Les plans GO+ (Classique, Premium, Gold) sont modifiables dans la section <strong className="text-foreground">Cartes GO+</strong>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <DollarSign className="w-5 h-5 text-primary" />
              Tarifs des services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-14 rounded-md bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              displayKeys.map(key => {
                const currentAmount = prices?.[key] ?? 0;
                const editVal = editValues[key];
                const displayVal = editVal !== undefined ? editVal : String(currentAmount);
                const isDirty = editVal !== undefined && editVal !== String(currentAmount);

                return (
                  <div key={key} className="flex items-center gap-3" data-testid={`row-price-${key}`}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground" data-testid={`text-label-${key}`}>
                        {PRICE_LABELS[key]}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="relative w-28">
                        <Input
                          data-testid={`input-price-${key}`}
                          type="number"
                          min="0"
                          value={displayVal}
                          onChange={e => handleChange(key, e.target.value)}
                          className="pr-8 text-right"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">€</span>
                      </div>
                      <Button
                        data-testid={`button-save-${key}`}
                        size="sm"
                        disabled={!isDirty || saving[key]}
                        onClick={() => handleSave(key)}
                      >
                        <Save className="w-4 h-4 mr-1" />
                        {saving[key] ? "..." : "Sauvegarder"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
