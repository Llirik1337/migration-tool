import { MognodbState, type MigrationToolOptions } from 'migration-tool';
import path from 'path';
import { globSync } from 'glob';

function loadTsJsMigration(filePath: string): {
  fileName: string;
  up: () => void;
  down: () => void;
} {
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-var-requires
  const { up = () => {}, down = () => {} } = require(path.resolve(
    filePath,
  )) as unknown as {
    up?: () => Promise<void>;
    down?: () => Promise<void>;
  };

  return {
    fileName: path.basename(filePath),
    up,
    down,
  };
}

const config: MigrationToolOptions = {
  migrations: [
    ...globSync(`./migrations/*-migration.{t,j}s`).map(loadTsJsMigration),
  ],
  initState: async function () {
    const state = await MognodbState.create({
      url: `mongodb://localhost:27017/tttt`,
      collection: `migrations`,
    });
    return state;
  },
};

export default config;
