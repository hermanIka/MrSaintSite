import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CreditCard, Receipt, ShieldOff, CheckCircle, XCircle, Clock, Star } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

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

export function AdminGoPlusPage() {
  const { getAuthHeaders } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"cards" | "transactions">("cards");

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
  const activeCards = cards.filter(c => c.status === "active").length;
  const paidTx = transactions.filter(t => t.status === "paid").length;

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

        <div className="flex gap-2">
          <Button
            data-testid="tab-cards"
            variant={activeTab === "cards" ? "default" : "outline"}
            size="default"
            onClick={() => setActiveTab("cards")}
          >
            <CreditCard className="w-4 h-4 mr-2" /> Cartes
          </Button>
          <Button
            data-testid="tab-transactions"
            variant={activeTab === "transactions" ? "default" : "outline"}
            size="default"
            onClick={() => setActiveTab("transactions")}
          >
            <Receipt className="w-4 h-4 mr-2" /> Transactions
          </Button>
        </div>

        {activeTab === "cards" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Cartes GO+</CardTitle>
            </CardHeader>
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
                              <Button
                                data-testid={`button-suspend-${card.id}`}
                                size="sm"
                                variant="outline"
                                onClick={() => suspendMutation.mutate(card.id)}
                                disabled={suspendMutation.isPending}
                              >
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
            <CardHeader>
              <CardTitle className="text-base font-semibold">Transactions GO+</CardTitle>
            </CardHeader>
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
      </div>
    </AdminLayout>
  );
}
