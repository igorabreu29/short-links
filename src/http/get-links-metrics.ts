import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";
import { redis } from "@/lib/redis.ts";
import { StatusCode } from "@/utils/status-code.ts";

export const getLinksMetrics: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/links/metrics",
    {
      schema: {
        tags: ["links"],
        summary: "Get links metrics",
        response: {
          200: z.object({
            metrics: z.array(
              z.object({
                linkId: z.uuidv7(),
                clicks: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (_, res) => {
      const result = await redis.zRangeByScoreWithScores("metrics", 0, 50);

      const metrics = result
        .sort((a, b) => b.score - a.score)
        .map((item) => {
          return {
            linkId: item.value,
            clicks: item.score,
          };
        });

      return res.status(StatusCode.OK).send({
        metrics,
      });
    },
  );
};
