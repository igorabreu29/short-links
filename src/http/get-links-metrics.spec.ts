import { app } from "@/app.ts";
import { makeRequest } from "@/factories/make-request.ts";
import { makeShortLink } from "@/factories/make-short-link.ts";
import { redis } from "@/lib/redis.ts";
import { StatusCode } from "@/utils/status-code.ts";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("Get links metrics (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("[GET /links/metrics] should get links metrics", async () => {
    const link = await makeShortLink({
      createdAt: new Date("2025-01-02"),
    });
    const link2 = await makeShortLink({
      createdAt: new Date("2025-01-01"),
    });

    await redis.zIncrBy("metrics", 2, link.id);
    await redis.zIncrBy("metrics", 1, link2.id);

    const response = await makeRequest<"get">("get", {
      url: "/links/metrics",
    });

    expect(response.statusCode).toEqual(StatusCode.OK);

    const { metrics } = response.body;

    expect(metrics).toMatchObject([
      {
        linkId: link.id,
        clicks: 2,
      },
      {
        linkId: link2.id,
        clicks: 1,
      },
    ]);
  });
});
