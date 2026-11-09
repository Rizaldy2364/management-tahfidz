import { Migrator, type Migration, type MigrationProvider } from 'kysely/migration';
import { db } from './index.js';
import * as migration001 from './migrations/001_init.js';

class StaticMigrationProvider implements MigrationProvider {
  async getMigrations(): Promise<Record<string, Migration>> {
    return {
      '001_init': migration001,
    };
  }
}

async function run(): Promise<void> {
  const migrator = new Migrator({
    db,
    provider: new StaticMigrationProvider(),
  });

  const action = process.argv[2] ?? 'up';

  let result;
  if (action === 'down') {
    result = await migrator.migrateDown();
  } else if (action === 'up') {
    result = await migrator.migrateToLatest();
  } else {
    console.error(`Aksi tidak dikenal: "${action}". Gunakan 'up' atau 'down'.`);
    process.exitCode = 1;
    return;
  }

  const { error, results } = result;

  results?.forEach((it) => {
    if (it.status === 'Success') {
      console.log(`Migrasi "${it.migrationName}" berhasil dijalankan (${action}).`);
    } else if (it.status === 'Error') {
      console.error(`Gagal menjalankan migrasi "${it.migrationName}".`);
    }
  });

  if (error) {
    console.error('Migrasi gagal:', error);
    process.exitCode = 1;
  }
}

run()
  .catch((err) => {
    console.error('Terjadi kesalahan fatal saat migrasi:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.destroy();
  });
