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

/**
 * Segments d'URL traduits. Clé = dossier interne sous `app/[lang]` ; valeurs = slug
 * public dans chaque langue (ex. dossier `terms` → /cgu en français, /en/terms en anglais).
 */
export const PAGE_SLUGS = {
  "legal-notice": { fr: "mentions-legales", en: "legal-notice" },
  terms: { fr: "cgu", en: "terms" },
  privacy: { fr: "confidentialite", en: "privacy" },
} as const satisfies Record<string, Localized<string>>;
export type PageKey = keyof typeof PAGE_SLUGS;

/** Dossier interne désigné par un premier segment (clé ou slug public de n'importe quelle langue). */
function pageKeyOf(segment: string | undefined): PageKey | undefined {
  if (!segment) return undefined;
  return (Object.keys(PAGE_SLUGS) as PageKey[]).find(
    (key) => key === segment || LOCALES.some((l) => PAGE_SLUGS[key][l] === segment),
  );
}

/** Remplace le premier segment d'un chemin sans langue (/x/y) via `PAGE_SLUGS`. */
function swapSlug(bare: string, to: (key: PageKey) => string): string {
  const [, first, ...rest] = bare.split("/");
  const key = pageKeyOf(first);
  return key ? ["", to(key), ...rest].join("/") : bare;
}

/**
 * Chemin public d'une page dans une langue. Le français (langue par défaut) n'a pas
 * de préfixe : ("fr", "/x") → /x ; les autres en ont un : ("en", "/x") → /en/x.
 * Les slugs traduits sont convertis : ("en", "/cgu") → /en/terms ; ("fr", "/terms") → /cgu.
 */
export function localizePath(locale: Locale, pathname = "/"): string {
  const bare = swapSlug(stripLocale(pathname), (key) => PAGE_SLUGS[key][locale]);
  if (locale === DEFAULT_LOCALE) return bare;
  return bare === "/" ? `/${locale}` : `/${locale}${bare}`;
}

/** Chemin interne (dossier Next) d'un chemin public déjà localisé : /cgu → /terms. */
function internalPath(bare: string): string {
  return swapSlug(bare, (key) => key);
}

/** URL d'un autre site du hub dans la même langue (racine nue en français). */
export function localizeSiteUrl(siteUrl: string, locale: Locale): string {
  return siteUrl.replace(/\/$/, "") + (locale === DEFAULT_LOCALE ? "" : `/${locale}`);
}

export type LocaleRoute =
  | { action: "next" }
  | { action: "redirect"; pathname: string }
  | { action: "rewrite"; pathname: string };

/**
 * Routage i18n "préfixe si besoin" (utilisé par les proxys Next) :
 * - slug d'une autre langue (/en/cgu, /privacy en français) → redirection vers le bon ;
 * - /fr/x  → redirection permanente vers /x (une seule URL par page) ;
 * - /en/x  → servi tel quel ;
 * - /x     → français : réécriture interne vers /fr/x (l'URL reste /x) ;
 *            anglais (cookie ou navigateur) : redirection vers /en/x.
 */
export function routeLocale(
  pathname: string,
  cookie: string | null | undefined,
  acceptLanguage: string | null | undefined,
): LocaleRoute {
  const first = pathname.split("/")[1];
  const locale = isLocale(first) ? first : pickLocale(cookie, acceptLanguage);
  // URL publique canonique (bonne langue, bon slug) : sinon, redirection.
  const canonical = localizePath(locale, pathname);
  if (canonical !== pathname) return { action: "redirect", pathname: canonical };
  const inner = internalPath(stripLocale(pathname));
  const internal = `/${locale}${inner === "/" ? "" : inner}`;
  if (locale === DEFAULT_LOCALE) return { action: "rewrite", pathname: internal };
  return internal === pathname ? { action: "next" } : { action: "rewrite", pathname: internal };
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
