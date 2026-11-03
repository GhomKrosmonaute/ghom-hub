/**
 * Socle i18n commun aux deux sites (routing Next.js par sous-chemin : /fr, /en).
 * Le français est la langue source : tout texte non traduit retombe dessus.
 */
export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";

/** Cookie posé par le sélecteur de langue ; prioritaire sur Accept-Language. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Une valeur déclinée dans chaque langue. */
export type Localized<T> = Record<Locale, T>;

export const LOCALE_META: Localized<{
  /** Nom de la langue dans sa propre langue. */
  name: string;
  /** Code court affiché dans l'interface. */
  short: string;
  /** Locale Intl (dates, nombres). */
  intl: string;
  /** Locale Open Graph. */
  og: string;
  /** Symbole monétaire affiché (liens de soutien). */
  currency: string;
}> = {
  fr: { name: "Français", short: "FR", intl: "fr-FR", og: "fr_FR", currency: "€" },
  en: { name: "English", short: "EN", intl: "en-GB", og: "en_GB", currency: "$" },
};

/** Symbole monétaire générique, remplacé par celui de la langue à l'affichage. */
export const CURRENCY_PLACEHOLDER = "¤";

/** "¤" → "€" (fr) ou "$" (en). */
export function localizeCurrency(text: string, locale: Locale): string {
  return text.replaceAll(CURRENCY_PLACEHOLDER, LOCALE_META[locale].currency);
}

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** L'autre langue (bascule FR ⇄ EN). */
export function otherLocale(locale: Locale): Locale {
  return LOCALES.find((l) => l !== locale) ?? DEFAULT_LOCALE;
}

/**
 * Choisit la meilleure langue supportée d'après un en-tête Accept-Language
 * (`en-US,en;q=0.9,fr;q=0.8`). Seule la langue primaire compte.
 */
export function negotiateLocale(
  acceptLanguage: string | null | undefined,
  fallback: Locale = DEFAULT_LOCALE,
): Locale {
  if (!acceptLanguage) return fallback;
  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag = "", ...params] = part.trim().split(";");
      const q = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
      const quality = q ? Number.parseFloat(q.slice(2)) : 1;
      return {
        lang: tag.trim().toLowerCase().split("-")[0] ?? "",
        quality: Number.isFinite(quality) ? quality : 0,
        index,
      };
    })
    .filter((r) => r.lang && r.quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);
  return ranked.map((r) => r.lang).find(isLocale) ?? fallback;
}

/** Cookie d'abord (choix explicite), puis préférences du navigateur. */
export function pickLocale(
  cookie: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Locale {
  return isLocale(cookie) ? cookie : negotiateLocale(acceptLanguage);
}

/** Retire le préfixe de langue d'un chemin : /en/x → /x. */
export function stripLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) return pathname || "/";
  return `/${rest.join("/")}`;
}

/** Préfixe un chemin par la langue : ("en", "/x") → /en/x ; ("en", "/") → /en. */
export function localizePath(locale: Locale, pathname = "/"): string {
  const bare = stripLocale(pathname);
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

/**
 * Valeur de `document.cookie` pour mémoriser la langue. Sur un vrai domaine,
 * le cookie est partagé entre ghom.fr et tous ses sous-domaines (portail studio).
 */
export function localeCookie(locale: Locale, rootDomain?: string): string {
  const parts = [`${LOCALE_COOKIE}=${locale}`, "path=/", "max-age=31536000", "samesite=lax"];
  if (rootDomain && rootDomain !== "localhost" && rootDomain.includes(".")) {
    parts.push(`domain=.${rootDomain}`);
  }
  return parts.join("; ");
}

/** Interpolation minimale : fill("{n} unités", { n: 3 }) → "3 unités". */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}
