import { describe, expect, test } from "bun:test";
import { compareProjects, countByKind, filterCatalog, matchesQuery, productRef } from "../catalog";
import { makeProject } from "./fixtures";

const catalog = [
  makeProject({ id: "a", name: "Néon Café", kind: "WEBSITE", sortOrder: 2, tags: ["café"] }),
  makeProject({
    id: "b",
    name: "Void Runner",
    kind: "GAME",
    owner: "STUDIO",
    featured: true,
    genre: "Runner",
  }),
  makeProject({ id: "c", name: "Old Bot", kind: "BOT", status: "ARCHIVED", sortOrder: 1 }),
  makeProject({
    id: "d",
    name: "Synth",
    kind: "TOOL",
    stack: ["Rust", "WASM"],
    sortOrder: 2,
    year: 2024,
  }),
];

describe("filterCatalog", () => {
  test("trie featured d'abord puis sortOrder puis année", () => {
    expect(filterCatalog(catalog).map((p) => p.id)).toEqual(["b", "c", "a", "d"]);
  });

  test("filtre par owner", () => {
    expect(filterCatalog(catalog, { owner: "STUDIO" }).map((p) => p.id)).toEqual(["b"]);
  });

  test("filtre par type", () => {
    expect(filterCatalog(catalog, { kinds: ["BOT", "TOOL"] }).map((p) => p.id)).toEqual(["c", "d"]);
  });

  test("masque les archivés", () => {
    expect(filterCatalog(catalog, { hideArchived: true }).some((p) => p.id === "c")).toBe(false);
  });

  test("ne mute pas l'entrée", () => {
    const copy = [...catalog];
    filterCatalog(catalog);
    expect(catalog).toEqual(copy);
  });
});

describe("matchesQuery", () => {
  test("insensible aux accents et à la casse", () => {
    expect(matchesQuery(catalog[0]!, "neon CAFE")).toBe(true);
  });

  test("cherche dans la stack, les tags et le genre", () => {
    expect(matchesQuery(catalog[3]!, "wasm")).toBe(true);
    expect(matchesQuery(catalog[1]!, "runner")).toBe(true);
  });

  test("tous les termes doivent matcher", () => {
    expect(matchesQuery(catalog[3]!, "rust python")).toBe(false);
  });

  test("requête vide → match", () => {
    expect(matchesQuery(catalog[0]!, "   ")).toBe(true);
  });
});

describe("divers", () => {
  test("productRef", () => {
    expect(productRef({ owner: "PERSONAL", kind: "WEB_APP", sortOrder: 7 })).toBe("GHM-APP-007");
    expect(productRef({ owner: "STUDIO", kind: "GAME", sortOrder: 12 })).toBe("NBN-GME-012");
  });

  test("countByKind", () => {
    expect(countByKind(catalog)).toEqual({ WEBSITE: 1, GAME: 1, BOT: 1, TOOL: 1 });
  });

  test("compareProjects tri alphabétique en dernier recours", () => {
    const a = makeProject({ name: "Beta" });
    const b = makeProject({ name: "Alpha" });
    expect(compareProjects(a, b)).toBeGreaterThan(0);
  });
});

describe("hashString", () => {
  test("stable et non signé", async () => {
    const { hashString } = await import("../catalog");
    expect(hashString("void-runner")).toBe(hashString("void-runner"));
    expect(hashString("a")).not.toBe(hashString("b"));
    expect(hashString("")).toBe(0x811c9dc5);
    expect(hashString("xyz")).toBeGreaterThanOrEqual(0);
  });
});
