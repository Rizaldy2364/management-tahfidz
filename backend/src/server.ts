import dotenv from 'dotenv';
import { buildApp } from './app.js';
import { db } from './db/index.js';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const host = '0.0.0.0';

const start = async () => {
  const server = await buildApp();

  let isShuttingDown = false;
  const shutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    server.log.info(`Received ${signal}, closing server and database...`);
    try {
      await server.close();
      await db.destroy();
      server.log.info('Graceful shutdown completed.');
      process.exit(0);
    } catch (err) {
      server.log.error({ err }, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  try {
    await server.listen({ port, host });
  } catch (err) {
    server.log.error(err);
    await db.destroy();
    process.exit(1);
  }
};

void start();
