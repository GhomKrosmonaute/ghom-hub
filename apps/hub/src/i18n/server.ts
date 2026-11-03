import { DEFAULT_LOCALE, isLocale, type Locale } from "@ghom/core";
import { lang } from "next/root-params";
import type { Dictionary } from ".";
import { loadDictionary } from "./load";

export { loadDictionary };

/** Langue de la requête courante, lue dans le segment racine `app/[lang]`. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Dictionnaire de la requête courante, surcharges comprises (Server Components). */
export async function getDictionary(): Promise<Dictionary> {
  return loadDictionary(await getLocale());
}
