import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "@/app.ts";
import { makeRequest } from "@/factories/make-request.ts";
import { makeShortLink } from "@/factories/make-short-link.ts";
import { StatusCode } from "@/utils/status-code.ts";
import { redis } from "@/lib/redis.ts";

describe("Get links (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("[GET /links] should get links", async () => {
    const link = await makeShortLink({
      createdAt: new Date("2025-01-02"),
    });
    const link2 = await makeShortLink({
      createdAt: new Date("2025-01-01"),
    });

    const response = await makeRequest<"get">("get", {
      url: "/links",
    });

    expect(response.statusCode).toEqual(StatusCode.OK);

    const { links } = response.body;

    expect(links).toHaveLength(2);
    expect(links).toMatchObject([
      {
        id: link.id,
      },
      {
        id: link2.id,
      },
    ]);
  });

  it("[GET /links] should get cached links", async () => {
    const link = await makeShortLink({
      createdAt: new Date("2025-01-02"),
    });

    const link2 = await makeShortLink({
      createdAt: new Date("2025-01-01"),
    });

    await redis.set("links", JSON.stringify([link]));

    const response = await makeRequest<"get">("get", {
      url: "/links",
    });

    expect(response.statusCode).toEqual(StatusCode.OK);

    const { links } = response.body;

    expect(links).toHaveLength(1);
    expect(links).toMatchObject([
      {
        id: link.id,
      },
    ]);
  });
});
