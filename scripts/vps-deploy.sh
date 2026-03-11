#!/bin/bash
# =============================================================================
# Script de déploiement VPS — Mr Saint (https://mrsaint.fr)
# VPS Hostinger KVM 2 | IP: 187.77.173.51
# Répertoire : /var/www/mr-saint | PM2 app : mr-saint
# Usage : bash scripts/vps-deploy.sh
# =============================================================================

set -e  # Arrêter immédiatement en cas d'erreur

# --- Configuration ---
APP_DIR="/var/www/mr-saint"
PM2_APP_NAME="mr-saint"
DATABASE_URL="postgresql://mrsaint_user:matandu2026@localhost:5432/mrsaint"
GITHUB_BRANCH="main"

echo "======================================================"
echo " Déploiement Mr Saint — $(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================================"

# --- 1. Récupérer les dernières modifications depuis GitHub ---
echo ""
echo "[1/8] Récupération du code depuis GitHub..."
git pull origin "$GITHUB_BRANCH"
echo "      OK — Code mis à jour."

# --- 2. Installer les dépendances ---
echo ""
echo "[2/8] Installation des dépendances npm..."
npm install
echo "      OK — Dépendances installées."

# --- 3. Créer le dossier uploads/ si absent (persistance des fichiers) ---
echo ""
echo "[3/8] Vérification du dossier uploads/..."
mkdir -p "$APP_DIR/uploads"
echo "      OK — Dossier uploads/ prêt."

# --- 4. Patch vite.config.ts pour le build production ---
#   Les plugins @replit/* ne fonctionnent que dans l'environnement Replit.
#   On écrit un vite.config.ts temporaire sans ces plugins, puis on restaure.
echo ""
echo "[4/8] Adaptation de vite.config.ts pour la production..."
cp vite.config.ts vite.config.ts.bak

cat > vite.config.ts << 'VITE_EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
VITE_EOF

echo "      OK — vite.config.ts adapté."

# --- 5. Build de production ---
echo ""
echo "[5/8] Build de production (frontend + backend)..."
npm run build
echo "      OK — Build terminé."

# --- 6. Restaurer vite.config.ts original ---
echo ""
echo "[6/8] Restauration de vite.config.ts..."
mv vite.config.ts.bak vite.config.ts
echo "      OK — vite.config.ts restauré."

# --- 7. Migration de la base de données (idempotente) ---
#   Ce script ajoute les colonnes manquantes sans jamais supprimer de données.
#   Peut être exécuté plusieurs fois sans risque.
echo ""
echo "[7/8] Migration de la base de données..."
psql "$DATABASE_URL" -f scripts/vps-migrate.sql
echo "      OK — Migration terminée."

# --- 8. Redémarrage de l'application via PM2 ---
echo ""
echo "[8/8] Redémarrage de l'application (PM2)..."
pm2 reload "$PM2_APP_NAME" --update-env || pm2 restart "$PM2_APP_NAME" --update-env
echo "      OK — Application redémarrée."

echo ""
echo "======================================================"
echo " Déploiement terminé avec succès !"
echo " Site accessible sur : https://mrsaint.fr"
echo "======================================================"
