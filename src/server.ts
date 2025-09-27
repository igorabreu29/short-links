import { app } from "./app.ts";
import { env } from "./env.ts";
import { sql } from "./lib/postgres.ts";
import { redis } from "./lib/redis.ts";

try {
  await app.listen({
    port: env.PORT,
    host: "0.0.0.0",
  });

  console.log(`Server running on port ${env.PORT}`);
} catch (err) {
  console.error(err);

  await redis.quit();
  await sql.end();
  process.exit(1);
}
