# Phoenix ZPlace Website
Site web pour présenter le logo Phoenix en pixel art dans le cadre du ZEvent - événement caritatif

## 🎯 Introduction
Ce projet est un serveur web Node.js simple et sécurisé conçu pour présenter le logo Phoenix en pixel art dans le cadre de notre participation au **ZPlace** du **ZEvent**. 

Le ZEvent est l'un des plus grands événements caritatifs de la communauté gaming francophone, où des streamers et créateurs de contenu se rassemblent pour lever des fonds pour des associations caritatives.

### Fonctionnalités
- 🎨 Affichage du logo Phoenix en pixel art optimisé
- 🔒 Serveur sécurisé avec Helmet.js
- 🚀 Dockerisé pour un déploiement facile
- 📱 Interface responsive et moderne
- 🏥 Endpoint de santé pour le monitoring
- ⚡ Compression et optimisation des performances

## 🖼️ Aperçu
![Logo Phoenix ZPlace](ZPlace/ZPlace_Logo_C.I.png)

*Notre logo en pixel art pour le ZPlace du ZEvent*

## 🛠️ Technologies utilisées
- **Node.js** (v18+) - Runtime JavaScript
- **Express.js** - Framework web
- **Helmet.js** - Sécurité HTTP
- **Docker** - Containerisation
- **HTML5/CSS3** - Interface utilisateur

## 📦 Installation

### Prérequis
- Node.js 18+ 
- Docker (optionnel)
- npm ou yarn

### Installation locale
```bash
# Cloner le repository
git clone <repository-url>
cd Phoenix-WebSite

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Lancer en mode production
npm start
```

### Installation avec Docker
```bash
# Construire l'image
docker build -t phoenix-zplace-web .

# Lancer le conteneur
docker run -d -p 3000:3000 --name phoenix-zplace-web phoenix-zplace-web
```

## 🚀 Déploiement

Le serveur expose le port 3000 par défaut. L'application inclut :
- Route principale `/` - Page de présentation
- Route de santé `/health` - Pour le monitoring
- Fichiers statiques servis depuis `/static` et `/zplace`

### Variables d'environnement
- `PORT` - Port d'écoute (défaut: 3000)
- `NODE_ENV` - Environnement (development/production)

## 🔧 Configuration Docker

Le projet inclut une configuration Docker avec :
- Image Alpine légère pour la sécurité
- Utilisateur non-root
- Health checks intégrés
- Optimisation des performances

## 🎮 À propos du ZEvent

Le ZEvent est un événement caritatif majeur de la communauté gaming francophone. Le ZPlace est un canvas collaboratif en pixel art où chaque communauté peut contribuer à une œuvre d'art collective tout en soutenant des causes caritatives.

## 🏗️ Structure du projet
```
Phoenix-WebSite/
├── server.js              # Serveur Express principal
├── package.json           # Dépendances et scripts
├── Dockerfile             # Configuration Docker
├── public/                # Fichiers statiques
│   └── index.html         # Page principale
├── ZPlace/                # Assets ZPlace
│   └── ZPlace_Logo_C.I.png # Logo en pixel art
└── README.md              # Documentation
```

## 🔒 Sécurité

Le serveur implémente plusieurs mesures de sécurité :
- Headers de sécurité avec Helmet.js
- Content Security Policy (CSP)
- Utilisateur non-root dans Docker
- Gestion d'erreurs centralisée
- Validation des entrées

## 🎯 Roadmap

- [x] Serveur web basique
- [x] Interface de présentation du logo
- [x] Dockerisation complète
- [ ] Ajout de l'image complète du ZPlace final
- [ ] Intégration de métriques de monitoring
- [ ] Support multi-langues

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -am 'Ajout d'une fonctionnalité'`)
4. Push la branche (`git push origin feature/amelioration`)
5. Ouvrir une Pull Request

## 📄 Licence
Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Crédits
**Équipe Phoenix RP** - Développement et design
**Communauté ZEvent** - Inspiration et support de l'événement caritatif

---

## 🎮 Phoenix Project
Phoenix is a _(Red Dead Redemption 2)_ RedM roleplay framework that is designed to bring your roleplay to a new level of immersion.

**GitHub** : https://github.com/Phoenix-RP-RedM
**Discord** : https://discord.gg/pdFdGK8Pv2
