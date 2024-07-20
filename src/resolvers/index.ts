import { extname, resolve } from 'node:path';
import type { Migration } from '../migration-tool';
import { typescriptResolver } from './ts.resolver';
import { readdir } from 'node:fs/promises';
import { javascriptResolver } from './js.resolver';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-empty-function
export const nullFunction = () => {};

export type FileResolver = (filePath: string) => Promise<Migration> | Migration;

export const filesResolvers: Record<string, FileResolver | undefined> = {
  '.ts': typescriptResolver,
  '.js': javascriptResolver,
};

export interface MigrationsResolverOptions {
  dir: string;
  resolvers?: Record<string, FileResolver>;
}

export const resolveMigrations = async (
  options: MigrationsResolverOptions,
): Promise<Migration[]> => {
  const { dir, resolvers = filesResolvers } = options;

  const files = await readdir(dir, { withFileTypes: true });

  return await Promise.all(
    files.flatMap((file) => {
      if (file.isDirectory()) {
        return [];
      }

      const ext = extname(file.name);
      const resolver = resolvers[ext];

      if (resolver == null) {
        return [];
      }

      return [resolver(resolve(dir, file.name))];
    }),
  );
};
