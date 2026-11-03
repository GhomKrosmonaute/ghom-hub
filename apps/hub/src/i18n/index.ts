import { type HubDictionary, hubDictionaries } from "@ghom/content";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@ghom/core";

/** Textes par défaut (code) ; les surcharges de l'admin sont appliquées par `server.ts`. */
export type Dictionary = HubDictionary;

export const dictionaries: Record<Locale, Dictionary> = hubDictionaries;

/** Dictionnaire par défaut d'une langue, sans surcharges. */
export function dictionaryFor(locale: unknown): Dictionary {
  return dictionaries[isLocale(locale) ? locale : DEFAULT_LOCALE];
}
