import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { type AgencyRequest, AGENCY_PACKS } from "@shared/schema";
import { Loader2, Building2, Eye, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: "En attente",    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  processing: { label: "En traitement", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  approved:   { label: "Approuvée",     className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  rejected:   { label: "Refusée",       className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return "—";
  try {
    return format(new Date(dateStr), "dd MMM yyyy", { locale: fr });
  } catch {
    return dateStr;
  }
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || { label: status, className: "bg-muted text-muted-foreground" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function getPackInfo(packName: string) {
  return AGENCY_PACKS.find(p => p.value === packName);
}

export function AdminAgencyRequestsPage() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAdminAuth();
  const [selectedRequest, setSelectedRequest] = useState<AgencyRequest | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const { data: requests = [], isLoading } = useQuery<AgencyRequest[]>({
    queryKey: ["/api/admin/agency-requests"],
    queryFn: async () => {
      const res = await fetch("/api/admin/agency-requests", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
    refetchInterval: 30000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const res = await fetch(`/api/admin/agency-requests/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agency-requests"] });
      toast({ title: "Statut mis à jour", description: "La demande a été mise à jour avec succès." });
      setSelectedRequest(null);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut.", variant: "destructive" });
    },
  });

  const filtered = filterStatus === "all"
    ? requests
    : requests.filter(r => r.status === filterStatus);

  const handleOpen = (request: AgencyRequest) => {
    setSelectedRequest(request);
    setNewStatus(request.status || "pending");
    setAdminNotes(request.adminNotes || "");
  };

  const handleUpdate = () => {
    if (!selectedRequest) return;
    updateStatusMutation.mutate({ id: selectedRequest.id, status: newStatus, notes: adminNotes });
  };

  const counts = {
    pending:    requests.filter(r => r.status === "pending").length,
    processing: requests.filter(r => r.status === "processing").length,
    approved:   requests.filter(r => r.status === "approved").length,
    rejected:   requests.filter(r => r.status === "rejected").length,
  };

  return (
    <AdminLayout title="Demandes Agence">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { key: "pending",    label: "En attente",    count: counts.pending },
          { key: "processing", label: "En traitement", count: counts.processing },
          { key: "approved",   label: "Approuvées",    count: counts.approved },
          { key: "rejected",   label: "Refusées",      count: counts.rejected },
        ].map(({ key, label, count }) => (
          <Card
            key={key}
            data-testid={`card-stat-${key}`}
            className={`cursor-pointer transition-all hover-elevate ${filterStatus === key ? "border-primary" : ""}`}
            onClick={() => setFilterStatus(filterStatus === key ? "all" : key)}
          >
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-2xl font-bold text-foreground">{count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Button
          variant={filterStatus === "all" ? "default" : "outline"}
          size="sm"
          data-testid="button-filter-all"
          onClick={() => setFilterStatus("all")}
        >
          Toutes ({requests.length})
        </Button>
        <p className="text-sm text-muted-foreground ml-auto">
          {filtered.length} demande{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucune demande de création d'agence{filterStatus !== "all" ? " avec ce statut" : ""}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Demandeur</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Forfait</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">CA estimé</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Paiement</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Date</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((req) => {
                    const pack = getPackInfo(req.packName);
                    return (
                      <tr key={req.id} data-testid={`row-agency-${req.id}`} className="hover-elevate transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground">{req.firstName} {req.lastName}</p>
                          <p className="text-xs text-muted-foreground">{req.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="font-medium text-foreground">{pack?.label || req.packName}</p>
                          <p className="text-xs text-primary font-semibold">{req.packPrice}€</p>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className="text-green-600 dark:text-green-400 text-xs font-medium">{pack?.revenue || "—"}</span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <span className="text-foreground font-medium">{req.amount}€</span>
                          <span className="text-xs text-muted-foreground ml-1">
                            {req.paymentMethod === "pawapay" ? "Mobile Money" : req.paymentMethod === "maishapay" ? "Carte" : req.paymentMethod || ""}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={req.status || "pending"} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">
                          {formatDate(req.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            data-testid={`button-view-agency-${req.id}`}
                            onClick={() => handleOpen(req)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Demande agence — {selectedRequest?.firstName} {selectedRequest?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (() => {
            const pack = getPackInfo(selectedRequest.packName);
            return (
              <div className="space-y-6">
                {/* Pack info */}
                <section>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Forfait choisi
                  </h4>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <Building2 className="w-8 h-8 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground text-lg">{pack?.label || selectedRequest.packName}</p>
                      <p className="text-sm text-muted-foreground">{pack?.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">{selectedRequest.packPrice}€</p>
                      {pack && (
                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 justify-end">
                          <TrendingUp className="w-3 h-3" />
                          <span>{pack.revenue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {pack && (
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium">Budget démarrage :</span> {pack.startBudget}
                    </div>
                  )}
                </section>

                {/* Informations personnelles */}
                <section>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Informations personnelles
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {[
                      ["Nom", `${selectedRequest.firstName} ${selectedRequest.lastName}`],
                      ["Email", selectedRequest.email],
                      ["Téléphone", selectedRequest.phone],
                      ["Nationalité", selectedRequest.nationality],
                      ["Date de naissance", selectedRequest.birthDate],
                      ["Référence", selectedRequest.id],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span className="text-muted-foreground">{k} :</span>
                        <span className="ml-1 font-medium text-foreground break-all">{v || "—"}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Message client */}
                {selectedRequest.message && (
                  <section>
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                      Message / Motivation
                    </h4>
                    <div className="p-4 rounded-lg bg-muted/40 border border-border text-sm text-foreground whitespace-pre-wrap">
                      {selectedRequest.message}
                    </div>
                  </section>
                )}

                {/* Paiement */}
                <section>
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Paiement
                  </h4>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Montant :</span>
                      <span className="ml-1 font-bold text-primary">{selectedRequest.amount}€</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Méthode :</span>
                      <span className="ml-1 font-medium text-foreground">
                        {selectedRequest.paymentMethod === "maishapay" ? "Carte bancaire"
                          : selectedRequest.paymentMethod === "pawapay" ? "Mobile Money"
                          : selectedRequest.paymentMethod || "—"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">ID Paiement :</span>
                      <span className="ml-1 font-mono text-xs text-foreground">{selectedRequest.paymentId || "—"}</span>
                    </div>
                  </div>
                </section>

                {/* Gestion du statut */}
                <section className="space-y-4 pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Gestion du dossier
                  </h4>
                  <div className="space-y-1.5">
                    <Label>Statut</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger data-testid="select-agency-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">En attente</SelectItem>
                        <SelectItem value="processing">En traitement</SelectItem>
                        <SelectItem value="approved">Approuvée</SelectItem>
                        <SelectItem value="rejected">Refusée</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="agencyAdminNotes">Notes internes</Label>
                    <Textarea
                      id="agencyAdminNotes"
                      data-testid="input-admin-notes"
                      placeholder="Notes de traitement, observations..."
                      value={adminNotes}
                      onChange={e => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </section>
              </div>
            );
          })()}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Fermer</Button>
            <Button
              data-testid="button-update-status"
              onClick={handleUpdate}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
