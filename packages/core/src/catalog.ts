import type { Locale, Localized } from "./i18n";
import type { Owner, Project, ProjectKind, ProjectStatus } from "./types";

/** Métaphore boutique : l'état d'un projet devient un état de stock. */
export const STATUS_META: Record<
  ProjectStatus,
  { label: Localized<string>; stock: Localized<string>; tone: "ok" | "warn" | "info" | "dim" }
> = {
  LIVE: {
    label: { fr: "En ligne", en: "Live" },
    stock: { fr: "EN STOCK", en: "IN STOCK" },
    tone: "ok",
  },
  BETA: {
    label: { fr: "Bêta", en: "Beta" },
    stock: { fr: "ACCÈS ANTICIPÉ", en: "EARLY ACCESS" },
    tone: "info",
  },
  IN_DEV: {
    label: { fr: "En développement", en: "In development" },
    stock: { fr: "EN FABRICATION", en: "IN PRODUCTION" },
    tone: "warn",
  },
  PROTOTYPE: {
    label: { fr: "Prototype", en: "Prototype" },
    stock: { fr: "PROTOTYPE", en: "PROTOTYPE" },
    tone: "warn",
  },
  ARCHIVED: {
    label: { fr: "Archivé", en: "Archived" },
    stock: { fr: "HORS SERVICE", en: "DISCONTINUED" },
    tone: "dim",
  },
};

export const KIND_META: Record<ProjectKind, { label: Localized<string>; code: string }> = {
  WEB_APP: { label: { fr: "App web", en: "Web app" }, code: "APP" },
  WEBSITE: { label: { fr: "Site", en: "Website" }, code: "WEB" },
  GAME: { label: { fr: "Jeu vidéo", en: "Video game" }, code: "GME" },
  TOOL: { label: { fr: "Outil", en: "Tool" }, code: "TL" },
  LIBRARY: { label: { fr: "Librairie", en: "Library" }, code: "LIB" },
  BOT: { label: { fr: "Bot", en: "Bot" }, code: "BOT" },
  OTHER: { label: { fr: "Divers", en: "Misc" }, code: "MSC" },
};

/**
 * Textes d'un projet dans la langue demandée. Les champs de base sont en
 * français ; `translations[locale]` les surcharge champ par champ.
 */
export function localizeProject<T extends Project>(project: T, locale: Locale): T {
  const t = project.translations?.[locale];
  if (!t) return project;
  return {
    ...project,
    name: t.name || project.name,
    tagline: t.tagline || project.tagline,
    description: t.description || project.description,
    genre: t.genre ?? project.genre,
    players: t.players ?? project.players,
    tags: t.tags?.length ? t.tags : project.tags,
  };
}

/** Référence produit stable, façon numéro de série : GHM-APP-007 / NBN-GME-002. */
export function productRef(project: Pick<Project, "owner" | "kind" | "sortOrder">): string {
  const prefix = project.owner === "STUDIO" ? "NBN" : "GHM";
  const n = String(Math.max(0, project.sortOrder)).padStart(3, "0");
  return `${prefix}-${KIND_META[project.kind].code}-${n}`;
}

export interface CatalogFilter {
  owner?: Owner;
  kinds?: ProjectKind[];
  statuses?: ProjectStatus[];
  query?: string;
  /** Masquer les projets archivés (défaut: false). */
  hideArchived?: boolean;
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function matchesQuery(project: Project, query: string): boolean {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = normalize(
    [
      project.name,
      project.tagline,
      project.description,
      project.genre ?? "",
      ...project.tags,
      ...project.stack,
    ].join(" "),
  );
  return terms.every((t) => haystack.includes(t));
}

/** Ordre d'affichage : featured d'abord, puis sortOrder, puis année décroissante, puis nom. */
export function compareProjects(a: Project, b: Project): number {
  if (a.featured !== b.featured) return a.featured ? -1 : 1;
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  if (a.year !== b.year) return b.year - a.year;
  return a.name.localeCompare(b.name, "fr");
}

export function filterCatalog(projects: readonly Project[], filter: CatalogFilter = {}): Project[] {
  return projects
    .filter((p) => (filter.owner ? p.owner === filter.owner : true))
    .filter((p) => (filter.kinds?.length ? filter.kinds.includes(p.kind) : true))
    .filter((p) => (filter.statuses?.length ? filter.statuses.includes(p.status) : true))
    .filter((p) => (filter.hideArchived ? p.status !== "ARCHIVED" : true))
    .filter((p) => (filter.query ? matchesQuery(p, filter.query) : true))
    .sort(compareProjects);
}

/** Nombre de projets par type, pour les onglets de filtre. */
export function countByKind(projects: readonly Project[]): Partial<Record<ProjectKind, number>> {
  const out: Partial<Record<ProjectKind, number>> = {};
  for (const p of projects) out[p.kind] = (out[p.kind] ?? 0) + 1;
  return out;
}

/** Hash FNV-1a 32 bits : sert à dériver des visuels stables à partir d'un slug. */
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}
