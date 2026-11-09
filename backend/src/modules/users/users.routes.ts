import type { FastifyInstance } from 'fastify';
import {
  usersService,
  type CreateStafInput,
  type ListStafQuery,
} from './users.service.js';

const createStafSchema = {
  body: {
    type: 'object',
    required: ['nama', 'email', 'peran'],
    properties: {
      nama: { type: 'string', minLength: 1, maxLength: 100 },
      email: { type: 'string', minLength: 1, maxLength: 254 },
      peran: { type: 'string', enum: ['WAKIL_ADMIN', 'PENASMI'] },
      kontak: { type: 'string' },
    },
    additionalProperties: false,
  },
};

const listStafSchema = {
  querystring: {
    type: 'object',
    properties: {
      peran: { type: 'string' },
      status: { type: 'string', enum: ['AKTIF', 'NONAKTIF'] },
      q: { type: 'string' },
      belum_ganti_password: { type: 'boolean' },
      page: { type: 'integer', minimum: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100 },
    },
    additionalProperties: false,
  },
};

const idParamSchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', minLength: 1 },
    },
    additionalProperties: false,
  },
};

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  // Semua route di /users memerlukan autentikasi dan peran ADMIN atau WAKIL_ADMIN
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireRole('ADMIN', 'WAKIL_ADMIN'));

  // 1. Buat akun staf baru
  app.post<{ Body: CreateStafInput }>(
    '/staf',
    { schema: createStafSchema },
    async (request, reply) => {
      const result = await usersService.createStaf(request.body, request.user);
      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      // Password sementara harus memakai header Cache-Control: no-store
      reply.header('Cache-Control', 'no-store');
      return reply.status(201).send(result.data);
    }
  );

  // 2. Ringkasan akun staf (harus didaftarkan sebelum rute dinamis /:id)
  app.get('/staf/ringkasan', async (request, reply) => {
    const result = await usersService.getRingkasan(request.user);
    if (!result.success) {
      return reply.status(result.status).send({
        code: result.code,
        message: result.message,
      });
    }

    return reply.status(200).send(result.data);
  });

  // 3. Daftar akun staf
  app.get<{ Querystring: ListStafQuery }>(
    '/staf',
    { schema: listStafSchema },
    async (request, reply) => {
      const result = await usersService.listStaf(request.query, request.user);
      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      return reply.status(200).send(result.data);
    }
  );

  // 4. Reset password
  app.post<{ Params: { id: string } }>(
    '/:id/reset-password',
    { schema: idParamSchema },
    async (request, reply) => {
      const result = await usersService.resetPassword(
        request.params.id,
        request.user
      );

      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      // Password sementara harus memakai header Cache-Control: no-store
      reply.header('Cache-Control', 'no-store');
      return reply.status(200).send(result.data);
    }
  );

  // 5. Nonaktifkan akun
  app.post<{ Params: { id: string } }>(
    '/:id/nonaktifkan',
    { schema: idParamSchema },
    async (request, reply) => {
      const result = await usersService.nonaktifkanUser(
        request.params.id,
        request.user
      );

      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      return reply.status(200).send(result.data);
    }
  );

  // 6. Aktifkan akun
  app.post<{ Params: { id: string } }>(
    '/:id/aktifkan',
    { schema: idParamSchema },
    async (request, reply) => {
      const result = await usersService.aktifkanUser(
        request.params.id,
        request.user
      );

      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }

      return reply.status(200).send(result.data);
    }
  );
}
