import {
  type ContactData,
  filterCatalog,
  isLocale,
  type Owner,
  type Project,
  type ProjectTranslations,
  type SubscribeInput,
} from "@ghom/core";
import { getPrisma } from "./client";
import { withFallback } from "./fallback";
import type { Project as DbProject } from "./generated/prisma/client";
import { seedProjectsAsProjects } from "./seed-data";

export function toProject(row: DbProject): Project {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    owner: row.owner,
    kind: row.kind,
    status: row.status,
    subdomain: row.subdomain,
    externalUrl: row.externalUrl,
    repoUrl: row.repoUrl,
    coverUrl: row.coverUrl,
    accent: row.accent,
    tags: row.tags,
    stack: row.stack,
    featured: row.featured,
    sortOrder: row.sortOrder,
    year: row.year,
    genre: row.genre,
    platforms: row.platforms,
    players: row.players,
    translations: parseTranslations(row.translations),
  };
}

/** La colonne JSON n'est pas typée : on ne garde que des langues connues et des chaînes. */
export function parseTranslations(value: unknown): ProjectTranslations {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: ProjectTranslations = {};
  for (const [locale, fields] of Object.entries(value)) {
    if (!isLocale(locale) || !fields || typeof fields !== "object") continue;
    const f = fields as Record<string, unknown>;
    const str = (k: string) => (typeof f[k] === "string" ? (f[k] as string) : undefined);
    out[locale] = {
      name: str("name"),
      tagline: str("tagline"),
      description: str("description"),
      genre: str("genre"),
      players: str("players"),
      tags: Array.isArray(f.tags)
        ? f.tags.filter((t): t is string => typeof t === "string")
        : undefined,
    };
  }
  return out;
}

export async function getProjects(owner: Owner) {
  return withFallback(
    `getProjects(${owner})`,
    async () => {
      const rows = await getPrisma().project.findMany({ where: { owner, published: true } });
      return filterCatalog(rows.map(toProject));
    },
    // En dev, les projets d'exemple ; en production, jamais de faux projets publics.
    () =>
      process.env.NODE_ENV === "production"
        ? []
        : filterCatalog(seedProjectsAsProjects(), { owner }),
  );
}

export async function saveContactMessage(data: ContactData): Promise<void> {
  await getPrisma().contactMessage.create({
    data: { name: data.name, email: data.email, subject: data.subject, message: data.message },
  });
}

/** Idempotent : se réinscrire avec le même email ne fait pas d'erreur. */
export async function addSubscriber(data: Pick<SubscribeInput, "email">, source = "nbng") {
  await getPrisma().subscriber.upsert({
    where: { email: data.email },
    create: { email: data.email, source },
    update: {},
  });
}
