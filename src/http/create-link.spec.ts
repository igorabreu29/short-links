import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { app } from "@/app.ts";
import { makeRequest } from "@/factories/make-request.ts";
import { makeShortLink } from "@/factories/make-short-link.ts";
import { sql } from "@/lib/postgres.ts";
import { StatusCode } from "@/utils/status-code.ts";

describe("Create Link (E2E)", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("[POST /links] should receive error when link with same code already exists", async () => {
    const body = {
      code: "test",
      url: "http://localhost:3333",
    };

    await makeShortLink({ code: body.code, originalUrl: body.url });

    const response = await makeRequest<"post">("post", {
      url: "/links",
      body,
    });

    expect(response.statusCode).toEqual(StatusCode.CONFLICT);
  });

  it("[POST /links] should create link", async () => {
    const body = {
      code: "test",
      url: "http://localhost:3333",
    };

    const response = await makeRequest<"post">("post", {
      url: "/links",
      body,
    });

    expect(response.statusCode).toEqual(StatusCode.CREATED);

    const { linkId } = response.body;

    expect(linkId).toBeTruthy();

    const result = await sql`
      SELECT * FROM short_links
      WHERE code = ${body.code};
    `;

    const link = result[0];

    expect(link).toMatchObject({
      id: linkId,
      code: body.code,
      original_url: body.url,
    });
  });
});
