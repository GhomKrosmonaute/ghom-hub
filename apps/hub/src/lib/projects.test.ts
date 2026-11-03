import { describe, expect, test } from "bun:test";
import { seedProjectsAsProjects } from "@ghom/db/seed-data";
import { toView, withLocale } from "./projects";

describe("toView", () => {
  const views = seedProjectsAsProjects().map((p) => toView(p, "fr"));
  const viewsEn = seedProjectsAsProjects().map((p) => toView(p, "en"));

  test("résout les sous-domaines perso sur le domaine racine", () => {
    const ledger = views.find((v) => v.slug === "neon-ledger")!;
    expect(ledger.host).toBe(`ledger.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || "ghom.fr"}`);
    expect(ledger.ref).toBe("GHM-APP-001");
    expect(ledger.stock).toBe("EN STOCK");
  });

  test("les jeux du studio passent par le sous-domaine studio", () => {
    const game = views.find((v) => v.slug === "void-tactics")!;
    expect(game.host).toMatch(/^void-tactics\.nobrainnogame\./);
  });

  test("textes et libellés traduits en anglais", () => {
    const ledger = viewsEn.find((v) => v.slug === "neon-ledger")!;
    expect(ledger.stock).toBe("IN STOCK");
    expect(ledger.kindLabel).toBe("Web app");
    expect(ledger.tagline).toMatch(/budgeting/);
    expect("translations" in ledger).toBe(false);
  });

  test("withLocale : langue en préfixe, sauf le français (racine nue)", () => {
    expect(withLocale("https://nobrainnogame.ghom.fr/", "en")).toBe(
      "https://nobrainnogame.ghom.fr/en",
    );
    expect(withLocale("https://nobrainnogame.ghom.fr/", "fr")).toBe(
      "https://nobrainnogame.ghom.fr",
    );
  });

  test("projet sans sous-domaine ni URL → pas d'hôte", () => {
    const old = views.find((v) => v.slug === "portfolio-v1")!;
    expect(old.url).toBeNull();
    expect(old.host).toBeNull();
  });
});
