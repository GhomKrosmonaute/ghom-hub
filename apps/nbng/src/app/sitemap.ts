import { LOCALES, localizePath } from "@ghom/core";
import type { MetadataRoute } from "next";

const SITE = "https://nobrainnogame.ghom.fr";
const PATHS = ["/", "/legal-notice", "/privacy", "/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: SITE + localizePath(locale, path),
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.5,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, SITE + localizePath(l, path)])),
      },
    })),
  );
}
