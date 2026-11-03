import { describe, expect, test } from "bun:test";
import { LOCALES } from "@ghom/core";
import {
  applyOverrides,
  defaultProfile,
  flattenDictionary,
  hubDictionaries,
  LEGAL_PAGES,
  LEGAL_UPDATED,
  legalDoc,
  localizeProfile,
  parseProfile,
  profileSchema,
  sameTemplateVars,
  studioDictionaries,
  templateVars,
} from "..";

describe("flattenDictionary", () => {
  test("chemins pointés, tableaux indexés", () => {
    const flat = flattenDictionary({ a: { b: "x" }, list: ["y", { t: "z" }] });
    expect(flat).toEqual([
      { key: "a.b", value: "x" },
      { key: "list.0", value: "y" },
      { key: "list.1.t", value: "z" },
    ]);
  });
});

describe("applyOverrides", () => {
  const dict = { hero: { scroll: "Défiler" }, ticker: ["A", "B"], n: { deep: { x: "1" } } };

  test("remplace les textes existants sans muter l'original", () => {
    const out = applyOverrides(dict, { "hero.scroll": "Scroll", "ticker.1": "BB" });
    expect(out.hero.scroll).toBe("Scroll");
    expect(out.ticker).toEqual(["A", "BB"]);
    expect(dict.hero.scroll).toBe("Défiler");
  });

  test("ignore les clés inconnues, les nœuds non textuels et les valeurs vides", () => {
    const out = applyOverrides(dict, {
      "hero.nope": "x",
      "ticker.9": "x",
      n: "x",
      "n.deep": "x",
      "hero.scroll": "  ",
      "__proto__.polluted": "x",
    });
    expect(out).toEqual(dict);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  test("sans surcharge → même objet", () => {
    expect(applyOverrides(dict, {})).toBe(dict);
  });
});

describe("variables de gabarit", () => {
  test("templateVars / sameTemplateVars", () => {
    expect(templateVars("{b} et {a}")).toEqual(["{a}", "{b}"]);
    expect(sameTemplateVars("{count} unités", "{count} units")).toBe(true);
    expect(sameTemplateVars("{count} unités", "units")).toBe(false);
    expect(sameTemplateVars("{n}", "{m}")).toBe(false);
  });

  test("les dictionnaires par défaut sont cohérents entre langues", () => {
    for (const dicts of [hubDictionaries, studioDictionaries]) {
      const fr = flattenDictionary(dicts.fr);
      for (const locale of LOCALES) {
        const other = flattenDictionary(dicts[locale]);
        expect(other.map((e) => e.key)).toEqual(fr.map((e) => e.key));
        const byKey = new Map(other.map((e) => [e.key, e.value]));
        for (const e of fr) {
          expect(byKey.get(e.key), e.key).toBeTruthy();
          expect(sameTemplateVars(e.value, byKey.get(e.key)!), e.key).toBe(true);
        }
      }
    }
  });
});

describe("profil", () => {
  test("le profil par défaut est valide", () => {
    expect(profileSchema.safeParse(defaultProfile).success).toBe(true);
  });

  test("parseProfile rejette les données invalides", () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile({ ...defaultProfile, handle: "" })).toBeNull();
    expect(
      parseProfile({
        ...defaultProfile,
        links: [{ label: "x", href: "javascript:alert(1)", code: "X" }],
      }),
    ).toBeNull();
  });

  test("le symbole ¤ des liens devient € (fr) ou $ (en)", () => {
    const code = (l: "fr" | "en") =>
      localizeProfile(defaultProfile, l).links.find((x) => x.href.includes("buymeacoffee"))?.code;
    expect(code("fr")).toBe("€");
    expect(code("en")).toBe("$");
  });

  test("localizeProfile aplatit les textes de la langue", () => {
    const en = localizeProfile(defaultProfile, "en");
    expect(en.role).toBe(defaultProfile.texts.en.role);
    expect(en.handle).toBe("GHOM");
    expect("texts" in en).toBe(false);
  });
});

describe("pages légales", () => {
  test("chaque page existe dans chaque langue, même nombre de sections", () => {
    for (const site of ["HUB", "STUDIO"] as const) {
      for (const page of LEGAL_PAGES) {
        const [fr, en] = LOCALES.map((l) => legalDoc(site, page, l));
        expect(fr?.sections.length).toBe(en?.sections.length);
        for (const doc of [fr, en]) {
          expect(doc?.sections.every((s, i) => s.heading.startsWith(`${i + 1}. `))).toBe(true);
          expect(doc?.sections.every((s) => s.body.length > 0)).toBe(true);
        }
      }
    }
  });

  test("la date de mise à jour est une date ISO valide", () => {
    expect(Number.isNaN(Date.parse(LEGAL_UPDATED))).toBe(false);
  });
});
