import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { db } from '../db/index.js';

export interface AuthUser {
  id: string;
  nama: string;
  username: string;
  peran: 'ADMIN' | 'WAKIL_ADMIN' | 'PENASMI' | 'SANTRI';
  status: 'MENUNGGU' | 'AKTIF' | 'NONAKTIF';
  wajib_ganti_password: boolean;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      sub: string;
      peran: string;
    };
    user: AuthUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (
      ...roles: ('ADMIN' | 'WAKIL_ADMIN' | 'PENASMI' | 'SANTRI')[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireActiveUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
  interface FastifyRequest {
    user: AuthUser;
  }
}

async function authPlugin(app: FastifyInstance): Promise<void> {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET harus ditentukan di environment variables (.env)');
  }

  await app.register(fastifyCookie);
  await app.register(fastifyJwt, {
    secret: jwtSecret,
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify();
      } catch {
        return reply.status(401).send({
          code: 'UNAUTHORIZED',
          message: 'Token tidak valid atau tidak ditemukan.',
        });
      }

      const payload = request.user as { sub?: string; peran?: string } | undefined;
      const userId = payload?.sub;
      if (!userId) {
        return reply.status(401).send({
          code: 'UNAUTHORIZED',
          message: 'Sesi tidak valid.',
        });
      }

      const user = await db
        .selectFrom('users')
        .where('id', '=', userId)
        .select([
          'id',
          'nama',
          'username',
          'peran',
          'status',
          'wajib_ganti_password',
        ])
        .executeTakeFirst();

      if (!user) {
        return reply.status(401).send({
          code: 'USER_NOT_FOUND',
          message: 'Pengguna tidak ditemukan.',
        });
      }

      if (user.status === 'NONAKTIF') {
        return reply.status(403).send({
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Akun dinonaktifkan.',
        });
      }

      request.user = {
        id: user.id,
        nama: user.nama,
        username: user.username,
        peran: user.peran,
        status: user.status,
        wajib_ganti_password: Boolean(user.wajib_ganti_password),
      };

      if (request.user.wajib_ganti_password) {
        const rawPath = request.url.split('?')[0] ?? '';
        const normalizedPath =
          rawPath.endsWith('/') && rawPath.length > 1
            ? rawPath.slice(0, -1)
            : rawPath;
        const routeUrl = request.routeOptions?.url;
        const method = request.method;

        const isAllowed =
          (method === 'GET' &&
            (routeUrl === '/auth/me' || normalizedPath === '/auth/me')) ||
          (method === 'POST' &&
            (routeUrl === '/auth/logout' ||
              normalizedPath === '/auth/logout' ||
              routeUrl === '/auth/change-password' ||
              normalizedPath === '/auth/change-password'));

        if (!isAllowed) {
          return reply.status(403).send({
            code: 'PASSWORD_CHANGE_REQUIRED',
            message: 'Wajib mengganti password sebelum mengakses fitur lain.',
          });
        }
      }
    }
  );

  app.decorate(
    'requireRole',
    (...roles: ('ADMIN' | 'WAKIL_ADMIN' | 'PENASMI' | 'SANTRI')[]) => {
      return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
        if (!request.user || !roles.includes(request.user.peran)) {
          return reply.status(403).send({
            code: 'FORBIDDEN',
            message: 'Anda tidak memiliki hak akses untuk operasi ini.',
          });
        }
      };
    }
  );

  app.decorate(
    'requireActiveUser',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      if (!request.user || request.user.status === 'MENUNGGU') {
        return reply.status(403).send({
          code: 'STATUS_MENUNGGU',
          message: 'Akun masih menunggu penempatan halaqah.',
        });
      }
    }
  );
}

export default fp(authPlugin, {
  name: 'auth-plugin',
});

