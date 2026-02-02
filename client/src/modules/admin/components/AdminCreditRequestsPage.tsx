import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { AdminLayout } from "./AdminLayout";
import { useAdminAuth } from "../hooks/useAdminAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import type { CreditTravelRequest } from "@shared/schema";
import {
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  Plane,
  Wallet,
  FileText,
  ExternalLink,
} from "lucide-react";

const statusConfig = {
  pending: { label: "En attente", variant: "secondary" as const, icon: Clock },
  approved: { label: "Approuvée", variant: "default" as const, icon: CheckCircle },
  rejected: { label: "Refusée", variant: "destructive" as const, icon: XCircle },
};

export function AdminCreditRequestsPage() {
  const { getAuthHeaders } = useAdminAuth();
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<CreditTravelRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: requests, isLoading } = useQuery<CreditTravelRequest[]>({
    queryKey: ["/api/admin/credit-requests"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes: string }) => {
      const res = await fetch(`/api/admin/credit-requests/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        credentials: "include",
        body: JSON.stringify({ status, adminNotes: notes }),
      });
      if (!res.ok) throw new Error("Erreur lors de la mise à jour");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Statut mis à jour" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/credit-requests"] });
      setIsDetailOpen(false);
    },
    onError: () => {
      toast({ title: "Erreur", description: "Impossible de mettre à jour le statut", variant: "destructive" });
    },
  });

  const handleStatusChange = (status: "approved" | "rejected") => {
    if (!selectedRequest) return;
    updateStatusMutation.mutate({ id: selectedRequest.id, status, notes: adminNotes });
  };

  const openDetail = (request: CreditTravelRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || "");
    setIsDetailOpen(true);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  const getDocumentUrl = (path: string | null) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `https://storage.googleapis.com/${path}`;
  };

  if (isLoading) {
    return (
      <AdminLayout title="Demandes de crédit voyage">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Demandes de crédit voyage">
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold">{requests?.filter(r => r.status === "pending").length || 0}</div>
              <p className="text-sm text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600">{requests?.filter(r => r.status === "approved").length || 0}</div>
              <p className="text-sm text-muted-foreground">Approuvées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-destructive">{requests?.filter(r => r.status === "rejected").length || 0}</div>
              <p className="text-sm text-muted-foreground">Refusées</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toutes les demandes</CardTitle>
          </CardHeader>
          <CardContent>
            {!requests || requests.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Aucune demande pour le moment</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const config = statusConfig[request.status as keyof typeof statusConfig];
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={request.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
                      data-testid={`credit-request-${request.id}`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium">
                          {request.firstName} {request.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {request.destination} - {request.creditAmount} EUR
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Soumis le {formatDate(request.createdAt)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={config.variant}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDetail(request)}
                          data-testid={`button-view-${request.id}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Voir
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Demande de {selectedRequest?.firstName} {selectedRequest?.lastName}
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Informations personnelles
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Nom:</strong> {selectedRequest.lastName}</p>
                    <p><strong>Prénom:</strong> {selectedRequest.firstName}</p>
                    <p><strong>Naissance:</strong> {formatDate(selectedRequest.birthDate)}</p>
                    <p><strong>Nationalité:</strong> {selectedRequest.nationality}</p>
                    <p><strong>Pays:</strong> {selectedRequest.countryOfResidence}</p>
                    <p><strong>Email:</strong> {selectedRequest.email}</p>
                    <p><strong>Téléphone:</strong> {selectedRequest.phone}</p>
                    <p><strong>Adresse:</strong> {selectedRequest.address}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Situation professionnelle
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Statut:</strong> {selectedRequest.professionalStatus}</p>
                    <p><strong>Profession:</strong> {selectedRequest.profession}</p>
                    <p><strong>Revenu:</strong> {selectedRequest.monthlyIncome}</p>
                    <p><strong>Ancienneté:</strong> {selectedRequest.professionalSeniority}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      Projet de voyage
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Destination:</strong> {selectedRequest.destination}</p>
                    <p><strong>Type:</strong> {selectedRequest.tripType}</p>
                    <p><strong>Départ:</strong> {formatDate(selectedRequest.departureDate)}</p>
                    <p><strong>Durée:</strong> {selectedRequest.stayDuration}</p>
                    <p><strong>Budget:</strong> {selectedRequest.estimatedBudget} EUR</p>
                    <p><strong>Montant demandé:</strong> {selectedRequest.creditAmount} EUR</p>
                    {selectedRequest.hasPersonalContribution && (
                      <p><strong>Apport:</strong> {selectedRequest.personalContributionAmount} EUR</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Remboursement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><strong>Durée:</strong> {selectedRequest.creditDuration}</p>
                    <p><strong>Mode:</strong> {selectedRequest.repaymentMethod}</p>
                    <p><strong>Fréquence:</strong> {selectedRequest.repaymentFrequency}</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      { label: "Pièce d'identité", url: selectedRequest.identityDocumentUrl },
                      { label: "Justificatif de revenus", url: selectedRequest.incomeProofUrl },
                      { label: "Justificatif de domicile", url: selectedRequest.addressProofUrl },
                      { label: "Photo récente", url: selectedRequest.recentPhotoUrl },
                      { label: "Lettre explicative", url: selectedRequest.explanatoryLetterUrl },
                    ].map((doc) => (
                      <div key={doc.label} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{doc.label}</span>
                        {doc.url ? (
                          <a
                            href={getDocumentUrl(doc.url) || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1 text-sm"
                          >
                            Voir <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">Non fourni</span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes administrateur</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Ajouter des notes sur cette demande..."
                  data-testid="textarea-admin-notes"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedRequest?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("rejected")}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-reject"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  onClick={() => handleStatusChange("approved")}
                  disabled={updateStatusMutation.isPending}
                  data-testid="button-approve"
                >
                  {updateStatusMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approuver
                </Button>
              </>
            )}
            {selectedRequest?.status !== "pending" && (
              <Badge variant={statusConfig[selectedRequest?.status as keyof typeof statusConfig]?.variant}>
                {statusConfig[selectedRequest?.status as keyof typeof statusConfig]?.label}
              </Badge>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default AdminCreditRequestsPage;
