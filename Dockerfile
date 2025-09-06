# Utilisation d'une image Node.js Alpine légère et sécurisée
FROM node:18-alpine

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances en mode production
RUN npm ci --omit=dev && npm cache clean --force

# Copie du code source
COPY --chown=node:node . .

# Création du répertoire pour les fichiers statiques avec les bonnes permissions
RUN mkdir -p /app/public /app/ZPlace && chown -R node:node /app

# Exposition du port
EXPOSE 3000

# Changement vers l'utilisateur non-root
USER node

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3000

# Commande de démarrage
CMD ["npm", "start"]

# Labels pour la documentation
LABEL maintainer="Phoenix RP Team"
LABEL description="Phoenix ZPlace Website for ZEvent charity event"
LABEL version="1.0.0"
