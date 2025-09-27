import { createClient } from "redis";
import { env } from "@/env.ts";

export const redis = createClient({
  url: `redis://:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}`,
  database: env.REDIS_DB,
});

await redis.connect();
