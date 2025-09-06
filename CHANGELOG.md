# 2.0.0 (2025-09-06)

### Features
* **Cendres-Incandescentes-ZPlace-Website:** Refonte complète du site
  - Rebranding : Phoenix → Cendres Incandescentes (nom officiel)
  - Design moderne avec approche mobile-first
  - Architecture PWA (Progressive Web App) complète
  - Service Worker pour mode hors ligne
  - Web App Manifest pour installation sur mobile
  - Interface responsive avec animations fluides
  - Système de cache intelligent (statique + dynamique)
  - Indicateur visuel de connexion (en ligne/hors ligne)
  - Background Sync pour synchronisation en arrière-plan
  - Monitoring des performances en temps réel
  - Support des notifications push (préparé)
  - Préchargement optimisé des ressources
  - Headers de sécurité renforcés

### Technical
* **PWA:** Service Worker avec stratégies de cache avancées
* **Performance:** Lazy loading, preload, intersection observer
* **Security:** CSP améliorée, rate limiting, CORS configuré
* **Mobile:** Design mobile-first, touch-friendly, app-like UX
* **Offline:** Cache intelligent, fallback, sync en arrière-plan
* **Modern Web:** ES6+, Web APIs modernes, progressive enhancement

### UI/UX
* **Design:** Interface moderne avec gradient dynamique
* **Animations:** Transitions fluides, hover effects, scroll animations
* **Typography:** Typographie responsive, hiérarchie claire
* **Colors:** Palette moderne (rouge, turquoise, jaune)
* **Icons:** Émojis pour l'accessibilité, instructions claires
* **Cards:** Design card-based avec glassmorphism

# 1.0.0 (2025-09-06)

### Features
* **Phoenix-ZPlace-Website:** Création du site web pour le ZEvent
  - Serveur Node.js/Express.js sécurisé
  - Interface responsive pour présenter le logo Phoenix en pixel art
  - Dockerisation complète avec Docker Compose
  - Headers de sécurité avec Helmet.js
  - Compression et optimisation des performances
  - Endpoint de santé pour le monitoring
  - Support du logo ZPlace en pixel art
  - Documentation complète du projet

### Technical
* **Dependencies:** Express.js, Helmet.js, Compression
* **Security:** CSP, utilisateur non-root Docker, gestion d'erreurs
* **Performance:** Compression gzip, cache des assets statiques
* **Deployment:** Docker multi-stage, health checks, resource limits

### Documentation
* **README:** Guide complet d'installation et déploiement
* **CHANGELOG:** Suivi des versions et fonctionnalités
