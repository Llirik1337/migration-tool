#!/usr/bin/env node
require('ts-node/register');
import { program } from 'commander';
import { MigrationTool, MigrationToolOptions } from './index';
import path from 'path';

(async () => {
  program
    .option(
      `-c, --config <path>`,
      `path to config file`,
      `./migration.config.ts`,
    )
    .option(`-d, --direction <up|down>`, `up or down`, `up`)
    .parse();

  const options: { config: string; direction: string; typescript: boolean } =
    program.opts();

  const configPath = path.resolve(process.cwd(), options.config);

  const config: MigrationToolOptions = require(configPath).default;

  const migrationTool = new MigrationTool(config);

  if (options.direction === 'up') {
    await migrationTool.up();
  } else {
    await migrationTool.down();
  }
})();
