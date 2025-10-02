import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { sql } from "@/lib/postgres.ts";
import { redis } from "@/lib/redis.ts";
import { StatusCode } from "@/utils/status-code.ts";

interface Link {
  original_url: string;
  code: string;
  id: string;
}

export const getLinks: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/links",
    {
      schema: {
        tags: ["links"],
        summary: "Get links",
        response: {
          200: z.object({
            links: z.array(
              z.object({
                id: z.string(),
                code: z.string(),
                original_url: z.url(),
              }),
            ),
          }),
        },
      },
    },
    async (_, res) => {
      const cachedLinks = await redis.get("links");
      if (cachedLinks) {
        const cacheData = JSON.parse(cachedLinks);
        return res.status(StatusCode.OK).send({
          links: cacheData,
        });
      }

      const links = await sql<Link[]>`
        SELECT *
        FROM short_links
        ORDER BY created_at DESC;
      `;

      await redis.set("links", JSON.stringify(links), {
        EX: 60 * 10, // 10 minutes,
      });

      return res.status(StatusCode.OK).send({
        links,
      });
    },
  );
};
