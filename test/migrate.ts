import {
  MognodbState,
  type MigrationToolOptions,
  tsJsResolver,
  type Migration,
  MigrationTool,
} from 'migration-tool';
import { globSync } from 'glob';

const config: MigrationToolOptions = {
  migrations: [
    ...globSync(`./migrations/*-migration.{t,j}s`, { absolute: true }).map(
      (path): Migration => tsJsResolver(path),
    ),
  ],
  initState: async function () {
    const state = await MognodbState.create({
      url: `mongodb://localhost:27017/tttt`,
      collection: `migrations`,
    });
    return state;
  },
};

void MigrationTool.run(config);
