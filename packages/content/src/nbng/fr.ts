import type { Widen } from "../dictionary";

/**
 * Dictionnaire source (français). `en.ts` doit avoir exactement la même forme :
 * le type `Dictionary` est dérivé de ce fichier.
 * Les variables s'écrivent {nom} et sont remplies avec `fill()` (@ghom/core).
 */
export const fr = {
  meta: {
    title: "No Brain No Game — Studio de jeux vidéo",
    description:
      "Studio indépendant de jeux tactiques et stratégiques, jouables dans le navigateur. Pas de cerveau, pas de jeu.",
  },
  stages: {
    aria: "Sections",
    jeux: "Jeux",
    studio: "Studio",
    "insert-coin": "Insert coin",
  },
  nav: {
    navigation: "Navigation",
    start: "Écran titre",
    games: "Lancer un jeu",
    systems: "Systèmes",
    hub: "Retour sur ghom.fr",
    sfx: "Effets sonores",
    language: "Switch to English",
    soon: "bientôt",
    support: "Soutenir le studio",
  },
  contextMenu: {
    link: "Lien ciblé",
    openLink: "Ouvrir dans un nouvel onglet",
    copyLink: "Copier l'adresse du lien",
    copied: "Adresse copiée",
    nativeHint: "Maj + clic droit : menu du navigateur",
  },
  bezel: {
    credit: "CRÉDIT",
    language: "Langue",
  },
  hero: {
    kicker: "STUDIO DE JEUX VIDÉO INDÉPENDANT · EST. 2025",
    pitch:
      "Des jeux tactiques et stratégiques, jouables directement dans ton navigateur. Ici, chaque victoire se mérite :",
    highlight: "sans cerveau, pas de partie.",
    memory: "{count} JEUX EN MÉMOIRE · ↵ ENTRÉE POUR COMMENCER",
  },
  games: {
    stage: "STAGE 1-1",
    title: "Select your game",
    keys: "↑ ↓ CHOISIR · ↵ JOUER",
    aria: "Jeux",
    empty: "AUCUNE CARTOUCHE INSÉRÉE",
    genre: "GENRE",
    players: "JOUEURS",
    platforms: "SUPPORT",
    release: "SORTIE",
    play: "Jouer",
    soon: "Bientôt",
    source: "Code source",
  },
  studio: {
    stage: "STAGE 1-2",
    title: "Le studio",
    body: "No Brain No Game est un studio indépendant de jeux tactiques et stratégiques. Pas de cerveau, pas de jeu : nos parties se gagnent en anticipant, en planifiant et en lisant l'adversaire. Fondé et piloté par",
    rule: "RÈGLE N°{n}",
    rules: [
      {
        title: "Chaque coup compte",
        text: "Pas de hasard qui décide à ta place : tu gagnes parce que tu as mieux lu la partie.",
      },
      {
        title: "Facile à apprendre, dur à maîtriser",
        text: "Des règles qui tiennent sur une carte, une profondeur qu'on creuse pendant des mois.",
      },
      {
        title: "Zéro installation",
        text: "Un lien, un navigateur, c'est parti. Sur ordi comme sur mobile.",
      },
    ],
    ticker: [
      "CERVEAU OBLIGATOIRE",
      "JEUX JOUABLES DANS LE NAVIGATEUR",
      "MADE IN FRANCE",
      "INSERT COIN",
      "RÉFLÉCHIS AVANT DE JOUER",
    ],
    stats: {
      games: "JEUX",
      playable: "JOUABLES",
      inDev: "EN FABRICATION",
      brain: "CERVEAU REQUIS",
    },
  },
  insertCoin: {
    stage: "STAGE 1-3",
    title: "Insert coin",
    body: "Laisse ton e-mail pour être prévenu·e à chaque nouveau jeu. Pas de spam, juste des sorties et des défis à ta mesure.",
    email: "E-mail",
    placeholder: "player1@exemple.fr",
    submit: "Insérer",
    accepted: "CRÉDIT AJOUTÉ",
    acceptedDetail: "CRÉDIT AJOUTÉ · Tu seras prévenu·e des sorties.",
    rejected: "PIÈCE REFUSÉE",
    outOfOrder: "MACHINE HORS SERVICE · Réessaie plus tard.",
  },
  support: {
    kicker: "CONTINUE ?",
    title: "Soutenir le studio",
    body: "Tous nos jeux sont gratuits, sans pub ni achat intégré, et la plupart sont open source. Le studio ne gagne rien : chaque café offert finance du temps de développement.",
    cta: "Offrir un café",
    note: "Via Buy Me a Coffee · sans inscription",
  },
  footer: {
    by: "UN STUDIO DE",
    support: "€ SOUTENIR",
  },
  notFound: {
    code: "404 · NIVEAU INTROUVABLE",
    title: "GAME OVER",
    continue: "▶ CONTINUE ?",
  },
};

export type Dictionary = Widen<typeof fr>;
