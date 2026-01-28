import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminAuth } from "../hooks/useAdminAuth";
import type { ActivityLog } from "@shared/schema";

export function AdminLogsPage() {
  const { getAuthHeaders } = useAdminAuth();

  const { data: logs, isLoading } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/logs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/logs", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      LOGIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  const getEntityTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      trip: "Voyage",
      testimonial: "Témoignage",
      portfolio: "Portfolio",
      faq: "FAQ",
      admin: "Admin",
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout title="Historique des activités">
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Chargement...</div>
        ) : logs && logs.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center gap-3 p-4"
                    data-testid={`log-item-${log.id}`}
                  >
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="px-2 py-1 text-xs bg-muted rounded">
                      {getEntityTypeLabel(log.entityType)}
                    </span>
                    <span className="flex-1 text-sm min-w-[150px]">{log.details}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center text-muted-foreground py-8">Aucune activité enregistrée</div>
        )}
      </div>
    </AdminLayout>
  );
}
