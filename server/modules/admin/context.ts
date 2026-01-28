/**
 * MODULE ADMIN - Context
 * 
 * Ce module gère l'administration de la plateforme:
 * - Authentification admin sécurisée
 * - Gestion des voyages (CRUD)
 * - Gestion des témoignages (CRUD)
 * - Gestion du portfolio (CRUD)
 * - Gestion de la FAQ (CRUD)
 * - Logs d'activité pour traçabilité
 * 
 * Contraintes:
 * - Accès restreint par authentification
 * - Toutes les actions sont tracées
 * - Session sécurisée par token JWT
 */

export const ADMIN_MODULE_CONTEXT = {
  name: "admin",
  version: "1.0.0",
  description: "Module d'administration et supervision",
  responsibilities: [
    "Authentification sécurisée",
    "Gestion des contenus (voyages, témoignages, portfolio)",
    "Gestion de la FAQ",
    "Logs d'activité",
    "Dashboard de supervision"
  ],
  dependencies: ["content"],
  exports: ["registerAdminRoutes", "adminStorage"]
};
