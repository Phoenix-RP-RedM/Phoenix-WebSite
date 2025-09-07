# Utilisation d'une image Node.js 24 Alpine récente et sécurisée
FROM node:24-alpine

# Installation des dépendances système nécessaires
RUN apk add --no-cache dumb-init

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances en mode production
# Utilisation de npm install pour générer un nouveau lock file compatible
RUN npm install --omit=dev --no-audit --no-fund && \
    npm cache clean --force

# Copie du code source et changement des permissions vers node
COPY . .
RUN chown -R node:node /app

# Changement vers l'utilisateur non-root après installation
USER node

# Exposition du port
EXPOSE 3000

# Variables d'environnement optimisées pour Node.js 24
ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--max-old-space-size=256"

# Health check pour Docker
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').request('http://localhost:3000', (res) => process.exit(res.statusCode === 200 ? 0 : 1)).end()"

# Utilisation de dumb-init pour une gestion propre des signaux
ENTRYPOINT ["dumb-init", "--"]

# Commande de démarrage optimisée
CMD ["node", "server.js"]

# Labels pour la documentation
LABEL maintainer="Cendres Incandescentes Team" \
      description="Cendres Incandescentes ZPlace Website for ZEvent charity event" \
      version="3.0.0" \
      node.version="24" \
      architecture="ESM" \
      org.opencontainers.image.source="https://github.com/phoenix-rp/cendres-incandescentes-zplace" \
      org.opencontainers.image.description="PWA pour l'événement caritatif ZEvent - Cendres Incandescentes"
