import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CreditCard, Receipt, ShieldOff, Star, Settings, CheckCircle, Save } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";

interface GoPlusCard {
  id: string;
  userId: string;
  planId: string;
  cardNumber: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface GoPlusTransaction {
  id: string;
  userId: string;
  planId: string;
  provider: string;
  providerPaymentId: string | null;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

interface GoPlusPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  discountPercentage: number;
  privileges: string[];
  durationDays: number;
  isActive: boolean;
}

export function AdminGoPlusPage() {
  const { getAuthHeaders } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"cards" | "transactions" | "plans">("cards");
  const [editingPlan, setEditingPlan] = useState<Record<string, Partial<GoPlusPlan & { privilegesText: string }>>>({});

  const { data: cardsData, isLoading: cardsLoading } = useQuery<{ cards: GoPlusCard[] }>({
    queryKey: ["/api/admin/go-plus/cards"],
    queryFn: async () => {
      const res = await fetch("/api/admin/go-plus/cards", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const { data: txData, isLoading: txLoading } = useQuery<{ transactions: GoPlusTransaction[] }>({
    queryKey: ["/api/admin/go-plus/transactions"],
    queryFn: async () => {
      const res = await fetch("/api/admin/go-plus/transactions", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const { data: plansData, isLoading: plansLoading } = useQuery<{ plans: GoPlusPlan[] }>({
    queryKey: ["/api/admin/go-plus/plans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/go-plus/plans", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
  });

  const suspendMutation = useMutation({
    mutationFn: async (cardId: string) => {
      const res = await fetch(`/api/admin/go-plus/cards/${cardId}/suspend`, {
        method: "PUT",
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Carte suspendue", description: "La carte GO+ a été suspendue." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/go-plus/cards"] });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de suspendre la carte.", variant: "destructive" });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<GoPlusPlan> }) => {
      const res = await fetch(`/api/admin/go-plus/plans/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur");
      return res.json();
    },
    onSuccess: (_, { id }) => {
      toast({ title: "Plan mis à jour", description: "Le plan GO+ a été enregistré." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/go-plus/plans"] });
      setEditingPlan(prev => { const n = { ...prev }; delete n[id]; return n; });
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le plan.", variant: "destructive" });
    },
  });

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: { label: "Active", className: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30" },
      expired: { label: "Expirée", className: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30" },
      suspended: { label: "Suspendue", className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
      pending: { label: "En attente", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
      paid: { label: "Payée", className: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30" },
      failed: { label: "Échouée", className: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30" },
    };
    const s = map[status] || { label: status, className: "" };
    return <Badge className={s.className}>{s.label}</Badge>;
  };

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("fr-FR") : "-";
  const formatAmount = (a: number) => (a / 100).toFixed(2) + " €";

  const cards = cardsData?.cards || [];
  const transactions = txData?.transactions || [];
  const plans = plansData?.plans || [];
  const activeCards = cards.filter(c => c.status === "active").length;
  const paidTx = transactions.filter(t => t.status === "paid").length;

  function initEdit(plan: GoPlusPlan) {
    setEditingPlan(prev => ({
      ...prev,
      [plan.id]: {
        name: plan.name,
        description: plan.description,
        price: plan.price,
        discountPercentage: plan.discountPercentage,
        privilegesText: (plan.privileges || []).join("\n"),
      },
    }));
  }

  function updateField(planId: string, field: string, value: string | number) {
    setEditingPlan(prev => ({
      ...prev,
      [planId]: { ...prev[planId], [field]: value },
    }));
  }

  function savePlan(plan: GoPlusPlan) {
    const edits = editingPlan[plan.id];
    if (!edits) return;
    const privileges = (edits.privilegesText || "")
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);
    updatePlanMutation.mutate({
      id: plan.id,
      data: {
        name: edits.name || plan.name,
        description: edits.description || plan.description,
        price: Math.round(Number(edits.price || plan.price) * 100),
        discountPercentage: Number(edits.discountPercentage || plan.discountPercentage),
        privileges,
      },
    });
  }

  const planColors: Record<string, string> = {
    Classique: "bg-blue-500/10 border-blue-500/30",
    Premium: "bg-purple-500/10 border-purple-500/30",
    Gold: "bg-yellow-500/10 border-yellow-500/30",
  };

  return (
    <AdminLayout title="Gestion GO+">
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Cartes actives</p>
                  <p className="text-2xl font-bold">{activeCards}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Transactions payées</p>
                  <p className="text-2xl font-bold">{paidTx}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-xs text-muted-foreground">Total cartes</p>
                  <p className="text-2xl font-bold">{cards.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Total transactions</p>
                  <p className="text-2xl font-bold">{transactions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button data-testid="tab-cards" variant={activeTab === "cards" ? "default" : "outline"} size="default" onClick={() => setActiveTab("cards")}>
            <CreditCard className="w-4 h-4 mr-2" /> Cartes
          </Button>
          <Button data-testid="tab-transactions" variant={activeTab === "transactions" ? "default" : "outline"} size="default" onClick={() => setActiveTab("transactions")}>
            <Receipt className="w-4 h-4 mr-2" /> Transactions
          </Button>
          <Button data-testid="tab-plans" variant={activeTab === "plans" ? "default" : "outline"} size="default" onClick={() => setActiveTab("plans")}>
            <Settings className="w-4 h-4 mr-2" /> Plans & Tarifs
          </Button>
        </div>

        {activeTab === "cards" && (
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Cartes GO+</CardTitle></CardHeader>
            <CardContent>
              {cardsLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : cards.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Aucune carte GO+ pour l'instant.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Utilisateur</th>
                        <th className="pb-3 font-medium">N° Carte</th>
                        <th className="pb-3 font-medium">Statut</th>
                        <th className="pb-3 font-medium">Expiration</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cards.map((card) => (
                        <tr key={card.id} data-testid={`row-card-${card.id}`}>
                          <td className="py-3 font-medium">{card.userId}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{card.cardNumber.slice(0, 18)}…</td>
                          <td className="py-3">{statusBadge(card.status)}</td>
                          <td className="py-3 text-muted-foreground">{formatDate(card.endDate)}</td>
                          <td className="py-3">
                            {card.status === "active" && (
                              <Button data-testid={`button-suspend-${card.id}`} size="sm" variant="outline"
                                onClick={() => suspendMutation.mutate(card.id)} disabled={suspendMutation.isPending}>
                                <ShieldOff className="w-3 h-3 mr-1" /> Suspendre
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "transactions" && (
          <Card>
            <CardHeader><CardTitle className="text-base font-semibold">Transactions GO+</CardTitle></CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">Aucune transaction GO+ pour l'instant.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Utilisateur</th>
                        <th className="pb-3 font-medium">Provider</th>
                        <th className="pb-3 font-medium">Montant</th>
                        <th className="pb-3 font-medium">Statut</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {transactions.map((tx) => (
                        <tr key={tx.id} data-testid={`row-transaction-${tx.id}`}>
                          <td className="py-3 font-medium">{tx.userId}</td>
                          <td className="py-3 capitalize text-muted-foreground">{tx.provider}</td>
                          <td className="py-3 font-medium">{formatAmount(tx.amount)}</td>
                          <td className="py-3">{statusBadge(tx.status)}</td>
                          <td className="py-3 text-muted-foreground">{formatDate(tx.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "plans" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Modifiez les tarifs, réductions et avantages de chaque carte GO+. Les modifications sont appliquées immédiatement pour les nouveaux achats.
            </p>
            {plansLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : plans.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">Aucun plan GO+ trouvé.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                  const isEditing = !!editingPlan[plan.id];
                  const edits = editingPlan[plan.id] || {};
                  const colorClass = planColors[plan.name] || "bg-muted/40 border-border";
                  return (
                    <Card key={plan.id} data-testid={`card-plan-${plan.id}`} className={`border-2 ${colorClass}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <CardTitle className="text-base font-heading">GO+ {plan.name}</CardTitle>
                          <Badge className="bg-primary/10 text-primary border-primary/20">
                            {plan.price}€ / an
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{plan.description}</p>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!isEditing ? (
                          <>
                            <div className="space-y-1.5">
                              <p className="text-xs text-muted-foreground font-medium">Avantages actuels</p>
                              <ul className="space-y-1">
                                {(plan.privileges || []).map((p, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                                    <CheckCircle className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                                    {p}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-border/50">
                              <div className="text-sm">
                                <span className="text-muted-foreground">Réduction principale : </span>
                                <span className="font-semibold text-primary">-{plan.discountPercentage}%</span>
                              </div>
                            </div>
                            <Button
                              data-testid={`button-edit-plan-${plan.id}`}
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => initEdit(plan)}
                            >
                              <Settings className="w-3.5 h-3.5 mr-1.5" /> Modifier ce plan
                            </Button>
                          </>
                        ) : (
                          <div className="space-y-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Nom du plan</Label>
                              <Input
                                data-testid={`input-plan-name-${plan.id}`}
                                value={edits.name || ""}
                                onChange={e => updateField(plan.id, "name", e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Description courte</Label>
                              <Input
                                data-testid={`input-plan-desc-${plan.id}`}
                                value={edits.description || ""}
                                onChange={e => updateField(plan.id, "description", e.target.value)}
                                className="h-8 text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Prix (€/an)</Label>
                                <Input
                                  data-testid={`input-plan-price-${plan.id}`}
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={edits.price ?? ""}
                                  onChange={e => updateField(plan.id, "price", e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Réduction (%)</Label>
                                <Input
                                  data-testid={`input-plan-discount-${plan.id}`}
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={edits.discountPercentage ?? ""}
                                  onChange={e => updateField(plan.id, "discountPercentage", e.target.value)}
                                  className="h-8 text-sm"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Avantages (un par ligne)</Label>
                              <Textarea
                                data-testid={`input-plan-privileges-${plan.id}`}
                                value={edits.privilegesText || ""}
                                onChange={e => updateField(plan.id, "privilegesText", e.target.value)}
                                rows={5}
                                className="text-xs"
                                placeholder="Avantage 1&#10;Avantage 2&#10;Avantage 3"
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                data-testid={`button-save-plan-${plan.id}`}
                                size="sm"
                                className="flex-1"
                                onClick={() => savePlan(plan)}
                                disabled={updatePlanMutation.isPending}
                              >
                                {updatePlanMutation.isPending
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                                  : <Save className="w-3.5 h-3.5 mr-1" />
                                }
                                Sauvegarder
                              </Button>
                              <Button
                                data-testid={`button-cancel-plan-${plan.id}`}
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingPlan(prev => { const n = { ...prev }; delete n[plan.id]; return n; })}
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
