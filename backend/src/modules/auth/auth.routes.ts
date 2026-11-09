import type { FastifyInstance } from 'fastify';
import { authService, type RegisterSantriInput } from './auth.service.js';

export function parseDurationToSeconds(duration: string): number {
  const trimmed = duration.trim();
  const match = trimmed.match(/^(\d+)([smhd])?$/i);
  if (!match) return 12 * 3600;
  const value = parseInt(match[1]!, 10);
  const unit = (match[2] || 's').toLowerCase();
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 3600;
    case 'd':
      return value * 86400;
    default:
      return value;
  }
}

const loginSchema = {
  body: {
    type: 'object',
    required: ['username', 'password'],
    properties: {
      username: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
};

const changePasswordSchema = {
  body: {
    type: 'object',
    required: ['password_lama', 'password_baru'],
    properties: {
      password_lama: { type: 'string', minLength: 1 },
      password_baru: { type: 'string', minLength: 8 },
    },
    additionalProperties: false,
  },
};

const registerSchema = {
  body: {
    type: 'object',
    required: ['kode', 'nama', 'kontak', 'password', 'konfirmasi_password'],
    properties: {
      kode: { type: 'string', minLength: 1 },
      nama: { type: 'string', minLength: 1, maxLength: 100 },
      kontak: { type: 'string', minLength: 1 },
      password: { type: 'string', minLength: 8 },
      konfirmasi_password: { type: 'string', minLength: 8 },
    },
    additionalProperties: false,
  },
};

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: RegisterSantriInput }>(
    '/register',
    { schema: registerSchema },
    async (request, reply) => {
      const result = await authService.registerSantri(request.body);
      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      return reply.status(201).send({
        user: result.user,
      });
    }
  );

  app.post<{ Body: { username: string; password: string } }>(
    '/login',
    { schema: loginSchema },
    async (request, reply) => {
      const { username, password } = request.body;
      const result = await authService.login(username, password);

      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      const expiresIn = process.env.JWT_EXPIRES_IN || '12h';
      const token = await reply.jwtSign(
        {
          sub: result.user.id,
          peran: result.user.peran,
        },
        {
          expiresIn,
        }
      );

      const maxAgeSeconds = parseDurationToSeconds(expiresIn);
      const isProduction = process.env.NODE_ENV === 'production';

      reply.setCookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: isProduction,
        maxAge: maxAgeSeconds,
      });

      return reply.status(200).send({
        user: result.user,
      });
    }
  );

  app.post('/logout', async (_request, reply) => {
    const isProduction = process.env.NODE_ENV === 'production';
    reply.clearCookie('token', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
    });
    return reply.status(204).send();
  });

  app.get(
    '/me',
    { preHandler: [app.authenticate] },
    async (request, reply) => {
      return reply.status(200).send({
        user: request.user,
      });
    }
  );

  app.post<{ Body: { password_lama: string; password_baru: string } }>(
    '/change-password',
    {
      preHandler: [app.authenticate],
      schema: changePasswordSchema,
    },
    async (request, reply) => {
      const { password_lama, password_baru } = request.body;
      const result = await authService.changePassword(
        request.user.id,
        password_lama,
        password_baru
      );

      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      return reply.status(200).send({ ok: true });
    }
  );
}
