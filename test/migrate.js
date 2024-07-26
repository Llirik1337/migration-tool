const { MognodbState, tsJsResolver, MigrationTool } = require('migration-tool');
const { globSync } = require('glob');

const config = {
  migrations: [
    ...globSync(`./migrations/*-migration.{t,j}s`, { absolute: true }).map(
      (path) => tsJsResolver(path),
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
