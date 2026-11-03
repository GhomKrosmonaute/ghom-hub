"use client";

import { useI18nContext } from "@ghom/ui/lib/i18n-context";
import type { Dictionary } from ".";

export { I18nProvider } from "@ghom/ui/lib/i18n-context";

/** Langue courante + dictionnaire typé, pour les Client Components. */
export function useI18n() {
  return useI18nContext<Dictionary>();
}
