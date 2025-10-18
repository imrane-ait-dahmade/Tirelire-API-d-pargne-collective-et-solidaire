# 🪙 Tirelire API - API d'Épargne Collective et Solidaire

API RESTful complète pour la gestion de groupes d'épargne collective avec système KYC, score de fiabilité et traçabilité des transactions.

## 📋 Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Tests](#tests)
- [Docker](#docker)
- [Sécurité](#sécurité)
- [Contribuer](#contribuer)

## 🎯 Présentation

L'API Tirelire est une solution moderne et sécurisée pour gérer des groupes d'épargne collective (tontines). Elle permet aux utilisateurs de créer des groupes, d'effectuer des contributions régulières, de gérer des tours de distribution et de suivre l'historique complet des transactions.

### Points forts

- ✅ **Système KYC complet** avec vérification faciale (préparé pour intégration)
- ✅ **Score de fiabilité** basé sur l'historique de paiement
- ✅ **Traçabilité totale** de toutes les opérations financières
- ✅ **Système de tickets** pour la résolution de problèmes
- ✅ **Messagerie intégrée** (texte et audio)
- ✅ **Notifications automatiques** pour les rappels de paiement
- ✅ **Architecture n-tiers** avec séparation des responsabilités
- ✅ **Tests Jest** avec couverture >80%

## 🚀 Fonctionnalités

### Gestion des utilisateurs
- Inscription et authentification JWT
- Profils utilisateurs avec données KYC
- Score de fiabilité automatique
- Gestion des rôles (Particulier, Admin)

### Système KYC
- Soumission de documents d'identité
- Upload de photos/selfies
- Vérification manuelle par administrateur
- Préparation pour vérification faciale automatique

### Gestion des groupes
- Création et configuration de groupes
- Ajout/retrait de membres
- Paramétrage des contributions (montant, fréquence, délais)
- Démarrage et clôture de groupes
- Score de fiabilité minimum requis

### Tours de contribution
- Génération automatique de l'ordre basé sur le score de fiabilité
- Suivi des contributions de chaque membre
- Calcul automatique des montants collectés
- Distribution au bénéficiaire du tour

### Transactions
- Création de contributions
- Confirmation de paiements
- Historique complet et filtrable
- Système de litiges avec résolution
- Traçabilité complète (IP, user-agent, timestamps)

### Communication
- Messagerie de groupe (texte et audio)
- Système de tickets pour le support
- Notifications automatiques
- Rappels de paiement

## 🛠 Technologies

### Backend
- **Node.js** (v20+)
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM pour MongoDB

### Sécurité
- **JWT** - Authentification
- **bcryptjs** - Hashage de mots de passe
- **Helmet** - Sécurité des headers HTTP
- **express-rate-limit** - Limitation de requêtes
- **CORS** - Cross-Origin Resource Sharing

### Upload & Validation
- **Multer** - Upload de fichiers
- **express-validator** - Validation des données

### Tests
- **Jest** - Framework de tests
- **Supertest** - Tests d'intégration

### Autres
- **Morgan** - Logging HTTP
- **dotenv** - Variables d'environnement
- **Docker** - Conteneurisation

## 📦 Installation

### Prérequis

- Node.js v20 ou supérieur
- MongoDB v7 ou supérieur
- npm ou yarn

### Installation locale

1. **Cloner le repository**
   ```bash
   git clone https://github.com/votre-username/tirelire-api.git
   cd tirelire-api
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env
   ```
   
   Modifier le fichier `.env` avec vos propres valeurs.

4. **Démarrer MongoDB**
   ```bash
   # Avec Docker
   docker run -d -p 27017:27017 --name mongodb mongo:7
   
   # Ou utiliser MongoDB local
   mongod
   ```

5. **Lancer l'application**
   ```bash
   # Développement
   npm start
   
   # Production
   npm run dev
   ```

L'API sera accessible sur `http://localhost:3000`

## ⚙️ Configuration

Créez un fichier `.env` à la racine du projet :

```env
# Environment
NODE_ENV=development
PORT=3000

# MongoDB
MONGO_URI=mongodb://localhost:27017/tirelire

# JWT
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=*

# Upload
MAX_FILE_SIZE=10485760

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@example.com
EMAIL_PASS=votre-mot-de-passe

# SMS (optionnel)
SMS_API_KEY=votre-cle-api-sms
SMS_SENDER=Tirelire
```

## 📖 Utilisation

### Exemple d'inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "password": "Password123"
  }'
```

### Exemple de connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "Password123"
  }'
```

### Exemple de création de groupe

```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{
    "name": "Groupe Famille",
    "description": "Épargne familiale",
    "contributionSettings": {
      "amount": 1000,
      "frequency": "mensuel",
      "paymentDeadline": 15
    }
  }'
```

## 🏗 Architecture

Le projet suit une **architecture n-tiers** avec séparation claire des responsabilités :

```
tirelire-api/
├── app/
│   ├── Models/              # Modèles Mongoose
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Round.js
│   │   ├── Transaction.js
│   │   ├── Ticket.js
│   │   ├── Message.js
│   │   └── Notification.js
│   │
│   ├── Services/            # Logique métier (OOP)
│   │   ├── BaseService.js
│   │   ├── AuthService.js
│   │   ├── UserService.js
│   │   ├── KYCService.js
│   │   ├── GroupService.js
│   │   ├── RoundService.js
│   │   ├── TransactionService.js
│   │   ├── TicketService.js
│   │   ├── MessageService.js
│   │   └── NotificationService.js
│   │
│   └── Http/
│       ├── Controllers/     # Contrôleurs
│       ├── Middlewares/     # Middlewares
│       └── Validators/      # Validations
│
├── routes/                  # Définition des routes
├── tests/                   # Tests Jest
├── uploads/                 # Fichiers uploadés
├── config/                  # Configuration
└── app.js                   # Point d'entrée
```

### Principes de conception

- **OOP (Programmation Orientée Objet)** : Services structurés en classes
- **Single Responsibility** : Chaque module a une responsabilité unique
- **DRY (Don't Repeat Yourself)** : BaseService pour éviter la duplication
- **Middleware Pipeline** : Validation, authentification, autorisation
- **Error Handling** : Gestion centralisée des erreurs

## 📚 API Documentation

### Endpoints principaux

#### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/change-password` - Changer le mot de passe
- `GET /api/auth/me` - Obtenir l'utilisateur actuel

#### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (Admin)
- `GET /api/users/:id` - Détails d'un utilisateur
- `PUT /api/users/profile` - Mettre à jour le profil
- `GET /api/users/stats/me` - Statistiques personnelles

#### KYC
- `POST /api/kyc/submit` - Soumettre les documents KYC
- `GET /api/kyc/status` - Statut KYC
- `GET /api/kyc/pending` - KYC en attente (Admin)
- `POST /api/kyc/:userId/verify` - Vérifier un KYC (Admin)

#### Groupes
- `POST /api/groups` - Créer un groupe
- `GET /api/groups` - Mes groupes
- `GET /api/groups/:id` - Détails d'un groupe
- `POST /api/groups/:id/members` - Ajouter un membre
- `DELETE /api/groups/:id/members` - Retirer un membre
- `POST /api/groups/:id/start` - Démarrer un groupe

#### Tours
- `GET /api/groups/:groupId/rounds` - Tours d'un groupe
- `GET /api/groups/:groupId/rounds/current` - Tour actuel
- `GET /api/rounds/:id/stats` - Statistiques d'un tour

#### Transactions
- `POST /api/transactions/contribute` - Effectuer une contribution
- `POST /api/transactions/:id/confirm` - Confirmer une transaction
- `GET /api/transactions/me` - Mes transactions
- `POST /api/transactions/:id/dispute` - Créer un litige

#### Tickets
- `POST /api/tickets` - Créer un ticket
- `GET /api/tickets/me` - Mes tickets
- `POST /api/tickets/:id/response` - Répondre à un ticket

#### Messages
- `POST /api/messages` - Envoyer un message
- `GET /api/groups/:groupId/messages` - Messages d'un groupe
- `POST /api/messages/:id/read` - Marquer comme lu

#### Notifications
- `GET /api/notifications` - Mes notifications
- `POST /api/notifications/:id/read` - Marquer comme lue
- `GET /api/notifications/unread` - Nombre non lues

## 🧪 Tests

Les tests sont écrits avec Jest et atteignent une couverture de >80%.

### Lancer les tests

```bash
# Tous les tests avec couverture
npm test

# Tests en mode watch
npm run test:watch
```

### Structure des tests

```
tests/
├── setup.js                 # Configuration Jest
├── models/
│   └── User.test.js
└── services/
    ├── AuthService.test.js
    ├── UserService.test.js
    └── GroupService.test.js
```

### Rapport de couverture

Un rapport HTML est généré dans `coverage/index.html` après l'exécution des tests.

## 🐳 Docker

### Démarrage avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f app

# Arrêter les services
docker-compose down

# Supprimer les volumes (données)
docker-compose down -v
```

### Services disponibles

- **API** : `http://localhost:3000`
- **MongoDB** : `localhost:27017`
- **Mongo Express** : `http://localhost:8081` (admin/admin)

### Build manuel

```bash
# Build l'image
docker build -t tirelire-api .

# Lancer le conteneur
docker run -d -p 3000:3000 --env-file .env tirelire-api
```

## 🔒 Sécurité

### Mesures de sécurité implémentées

- ✅ **Authentification JWT** avec expiration
- ✅ **Hashage bcrypt** des mots de passe
- ✅ **Validation des entrées** avec express-validator
- ✅ **Rate limiting** pour prévenir les abus
- ✅ **Helmet** pour sécuriser les headers HTTP
- ✅ **CORS** configuré
- ✅ **KYC obligatoire** pour les actions sensibles
- ✅ **Traçabilité** de toutes les transactions
- ✅ **Gestion des rôles** (Particulier, Admin)

### Bonnes pratiques

- Ne jamais commiter le fichier `.env`
- Utiliser des secrets JWT forts en production
- Activer HTTPS en production
- Limiter les tentatives de connexion
- Logger toutes les actions sensibles

## 📝 Planification JIRA

Le projet est géré avec JIRA avec :
- **Epics** pour les grandes fonctionnalités
- **User Stories** pour les besoins utilisateurs
- **Tasks** et **Sub-tasks** pour le découpage technique
- **Automation** reliée à GitHub

### Structure JIRA

**Epic 1 : Authentification et KYC**
- US-1 : En tant qu'utilisateur, je veux créer un compte
- US-2 : En tant qu'utilisateur, je veux soumettre mon KYC

**Epic 2 : Gestion des groupes**
- US-3 : En tant qu'utilisateur, je veux créer un groupe
- US-4 : En tant qu'admin de groupe, je veux gérer les membres

**Epic 3 : Contributions et tours**
- US-5 : En tant que membre, je veux effectuer une contribution
- US-6 : En tant que bénéficiaire, je veux recevoir ma distribution

**Epic 4 : Communication et support**
- US-7 : En tant que membre, je veux communiquer avec le groupe
- US-8 : En tant qu'utilisateur, je veux créer un ticket

## 👨‍💻 Contribuer

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Conventions

- **Commits** : Suivre Conventional Commits
- **Tests** : Maintenir la couverture >80%
- **Code** : Suivre les conventions ESLint
- **Documentation** : Mettre à jour le README si nécessaire

## 📄 Licence

Ce projet est sous licence MIT.

## 📞 Contact

Pour toute question ou suggestion :
- Email : contact@tirelire-api.com
- GitHub Issues : [Ouvrir un ticket](https://github.com/votre-username/tirelire-api/issues)

## 🙏 Remerciements

- Youcode pour le projet
- La communauté Node.js
- Tous les contributeurs

---

**Note** : Ce projet a été développé dans le cadre d'un projet pédagogique Youcode.

**Date limite** : 17/10/2025

**Développé avec ❤️ par [Votre Nom]**


