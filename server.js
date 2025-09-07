import Fastify from 'fastify';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import staticFiles from '@fastify/static';
import rateLimit from '@fastify/rate-limit';
import cors from '@fastify/cors';
import { join } from 'node:path';

const fastify = Fastify({
  logger: { level: process.env.NODE_ENV === 'production' ? 'warn' : 'info' },
  trustProxy: true
});

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // Plugins de sécurité
    await fastify.register(helmet, {
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

    await fastify.register(compress, { global: true, threshold: 1024 });
    await fastify.register(cors, { origin: false });
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        code: 429,
        error: 'Too Many Requests',
        message: 'Trop de requêtes, réessayez plus tard'
      })
    });

    // Fichiers statiques
    await fastify.register(staticFiles, {
      root: join(import.meta.dirname, 'public'),
      prefix: '/static/'
    });

    await fastify.register(staticFiles, {
      root: join(import.meta.dirname, 'public'),
      prefix: '/',
      decorateReply: false
    });

    await fastify.register(staticFiles, {
      root: join(import.meta.dirname, 'ZPlace'),
      prefix: '/zplace/',
      decorateReply: false
    });

    // Routes
    fastify.get('/', async (request, reply) => {
      return reply.sendFile('index.html', join(import.meta.dirname, 'public'));
    });

    fastify.get('/health', async () => ({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Cendres Incandescentes ZPlace Website',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '3.0.0-latest',
      nodeVersion: process.version,
      architecture: 'ESM',
      fastifyVersion: '5.6.0',
      dependencies: 'latest'
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
