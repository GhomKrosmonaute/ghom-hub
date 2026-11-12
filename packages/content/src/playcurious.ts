import type { Locale } from "@ghom/core";

/**
 * Projets Play Curious (studio de serious games) auxquels GHOM a participé.
 * Sources : crédits officiels sur playcurious.games, textes des anciens portfolios,
 * contributions publiques sur github.com/play-curious.
 */
export type PlayCuriousProject = {
  slug: string;
  name: string;
  kind: "game" | "tool";
  /** Visuel servi depuis apps/hub/public ; absent : glyphe à la place. */
  image?: string;
  url: string;
  accent: string;
  featured?: boolean;
  /** Uniquement ce que confirment les dépôts publics ; vide si inconnu. */
  stack: string[];
  texts: Record<Locale, { role: string; meta: string; pitch: string; work: string[] }>;
};

export const PLAY_CURIOUS_URL = "https://playcurious.games";

export const playCuriousProjects: PlayCuriousProject[] = [
  {
    slug: "crispr-crunch",
    name: "CRISPR Crunch",
    kind: "game",
    image: "/playcurious/crispr-crunch.webp",
    url: "https://playcurious.games/our-games/crispr-crunch/",
    accent: "#3dffb0",
    featured: true,
    stack: ["Mobile"],
    texts: {
      fr: {
        role: "Développeur principal",
        meta: "Puzzle game · avec le Learning Planet Institute, Paris",
        pitch:
          "Un puzzle game sur l'édition génétique : découper l'ADN des virus avec CRISPR, niveau après niveau.",
        work: [
          "Gameplay et level design",
          "Interface, animations et audio",
          "Intégration de l'application mobile",
        ],
      },
      en: {
        role: "Lead developer",
        meta: "Puzzle game · with the Learning Planet Institute, Paris",
        pitch:
          "A puzzle game about gene editing: cut viral DNA with CRISPR, one level after another.",
        work: ["Gameplay and level design", "UI, animation and audio", "Mobile app integration"],
      },
    },
  },
  {
    slug: "edenred-boat-quest",
    name: "Edenred Boat Quest",
    kind: "game",
    image: "/playcurious/edenred-boat-quest.webp",
    url: "https://playcurious.games/our-games/edenred-boat-quest/",
    accent: "#4cc9ff",
    stack: [],
    texts: {
      fr: {
        role: "Développeur",
        meta: "Jeu événementiel · pour Edenred",
        pitch:
          "Sauver la mer en ramassant un maximum de déchets. Conçu en moins d'un mois, chaque partie a nourri un don à une ONG de nettoyage des océans.",
        work: [
          "Gameplay et physique du bateau",
          "Interface et animations",
          "Progression de la difficulté",
        ],
      },
      en: {
        role: "Developer",
        meta: "Event game · for Edenred",
        pitch:
          "Save the sea by collecting as much waste as you can. Built in under a month, every game fed a donation to an ocean clean-up NGO.",
        work: ["Gameplay and boat physics", "UI and animation", "Difficulty progression"],
      },
    },
  },
  {
    slug: "neuroboost",
    name: "Neuroboost",
    kind: "game",
    image: "/playcurious/neuroboost.webp",
    url: "https://playcurious.games/our-games/neuroboost/",
    accent: "#ff6ec7",
    stack: ["TypeScript", "PixiJS", "Booyah"],
    texts: {
      fr: {
        role: "Développeur",
        meta: "Jeu éducatif · 2021 – 2022",
        pitch:
          "« Apprendre à apprendre » : un jeu éducatif qui fait travailler sa façon d'apprendre.",
        work: ["Près de 200 commits sur le dépôt", "Gameplay et interface"],
      },
      en: {
        role: "Developer",
        meta: "Educational game · 2021 – 2022",
        pitch: "“Learn how to learn”: an educational game about the way you learn.",
        work: ["Close to 200 commits on the repo", "Gameplay and UI"],
      },
    },
  },
  {
    slug: "sea-rescue",
    name: "Sea Rescue",
    kind: "game",
    url: "https://playcurious.games/our-games/sea-rescue/",
    accent: "#00f0ff",
    stack: ["TypeScript", "three.js", "Booyah"],
    texts: {
      fr: {
        role: "Développeur",
        meta: "Jeu 3D",
        pitch: "Un jeu en 3D pour nettoyer l'océan, réalisé avec l'équipe Play Curious.",
        work: ["Rendu 3D avec three.js", "Logique de jeu avec Booyah"],
      },
      en: {
        role: "Developer",
        meta: "3D game",
        pitch: "A 3D game about cleaning up the ocean, built with the Play Curious team.",
        work: ["3D rendering with three.js", "Game logic with Booyah"],
      },
    },
  },
  {
    slug: "redmetrics",
    name: "RedMetrics",
    kind: "tool",
    url: "https://github.com/play-curious/RedMetrics2",
    accent: "#ff4d6d",
    stack: ["TypeScript", "Express", "PostgreSQL", "React", "Docker"],
    texts: {
      fr: {
        role: "Premier contributeur",
        meta: "Analytics open source pour les jeux",
        pitch:
          "La plateforme qui mesure comment on joue aux jeux du studio : une API d'événements, une base de données et un tableau de bord.",
        work: ["API et base de données", "Interface du tableau de bord", "SDK JavaScript"],
      },
      en: {
        role: "Top contributor",
        meta: "Open source game analytics",
        pitch:
          "The platform that measures how people play the studio's games: an event API, a database and a dashboard.",
        work: ["API and database", "Dashboard UI", "JavaScript SDK"],
      },
    },
  },
  {
    slug: "booyah",
    name: "Booyah",
    kind: "tool",
    url: "https://github.com/play-curious/booyah",
    accent: "#f72585",
    stack: ["TypeScript", "JavaScript"],
    texts: {
      fr: {
        role: "Contributeur",
        meta: "Moteur de jeux HTML5 du studio",
        pitch:
          "Le moteur maison sur lequel tournent les jeux Play Curious, à base de machines à états. J'en maintiens aujourd'hui ma propre version.",
        work: ["Deuxième contributeur du dépôt", "Machines à états et outillage"],
      },
      en: {
        role: "Contributor",
        meta: "The studio's HTML5 game engine",
        pitch:
          "The in-house engine Play Curious games run on, built around state machines. I now maintain my own version of it.",
        work: ["Second contributor to the repo", "State machines and tooling"],
      },
    },
  },
];
