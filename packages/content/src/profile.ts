import { type Locale, localizeCurrency } from "@ghom/core";
import { z } from "zod";

/**
 * Présentation de GHOM (hub). Les valeurs ci-dessous sont celles par défaut ;
 * l'admin enregistre une version modifiée en base, validée par `profileSchema`.
 */
const text = (max: number) => z.string().trim().min(1, "Requis").max(max, `${max} caractères max.`);

const localizedTextsSchema = z.object({
  role: text(80),
  location: text(80),
  tagline: text(300),
  bio: z.array(text(1200)).min(1, "Au moins un paragraphe").max(6),
  logbook: z.array(z.object({ year: text(8), entry: text(200) })).max(20),
});

export const profileSchema = z.object({
  handle: text(24),
  unit: text(40),
  /** Affichés comme des "systèmes" de l'exosquelette (niveau 0–100). */
  systems: z
    .array(
      z.object({
        code: text(12),
        label: text(40),
        level: z.coerce.number().int().min(0).max(100),
      }),
    )
    .max(12),
  loadout: z.array(text(32)).max(30),
  links: z
    .array(
      z.object({
        label: text(24),
        href: z
          .string()
          .trim()
          .regex(/^(https?:\/\/|mailto:)\S+$/, "URL http(s):// ou mailto: attendue"),
        code: text(4),
      }),
    )
    .max(8),
  texts: z.object({ fr: localizedTextsSchema, en: localizedTextsSchema }),
});

export type ProfileData = z.infer<typeof profileSchema>;
export type ProfileInput = z.input<typeof profileSchema>;

export const defaultProfile: ProfileData = {
  handle: "GHOM",
  unit: "EXO-7 · MK.II",
  systems: [
    { code: "SYS.01", label: "TypeScript", level: 95 },
    { code: "SYS.02", label: "React / Next.js", level: 92 },
    { code: "SYS.03", label: "three.js / WebGL", level: 80 },
    { code: "SYS.04", label: "PostgreSQL / Prisma", level: 85 },
    { code: "SYS.05", label: "Game design", level: 74 },
    { code: "SYS.06", label: "DevOps / Docker", level: 70 },
  ],
  loadout: [
    "Bun",
    "Next.js",
    "Turbo",
    "Prisma",
    "PostgreSQL",
    "three.js",
    "Tailwind",
    "Godot",
    "Docker",
    "Linux",
  ],
  links: [
    { label: "GitHub", href: "https://github.com/", code: "GH" },
    { label: "LinkedIn", href: "https://www.linkedin.com/", code: "IN" },
    { label: "E-mail", href: "mailto:contact@ghom.fr", code: "@" },
    { label: "Buy me a coffee", href: "https://buymeacoffee.com/ghom", code: "¤" },
  ],
  texts: {
    fr: {
      role: "Dev full-stack & game dev",
      location: "France · UTC+1",
      tagline:
        "Je construis des interfaces qui se pilotent, des outils qui servent et des jeux qui font travailler le cerveau.",
      bio: [
        "Développement web de bout en bout : du schéma de base de données jusqu'au dernier pixel animé. J'aime les interfaces qui ont du caractère et les architectures qui restent simples.",
        "En parallèle, je fais tourner No Brain No Game, un petit studio de jeux tactiques et stratégiques jouables directement dans le navigateur.",
      ],
      logbook: [
        { year: "2026", entry: "Mise en service de ghom.fr et du portail No Brain No Game." },
        { year: "2025", entry: "Création du studio No Brain No Game." },
        { year: "2023", entry: "Premiers projets full-stack en production." },
        { year: "20XX", entry: "Premier « Hello world ». Le début des ennuis." },
      ],
    },
    en: {
      role: "Full-stack & game developer",
      location: "France · UTC+1",
      tagline:
        "I build interfaces you can pilot, tools that get the job done and games that make your brain work.",
      bio: [
        "End-to-end web development: from the database schema to the last animated pixel. I like interfaces with character and architectures that stay simple.",
        "On the side, I run No Brain No Game, a small studio making tactical and strategy games you play right in the browser.",
      ],
      logbook: [
        { year: "2026", entry: "ghom.fr and the No Brain No Game portal go live." },
        { year: "2025", entry: "No Brain No Game studio founded." },
        { year: "2023", entry: "First full-stack projects in production." },
        { year: "20XX", entry: "First “Hello world”. That's when the trouble started." },
      ],
    },
  },
};

/** Profil tel qu'affiché dans une langue. */
export function localizeProfile(data: ProfileData, locale: Locale) {
  const { texts, links, ...rest } = data;
  return {
    ...rest,
    // "¤" dans un code de lien → € en français, $ en anglais
    links: links.map((l) => ({ ...l, code: localizeCurrency(l.code, locale) })),
    ...texts[locale],
  };
}
export type Profile = ReturnType<typeof localizeProfile>;

/** Valide une valeur venue de la base ; `null` si absente ou invalide. */
export function parseProfile(value: unknown): ProfileData | null {
  const parsed = profileSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
