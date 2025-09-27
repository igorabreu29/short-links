import { z } from "zod";

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(["prod", "dev"]).default("prod"),
  DATABASE_URL: z.url().startsWith("postgresql://"),
  REDIS_HOST: z.hostname(),
  REDIS_PASSWORD: z.string(),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_DB: z.coerce.number().default(0),
});

export const env = envSchema.parse(process.env);
