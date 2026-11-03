import { applyOverrides } from "@ghom/content";
import type { Locale } from "@ghom/core";
import { getOverrides } from "@ghom/db";
import { cache } from "react";
import { type Dictionary, dictionaryFor } from ".";

/**
 * Textes par défaut + surcharges saisies dans l'admin (une requête par rendu).
 * Sans next/root-params : utilisable aussi dans les Server Actions.
 */
export const loadDictionary = cache(async (locale: Locale): Promise<Dictionary> => {
  return applyOverrides(dictionaryFor(locale), await getOverrides("STUDIO", locale));
});
