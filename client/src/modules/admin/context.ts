/**
 * MODULE ADMIN - Context Frontend
 * 
 * Ce module gère l'interface d'administration:
 * - Page de connexion sécurisée
 * - Dashboard avec statistiques
 * - Gestion des voyages, témoignages, portfolio, FAQ
 * - Historique des activités
 */

export const ADMIN_MODULE_CONTEXT = {
  name: "admin",
  version: "1.0.0",
  description: "Interface d'administration Mr Saint",
  pages: [
    "AdminLoginPage",
    "AdminDashboard",
    "AdminTripsPage",
    "AdminTestimonialsPage",
    "AdminPortfolioPage",
    "AdminFaqPage",
    "AdminLogsPage",
  ],
  exports: [
    "AdminLoginPage",
    "AdminDashboard",
    "useAdminAuth",
  ],
};
