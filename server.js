const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"]
    }
  }
}));

// Compression des réponses
app.use(compression());

// Servir les fichiers statiques
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/zplace', express.static(path.join(__dirname, 'ZPlace')));

// Route principale
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route de santé pour le monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Phoenix ZPlace Website'
  });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Middleware pour les routes non trouvées
app.use((req, res) => {
  res.status(404).json({ error: 'Page non trouvée' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur Phoenix ZPlace démarré sur http://0.0.0.0:${PORT}`);
  console.log(`🎮 Participant au ZEvent - Événement caritatif`);
  console.log(`🎨 Présentant le logo Phoenix en pixel art`);
});

// Gestion propre de l'arrêt du serveur
process.on('SIGTERM', () => {
  console.log('Arrêt du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Arrêt du serveur...');
  process.exit(0);
});
