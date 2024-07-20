import { type Collection, MongoClient, type Document } from 'mongodb';
import { type Migration } from '../migration-tool';
import { type State } from '.';

export interface MongodbStateOptions {
  url: string;
  collection: string;
}

type MigrationDocument = {
  fileName: string;
  createdAt: Date;
} & Document;

export class MognodbState implements State {
  private collection!: Collection<MigrationDocument>;
  private client!: MongoClient;

  private constructor(private readonly options: MongodbStateOptions) {}

  private async connect(): Promise<void> {
    const { url, collection } = this.options;
    this.client = new MongoClient(url);
    await this.client.connect();
    const db = this.client.db();
    this.collection = db.collection(collection);
    await this.collection.createIndex(
      { fileName: 1 },
      { unique: true, name: `fileName-index` },
    );
    await this.collection.createIndex(
      { createdAt: 1 },
      { name: `created-at-index` },
    );
  }

  static async create(options: MongodbStateOptions): Promise<MognodbState> {
    const mongodbState = new MognodbState(options);

    await mongodbState.connect();

    return mongodbState;
  }

  async getUpMigrations(migrations: Migration[]): Promise<Migration[]> {
    const countMigrations = await this.collection.countDocuments();

    if (countMigrations === 0) {
      return migrations;
    }

    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      const exist = await this.collection.findOne({
        fileName: migration.fileName,
      });

      if (exist == null) {
        return migrations.slice(i);
      }
    }

    return [];
  }

  async getDownMigrations(migrations: Migration[]): Promise<Migration[]> {
    const lastMigrationFromDb = await this.collection.findOne(
      {},
      { sort: { createdAt: -1 } },
    );

    if (lastMigrationFromDb === null) {
      return [];
    }

    const index = migrations.findIndex(
      (migration) => migration.fileName === lastMigrationFromDb.fileName,
    );

    return migrations.slice(0, index + 1);
  }

  async markaAsUp(migration: Migration): Promise<void> {
    const { fileName } = migration;

    await this.collection.insertOne({ fileName, createdAt: new Date() });
  }

  async markAsDown(migration: Migration): Promise<void> {
    const { fileName } = migration;

    await this.collection.deleteOne({ fileName });
  }

  async close(): Promise<void> {
    await this.client.close(true);
  }
}
