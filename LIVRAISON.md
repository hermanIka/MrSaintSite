# Documentation Technique — Site Mr Saint
## Document de livraison

---

| | |
|---|---|
| **Client** | Saint Matandu |
| **Site web** | https://mrsaint.fr |
| **Développeur** | Herman IKA |
| **Date de livraison** | Mars 2026 |
| **Version** | 1.0.0 |

---

## Table des matières

1. [Présentation du projet](#1-présentation-du-projet)
2. [Stack technique](#2-stack-technique)
3. [Infrastructure serveur](#3-infrastructure-serveur)
4. [Base de données](#4-base-de-données)
5. [Accès administrateur](#5-accès-administrateur)
6. [Fonctionnalités du site](#6-fonctionnalités-du-site)
7. [Système de tarification](#7-système-de-tarification)
8. [Paiements](#8-paiements)
9. [Emails transactionnels](#9-emails-transactionnels)
10. [Module GO+ (fidélité)](#10-module-go-fidélité)
11. [Mise à jour et maintenance](#11-mise-à-jour-et-maintenance)
12. [Commandes utiles](#12-commandes-utiles)
13. [Variables d'environnement](#13-variables-denvironnement)
14. [Contacts et support](#14-contacts-et-support)

---

## 1. Présentation du projet

Mr Saint est un site web professionnel pour une agence de voyage haut de gamme. Il propose les services suivants :

- Facilitation visa (dossier complet, dépôt en ligne)
- Consultation expert voyage
- Création d'agence de voyage (accompagnement et formation)
- Voyages d'affaires organisés
- Voyage à Crédit (financement personnalisé)
- Carte de fidélité GO+ (3 niveaux : Classique, Premium, Gold)

Le site dispose d'un panneau d'administration complet permettant de gérer l'intégralité du contenu sans intervention du développeur.

---

## 2. Stack technique

| Composant | Technologie |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Node.js + Express.js |
| Base de données | PostgreSQL |
| ORM | Drizzle ORM |
| Styles | Tailwind CSS + Shadcn UI |
| Paiements | MaishaPay (carte) + PawaPay (Mobile Money) |
| Emails | Resend |
| Calendrier | Calendly API v2 |
| Chatbot | OpenAI GPT-4o-mini |
| Serveur | VPS Hostinger KVM2 (Ubuntu) |
| Process manager | PM2 |
| Reverse proxy | Nginx |
| SSL | Let's Encrypt (renouvellement automatique) |

---

## 3. Infrastructure serveur

### Accès SSH

```
Hôte : mrsaint.fr (ou IP du VPS)
Utilisateur : root
Port : 22
Authentification : clé SSH (gérée par le développeur)
```

### Répertoire de l'application

```
/var/www/mr-saint/
```

### Structure des dossiers sur le serveur

```
/var/www/mr-saint/
├── dist/               # Application compilée (frontend + backend)
│   └── public/         # Fichiers statiques frontend
├── client/             # Code source frontend
├── server/             # Code source backend
├── shared/             # Types et schémas partagés
├── uploads/            # Documents uploadés par les utilisateurs
├── .env                # Variables d'environnement (NE PAS PARTAGER)
├── package.json        # Dépendances
└── vite.config.ts      # Configuration build
```

### Nginx

Le fichier de configuration Nginx se trouve dans :
```
/etc/nginx/sites-enabled/mr-saint
```

Il fait le proxy de toutes les requêtes HTTP/HTTPS vers l'application Node.js sur le port 3000.

### PM2 (gestionnaire de processus)

L'application tourne en arrière-plan avec PM2 sous le nom `mr-saint`. PM2 redémarre automatiquement l'application en cas de crash et au redémarrage du serveur.

---

## 4. Base de données

### Connexion PostgreSQL

```
Hôte : localhost
Port : 5432
Base de données : mrsaint
Utilisateur : mrsaint_user
Mot de passe : [voir fichier .env]
```

### Tables principales

| Table | Contenu |
|---|---|
| `admins` | Compte(s) administrateur |
| `trips` | Voyages organisés |
| `testimonials` | Témoignages clients |
| `portfolio` | Réalisations / portfolio |
| `faqs` | Questions fréquentes |
| `services` | Services affichés sur le site |
| `service_prices` | Tarifs des services (modifiables par l'admin) |
| `visa_requests` | Demandes de facilitation visa |
| `agency_requests` | Demandes de création d'agence |
| `credit_travel_requests` | Demandes de voyage à crédit |
| `go_plus_plans` | Plans de la carte de fidélité GO+ |
| `go_plus_cards` | Cartes GO+ achetées par les clients |
| `go_plus_transactions` | Transactions GO+ |
| `chatbot_conversations` | Historique du chatbot |
| `chatbot_system_prompts` | Instructions du chatbot (modifiables par l'admin) |
| `activity_logs` | Journal d'activité admin |

### Sauvegarde manuelle

```bash
sudo -u postgres pg_dump mrsaint > /root/backup_mrsaint_$(date +%Y%m%d).sql
```

---

## 5. Accès administrateur

### URL du panneau admin

```
https://mrsaint.fr/admin
```

### Identifiants par défaut

```
Nom d'utilisateur : admin
Mot de passe : admin123
```

**Important : Changer le mot de passe immédiatement après la première connexion.**

Pour changer le mot de passe, contactez le développeur ou utilisez cette commande SQL :

```bash
sudo -u postgres psql -d mrsaint -c "UPDATE admins SET password_hash = encode(digest('NOUVEAU_MOT_DE_PASSE', 'sha256'), 'hex') WHERE username = 'admin';"
```

### Pages du panneau admin

| Page | URL | Description |
|---|---|---|
| Tableau de bord | /admin | Statistiques globales |
| Services & Prix | /admin/services | Gérer les services affichés |
| Tarifs | /admin/tarifs | Modifier les prix des services |
| Voyages | /admin/trips | Gérer les voyages organisés |
| Demandes Visa | /admin/visa-requests | Traiter les dossiers visa |
| Demandes Agence | /admin/agency-requests | Traiter les demandes de création d'agence |
| Demandes Crédit | /admin/credit-requests | Gérer les demandes de voyage à crédit |
| Cartes GO+ | /admin/go-plus | Gérer les cartes de fidélité |
| Témoignages | /admin/testimonials | Gérer les avis clients |
| Portfolio | /admin/portfolio | Gérer les réalisations |
| FAQ | /admin/faqs | Gérer les questions fréquentes |
| Chatbot | /admin/chatbot | Modifier les instructions du chatbot |
| Historique | /admin/logs | Journal des actions admin |

---

## 6. Fonctionnalités du site

### Pages publiques

| Page | URL | Description |
|---|---|---|
| Accueil | / | Hero, services, voyages en vedette, témoignages |
| À propos | /about | Présentation de l'agence |
| Services | /services | Liste complète des services |
| GO+ | /go-plus | Présentation et achat de la carte fidélité |
| Portfolio | /portfolio | Réalisations filtrables par service |
| Nos Voyages | /trips | Catalogue des voyages organisés |
| Facilitation Visa | /facilitation-visa | Formulaire de demande visa (3 étapes) |
| Création Agence | /creation-agence | Formulaire de création d'agence (2 étapes) |
| Voyage à Crédit | /voyage-credit | Demande de financement voyage |
| Réservation | /reservation | Réservation de consultation Calendly |
| Contact | /contact | Formulaire de contact + WhatsApp |
| FAQ | /faq | Questions fréquentes |

### Formulaires avec paiement intégré

- **Facilitation Visa** (`/facilitation-visa`) : Formulaire 3 étapes — infos personnelles → upload documents → paiement (MaishaPay ou PawaPay)
- **Création Agence** (`/creation-agence`) : Formulaire 2 étapes — choix du pack → paiement (MaishaPay ou PawaPay)
- **GO+** (`/go-plus`) : Achat de carte de fidélité en ligne

### Chatbot

Un chatbot flottant est présent sur toutes les pages. Il répond automatiquement aux questions des visiteurs. Ses instructions peuvent être modifiées depuis le panneau admin à la page `/admin/chatbot`.

### Calendly

Le système de réservation de consultation utilise Calendly. Les disponibilités sont synchronisées en temps réel depuis le compte Calendly de Mr Saint.

---

## 7. Système de tarification

Tous les tarifs sont stockés en base de données et modifiables directement depuis le panneau admin (`/admin/tarifs`) sans intervention technique.

### Tarifs actuels (modifiables)

| Service | Clé DB | Tarif par défaut |
|---|---|---|
| Facilitation Visa | `visa` | 600 € |
| Consultation expert | `consultation` | 20 € |
| Agence Classique | `agence_classique` | 800 € |
| Agence Premium | `agence_premium` | 1 500 € |
| Agence Elite | `agence_elite` | 2 500 € |

### Packs Création d'Agence

| Pack | Prix | Budget de démarrage | Revenu estimé |
|---|---|---|---|
| Classique | 800 € | 2 000 € | 1 500 € – 2 500 €/mois |
| Premium | 1 500 € | 6 000 € | 2 500 € – 5 000 €/mois |
| Elite | 2 500 € | 10 000 € | 25 000 € – 50 000 €/mois |

---

## 8. Paiements

### Providers de paiement

#### MaishaPay (carte bancaire)

Supporte Visa, Mastercard, American Express, UnionPay. Le client est redirigé vers une page de paiement sécurisée MaishaPay, puis revient automatiquement sur le site avec confirmation.

Variables d'environnement requises :
```
MAISHAPAY_PUBLIC_KEY=...
MAISHAPAY_SECRET_KEY=...
```

#### PawaPay (Mobile Money)

Supporte les opérateurs Mobile Money dans 19 pays africains (MTN, Orange, Airtel, M-Pesa...). Le client reçoit une notification push sur son téléphone pour valider le paiement.

Variables d'environnement requises :
```
PAWAPAY_API_TOKEN=...
PAWAPAY_ENV=production
```

### Pays supportés par PawaPay

RD Congo, Congo-Brazzaville, Cameroun, Côte d'Ivoire, Sénégal, Ghana, Tanzanie, Kenya, Uganda, Zambie, Zimbabwe, Mozambique, Madagascar, Rwanda, Burkina Faso, Mali, Niger, Guinée, Togo.

---

## 9. Emails transactionnels

Le site utilise **Resend** pour l'envoi automatique d'emails. Les emails suivants sont envoyés automatiquement :

| Déclencheur | Destinataire | Contenu |
|---|---|---|
| Nouvelle demande visa | Admin (matandusaint@gmail.com) | Alerte avec détails du dossier |
| Confirmation visa | Client | Accusé de réception de sa demande |
| Nouvelle demande agence | Admin | Alerte avec détails du formulaire |
| Paiement GO+ confirmé | Client | Confirmation et détails de la carte |

Variable d'environnement requise :
```
RESEND_API_KEY=...
```

---

## 10. Module GO+ (fidélité)

Le programme GO+ permet aux clients d'acheter une carte de fidélité valable 1 an avec des avantages sur tous les services.

### Plans disponibles

| Plan | Prix | Avantages principaux |
|---|---|---|
| Classique | 79 € | -10% sur les forfaits, -25% sur la facilitation visa |
| Premium | 179 € | -15% sur les forfaits, -35% sur visa, séjours partenaires |
| Gold | 299 € | Visa 100% gratuit, accès Voyage à Crédit, assistance VIP |

### Gestion admin

Depuis `/admin/go-plus`, l'administrateur peut :
- Voir toutes les cartes achetées
- Vérifier le statut d'une carte
- Activer / désactiver une carte manuellement
- Voir les transactions

---

## 11. Mise à jour et maintenance

### Mettre à jour le code source

Lorsque le développeur livre une nouvelle version du code sur GitHub :

```bash
# Se connecter au serveur SSH
ssh root@mrsaint.fr

# Aller dans le répertoire
cd /var/www/mr-saint

# Récupérer les mises à jour
git pull origin main

# Réinstaller les dépendances si nécessaire
npm install

# Recompiler l'application
npm run build

# Redémarrer l'application
pm2 restart mr-saint --update-env
```

### Mettre à jour la base de données (schéma)

Si le développeur a modifié le schéma de base de données :

```bash
cd /var/www/mr-saint
npm run db:push
```

### Renouvellement SSL

Le certificat SSL Let's Encrypt se renouvelle **automatiquement** via Certbot. Il expire tous les 90 jours mais est renouvelé avant expiration sans intervention manuelle.

---

## 12. Commandes utiles

### Gestion PM2

```bash
# Voir le statut de l'application
pm2 status

# Voir les logs en temps réel
pm2 logs mr-saint

# Voir les 50 dernières lignes de logs
pm2 logs mr-saint --lines 50

# Redémarrer l'application
pm2 restart mr-saint

# Arrêter l'application
pm2 stop mr-saint

# Démarrer l'application (si arrêtée)
pm2 start mr-saint

# Sauvegarder la configuration PM2 (à faire si on ajoute un nouveau processus)
pm2 save
```

### Gestion Nginx

```bash
# Vérifier la configuration Nginx
nginx -t

# Recharger Nginx (sans coupure)
systemctl reload nginx

# Redémarrer Nginx
systemctl restart nginx

# Voir les logs Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql -d mrsaint

# Lister les tables
\dt

# Quitter psql
\q

# Sauvegarder la base de données
sudo -u postgres pg_dump mrsaint > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
sudo -u postgres psql mrsaint < backup_20260301.sql
```

### Vérifier que le site fonctionne

```bash
# Tester que l'API répond
curl http://localhost:3000/api/prices

# Tester la connexion DB
sudo -u postgres psql -d mrsaint -c "SELECT COUNT(*) FROM trips;"
```

---

## 13. Variables d'environnement

Le fichier `.env` se trouve dans `/var/www/mr-saint/.env`. Ce fichier contient toutes les clés API et ne doit **jamais** être partagé publiquement ni commité sur GitHub.

### Liste des variables

| Variable | Description |
|---|---|
| `NODE_ENV` | Environnement (`production`) |
| `PORT` | Port de l'application (`3000`) |
| `APP_URL` | URL publique du site (`https://mrsaint.fr`) |
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `JWT_SECRET` | Secret pour les tokens de session admin |
| `RESEND_API_KEY` | Clé API Resend pour les emails |
| `PAWAPAY_API_TOKEN` | Token API PawaPay (Mobile Money) |
| `PAWAPAY_ENV` | Mode PawaPay (`production`) |
| `MAISHAPAY_PUBLIC_KEY` | Clé publique MaishaPay |
| `MAISHAPAY_SECRET_KEY` | Clé secrète MaishaPay |
| `OPENAI_API_KEY` | Clé API OpenAI (chatbot IA) |
| `CALENDLY_API_KEY` | Token API Calendly (réservations) |
| `UPLOADS_DIR` | Répertoire des uploads (`/var/www/mr-saint/uploads`) |

### Modifier une variable d'environnement

```bash
# Ouvrir le fichier .env
nano /var/www/mr-saint/.env

# Après modification, redémarrer l'application
pm2 restart mr-saint --update-env
```

---

## 14. Contacts et support

### Client

**Saint Matandu**
- Email : matandusaint@gmail.com
- WhatsApp : +33 6 66 01 38 66

### Développeur

**Herman IKA**
- GitHub : https://github.com/hermanIka
- Repository : https://github.com/hermanIka/MrSaintSite

---

## Notes importantes

1. **Sécurité** : Ne jamais partager le fichier `.env` ni les clés API.
2. **Sauvegardes** : Effectuer une sauvegarde de la base de données avant toute mise à jour majeure.
3. **Logs** : En cas de problème, commencer par `pm2 logs mr-saint --lines 50` pour identifier l'erreur.
4. **DNS** : Le domaine `mrsaint.fr` est géré sur Hostinger. Les serveurs de noms pointent vers le VPS (IP : 82.25.113.170).
5. **Uploads** : Les documents uploadés par les clients (passeports, photos, justificatifs) sont stockés dans `/var/www/mr-saint/uploads/`. Ce dossier doit être sauvegardé régulièrement.

---

*Document rédigé par Herman IKA — Mars 2026*
