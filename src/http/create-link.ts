import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { ConflictError } from "@/errors/conflict-error.ts";
import { sql } from "@/lib/postgres.ts";
import { redis } from "@/lib/redis.ts";
import { createId } from "@/utils/create-id.ts";
import { StatusCode } from "@/utils/status-code.ts";

export const createLink: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/links",
    {
      schema: {
        tags: ["links"],
        summary: "Create short link code by url",
        body: z.object({
          code: z
            .string()
            .min(3, { error: "The code cannot be less than 3 characters." }),
          url: z.url({ error: "Invalid url format." }),
        }),
        response: {
          201: z.object({
            linkId: z.uuidv7(),
          }),
        },
      },
    },
    async (req, res) => {
      const { code, url } = req.body;

      const resultFindShortLinks = await sql`
        SELECT id from short_links
        WHERE code = ${code};
      `;

      const shortLinkWithSameCode = resultFindShortLinks[0];

      if (shortLinkWithSameCode) {
        throw new ConflictError("Short link with same code already exists.");
      }

      const [result] = await Promise.all([
        sql`
        INSERT INTO short_links (id, code, original_url)
        VALUES (${createId()}, ${code}, ${url})
        RETURNING id;
      `,
        await redis.del("links"),
      ]);

      const link = result[0];

      return res.status(StatusCode.CREATED).send({ linkId: link.id });
    },
  );
};
