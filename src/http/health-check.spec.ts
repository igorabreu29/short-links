import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "@/app.ts";
import { makeRequest } from "@/factories/make-request.ts";
import { StatusCode } from "@/utils/status-code.ts";

describe("Health-Check (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("[GET /health] verify health", async () => {
    const response = await makeRequest<"get">("get", {
      url: "/links",
    });

    expect(response.statusCode).toEqual(StatusCode.OK);

    const { ok } = response.body;

    expect(ok).toBe(true);
  });
});
