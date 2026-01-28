import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "./AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, MessageSquare, Briefcase, HelpCircle, Activity } from "lucide-react";
import { useAdminAuth } from "../hooks/useAdminAuth";
import type { ActivityLog } from "@shared/schema";

interface DashboardStats {
  trips: number;
  testimonials: number;
  portfolio: number;
  faqs: number;
  recentLogs: ActivityLog[];
}

export function AdminDashboard() {
  const { getAuthHeaders } = useAdminAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Erreur de chargement");
      return res.json();
    },
  });

  const statCards = [
    { label: "Voyages", value: stats?.trips ?? 0, icon: Plane, color: "text-blue-500" },
    { label: "Témoignages", value: stats?.testimonials ?? 0, icon: MessageSquare, color: "text-green-500" },
    { label: "Portfolio", value: stats?.portfolio ?? 0, icon: Briefcase, color: "text-purple-500" },
    { label: "FAQ", value: stats?.faqs ?? 0, icon: HelpCircle, color: "text-orange-500" },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
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

  return (
    <AdminLayout title="Tableau de bord">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} data-testid={`card-stat-${stat.label.toLowerCase()}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {isLoading ? "..." : stat.value}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground">Chargement...</div>
            ) : stats?.recentLogs && stats.recentLogs.length > 0 ? (
              <div className="space-y-3">
                {stats.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-md"
                    data-testid={`log-item-${log.id}`}
                  >
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-sm">{log.details}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-8">
                Aucune activité récente
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
