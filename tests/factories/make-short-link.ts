import { faker } from "@faker-js/faker";
import { sql } from "@/lib/postgres.ts";
import type { Link } from "@/types/link.ts";
import { createId } from "@/utils/create-id.ts";
import { link } from "node:fs/promises";

interface ShortLinkParams {
  originalUrl: string;
  code: string;
  createdAt: Date;
}

export async function makeShortLink(
  params: Partial<ShortLinkParams> = {},
  id?: string,
) {
  const data = {
    id: id ?? createId(),
    code: params.code ?? faker.book.title(),
    original_url: params.originalUrl ?? faker.internet.url(),
    created_at: params.createdAt ?? new Date(),
  };

  const links = await sql<Link[]>`
    INSERT INTO short_links (id, code, original_url, created_at)
    VALUES (${data.id}, ${data.code}, ${data.original_url}, ${data.created_at})
    RETURNING *;
  `;

  const link = links[0];

  return link;
}
