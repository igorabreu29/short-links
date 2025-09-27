import { config } from "dotenv";
import postgres from "postgres";
import { createClient } from "redis";
import { afterAll, beforeAll, beforeEach } from "vitest";

config({ path: ".env", override: true });
config({ path: ".env.test", override: true });

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

export const redis = createClient({
  url: `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  database: Number(process.env.REDIS_DB) || 1,
});

const baseUrl = new URL(process.env.DATABASE_URL);
const workerId = process.env.VITEST_WORKER_ID ?? "1";

const databaseName = baseUrl.pathname;
const workerDatabaseName = `${databaseName}_w${workerId}`;

const workerUrl = new URL(baseUrl.toString());
workerUrl.pathname = `/${workerDatabaseName}`;

process.env.DATABASE_URL = workerUrl.toString();

const shortLinkSql = postgres(baseUrl.toString());
const sql = postgres(process.env.DATABASE_URL);

beforeAll(async () => {
  await redis.connect();

  const dbExists = await shortLinkSql`
    SELECT 1 FROM pg_database WHERE datname = ${workerDatabaseName}
  `;

  if (dbExists.length === 0) {
    await shortLinkSql.unsafe(`CREATE DATABASE "${workerDatabaseName}"`);
  }

  await redis.flushDb();

  // Prepare schema for tests in this worker
  await sql.unsafe(`DROP TABLE IF EXISTS short_links;`);
  await sql.unsafe(`
    CREATE TABLE IF NOT EXISTS short_links (
      id VARCHAR(255) PRIMARY KEY,
      code VARCHAR(255) UNIQUE NOT NULL,
      original_url TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
});

beforeEach(async () => {
  const tables = await sql<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for await (const { tablename } of tables) {
    await sql.unsafe(`TRUNCATE TABLE "${tablename}" RESTART IDENTITY CASCADE;`);
  }
});

afterAll(async () => {
  try {
    await sql.end();
    await redis.quit();
    await shortLinkSql.unsafe(
      `DROP DATABASE IF EXISTS "${workerDatabaseName}" WITH (FORCE)`,
    );
  } catch {
  } finally {
    await shortLinkSql.end();
  }
});
