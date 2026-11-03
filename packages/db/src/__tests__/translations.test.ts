import { describe, expect, test } from "bun:test";
import { LOCALES } from "@ghom/core";
import { parseTranslations } from "../queries";
import { SEED_PROJECTS } from "../seed-data";

describe("parseTranslations", () => {
  test("ignore les langues inconnues et les valeurs mal typées", () => {
    expect(
      parseTranslations({
        en: { tagline: "Hook", genre: 3, tags: ["a", 1] },
        de: { tagline: "x" },
      }),
    ).toEqual({
      en: {
        name: undefined,
        tagline: "Hook",
        description: undefined,
        genre: undefined,
        players: undefined,
        tags: ["a"],
      },
    });
  });

  test("valeurs non objet → aucune traduction", () => {
    expect(parseTranslations(null)).toEqual({});
    expect(parseTranslations("en")).toEqual({});
    expect(parseTranslations([])).toEqual({});
  });
});

describe("seed", () => {
  test("chaque projet d'exemple a ses textes dans toutes les langues", () => {
    for (const p of SEED_PROJECTS) {
      for (const locale of LOCALES.filter((l) => l !== "fr")) {
        const t = p.translations[locale];
        expect(t?.tagline, `${p.slug}.${locale}.tagline`).toBeTruthy();
        expect(t?.description, `${p.slug}.${locale}.description`).toBeTruthy();
        if (p.genre) expect(t?.genre, `${p.slug}.${locale}.genre`).toBeTruthy();
      }
    }
  });
});

describe("csvCell", () => {
  test("échappe guillemets / virgules et neutralise les formules", async () => {
    const { csvCell } = await import("../admin");
    expect(csvCell("a@b.fr")).toBe("a@b.fr");
    expect(csvCell('x,"y"')).toBe('"x,""y"""');
    expect(csvCell("=HYPERLINK(1)")).toBe("'=HYPERLINK(1)");
    expect(csvCell("@cmd")).toBe("'@cmd");
  });
});
