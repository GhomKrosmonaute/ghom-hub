import type { Project, ProjectTranslations } from "@ghom/core";

export type SeedProject = Omit<Project, "id"> & { translations: ProjectTranslations };

const base = {
  externalUrl: null,
  repoUrl: null,
  coverUrl: null,
  featured: false,
  playable: false,
  genre: null,
  platforms: [],
  players: null,
  translations: {},
} satisfies Partial<SeedProject>;

/**
 * ⚠️ Données d'exemple : remplace-les par tes vrais projets
 * (ici, puis `bun db:seed`, ou directement via `bun db:studio`).
 * Elles servent aussi de repli si la base est injoignable.
 */
export const SEED_PROJECTS: SeedProject[] = [
  // ───────────── Projets perso → <subdomain>.ghom.fr ─────────────
  {
    ...base,
    slug: "neon-ledger",
    name: "Neon Ledger",
    tagline: "Budget perso en temps réel, façon terminal de trading.",
    description:
      "Application web de suivi de budget : import bancaire, catégorisation automatique et graphiques temps réel dans une interface de salle des marchés.",
    owner: "PERSONAL",
    kind: "WEB_APP",
    status: "LIVE",
    subdomain: "ledger",
    accent: "#00f0ff",
    tags: ["finance", "dashboard"],
    stack: ["Next.js", "PostgreSQL", "Prisma"],
    featured: true,
    sortOrder: 1,
    year: 2026,
    translations: {
      en: {
        tagline: "Real-time personal budgeting, trading-terminal style.",
        description:
          "Budget tracking web app: bank imports, automatic categorisation and real-time charts in a trading-floor interface.",
        tags: ["finance", "dashboard"],
      },
    },
  },
  {
    ...base,
    slug: "pixel-forge",
    name: "Pixel Forge",
    tagline: "Éditeur de sprites et d'animations dans le navigateur.",
    description:
      "Calques, palettes indexées, onion skinning et export de spritesheets. Pensé pour prototyper vite les assets des jeux du studio.",
    owner: "PERSONAL",
    kind: "TOOL",
    status: "IN_DEV",
    subdomain: "forge",
    accent: "#ff2bd6",
    tags: ["pixel-art", "gamedev"],
    stack: ["TypeScript", "Canvas", "WebGL"],
    sortOrder: 2,
    year: 2026,
    translations: {
      en: {
        tagline: "Sprite and animation editor in the browser.",
        description:
          "Layers, indexed palettes, onion skinning and spritesheet export. Built to prototype the studio's game assets fast.",
        tags: ["pixel-art", "gamedev"],
      },
    },
  },
  {
    ...base,
    slug: "synthwave-radio",
    name: "Synthwave Radio",
    tagline: "Une webradio rétro-futuriste avec visualiseur 3D.",
    description:
      "Flux audio continu, visualiseur réactif en three.js et chat en direct. Le genre de site qu'on laisse ouvert dans un onglet toute la journée.",
    owner: "PERSONAL",
    kind: "WEBSITE",
    status: "BETA",
    subdomain: "radio",
    accent: "#ffb800",
    tags: ["musique", "3d"],
    stack: ["three.js", "Web Audio", "Bun"],
    sortOrder: 3,
    year: 2025,
    translations: {
      en: {
        tagline: "A retro-futuristic web radio with a 3D visualiser.",
        description:
          "Continuous audio stream, a reactive three.js visualiser and live chat. The kind of site you leave open in a tab all day.",
        tags: ["music", "3d"],
      },
    },
  },
  {
    ...base,
    slug: "glitchkit",
    name: "Glitchkit",
    tagline: "Librairie d'effets glitch pour React.",
    description:
      "Composants et hooks pour du texte qui se décrypte, des distorsions RGB et des scanlines — sans dépendances lourdes.",
    owner: "PERSONAL",
    kind: "LIBRARY",
    status: "LIVE",
    subdomain: null,
    repoUrl: "https://github.com/",
    accent: "#7cff4f",
    tags: ["open-source", "ui"],
    stack: ["React", "TypeScript"],
    sortOrder: 4,
    year: 2025,
    translations: {
      en: {
        tagline: "Glitch effects library for React.",
        description:
          "Components and hooks for decrypting text, RGB distortion and scanlines — with no heavy dependencies.",
        tags: ["open-source", "ui"],
      },
    },
  },
  {
    ...base,
    slug: "sentinel",
    name: "Sentinel",
    tagline: "Bot Discord de modération et de stats de serveur.",
    description:
      "Modération automatique, journaux d'audit lisibles et tableaux de bord d'activité pour communautés de joueurs.",
    owner: "PERSONAL",
    kind: "BOT",
    status: "LIVE",
    subdomain: null,
    repoUrl: "https://github.com/",
    accent: "#8b5cff",
    tags: ["discord", "communauté"],
    stack: ["Bun", "discord.js", "PostgreSQL"],
    sortOrder: 5,
    year: 2024,
    translations: {
      en: {
        tagline: "Discord bot for moderation and server stats.",
        description:
          "Automatic moderation, readable audit logs and activity dashboards for gaming communities.",
        tags: ["discord", "community"],
      },
    },
  },
  {
    ...base,
    slug: "portfolio-v1",
    name: "Portfolio v1",
    tagline: "L'ancien site, avant la mise à niveau de l'exosquelette.",
    description: "Première version du portfolio. Conservé pour l'histoire.",
    owner: "PERSONAL",
    kind: "WEBSITE",
    status: "ARCHIVED",
    subdomain: null,
    accent: "#5b6b7f",
    tags: ["archive"],
    stack: ["HTML", "CSS"],
    sortOrder: 9,
    year: 2021,
    translations: {
      en: {
        tagline: "The old site, before the exoskeleton upgrade.",
        description: "First version of the portfolio. Kept for history's sake.",
        tags: ["archive"],
      },
    },
  },

  // ───────────── Jeux No Brain No Game → <subdomain>.nobrainnogame.ghom.fr ─────────────
  {
    ...base,
    slug: "void-tactics",
    name: "Void Tactics",
    tagline: "Chaque tour compte. Chaque case aussi.",
    description:
      "Tactique au tour par tour dans une mégapole néon. Tu commandes une escouade de quatre : couverture, lignes de vue, points d'action. Une erreur de placement se paie trois tours plus tard.",
    owner: "STUDIO",
    kind: "GAME",
    status: "LIVE",
    playable: true,
    subdomain: "void-tactics",
    accent: "#c6ff00",
    tags: ["tactique", "tour par tour"],
    stack: ["three.js", "TypeScript"],
    featured: true,
    sortOrder: 1,
    year: 2026,
    genre: "Tactique au tour par tour",
    platforms: ["Web", "PC"],
    players: "1 joueur",
    translations: {
      en: {
        tagline: "Every turn counts. So does every tile.",
        description:
          "Turn-based tactics in a neon megacity. You command a squad of four: cover, lines of sight, action points. A bad placement costs you three turns later.",
        genre: "Turn-based tactics",
        players: "1 player",
        tags: ["tactics", "turn-based"],
      },
    },
  },
  {
    ...base,
    slug: "brainstorm",
    name: "Brainstorm",
    tagline: "Tout le monde planifie. Tout se résout en même temps.",
    description:
      "Duel de stratégie en tours simultanés : chacun programme ses ordres en secret, puis tout s'exécute d'un coup. Anticiper l'adversaire, c'est toute la partie.",
    owner: "STUDIO",
    kind: "GAME",
    status: "BETA",
    playable: true,
    subdomain: "brainstorm",
    accent: "#ff5e1a",
    tags: ["multijoueur", "stratégie"],
    stack: ["Godot", "WebRTC"],
    sortOrder: 2,
    year: 2026,
    genre: "Stratégie en tours simultanés",
    platforms: ["Web", "PC"],
    players: "2–4 joueurs",
    translations: {
      en: {
        tagline: "Everyone plans. Everything resolves at once.",
        description:
          "A strategy duel with simultaneous turns: everyone programs their orders in secret, then it all plays out at once. Reading your opponent is the whole game.",
        genre: "Simultaneous-turn strategy",
        players: "2–4 players",
        tags: ["multiplayer", "strategy"],
      },
    },
  },
  {
    ...base,
    slug: "neon-crypt",
    name: "Neon Crypt",
    tagline: "Roguelike tactique : chaque étage est un puzzle de combat.",
    description:
      "Descends les étages d'une tour corpo infestée de drones, case par case. Les ennemis annoncent leurs coups : à toi de trouver la séquence qui te sort de là.",
    owner: "STUDIO",
    kind: "GAME",
    status: "IN_DEV",
    subdomain: "neon-crypt",
    accent: "#a855ff",
    tags: ["roguelike", "tactique"],
    stack: ["Rust", "WASM"],
    sortOrder: 3,
    year: 2027,
    genre: "Roguelike tactique",
    platforms: ["Web", "PC"],
    players: "1 joueur",
    translations: {
      en: {
        tagline: "Tactical roguelike: every floor is a combat puzzle.",
        description:
          "Climb down a corporate tower infested with drones, one tile at a time. Enemies telegraph their moves: find the sequence that gets you out alive.",
        genre: "Tactical roguelike",
        players: "1 player",
        tags: ["roguelike", "tactics"],
      },
    },
  },
  {
    ...base,
    slug: "cortex-overflow",
    name: "Cortex Overflow",
    tagline: "Un puzzle de logique où chaque coup se prévoit trois coups à l'avance.",
    description:
      "Relie les neurones, route les influx, évite la surchauffe du réseau. Prototype de game jam devenu projet sérieux.",
    owner: "STUDIO",
    kind: "GAME",
    status: "PROTOTYPE",
    subdomain: "cortex",
    accent: "#00e5ff",
    tags: ["puzzle", "logique"],
    stack: ["TypeScript", "Canvas"],
    sortOrder: 4,
    year: 2025,
    genre: "Puzzle / logique",
    platforms: ["Web"],
    players: "1 joueur",
    translations: {
      en: {
        tagline: "A logic puzzle where every move is planned three moves ahead.",
        description:
          "Connect neurons, route signals, keep the network from overheating. A game jam prototype that became a serious project.",
        genre: "Puzzle / logic",
        players: "1 player",
        tags: ["puzzle", "logic"],
      },
    },
  },
];

export function seedProjectsAsProjects(): Project[] {
  return SEED_PROJECTS.map((p) => ({ ...p, id: `seed-${p.slug}` }));
}
