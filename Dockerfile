FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le reste de l'application
COPY . .

# Créer le dossier uploads
RUN mkdir -p uploads/kyc/ids uploads/kyc/selfies uploads/files

# Exposer le port
EXPOSE 3000

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Démarrer l'application
CMD ["node", "app.js"]