import type { Locale } from "@ghom/core";

/**
 * Ce que GHOM construit avec Claude. Faits tirés des dépôts (README, guides) ;
 * le dépôt de l'agent Satané Ghom est privé : décrit ici, jamais lié.
 */
export const SATANE_GHOM = {
  channelId: "UCgg20wPvbiLm-OhOSjvz1_A",
  url: "https://www.youtube.com/@Satan%C3%A9Ghom",
  site: "https://ghomkrosmonaute.github.io/anti-dogmatic-resources/",
  /** Premier commit de Ghom sur l'agent (et non la date de création de la chaîne). */
  since: "2026-09-25",
};

export type ClaudeBuild = {
  slug: string;
  name: string;
  href?: string;
  /** Libellé du lien (par défaut : « GitHub »). */
  linkLabel?: string;
  tags: string[];
  texts: Record<Locale, { kicker: string; body: string }>;
};

export const claudeBuilds: ClaudeBuild[] = [
  {
    slug: "ghom-hub",
    name: "ghom.fr",
    href: "https://github.com/GhomKrosmonaute/ghom-hub",
    tags: ["Claude Code", "Skills", "MCP"],
    texts: {
      fr: {
        kicker: "Ce site, de bout en bout",
        body: "Le hub, le portail No Brain No Game et la console d'admin : conçus, codés et déployés avec Claude Code. Deux skills maison automatisent le reste : mettre un jeu en ligne sur son sous-domaine (Vercel, Neon, DNS OVH) et l'ajouter au catalogue.",
      },
      en: {
        kicker: "This site, end to end",
        body: "The hub, the No Brain No Game portal and the admin console: designed, coded and deployed with Claude Code. Two home-made skills automate the rest: shipping a game to its own subdomain (Vercel, Neon, OVH DNS) and adding it to the catalogue.",
      },
    },
  },
  {
    slug: "frugal",
    name: "frugal",
    href: "https://github.com/GhomKrosmonaute/claude-plugins",
    tags: ["Plugin", "Subagents", "Hooks"],
    texts: {
      fr: {
        kicker: "Plugin Claude Code open source",
        body: "Réduit la consommation de tokens de Claude Code : contexte principal court, travail trivial délégué à Haiku et simple à Sonnet, captures d'écran et longues sorties tenues hors du contexte, et un rapport pour mesurer le gain.",
      },
      en: {
        kicker: "Open source Claude Code plugin",
        body: "Cuts Claude Code token usage: a short main context, trivial work delegated to Haiku and simple work to Sonnet, screenshots and long outputs kept out of the context, and a report to measure the gain.",
      },
    },
  },
  {
    slug: "ghombudget",
    name: "GhomBudget",
    href: "https://budget.ghom.fr",
    linkLabel: "budget.ghom.fr",
    tags: ["React", "Tauri", "Open banking"],
    texts: {
      fr: {
        kicker: "Gestion de budget, construite avec Claude Code",
        body: "Une app de budget personnel sur le web, le bureau et Android : synchronisation bancaire, catégorisation proposée puis confirmée, détection des salaires et des récurrences, suivi des dettes et projection du solde. Verrouillage biométrique inclus.",
      },
      en: {
        kicker: "Budgeting app, built with Claude Code",
        body: "A personal budgeting app for web, desktop and Android: bank sync, categories suggested then confirmed, salary and recurring-payment detection, debt tracking and balance projection. Biometric lock included.",
      },
    },
  },
];
