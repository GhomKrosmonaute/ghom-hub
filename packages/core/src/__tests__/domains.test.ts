import { describe, expect, test } from "bun:test";
import {
  type DomainConfig,
  displayHost,
  domainConfigFromEnv,
  isValidSubdomainLabel,
  projectHost,
  projectUrl,
} from "../domains";

const prod: DomainConfig = {
  rootDomain: "ghom.fr",
  studioLabel: "nobrainnogame",
  protocol: "https",
};

describe("projectHost", () => {
  test("projet perso → sous-domaine de ghom.fr", () => {
    expect(projectHost({ owner: "PERSONAL", subdomain: "pixelforge" }, prod)).toBe(
      "pixelforge.ghom.fr",
    );
  });

  test("jeu du studio → sous-sous-domaine de nobrainnogame.ghom.fr", () => {
    expect(projectHost({ owner: "STUDIO", subdomain: "void-runner" }, prod)).toBe(
      "void-runner.nobrainnogame.ghom.fr",
    );
  });

  test("le hub studio lui-même est un projet perso sur le label studio", () => {
    expect(projectHost({ owner: "PERSONAL", subdomain: "nobrainnogame" }, prod)).toBe(
      "nobrainnogame.ghom.fr",
    );
  });

  test("normalise la casse", () => {
    expect(projectHost({ owner: "PERSONAL", subdomain: "PixelForge" }, prod)).toBe(
      "pixelforge.ghom.fr",
    );
  });

  test("pas de sous-domaine → null", () => {
    expect(projectHost({ owner: "PERSONAL", subdomain: null }, prod)).toBeNull();
  });

  test("refuse les labels invalides", () => {
    expect(() => projectHost({ owner: "PERSONAL", subdomain: "bad_label" }, prod)).toThrow();
    expect(() => projectHost({ owner: "STUDIO", subdomain: "-x" }, prod)).toThrow();
  });

  test("refuse les labels réservés pour les projets perso", () => {
    expect(() => projectHost({ owner: "PERSONAL", subdomain: "www" }, prod)).toThrow(/réservé/);
    expect(() => projectHost({ owner: "PERSONAL", subdomain: "admin" }, prod)).toThrow(/réservé/);
  });
});

describe("projectUrl", () => {
  test("sous-domaine prioritaire sur l'URL externe", () => {
    expect(
      projectUrl({ owner: "PERSONAL", subdomain: "app", externalUrl: "https://example.com" }, prod),
    ).toBe("https://app.ghom.fr");
  });

  test("fallback sur l'URL externe", () => {
    expect(
      projectUrl({ owner: "PERSONAL", subdomain: null, externalUrl: "https://github.com/x" }, prod),
    ).toBe("https://github.com/x");
  });

  test("rien → null", () => {
    expect(projectUrl({ owner: "PERSONAL", subdomain: null, externalUrl: null }, prod)).toBeNull();
  });

  test("dev : localhost avec port et http", () => {
    const dev: DomainConfig = {
      rootDomain: "localhost:4000",
      studioLabel: "nobrainnogame",
      protocol: "http",
    };
    expect(projectUrl({ owner: "STUDIO", subdomain: "game", externalUrl: null }, dev)).toBe(
      "http://game.nobrainnogame.localhost:4000",
    );
  });
});

describe("helpers", () => {
  test("isValidSubdomainLabel", () => {
    expect(isValidSubdomainLabel("a")).toBe(true);
    expect(isValidSubdomainLabel("my-game-2")).toBe(true);
    expect(isValidSubdomainLabel("my-")).toBe(false);
    expect(isValidSubdomainLabel("UPPER")).toBe(false);
    expect(isValidSubdomainLabel("a".repeat(64))).toBe(false);
  });

  test("displayHost", () => {
    expect(displayHost("https://x.ghom.fr/path")).toBe("x.ghom.fr");
    expect(displayHost("not a url")).toBeNull();
    expect(displayHost(null)).toBeNull();
  });

  test("domainConfigFromEnv : défauts prod", () => {
    expect(domainConfigFromEnv({})).toEqual(prod);
  });

  test("domainConfigFromEnv : surcharge dev", () => {
    expect(
      domainConfigFromEnv({ NEXT_PUBLIC_ROOT_DOMAIN: "localhost", NEXT_PUBLIC_PROTOCOL: "http" }),
    ).toEqual({ rootDomain: "localhost", studioLabel: "nobrainnogame", protocol: "http" });
  });
});
