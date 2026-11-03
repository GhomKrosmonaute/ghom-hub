import type { Locale } from "./i18n";

export const OWNERS = ["PERSONAL", "STUDIO"] as const;
export type Owner = (typeof OWNERS)[number];

export const PROJECT_KINDS = [
  "WEB_APP",
  "WEBSITE",
  "GAME",
  "TOOL",
  "LIBRARY",
  "BOT",
  "OTHER",
] as const;
export type ProjectKind = (typeof PROJECT_KINDS)[number];

export const PROJECT_STATUSES = ["LIVE", "BETA", "IN_DEV", "PROTOTYPE", "ARCHIVED"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Champs textuels d'un projet qui peuvent être traduits. */
export interface ProjectText {
  name: string;
  tagline: string;
  description: string;
  genre: string | null;
  players: string | null;
  tags: string[];
}

/** Traductions par langue (le français est la langue de base, stockée dans les colonnes). */
export type ProjectTranslations = Partial<Record<Locale, Partial<ProjectText>>>;

/** Projet tel qu'il est consommé par les front-ends (indépendant de Prisma). */
export interface Project {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  owner: Owner;
  kind: ProjectKind;
  status: ProjectStatus;
  /** Label de sous-domaine : `slug` → slug.ghom.fr (PERSONAL) ou slug.nobrainnogame.ghom.fr (STUDIO). */
  subdomain: string | null;
  externalUrl: string | null;
  repoUrl: string | null;
  coverUrl: string | null;
  /** Couleur néon d'accent, format #rrggbb. */
  accent: string;
  tags: string[];
  stack: string[];
  featured: boolean;
  sortOrder: number;
  year: number;
  genre: string | null;
  platforms: string[];
  players: string | null;
  translations?: ProjectTranslations;
}
