#!/bin/bash
# =============================================================================
# Script de déploiement VPS — Mr Saint (https://mrsaint.fr)
# VPS Hostinger KVM 2 | IP: 187.77.173.51
# Usage : bash scripts/vps-deploy.sh
# =============================================================================

set -e  # Arrêter immédiatement en cas d'erreur

# --- Configuration ---
APP_DIR="/var/www/mrsaint"          # Répertoire du projet sur le VPS (adapter si besoin)
PM2_APP_NAME="mrsaint"             # Nom de l'app dans PM2
DATABASE_URL="postgresql://mrsaint_user:matandu2026@localhost:5432/mrsaint"
GITHUB_BRANCH="main"

echo "======================================================"
echo " Déploiement Mr Saint — $(date '+%Y-%m-%d %H:%M:%S')"
echo "======================================================"

# --- 1. Récupérer les dernières modifications depuis GitHub ---
echo ""
echo "[1/7] Récupération du code depuis GitHub..."
git pull origin "$GITHUB_BRANCH"
echo "      OK — Code mis à jour."

# --- 2. Installer les dépendances (y compris devDependencies pour le build) ---
echo ""
echo "[2/7] Installation des dépendances npm..."
npm install
echo "      OK — Dépendances installées."

# --- 3. Fix vite.config.ts : supprimer les plugins Replit-only pour le build ---
#         Ces plugins ne fonctionnent que dans l'environnement Replit.
echo ""
echo "[3/7] Adaptation de vite.config.ts pour la production..."
cp vite.config.ts vite.config.ts.bak

# Supprimer le bloc conditionnel Replit (plugins cartographer et devBanner)
sed -i '/process\.env\.REPL_ID/,/\])/d' vite.config.ts

# Supprimer aussi runtimeErrorOverlay (plugin Replit)
sed -i '/runtimeErrorOverlay/d' vite.config.ts
sed -i '/@replit\/vite-plugin-runtime-error-modal/d' vite.config.ts

echo "      OK — vite.config.ts adapté."

# --- 4. Build de production ---
echo ""
echo "[4/7] Build de production (frontend + backend)..."
npm run build
echo "      OK — Build terminé."

# --- 5. Restaurer vite.config.ts original ---
echo ""
echo "[5/7] Restauration de vite.config.ts..."
mv vite.config.ts.bak vite.config.ts
echo "      OK — vite.config.ts restauré."

# --- 6. Migration de la base de données ---
echo ""
echo "[6/7] Migration de la base de données..."
psql "$DATABASE_URL" -f scripts/vps-migrate.sql
echo "      OK — Migration terminée."

# --- 7. Redémarrage de l'application via PM2 ---
echo ""
echo "[7/7] Redémarrage de l'application (PM2)..."
pm2 reload "$PM2_APP_NAME" --update-env || pm2 restart "$PM2_APP_NAME" --update-env
echo "      OK — Application redémarrée."

echo ""
echo "======================================================"
echo " Déploiement terminé avec succès !"
echo " Site accessible sur : https://mrsaint.fr"
echo "======================================================"
