import type { Project } from "./types";

export interface DomainConfig {
  /** ex: "ghom.fr" en prod, "localhost" en dev. Peut contenir un port ("localhost:4000"). */
  rootDomain: string;
  /** Label du hub studio, ex: "nobrainnogame". */
  studioLabel: string;
  protocol: "http" | "https";
}

const LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Un label DNS valide (RFC 1123), en minuscules. */
export function isValidSubdomainLabel(label: string): boolean {
  return LABEL_RE.test(label);
}

/** Labels réservés : ils ne peuvent pas être attribués à un projet personnel. */
export function reservedLabels(config: DomainConfig): string[] {
  return ["www", "api", "admin", "mail", config.studioLabel];
}

export function studioHost(config: DomainConfig): string {
  return `${config.studioLabel}.${config.rootDomain}`;
}

/**
 * Hôte public d'un projet :
 * - PERSONAL : <label>.ghom.fr
 * - STUDIO   : <label>.nobrainnogame.ghom.fr
 */
export function projectHost(
  project: Pick<Project, "owner" | "subdomain">,
  config: DomainConfig,
): string | null {
  if (!project.subdomain) return null;
  const label = project.subdomain.toLowerCase();
  if (!isValidSubdomainLabel(label)) {
    throw new Error(`Sous-domaine invalide : "${project.subdomain}"`);
  }
  if (project.owner === "STUDIO") return `${label}.${studioHost(config)}`;
  if (reservedLabels(config).includes(label) && label !== config.studioLabel) {
    throw new Error(`Sous-domaine réservé : "${label}"`);
  }
  return `${label}.${config.rootDomain}`;
}

/** URL à ouvrir pour "lancer" un projet : sous-domaine en priorité, sinon URL externe. */
export function projectUrl(
  project: Pick<Project, "owner" | "subdomain" | "externalUrl">,
  config: DomainConfig,
): string | null {
  const host = projectHost(project, config);
  if (host) return `${config.protocol}://${host}`;
  return project.externalUrl ?? null;
}

/** Hôte affiché (sans protocole) pour les étiquettes HUD. */
export function displayHost(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export function domainConfigFromEnv(env: Record<string, string | undefined>): DomainConfig {
  const protocol = env.NEXT_PUBLIC_PROTOCOL === "http" ? "http" : "https";
  return {
    rootDomain: env.NEXT_PUBLIC_ROOT_DOMAIN || "ghom.fr",
    studioLabel: env.NEXT_PUBLIC_STUDIO_LABEL || "nobrainnogame",
    protocol,
  };
}
