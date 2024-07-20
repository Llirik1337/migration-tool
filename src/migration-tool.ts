import { type FileResolver } from './resolvers';
import { type State } from './states';

export type MigrationFunction = (context?: unknown) => Promise<void> | void;

export interface Migration {
  fileName: string;
  up: MigrationFunction;
  down: MigrationFunction;
}

export interface MigrationToolOptions {
  migrations: Migration[];
  context?: unknown;
  initState: () => Promise<State>;
  resolvers?: Record<string, FileResolver>;
}

export class MigrationTool {
  constructor(private readonly options: MigrationToolOptions) {}

  async up(): Promise<void> {
    const { context, initState, migrations } = this.options;

    const state = await initState();

    try {
      const upMigrations = await state.getUpMigrations(migrations);

      if (upMigrations.length === 0) {
        console.log(`No migrations to up`);
        return;
      }

      for (const migration of upMigrations) {
        console.log(`Up: ${migration.fileName}`);
        await migration.up(context);
        await state.markaAsUp(migration);
        console.log(`Up: ${migration.fileName} ✔️`);
      }
    } finally {
      await state.close?.();
    }
  }

  async down(): Promise<void> {
    const { context, initState, migrations } = this.options;

    const state = await initState();

    try {
      const downMigrations = await state.getDownMigrations(migrations);

      if (downMigrations.length === 0) {
        console.log(`No migrations to down`);
        return;
      }

      for (const migration of downMigrations) {
        console.log(`Down: ${migration.fileName}`);
        await migration.down(context);
        await state.markAsDown(migration);
        console.log(`Down: ${migration.fileName} ✔️`);
      }
    } finally {
      await state.close?.();
    }
  }
}
