import type { FastifyInstance } from 'fastify';
import { referralService } from './referral.service.js';

const createReferralSchema = {
  body: {
    type: 'object',
    required: ['label', 'kuota'],
    properties: {
      label: { type: 'string', minLength: 1, maxLength: 100 },
      kuota: { type: 'integer', minimum: 1 },
      kedaluwarsa: { type: 'string' },
      kode: { type: 'string' },
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

export async function referralRoutes(app: FastifyInstance): Promise<void> {
  // Semua route referral diakses oleh ADMIN dan WAKIL_ADMIN
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireRole('ADMIN', 'WAKIL_ADMIN'));

  app.post<{
    Body: {
      label: string;
      kuota: number;
      kedaluwarsa?: string | null;
      kode?: string | null;
    };
  }>('/', { schema: createReferralSchema }, async (request, reply) => {
    const result = await referralService.createReferral({
      ...request.body,
      createdBy: request.user.id,
    });

    if (!result.success) {
      return reply.status(result.status).send({
        code: result.code,
        message: result.message,
      });
    }

    return reply.status(201).send(result.data);
  });

  app.get('/', async (_request, reply) => {
    const list = await referralService.listReferrals();
    return reply.status(200).send(list);
  });

  app.get('/ringkasan', async (_request, reply) => {
    const summary = await referralService.getSummary();
    return reply.status(200).send(summary);
  });

  app.get<{ Params: { id: string } }>(
    '/:id/pendaftar',
    { schema: idParamSchema },
    async (request, reply) => {
      const result = await referralService.getPendaftar(request.params.id);
      if (!result.success) {
        return reply.status(result.status).send({
          code: result.code,
          message: result.message,
        });
      }
      return reply.status(200).send(result.data);
    }
  );

  app.post<{ Params: { id: string } }>(
    '/:id/nonaktifkan',
    { schema: idParamSchema },
    async (request, reply) => {
      const result = await referralService.deactivateReferral(
        request.params.id,
        request.user.id
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

