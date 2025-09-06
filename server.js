const fastify = require('fastify')({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info'
  },
  trustProxy: true
});

const path = require('path');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Enregistrement des plugins de sécurité
    await fastify.register(require('@fastify/helmet'), {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "https:"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          connectSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"]
        }
      },
      crossOriginEmbedderPolicy: false
    });

    // Plugin de compression
    await fastify.register(require('@fastify/compress'), {
      global: true,
      threshold: 1024
    });

    // Plugin CORS
    await fastify.register(require('@fastify/cors'), {
      origin: false
    });

    // Plugin de limitation de taux
    await fastify.register(require('@fastify/rate-limit'), {
      max: 100,
      timeWindow: '1 minute',
      errorResponseBuilder: function (request, context) {
        return {
          code: 429,
          error: 'Too Many Requests',
          message: `Trop de requêtes, réessayez dans ${Math.round(context.ttl / 1000)} secondes`
        }
      }
    });

    // Servir les fichiers statiques
    await fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, 'public'),
      prefix: '/static/'
    });

    await fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, 'ZPlace'),
      prefix: '/zplace/',
      decorateReply: false
    });

    // Route principale
    fastify.get('/', async (request, reply) => {
      return reply.sendFile('index.html', path.join(__dirname, 'public'));
    });

    // Route de santé pour le monitoring
    fastify.get('/health', async (request, reply) => {
      return {
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Phoenix ZPlace Website',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };
    });

    // Middleware de gestion d'erreurs
    fastify.setErrorHandler(async (error, request, reply) => {
      fastify.log.error(error);
      
      if (reply.statusCode === 429) {
        return reply.send({
          error: 'Too Many Requests',
          message: 'Trop de requêtes, veuillez patienter'
        });
      }

      return reply.status(500).send({
        error: 'Erreur interne du serveur',
        message: 'Une erreur est survenue'
      });
    });

    // Middleware pour les routes non trouvées
    fastify.setNotFoundHandler(async (request, reply) => {
      return reply.status(404).send({
        error: 'Page non trouvée',
        message: 'La ressource demandée n\'existe pas'
      });
    });

    // Démarrage du serveur
    await fastify.listen({ 
      port: PORT, 
      host: '0.0.0.0' 
    });

    console.log(`🚀 Serveur Phoenix ZPlace (Fastify) démarré sur http://0.0.0.0:${PORT}`);
    console.log(`🎮 Participant au ZEvent - Événement caritatif`);
    console.log(`🎨 Présentant le logo Phoenix en pixel art`);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt du serveur
const gracefulShutdown = async (signal) => {
  console.log(`Réception du signal ${signal}, arrêt du serveur...`);
  try {
    await fastify.close();
    console.log('Serveur arrêté proprement');
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de l\'arrêt du serveur:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Démarrage de l'application
start();
