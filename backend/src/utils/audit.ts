import type { Kysely, Transaction } from 'kysely';
import type { Database } from '../db/types.js';
import { newId } from './id.js';

export interface AuditParams {
  pelaku_id: string | null;
  aksi: string;
  objek: string;
  detail: unknown;
}

export async function catatAudit(
  dbOrTrx: Kysely<Database> | Transaction<Database>,
  params: AuditParams
): Promise<void> {
  await dbOrTrx
    .insertInto('audit_logs')
    .values({
      id: newId(),
      pelaku_id: params.pelaku_id,
      aksi: params.aksi,
      objek: params.objek,
      detail_perubahan: params.detail ? JSON.stringify(params.detail) : null,
    })
    .execute();
}

