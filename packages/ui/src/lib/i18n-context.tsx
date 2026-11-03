"use client";

import type { Locale } from "@ghom/core";
import { createContext, useContext } from "react";

/**
 * Contexte i18n côté client. Les Server Components lisent le dictionnaire
 * directement (next/root-params) ; les Client Components passent par ce contexte.
 * Chaque app l'enveloppe dans un hook typé avec son propre dictionnaire.
 */
const I18nContext = createContext<{ locale: Locale; t: unknown } | null>(null);

export function I18nProvider<D>({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: D;
  children: React.ReactNode;
}) {
  return <I18nContext.Provider value={{ locale, t: dict }}>{children}</I18nContext.Provider>;
}

export function useI18nContext<D>(): { locale: Locale; t: D } {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n() doit être utilisé sous <I18nProvider>");
  return value as { locale: Locale; t: D };
}
