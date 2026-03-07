import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Loader2, CalendarDays, Eye, Users, CreditCard, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: "En attente",      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  partial:   { label: "Acompte versé",   className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  paid:      { label: "Payé",            className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  cancelled: { label: "Annulé",          className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try { return format(new Date(dateStr), "dd MMM yyyy", { locale: fr }); } catch { return dateStr; }
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

type ReservationWithDetails = {
  id: string;
  clientId: string;
  tripId: string;
  numberOfPeople: number;
  totalPrice: number;
  amountPaid: number;
  paymentStatus: string;
  travelDate: string | null;
  paymentId: string | null;
  paymentProvider: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: string; fullName: string; email: string; phone: string } | null;
  trip: { id: string; title: string; destination: string; price: number; date: string } | null;
  invoice: { id: string; invoiceNumber: string; amount: number; issueDate: string } | null;
};

export function AdminReservationsPage() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminAuth();
  const [selected, setSelected] = useState<ReservationWithDetails | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: reservations = [], isLoading } = useQuery<ReservationWithDetails[]>({
    queryKey: ["/api/admin/reservations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/reservations", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/reservations/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reservations"] });
      toast({ title: "Statut mis à jour" });
      setSelected(null);
    },
    onError: () => toast({ title: "Erreur", variant: "destructive" }),
  });

  const filtered = filterStatus === "all" ? reservations : reservations.filter(r => r.paymentStatus === filterStatus);

  const totalPaid = reservations.filter(r => r.paymentStatus === "paid").reduce((acc, r) => acc + r.amountPaid, 0);
  const pendingCount = reservations.filter(r => r.paymentStatus === "pending").length;
  const paidCount = reservations.filter(r => r.paymentStatus === "paid").length;

  return (
    <AdminLayout title="Réservations Voyages">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 data-testid="text-reservations-title" className="text-2xl font-heading font-bold text-foreground">
              Réservations Voyages
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{reservations.length} réservation(s) au total</p>
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total réservations</p>
                <p data-testid="stat-total-reservations" className="text-2xl font-bold text-foreground">{reservations.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total encaissé</p>
                <p data-testid="stat-total-paid" className="text-2xl font-bold text-foreground">{totalPaid}€</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p data-testid="stat-pending" className="text-2xl font-bold text-foreground">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger data-testid="select-filter-status" className="w-48">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="partial">Acompte versé</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
              <SelectItem value="cancelled">Annulé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">Aucune réservation trouvée.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left p-4 font-medium text-muted-foreground">Client</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Voyage</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Pers.</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Montant</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Statut</th>
                      <th className="text-left p-4 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                      <th className="text-left p-4 font-medium text-muted-foreground"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        data-testid={`row-reservation-${r.id}`}
                        className="border-b border-border last:border-0 hover-elevate"
                      >
                        <td className="p-4">
                          <p className="font-medium text-foreground">{r.client?.fullName || "—"}</p>
                          <p className="text-xs text-muted-foreground">{r.client?.email || "—"}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-foreground">{r.trip?.title || "—"}</p>
                          <p className="text-xs text-muted-foreground">{r.trip?.destination || "—"}</p>
                        </td>
                        <td className="p-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            {r.numberOfPeople}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-primary">{r.totalPrice}€</p>
                          {r.paymentStatus === "paid" && r.amountPaid > 0 && (
                            <p className="text-xs text-green-600">Payé : {r.amountPaid}€</p>
                          )}
                        </td>
                        <td className="p-4"><StatusBadge status={r.paymentStatus} /></td>
                        <td className="p-4 hidden md:table-cell text-muted-foreground">{formatDate(r.createdAt)}</td>
                        <td className="p-4">
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-view-reservation-${r.id}`}
                            onClick={() => { setSelected(r); setNewStatus(r.paymentStatus); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-heading">Détail de la réservation</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Client</p>
                  <p className="font-medium text-foreground">{selected.client?.fullName || "—"}</p>
                  <p className="text-muted-foreground">{selected.client?.email}</p>
                  <p className="text-muted-foreground">{selected.client?.phone}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Voyage</p>
                  <p className="font-medium text-foreground">{selected.trip?.title || "—"}</p>
                  <p className="text-muted-foreground">{selected.trip?.destination}</p>
                  <p className="text-muted-foreground">{selected.trip?.startDate && selected.trip?.endDate ? `${selected.trip.startDate} → ${selected.trip.endDate}` : selected.trip?.startDate || "—"}</p>
                </div>
              </div>

              <div className="bg-muted/40 rounded-lg p-4 border border-border text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nombre de personnes</span>
                  <span className="font-medium">{selected.numberOfPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date souhaitée</span>
                  <span className="font-medium">{formatDate(selected.travelDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-primary">{selected.totalPrice}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payé</span>
                  <span className="font-medium">{selected.amountPaid}€</span>
                </div>
                {selected.paymentProvider && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Moyen de paiement</span>
                    <span className="font-medium capitalize">{selected.paymentProvider}</span>
                  </div>
                )}
                {selected.invoice && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">N° facture</span>
                    <span className="font-medium">{selected.invoice.invoiceNumber}</span>
                  </div>
                )}
              </div>

              {selected.notes && (
                <div className="text-sm">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                  <p className="text-foreground">{selected.notes}</p>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Changer le statut</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger data-testid="select-new-reservation-status" className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="partial">Acompte versé</SelectItem>
                      <SelectItem value="paid">Payé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    data-testid="button-update-reservation-status"
                    onClick={() => updateStatusMutation.mutate({ id: selected.id, status: newStatus })}
                    disabled={updateStatusMutation.isPending || newStatus === selected.paymentStatus}
                  >
                    {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Mettre à jour"}
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Créée le {formatDate(selected.createdAt)}</p>
                <Button variant="outline" onClick={() => setSelected(null)}>Fermer</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
