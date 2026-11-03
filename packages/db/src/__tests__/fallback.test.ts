import { describe, expect, test } from "bun:test";
import { isValidSubdomainLabel } from "@ghom/core";
import { withFallback } from "../fallback";
import { SEED_PROJECTS } from "../seed-data";

describe("withFallback", () => {
  test("renvoie les données de la DB si le loader réussit", async () => {
    const r = await withFallback(
      "t",
      async () => [1, 2],
      () => [],
    );
    expect(r).toEqual({ data: [1, 2], source: "db" });
  });

  test("bascule sur le repli et logue si le loader échoue", async () => {
    const logs: string[] = [];
    const r = await withFallback(
      "getThing",
      async () => {
        throw new Error("connect ECONNREFUSED\nstack…");
      },
      () => ["seed"],
      (m) => logs.push(m),
    );
    expect(r).toEqual({ data: ["seed"], source: "fallback" });
    expect(logs).toEqual(["[db] getThing : repli sur les données de seed (connect ECONNREFUSED)"]);
  });
});

describe("seed data", () => {
  test("slugs uniques", () => {
    const slugs = SEED_PROJECTS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  test("sous-domaines valides et uniques par owner", () => {
    const seen = new Set<string>();
    for (const p of SEED_PROJECTS) {
      if (!p.subdomain) continue;
      expect(isValidSubdomainLabel(p.subdomain)).toBe(true);
      const key = `${p.owner}:${p.subdomain}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });

  test("accents au format #rrggbb", () => {
    for (const p of SEED_PROJECTS) expect(p.accent).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
