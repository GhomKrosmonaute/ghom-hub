import { z } from "zod";
import { type DomainConfig, projectHost } from "./domains";
import { OWNERS, PROJECT_KINDS, PROJECT_STATUSES } from "./types";

/** "" ou espaces → null ; sinon la chaîne nettoyée. */
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max} caractères max.`)
    .optional()
    .transform((v) => (v ? v : null));

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .refine((v) => v === null || /^https?:\/\/\S+$/.test(v), "URL http(s):// attendue");

/** Liste saisie "a, b, c" (ou déjà en tableau) → ["a", "b", "c"], sans doublons ni vides. */
const csvList = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => {
    const items = (Array.isArray(v) ? v : (v ?? "").split(",")).map((s) => s.trim());
    return [...new Set(items.filter(Boolean))];
  });

const translationSchema = z
  .object({
    name: optionalText(80),
    tagline: optionalText(200),
    description: optionalText(2000),
    genre: optionalText(60),
    players: optionalText(40),
    tags: csvList,
  })
  .partial()
  .optional()
  .transform((t) => {
    // On ne garde que les champs renseignés : un champ vide retombe sur le français.
    const out: Record<string, string | string[]> = {};
    for (const [k, v] of Object.entries(t ?? {})) {
      if (Array.isArray(v) ? v.length > 0 : Boolean(v)) out[k] = v as string | string[];
    }
    return out;
  });

/**
 * Schéma du formulaire "projet" de l'admin. Le sous-domaine est validé avec
 * la même logique que les sites (label DNS valide, labels réservés).
 */
export function projectInputSchema(domains: DomainConfig) {
  return z
    .object({
      slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Minuscules, chiffres et tirets uniquement")
        .max(60),
      name: z.string().trim().min(1, "Requis").max(80),
      tagline: z.string().trim().min(1, "Requis").max(200),
      description: z.string().trim().min(1, "Requis").max(2000),
      owner: z.enum(OWNERS),
      kind: z.enum(PROJECT_KINDS),
      status: z.enum(PROJECT_STATUSES),
      subdomain: z
        .string()
        .trim()
        .toLowerCase()
        .optional()
        .transform((v) => (v ? v : null)),
      externalUrl: optionalUrl,
      repoUrl: optionalUrl,
      coverUrl: optionalUrl,
      accent: z
        .string()
        .trim()
        .regex(/^#[0-9a-fA-F]{6}$/, "Couleur au format #rrggbb")
        .transform((v) => v.toLowerCase()),
      tags: csvList,
      stack: csvList,
      featured: z.boolean().default(false),
      published: z.boolean().default(true),
      sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
      year: z.coerce.number().int().min(1990, "Année invalide").max(2100, "Année invalide"),
      genre: optionalText(60),
      platforms: csvList,
      players: optionalText(40),
      translations: z.object({ en: translationSchema }).partial().default({}),
    })
    .superRefine((p, ctx) => {
      try {
        projectHost({ owner: p.owner, subdomain: p.subdomain }, domains);
      } catch (error) {
        ctx.addIssue({ code: "custom", path: ["subdomain"], message: (error as Error).message });
      }
    })
    .transform(({ translations, ...rest }) => ({
      ...rest,
      translations:
        translations.en && Object.keys(translations.en).length ? { en: translations.en } : {},
    }));
}

export type ProjectFormInput = z.input<ReturnType<typeof projectInputSchema>>;
export type ProjectFormData = z.output<ReturnType<typeof projectInputSchema>>;
