import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { BadRequestError } from "@/errors/bad-request-error.ts";
import { sql } from "@/lib/postgres.ts";
import { redis } from "@/lib/redis.ts";
import { StatusCode } from "@/utils/status-code.ts";

export const getLink: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/links/:code",
    {
      schema: {
        tags: ["links"],
        summary: "Get link by code",
        params: z.object({
          code: z
            .string()
            .min(3, { error: "The code cannot be less than 3 characters." }),
        }),
        response: {
          301: z.url(),
        },
      },
    },
    async (req, res) => {
      const { code } = req.params;

      const cachedLink = await redis.get(`links:${code}`);
      if (cachedLink) {
        const link = JSON.parse(cachedLink);
        await redis.zIncrBy("metrics", 1, link.id);

        return res
          .status(StatusCode.MOVED_PERMANENTLY)
          .redirect(link.original_url);
      }

      const result = await sql /*sql*/ `
        SELECT id, original_url
        FROM short_links
        WHERE short_links.code = ${code}
      `;

      if (result.length === 0) {
        throw new BadRequestError("Link not found.");
      }

      const link = result[0];

      await redis.set(`links:${code}`, JSON.stringify(link), {
        EX: 60 * 10, // 10 minutes
      });
      await redis.zIncrBy("metrics", 1, link.id);

      return res
        .status(StatusCode.MOVED_PERMANENTLY)
        .redirect(link.original_url);
    },
  );
};
