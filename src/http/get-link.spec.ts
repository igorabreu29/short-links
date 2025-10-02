import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "@/app.ts";
import { makeRequest } from "@/factories/make-request.ts";
import { makeShortLink } from "@/factories/make-short-link.ts";
import { redis } from "@/lib/redis.ts";
import { StatusCode } from "@/utils/status-code.ts";

describe("Get link (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("[GET /links/:code] should receive error when link does not exist", async () => {
    const response = await makeRequest<"get">("get", {
      url: `/links/${randomUUID()}`,
    });

    expect(response.statusCode).toEqual(StatusCode.BAD_REQUEST);
  });

  it("[GET /links/:code] should get cached link", async () => {
    const link = await makeShortLink();

    await redis.set(`links:${link.code}`, JSON.stringify(link));

    const response = await makeRequest<"get">("get", {
      url: `/links/${link.code}`,
    });

    expect(response.statusCode).toEqual(StatusCode.MOVED_PERMANENTLY);
  });

  it("[GET /links/:code] should get link", async () => {
    const link = await makeShortLink();

    const response = await makeRequest<"get">("get", {
      url: `/links/${link.code}`,
    });

    expect(response.statusCode).toEqual(StatusCode.MOVED_PERMANENTLY);
  });
});
