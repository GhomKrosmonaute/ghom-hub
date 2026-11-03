"use server";

import { type Site, sameTemplateVars, templateVars } from "@ghom/content";
import { isLocale, type Locale } from "@ghom/core";
import { resetOverride, setOverride } from "@ghom/db/admin";
import { requireAdmin } from "@/auth/guard";
import { type ActionResult, done, failure } from "@/lib/actions";
import { defaultText, isSite } from "./defaults";

function check(
  site: unknown,
  locale: unknown,
  key: string,
): { site: Site; locale: Locale; reference: string } | null {
  if (!isSite(site) || !isLocale(locale)) return null;
  const reference = defaultText(site, locale, key);
  return reference === undefined ? null : { site, locale, reference };
}

export async function saveTranslation(
  site: string,
  locale: string,
  key: string,
  value: string,
): Promise<ActionResult> {
  await requireAdmin();
  const target = check(site, locale, key);
  if (!target) return { ok: false, message: "Clé inconnue" };
  const text = value.trim();
  if (!text)
    return { ok: false, message: "Le texte ne peut pas être vide (utilise « Réinitialiser »)" };
  if (text.length > 2000) return { ok: false, message: "2000 caractères maximum" };
  if (!sameTemplateVars(target.reference, text)) {
    const vars = templateVars(target.reference);
    return {
      ok: false,
      message: vars.length
        ? `Le texte doit contenir exactement ${vars.join(", ")}`
        : "Ce texte ne doit pas contenir de variable {…}",
    };
  }
  try {
    // Identique au texte par défaut → inutile de stocker une surcharge.
    if (text === target.reference) await resetOverride(target.site, target.locale, key);
    else await setOverride(target.site, target.locale, key, text);
    return done(`« ${key} » (${target.locale.toUpperCase()}) enregistré`, [target.site]);
  } catch (error) {
    return failure(error);
  }
}

export async function resetTranslation(
  site: string,
  locale: string,
  key: string,
): Promise<ActionResult> {
  await requireAdmin();
  const target = check(site, locale, key);
  if (!target) return { ok: false, message: "Clé inconnue" };
  try {
    await resetOverride(target.site, target.locale, key);
    return done(`« ${key} » (${target.locale.toUpperCase()}) réinitialisé`, [target.site]);
  } catch (error) {
    return failure(error);
  }
}
