import { describe, expect, test } from "bun:test";
import { projectInputSchema } from "../project-input";

const domains = { rootDomain: "ghom.fr", studioLabel: "nobrainnogame", protocol: "https" as const };
const schema = projectInputSchema(domains);
const valid = {
  slug: "void-tactics",
  name: "Void Tactics",
  tagline: "Chaque tour compte.",
  description: "Tactique au tour par tour.",
  owner: "STUDIO",
  kind: "GAME",
  status: "LIVE",
  subdomain: "Void-Tactics",
  accent: "#C6FF00",
  tags: "tactique, tour par tour, tactique",
  stack: ["three.js", " TypeScript "],
  year: "2026",
  genre: "",
  platforms: "Web,PC",
  translations: { en: { tagline: "Every turn counts.", description: "", tags: "" } },
} as const;

describe("projectInputSchema", () => {
  test("normalise un projet valide", () => {
    const r = schema.safeParse(valid);
    expect(r.success).toBe(true);
    if (!r.success) return;
    expect(r.data.subdomain).toBe("void-tactics");
    expect(r.data.accent).toBe("#c6ff00");
    expect(r.data.tags).toEqual(["tactique", "tour par tour"]);
    expect(r.data.stack).toEqual(["three.js", "TypeScript"]);
    expect(r.data.platforms).toEqual(["Web", "PC"]);
    expect(r.data.year).toBe(2026);
    expect(r.data.genre).toBeNull();
    expect(r.data.externalUrl).toBeNull();
    expect(r.data.published).toBe(true);
    expect(r.data.translations).toEqual({ en: { tagline: "Every turn counts." } });
  });

  test("traductions vides → objet vide", () => {
    const r = schema.safeParse({ ...valid, translations: { en: { tagline: " " } } });
    expect(r.success && r.data.translations).toEqual({});
  });

  test("refuse un sous-domaine réservé pour un projet perso", () => {
    const r = schema.safeParse({ ...valid, owner: "PERSONAL", kind: "TOOL", subdomain: "admin" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["subdomain"]);
  });

  test("refuse sous-domaine, slug, accent et URL invalides", () => {
    for (const patch of [
      { subdomain: "-bad-" },
      { slug: "Pas Bon" },
      { accent: "red" },
      { repoUrl: "javascript:alert(1)" },
    ]) {
      expect(schema.safeParse({ ...valid, ...patch }).success).toBe(false);
    }
  });
});
