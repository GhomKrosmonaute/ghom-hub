import {
  flattenDictionary,
  hubDictionaries,
  SITES,
  type Site,
  studioDictionaries,
} from "@ghom/content";
import { isLocale, type Locale } from "@ghom/core";

const DICTIONARIES = { HUB: hubDictionaries, STUDIO: studioDictionaries } as const;

export const SITE_LABEL: Record<Site, string> = { HUB: "ghom.fr", STUDIO: "No Brain No Game" };

export function isSite(value: unknown): value is Site {
  return typeof value === "string" && (SITES as readonly string[]).includes(value);
}

/** Texte par défaut (code) d'une clé, ou undefined si la clé n'existe pas. */
export function defaultText(site: Site, locale: Locale, key: string): string | undefined {
  return flattenDictionary(DICTIONARIES[site][locale]).find((e) => e.key === key)?.value;
}

export function defaultEntries(site: Site, locale: Locale) {
  return flattenDictionary(DICTIONARIES[site][locale]);
}

export { isLocale };
