import type { Locale } from "@ghom/core";

/**
 * CV de GHOM, affiché sur ghom.fr/cv et exporté en PDF (`bun run cv:pdf`).
 * Source : le profil LinkedIn (expériences, formation) et le CV de la v2 du portfolio
 * (certifications, points forts). Pas de téléphone ni d'adresse : le CV est public.
 */
type Entry = { title: string; org: string; meta: string; period: string; points: string[] };

export type Cv = {
  name: string;
  role: string;
  location: string;
  summary: string;
  contact: { label: string; href: string }[];
  ui: {
    pageTitle: string;
    description: string;
    back: string;
    download: string;
    print: string;
    experience: string;
    education: string;
    skills: string;
    highlights: string;
    certifications: string;
    interests: string;
  };
  experience: Entry[];
  education: Entry[];
  skills: { group: string; items: string[] }[];
  highlights: string[];
  certifications: string[];
  interests: string[];
};

const contact = [
  { label: "ghom.fr", href: "https://ghom.fr" },
  { label: "camille.abella@proton.me", href: "mailto:camille.abella@proton.me" },
  { label: "github.com/GhomKrosmonaute", href: "https://github.com/GhomKrosmonaute" },
  { label: "linkedin.com/in/ghom", href: "https://www.linkedin.com/in/ghom/" },
];

const skills = {
  langs: ["TypeScript", "JavaScript", "SQL", "HTML / CSS"],
  front: ["React", "Next.js", "Tailwind", "three.js / WebGL", "PixiJS"],
  back: ["Node.js", "Bun", "PostgreSQL", "Prisma", "discord.js"],
  ops: ["Docker", "Linux", "Turborepo", "Vercel", "Git"],
};

export const cv: Record<Locale, Cv> = {
  fr: {
    name: "Camille « Ghom » Abella",
    role: "Développeur full-stack & game dev",
    location: "Perpignan, France · télétravail",
    summary:
      "Développeur TypeScript de bout en bout, du schéma de base de données à l'interface animée. Sept ans de pratique entre jeux sérieux, produit SaaS et open source, avec un goût prononcé pour les interfaces qui ont du caractère et les architectures qui restent simples.",
    contact,
    ui: {
      pageTitle: "CV",
      description:
        "CV de Camille « Ghom » Abella, développeur full-stack et game dev : expériences, formation et compétences.",
      back: "Retour au hub",
      download: "Télécharger le PDF",
      print: "Imprimer",
      experience: "Expérience",
      education: "Formation",
      skills: "Compétences",
      highlights: "Points forts",
      certifications: "Certifications",
      interests: "Centres d'intérêt",
    },
    experience: [
      {
        title: "Développeur web",
        org: "Danim",
        meta: "CDI · à distance",
        period: "déc. 2024 – nov. 2026",
        points: [
          "Équipe R&D : prototypes et explorations techniques.",
          "Équipe produit : développement en équipe sur un monorepo Turborepo, coding collaboratif.",
        ],
      },
      {
        title: "Développeur indépendant",
        org: "Freelance",
        meta: "À distance",
        period: "depuis sept. 2023",
        points: [
          "Projets web et jeux vidéo en TypeScript, de la conception à la mise en ligne.",
          "Fondation du studio No Brain No Game : jeux tactiques jouables dans le navigateur.",
        ],
      },
      {
        title: "Développeur",
        org: "Play Curious",
        meta: "Alternance · Perpignan",
        period: "juil. 2020 – sept. 2023",
        points: [
          "Studio de serious games : développement de jeux vidéo, web et mobile, gestion de projet.",
          "Projets : CRISPR Crunch, Edenred Boat Quest, RedMetrics.",
        ],
      },
      {
        title: "Développeur web",
        org: "Agence Point Com",
        meta: "Stage · Perpignan",
        period: "mai – juin 2019",
        points: ["Back-end PHP et développement de plugins WordPress."],
      },
    ],
    education: [
      {
        title: "Master 2 Cybersécurité",
        org: "L'Idem, Perpignan",
        meta: "",
        period: "2022 – 2023",
        points: [],
      },
      {
        title: "Master 1 Chef de projet",
        org: "L'Idem, Perpignan",
        meta: "",
        period: "2021 – 2022",
        points: [],
      },
      {
        title: "Concepteur développeur d'applications desktop et mobile",
        org: "L'Idem, Perpignan",
        meta: "Diplômé",
        period: "2020 – 2021",
        points: [],
      },
      {
        title: "Développeur web et applications mobiles",
        org: "L'Idem, Perpignan",
        meta: "Diplômé",
        period: "2019 – 2020",
        points: [],
      },
      {
        title: "Développement web & web design",
        org: "L'Idem, Perpignan",
        meta: "",
        period: "2019",
        points: [],
      },
    ],
    skills: [
      { group: "Langages", items: skills.langs },
      { group: "Front", items: skills.front },
      { group: "Back", items: skills.back },
      { group: "Outils", items: skills.ops },
      { group: "Aussi", items: ["Game design", "UI / UX", "Cybersécurité"] },
    ],
    highlights: [
      "Fondateur des Laboratoires JS (2018) : près de 1000 personnes réunies sur Discord pour apprendre le JavaScript.",
      "Open source : Bot.ts, @ghom/orm, @ghom/booyah et d'autres librairies npm.",
      "3ᵉ place au Startup Weekend Perpignan (2019).",
    ],
    certifications: [
      "SecNumacadémie (ANSSI) : bonnes pratiques en cybersécurité",
      "L'Atelier RGPD (CNIL) : connaissances RGPD",
    ],
    interests: ["Production musicale (FL Studio)", "Création graphique (suite Adobe)"],
  },
  en: {
    name: "Camille “Ghom” Abella",
    role: "Full-stack & game developer",
    location: "Perpignan, France · remote",
    summary:
      "End-to-end TypeScript developer, from the database schema to the animated interface. Seven years of practice across serious games, a SaaS product and open source, with a taste for interfaces with character and architectures that stay simple.",
    contact,
    ui: {
      pageTitle: "Résumé",
      description:
        "Résumé of Camille “Ghom” Abella, full-stack and game developer: experience, education and skills.",
      back: "Back to the hub",
      download: "Download the PDF",
      print: "Print",
      experience: "Experience",
      education: "Education",
      skills: "Skills",
      highlights: "Highlights",
      certifications: "Certifications",
      interests: "Interests",
    },
    experience: [
      {
        title: "Web developer",
        org: "Danim",
        meta: "Permanent contract · remote",
        period: "Dec 2024 – Nov 2026",
        points: [
          "R&D team: prototypes and technical explorations.",
          "Product team: team development on a Turborepo monorepo, collaborative coding.",
        ],
      },
      {
        title: "Independent developer",
        org: "Freelance",
        meta: "Remote",
        period: "since Sep 2023",
        points: [
          "Web and game projects in TypeScript, from design to release.",
          "Founded the No Brain No Game studio: tactical games playable in the browser.",
        ],
      },
      {
        title: "Developer",
        org: "Play Curious",
        meta: "Work-study · Perpignan",
        period: "Jul 2020 – Sep 2023",
        points: [
          "Serious games studio: game, web and mobile development, project management.",
          "Projects: CRISPR Crunch, Edenred Boat Quest, RedMetrics.",
        ],
      },
      {
        title: "Web developer",
        org: "Agence Point Com",
        meta: "Internship · Perpignan",
        period: "May – Jun 2019",
        points: ["PHP back end and WordPress plugin development."],
      },
    ],
    education: [
      {
        title: "Master's degree (M2), Cybersecurity",
        org: "L'Idem, Perpignan",
        meta: "",
        period: "2022 – 2023",
        points: [],
      },
      {
        title: "Master's degree (M1), Project management",
        org: "L'Idem, Perpignan",
        meta: "",
        period: "2021 – 2022",
        points: [],
      },
      {
        title: "Desktop and mobile application designer-developer",
        org: "L'Idem, Perpignan",
        meta: "Graduated",
        period: "2020 – 2021",
        points: [],
      },
      {
        title: "Web and mobile application developer",
        org: "L'Idem, Perpignan",
        meta: "Graduated",
        period: "2019 – 2020",
        points: [],
      },
      {
        title: "Web development & web design",
        org: "L'Idem, Perpignan",
        meta: "",
        period: "2019",
        points: [],
      },
    ],
    skills: [
      { group: "Languages", items: skills.langs },
      { group: "Front end", items: skills.front },
      { group: "Back end", items: skills.back },
      { group: "Tooling", items: skills.ops },
      { group: "Also", items: ["Game design", "UI / UX", "Cybersecurity"] },
    ],
    highlights: [
      "Founder of Les Laboratoires JS (2018): close to 1,000 people on Discord learning JavaScript together.",
      "Open source: Bot.ts, @ghom/orm, @ghom/booyah and other npm libraries.",
      "3rd place at Startup Weekend Perpignan (2019).",
    ],
    certifications: [
      "SecNumacadémie (ANSSI): cybersecurity good practices",
      "L'Atelier RGPD (CNIL): GDPR knowledge",
    ],
    interests: ["Music production (FL Studio)", "Graphic design (Adobe suite)"],
  },
};

/** Fichier PDF publié pour une langue (généré par `bun run cv:pdf`). */
export const cvPdfPath = (locale: Locale) => `/cv/camille-ghom-abella-cv-${locale}.pdf`;
