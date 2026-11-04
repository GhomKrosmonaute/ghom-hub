import type { ProjectFormInput } from "@ghom/core";
import type { getProjectById } from "@ghom/db/admin";

type DbProject = NonNullable<Awaited<ReturnType<typeof getProjectById>>>;

const list = (v: string[] | undefined) => (v ?? []).join(", ");

/** Valeurs initiales du formulaire (listes en texte "a, b", champs vides en ""). */
export function toFormDefaults(p: DbProject | null): ProjectFormInput {
  const en = p?.translations?.en ?? {};
  return {
    slug: p?.slug ?? "",
    name: p?.name ?? "",
    tagline: p?.tagline ?? "",
    description: p?.description ?? "",
    owner: p?.owner ?? "PERSONAL",
    kind: p?.kind ?? "WEB_APP",
    status: p?.status ?? "IN_DEV",
    subdomain: p?.subdomain ?? "",
    externalUrl: p?.externalUrl ?? "",
    repoUrl: p?.repoUrl ?? "",
    coverUrl: p?.coverUrl ?? "",
    accent: p?.accent ?? "#00f0ff",
    tags: list(p?.tags),
    stack: list(p?.stack),
    featured: p?.featured ?? false,
    playable: p?.playable ?? false,
    published: p?.published ?? true,
    sortOrder: String(p?.sortOrder ?? 0),
    year: String(p?.year ?? new Date().getFullYear()),
    genre: p?.genre ?? "",
    platforms: list(p?.platforms),
    players: p?.players ?? "",
    translations: {
      en: {
        name: en.name ?? "",
        tagline: en.tagline ?? "",
        description: en.description ?? "",
        genre: en.genre ?? "",
        players: en.players ?? "",
        tags: list(en.tags),
      },
    },
  };
}
