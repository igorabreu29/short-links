import { sql } from "./lib/postgres.ts";

async function setup() {
  await sql`
    DROP TABLE IF EXISTS short_links;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS short_links (
      id VARCHAR(255) PRIMARY KEY,
      code VARCHAR(255) UNIQUE NOT NULL,
      original_url TEXT,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql.end();

  console.log("Setup feito com sucesso!");
}

setup();
