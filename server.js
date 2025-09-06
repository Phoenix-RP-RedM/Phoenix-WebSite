const fastify = require('fastify')({
  logger: { level: process.env.NODE_ENV === 'production' ? 'warn' : 'info' },
  trustProxy: true
});

const path = require('path');
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Plugins de sécurité
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

    await fastify.register(require('@fastify/compress'), { global: true, threshold: 1024 });
    await fastify.register(require('@fastify/cors'), { origin: false });
    await fastify.register(require('@fastify/rate-limit'), {
      max: 100,
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        code: 429,
        error: 'Too Many Requests',
        message: 'Trop de requêtes, réessayez plus tard'
      })
    });

    // Fichiers statiques
    await fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, 'public'),
      prefix: '/static/'
    });

    await fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, 'public'),
      prefix: '/',
      decorateReply: false
    });

    await fastify.register(require('@fastify/static'), {
      root: path.join(__dirname, 'ZPlace'),
      prefix: '/zplace/',
      decorateReply: false
    });

    // Routes
    fastify.get('/', async (request, reply) => {
      return reply.sendFile('index.html', path.join(__dirname, 'public'));
    });

    fastify.get('/health', async () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Cendres Incandescentes ZPlace Website',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '2.0.0'
    }));

    // Gestion d'erreurs
    fastify.setErrorHandler(async (error, request, reply) => {
      fastify.log.error(error);
      return reply.status(reply.statusCode === 429 ? 429 : 500).send({
        error: reply.statusCode === 429 ? 'Too Many Requests' : 'Erreur interne',
        message: reply.statusCode === 429 ? 'Trop de requêtes' : 'Une erreur est survenue'
      });
    });

    fastify.setNotFoundHandler(async () => ({
      error: 'Page non trouvée',
      message: 'La ressource demandée n\'existe pas'
    }));

    // Démarrage
    await fastify.listen({ port: PORT, host: '0.0.0.0' });

    console.log(`🚀 Serveur Cendres Incandescentes ZPlace (Fastify) démarré sur http://0.0.0.0:${PORT}`);
    console.log(`🎮 Participant au ZEvent - Événement caritatif`);
    console.log(`🎨 Présentant le logo Cendres Incandescentes en pixel art`);
    console.log(`📱 PWA activée avec Service Worker`);
    console.log(`🔒 Sécurité renforcée avec headers et rate limiting`);

  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Arrêt propre
['SIGTERM', 'SIGINT'].forEach(signal => {
  process.on(signal, async () => {
    console.log(`Réception du signal ${signal}, arrêt du serveur...`);
    try {
      await fastify.close();
      console.log('Serveur arrêté proprement');
      process.exit(0);
    } catch (err) {
      console.error('Erreur lors de l\'arrêt:', err);
      process.exit(1);
    }
  });
});

start();
