import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { sql } from 'kysely';
import { db } from './db/index.js';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { referralRoutes } from './modules/referral/referral.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';

dotenv.config();

export async function buildApp(
  opts: FastifyServerOptions = {}
): Promise<FastifyInstance> {
  const app = Fastify({
    logger: true,
    ...opts,
  });

  const rawCors = process.env.CORS_ORIGIN || 'http://localhost:5173';
  const corsOrigins = rawCors
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  await app.register(cors, {
    origin: corsOrigins,
    credentials: true,
  });

  await app.register(authPlugin);
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(referralRoutes, { prefix: '/referral' });
  await app.register(usersRoutes, { prefix: '/users' });

  app.get('/health', async (_request, reply) => {
    try {
      await sql`SELECT 1`.execute(db);
      return reply.status(200).send({
        status: 'ok',
        database: 'terhubung',
      });
    } catch (err) {
      app.log.error({ err }, 'Health check failed: unable to query database');
      return reply.status(503).send({
        status: 'error',
        database: 'terputus',
      });
    }
  });

  return app;
}

