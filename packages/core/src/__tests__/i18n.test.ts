import { describe, expect, test } from "bun:test";
import { KIND_META, localizeProject, STATUS_META } from "../catalog";
import {
  fill,
  isLocale,
  LOCALES,
  localeCookie,
  localizePath,
  negotiateLocale,
  otherLocale,
  pickLocale,
  stripLocale,
} from "../i18n";
import { contactSchemaFor, subscribeSchemaFor } from "../validation";
import { makeProject } from "./fixtures";

describe("négociation de langue", () => {
  test("respecte les poids q et ignore la région", () => {
    expect(negotiateLocale("en-US,en;q=0.9,fr;q=0.8")).toBe("en");
    expect(negotiateLocale("de-DE,fr;q=0.7,en;q=0.9")).toBe("en");
    expect(negotiateLocale("fr-CA")).toBe("fr");
  });

  test("retombe sur le français si rien ne correspond", () => {
    expect(negotiateLocale("de,ja;q=0.5")).toBe("fr");
    expect(negotiateLocale(null)).toBe("fr");
    expect(negotiateLocale("")).toBe("fr");
    expect(negotiateLocale("en;q=0")).toBe("fr");
  });

  test("le cookie l'emporte sur l'en-tête, sauf s'il est invalide", () => {
    expect(pickLocale("en", "fr")).toBe("en");
    expect(pickLocale("xx", "en")).toBe("en");
    expect(pickLocale(undefined, undefined)).toBe("fr");
  });

  test("isLocale / otherLocale", () => {
    expect(isLocale("fr")).toBe(true);
    expect(isLocale("de")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(otherLocale("fr")).toBe("en");
    expect(otherLocale("en")).toBe("fr");
  });
});

describe("chemins localisés", () => {
  test("strip / localize", () => {
    expect(stripLocale("/en/foo/bar")).toBe("/foo/bar");
    expect(stripLocale("/en")).toBe("/");
    expect(stripLocale("/foo")).toBe("/foo");
    expect(localizePath("en", "/")).toBe("/en");
    expect(localizePath("fr", "/en/x")).toBe("/fr/x");
    expect(localizePath("en")).toBe("/en");
  });

  test("cookie partagé entre sous-domaines seulement sur un vrai domaine", () => {
    expect(localeCookie("en", "ghom.fr")).toContain("domain=.ghom.fr");
    expect(localeCookie("en", "localhost")).not.toContain("domain=");
    expect(localeCookie("fr")).toStartWith("NEXT_LOCALE=fr;");
  });

  test("fill remplace les variables connues uniquement", () => {
    expect(fill("{n} unités / {x}", { n: 3 })).toBe("3 unités / {x}");
  });
});

describe("catalogue traduit", () => {
  test("chaque statut et type est libellé dans toutes les langues", () => {
    for (const locale of LOCALES) {
      for (const meta of Object.values(STATUS_META)) {
        expect(meta.label[locale]).toBeTruthy();
        expect(meta.stock[locale]).toBeTruthy();
      }
      for (const meta of Object.values(KIND_META)) expect(meta.label[locale]).toBeTruthy();
    }
  });

  test("localizeProject surcharge champ par champ et garde le reste", () => {
    const p = makeProject({
      tagline: "Accroche",
      description: "Description",
      tags: ["outil"],
      translations: { en: { tagline: "Hook", tags: ["tool"] } },
    });
    const en = localizeProject(p, "en");
    expect(en.tagline).toBe("Hook");
    expect(en.description).toBe("Description");
    expect(en.tags).toEqual(["tool"]);
    expect(localizeProject(p, "fr")).toBe(p);
  });
});

describe("validation traduite", () => {
  test("messages d'erreur dans la langue demandée", () => {
    const input = { name: "A", email: "nope", message: "court" };
    const fr = contactSchemaFor("fr").safeParse(input);
    const en = contactSchemaFor("en").safeParse(input);
    expect(fr.success || en.success).toBe(false);
    const msgs = (r: typeof fr) => (r.success ? [] : r.error.issues.map((i) => i.message));
    expect(msgs(fr)).toContain("Adresse e-mail invalide");
    expect(msgs(en)).toContain("Invalid e-mail address");
    expect(msgs(en).join(" ")).not.toMatch(/caractères/);
  });

  test("abonnement", () => {
    const r = subscribeSchemaFor("en").safeParse({ email: "x" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toBe("Invalid e-mail address");
  });
});
