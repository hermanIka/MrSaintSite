# Guide de déploiement — Mr Saint sur Hostinger VPS

## Prérequis

- **Hostinger VPS** (KVM 1 minimum, ~4€/mois) — l'hébergement mutualisé ne supporte pas Node.js
- Ubuntu 22.04 LTS recommandé
- Accès SSH au VPS

---

## 1. Préparer le serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer PM2 (gestionnaire de processus)
sudo npm install -g pm2

# Installer PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Installer Nginx
sudo apt install -y nginx
```

---

## 2. Configurer PostgreSQL

```bash
sudo -u postgres psql
```
```sql
CREATE USER mr_saint WITH PASSWORD 'VotreMotDePasse';
CREATE DATABASE mr_saint OWNER mr_saint;
GRANT ALL PRIVILEGES ON DATABASE mr_saint TO mr_saint;
\q
```

---

## 3. Transférer le projet

```bash
# Sur votre machine locale, pousser sur GitHub puis sur le VPS :
git clone https://github.com/votre-compte/mr-saint.git /var/www/mr-saint
cd /var/www/mr-saint

# Installer les dépendances
npm install

# Créer le dossier uploads
mkdir -p uploads
```

---

## 4. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

Remplissez toutes les valeurs (voir `.env.example`). Points critiques :
- `APP_URL` = votre domaine (ex: `https://mrsaint.com`)
- `DATABASE_URL` = URL de connexion PostgreSQL local
- `JWT_SECRET` = générez avec `node -e "require('crypto').randomBytes(32).toString('hex')"`

---

## 5. Migrer la base de données

Exportez d'abord depuis Replit :
```bash
# Sur Replit (terminal)
pg_dump $DATABASE_URL > mr_saint_backup.sql
```

Importez sur Hostinger :
```bash
# Transférez le fichier via scp ou FileZilla, puis :
psql -U mr_saint -d mr_saint < mr_saint_backup.sql
```

Ou laissez le seed automatique peupler la base au premier démarrage.

---

## 6. Builder et démarrer l'application

```bash
cd /var/www/mr-saint

# Build production
npm run build

# Démarrer avec PM2
pm2 start dist/index.js --name mr-saint

# Démarrage automatique au reboot
pm2 startup
pm2 save
```

---

## 7. Configurer Nginx (reverse proxy)

```bash
sudo nano /etc/nginx/sites-available/mr-saint
```

```nginx
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    # Servir les uploads directement
    location /uploads/ {
        alias /var/www/mr-saint/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Proxy vers Node.js
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 20M;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/mr-saint /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. SSL gratuit avec Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## 9. Vérifications post-déploiement

- [ ] `https://votre-domaine.com` charge correctement
- [ ] `/admin` → login fonctionne
- [ ] Uploads de documents fonctionnent
- [ ] Paiements MaishaPay/PawaPay : mettre à jour `APP_URL` avec le vrai domaine pour les callbacks

---

## Mises à jour

```bash
cd /var/www/mr-saint
git pull
npm install
npm run build
pm2 restart mr-saint
```

---

## Variables d'environnement pour les paiements

Pour que les callbacks MaishaPay et PawaPay fonctionnent en production, assurez-vous que :
- `APP_URL=https://votre-domaine.com` (sans slash final)
- Les webhooks sont configurés côté MaishaPay/PawaPay avec votre URL de production
