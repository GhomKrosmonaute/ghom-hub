import type { Locale, Localized, PageKey } from "@ghom/core";

/**
 * Pages légales des deux sites publics, en français et en anglais :
 * - `legal-notice` : mentions légales (/mentions-legales, /en/legal-notice) ;
 * - `terms`        : CGU (/cgu, /en/terms) ;
 * - `privacy`      : politique de confidentialité (/confidentialite, /en/privacy).
 * Les slugs publics sont définis par `PAGE_SLUGS` (@ghom/core).
 * Textes volontairement dans le code (versionnés, relus) et non dans l'admin.
 * Pense à mettre à jour `LEGAL_UPDATED` à chaque modification de fond.
 */

export const LEGAL_PAGES = [
  "legal-notice",
  "terms",
  "privacy",
] as const satisfies readonly PageKey[];
export type LegalPage = (typeof LEGAL_PAGES)[number];
export type LegalSite = "HUB" | "STUDIO";

/** Date de dernière mise à jour (ISO), affichée sur les pages. */
export const LEGAL_UPDATED = "2026-11-03";

/** Éditrice des deux sites. */
export const PUBLISHER = {
  name: "Camille ABELLA",
  handle: "GHOM",
  siret: "979 392 164 00013",
  address: "5 rue Agusanum, 66240 Saint-Estève, France",
} as const;

/** Adresse de contact (et d'exercice des droits RGPD) de chaque site. */
export const LEGAL_CONTACTS: Record<LegalSite, string> = {
  HUB: "camille.abella@proton.me",
  STUDIO: "nobrainnogame-fr@proton.me",
};

export interface LegalSection {
  heading: string;
  /** Paragraphes ; les adresses e-mail et URL https sont rendues en liens. */
  body: string[];
}

export interface LegalDoc {
  title: string;
  description: string;
  intro: string;
  sections: LegalSection[];
}

export const legalUi: Localized<
  Record<LegalPage, string> & {
    updated: string;
    back: string;
    nav: string;
  }
> = {
  fr: {
    "legal-notice": "Mentions légales",
    terms: "CGU",
    privacy: "Confidentialité",
    updated: "Dernière mise à jour",
    back: "Retour à l'accueil",
    nav: "Informations légales",
  },
  en: {
    "legal-notice": "Legal notice",
    terms: "Terms",
    privacy: "Privacy",
    updated: "Last updated",
    back: "Back to home",
    nav: "Legal information",
  },
};

/* ------------------------------------------------------------------ */
/* Faits communs                                                       */
/* ------------------------------------------------------------------ */

const HOSTS: Localized<string[]> = {
  fr: [
    "Site : Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis — privacy@vercel.com — https://vercel.com. Pages servies depuis la région européenne « fra1 » (Francfort, Allemagne).",
    "Base de données : Neon, LLC, filiale de Databricks, Inc., 160 Spear Street, Suite 1300, San Francisco, CA 94105, États-Unis — https://neon.com. Données stockées à Francfort (Allemagne).",
  ],
  en: [
    "Website: Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, United States — privacy@vercel.com — https://vercel.com. Pages served from the European “fra1” region (Frankfurt, Germany).",
    "Database: Neon, LLC, a subsidiary of Databricks, Inc., 160 Spear Street, Suite 1300, San Francisco, CA 94105, United States — https://neon.com. Data stored in Frankfurt (Germany).",
  ],
};

interface SiteFacts {
  name: string;
  domain: string;
  contact: string;
  /** Qui édite le site (mentions légales, section 1). */
  publisher: Localized<string[]>;
  /** Phrase courte pour « Éditeur » dans les CGU et la confidentialité. */
  publisherShort: Localized<string>;
  /** Ce que propose le site, inséré dans « Objet ». */
  purpose: Localized<string>;
  /** Section propre au service du site (CGU, section 3). */
  service: Localized<LegalSection>;
  /** Données collectées par ce service (politique de confidentialité). */
  data: Localized<LegalSection[]>;
  /** Clés de stockage local utilisées par le site. */
  storage: Localized<string[]>;
}

const p = PUBLISHER;

const SITES: Record<LegalSite, SiteFacts> = {
  HUB: {
    name: "ghom.fr",
    domain: "ghom.fr",
    contact: LEGAL_CONTACTS.HUB,
    publisher: {
      fr: [
        `${p.name} EI (entrepreneur individuel, micro-entreprise), alias « ${p.handle} ».`,
        `SIRET : ${p.siret}.`,
        `Adresse : ${p.address}.`,
        `E-mail : ${LEGAL_CONTACTS.HUB}.`,
      ],
      en: [
        `${p.name} EI (French sole proprietorship, micro-entreprise), also known as “${p.handle}”.`,
        `SIRET (French business registration number): ${p.siret}.`,
        `Address: ${p.address}.`,
        `Email: ${LEGAL_CONTACTS.HUB}.`,
      ],
    },
    publisherShort: {
      fr: `${p.name} EI (« ${p.handle} »), SIRET ${p.siret}, ${p.address}`,
      en: `${p.name} EI (“${p.handle}”), SIRET ${p.siret}, ${p.address}`,
    },
    purpose: {
      fr: `présenter ${p.handle}, ses projets (applications web, outils, jeux) et permettre de prendre contact`,
      en: `present ${p.handle} and their projects (web apps, tools, games) and make it possible to get in touch`,
    },
    service: {
      fr: {
        heading: "Formulaire de contact",
        body: [
          "Le formulaire « Comms » permet d'envoyer un message à l'éditrice. Tu t'engages à fournir une adresse e-mail valide qui t'appartient et à ne pas envoyer de contenu illicite, injurieux, publicitaire non sollicité ou automatisé.",
          "L'éditrice s'efforce de répondre dans un délai raisonnable, sans obligation de réponse. Le formulaire ne vaut ni devis ni engagement contractuel : toute prestation fait l'objet d'un accord séparé.",
        ],
      },
      en: {
        heading: "Contact form",
        body: [
          "The “Comms” form lets you send a message to the publisher. You agree to provide a valid email address that belongs to you and not to send unlawful, abusive, unsolicited advertising or automated content.",
          "The publisher tries to answer within a reasonable time, with no obligation to reply. The form is neither a quote nor a contractual commitment: any service is subject to a separate agreement.",
        ],
      },
    },
    data: {
      fr: [
        {
          heading: "Formulaire de contact",
          body: [
            "Données : indicatif (nom ou pseudo), adresse e-mail, objet facultatif, message, date d'envoi.",
            "Finalité : lire ta demande et y répondre. Base légale : ton consentement et l'intérêt légitime de l'éditrice à répondre aux demandes qui lui sont adressées (art. 6.1.a et 6.1.f du RGPD).",
            "Durée de conservation : le temps de traiter l'échange, puis au plus 3 ans après le dernier contact.",
          ],
        },
      ],
      en: [
        {
          heading: "Contact form",
          body: [
            "Data: callsign (name or nickname), email address, optional subject, message, date sent.",
            "Purpose: reading and answering your request. Legal basis: your consent and the publisher's legitimate interest in answering requests sent to them (GDPR art. 6.1.a and 6.1.f).",
            "Retention: as long as needed to handle the conversation, then at most 3 years after the last contact.",
          ],
        },
      ],
    },
    storage: {
      fr: [
        "« ghom:sfx » (stockage local) : mémorise si les effets sonores sont activés.",
        "« ghom:booted » (stockage de session) : évite de rejouer l'animation de démarrage pendant la visite.",
      ],
      en: [
        "“ghom:sfx” (local storage): remembers whether sound effects are on.",
        "“ghom:booted” (session storage): avoids replaying the boot animation during your visit.",
      ],
    },
  },
  STUDIO: {
    name: "No Brain No Game",
    domain: "nobrainnogame.ghom.fr",
    contact: LEGAL_CONTACTS.STUDIO,
    publisher: {
      fr: [
        `No Brain No Game est un projet personnel et non lucratif de ${p.name}, sans structure juridique propre : le studio n'est pas une société.`,
        `Éditrice : ${p.name}, ${p.address}.`,
        `E-mail : ${LEGAL_CONTACTS.STUDIO}.`,
      ],
      en: [
        `No Brain No Game is a personal, non-profit project by ${p.name}, with no legal structure of its own: the studio is not a company.`,
        `Publisher: ${p.name}, ${p.address}.`,
        `Email: ${LEGAL_CONTACTS.STUDIO}.`,
      ],
    },
    publisherShort: {
      fr: `${p.name}, ${p.address}, dans le cadre du projet personnel et non lucratif No Brain No Game`,
      en: `${p.name}, ${p.address}, as part of the personal, non-profit No Brain No Game project`,
    },
    purpose: {
      fr: "présenter le projet No Brain No Game et ses jeux, donner accès à ces jeux et proposer une liste de diffusion annonçant les sorties",
      en: "present the No Brain No Game project and its games, give access to those games and offer a mailing list announcing releases",
    },
    service: {
      fr: {
        heading: "Jeux et liste de diffusion",
        body: [
          "Les jeux sont gratuits, sans publicité ni achat intégré, et accessibles depuis le portail, chacun sur son propre sous-domaine (<jeu>.nobrainnogame.ghom.fr). Un jeu peut comporter ses propres règles ou conditions, qui complètent les présentes CGU. Les jeux en « accès anticipé » ou en prototype peuvent contenir des bugs, être modifiés ou retirés à tout moment.",
          `La section « Insert coin » permet de s'inscrire avec son adresse e-mail pour être prévenu·e des sorties. Chaque e-mail contient un lien de désinscription ; tu peux aussi te désinscrire à tout moment en écrivant à ${LEGAL_CONTACTS.STUDIO}.`,
          "Le code source de certains jeux est publié sous licence libre : c'est alors la licence indiquée dans le dépôt qui s'applique à ce code.",
        ],
      },
      en: {
        heading: "Games and mailing list",
        body: [
          "The games are free, with no ads or in-app purchases, and reachable from the portal, each on its own subdomain (<game>.nobrainnogame.ghom.fr). A game may come with its own rules or terms, which supplement these Terms. Games in “early access” or prototype stage may contain bugs and may be changed or withdrawn at any time.",
          `The “Insert coin” section lets you sign up with your email address to hear about new releases. Every email contains an unsubscribe link; you can also unsubscribe at any time by writing to ${LEGAL_CONTACTS.STUDIO}.`,
          "The source code of some games is published under an open-source licence: the licence stated in the repository then applies to that code.",
        ],
      },
    },
    data: {
      fr: [
        {
          heading: "Liste de diffusion (« Insert coin »)",
          body: [
            "Données : adresse e-mail, date d'inscription, site d'origine de l'inscription.",
            "Finalité : t'envoyer les annonces de sortie des jeux, sans autre usage. Base légale : ton consentement (art. 6.1.a du RGPD), que tu peux retirer à tout moment.",
            "Durée de conservation : jusqu'à ta désinscription, ou 3 ans sans aucun envoi ni interaction.",
          ],
        },
      ],
      en: [
        {
          heading: "Mailing list (“Insert coin”)",
          body: [
            "Data: email address, sign-up date, site where you signed up.",
            "Purpose: sending you release announcements for the games, nothing else. Legal basis: your consent (GDPR art. 6.1.a), which you can withdraw at any time.",
            "Retention: until you unsubscribe, or 3 years without any mailing or interaction.",
          ],
        },
      ],
    },
    storage: {
      fr: [
        "« ghom:sfx » (stockage local) : mémorise si les effets sonores sont activés.",
        "« nbng:credits » (stockage local) : compteur de crédits de la borne d'arcade, purement ludique.",
      ],
      en: [
        "“ghom:sfx” (local storage): remembers whether sound effects are on.",
        "“nbng:credits” (local storage): the arcade cabinet's credit counter, just for fun.",
      ],
    },
  },
};

/** Numérote les sections dans l'ordre : « 1. … », « 2. … ». */
function numbered(sections: LegalSection[]): LegalSection[] {
  return sections.map((s, i) => ({ ...s, heading: `${i + 1}. ${s.heading}` }));
}

/* ------------------------------------------------------------------ */
/* Mentions légales                                                    */
/* ------------------------------------------------------------------ */

function legalNotice(s: SiteFacts, locale: Locale): LegalDoc {
  if (locale === "en") {
    return {
      title: "Legal notice",
      description: `Legal notice of ${s.domain}: publisher and hosting.`,
      intro: `Information required by French law (Article 6 of law no. 2004-575 of 21 June 2004 on confidence in the digital economy) about ${s.domain}.`,
      sections: numbered([
        { heading: "Publisher", body: s.publisher.en },
        { heading: "Publication director", body: [p.name] },
        { heading: "Hosting", body: HOSTS.en },
        {
          heading: "Intellectual property",
          body: [
            "The Site's content is protected by intellectual property law. Conditions of use are set out in the terms of use.",
          ],
        },
        {
          heading: "Personal data",
          body: [
            "How your personal data is handled is described in the privacy policy. Both documents are available from the Site's footer.",
          ],
        },
      ]),
    };
  }
  return {
    title: "Mentions légales",
    description: `Mentions légales de ${s.domain} : éditrice et hébergement.`,
    intro: `Informations prévues par l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN), concernant ${s.domain}.`,
    sections: numbered([
      { heading: "Éditrice", body: s.publisher.fr },
      { heading: "Directrice de la publication", body: [p.name] },
      { heading: "Hébergement", body: HOSTS.fr },
      {
        heading: "Propriété intellectuelle",
        body: [
          "Les contenus du Site sont protégés par le droit de la propriété intellectuelle. Leurs conditions d'utilisation sont précisées dans les conditions générales d'utilisation.",
        ],
      },
      {
        heading: "Données personnelles",
        body: [
          "Le traitement de tes données personnelles est décrit dans la politique de confidentialité. Ces deux documents sont accessibles depuis le pied de page du Site.",
        ],
      },
    ]),
  };
}

/* ------------------------------------------------------------------ */
/* CGU                                                                 */
/* ------------------------------------------------------------------ */

function terms(s: SiteFacts, locale: Locale): LegalDoc {
  if (locale === "en") {
    return {
      title: "Terms of use",
      description: `Terms of use of ${s.domain}.`,
      intro: `These terms of use (“Terms”) govern access to and use of ${s.domain} (the “Site”). By browsing the Site, you accept them without reservation.`,
      sections: numbered([
        {
          heading: "Publisher",
          body: [
            `The Site is published by ${s.publisherShort.en}. Contact: ${s.contact}. Full details, including hosting, are given in the legal notice.`,
          ],
        },
        {
          heading: "Purpose",
          body: [
            `The Site's purpose is to ${s.purpose.en}. Access is free; you only need an internet connection and a recent browser, at your own expense.`,
          ],
        },
        s.service.en,
        {
          heading: "Acceptable use",
          body: [
            "You agree not to disrupt the Site's operation (automated mass requests, vulnerability scanning without permission, intrusion attempts, malicious code injection…) and not to use it for unlawful purposes.",
            "The publisher may block access for anyone who breaches these Terms, without notice.",
          ],
        },
        {
          heading: "Intellectual property",
          body: [
            `Unless stated otherwise, the Site's content (texts, visuals, 3D scenes, logos, the “${s.name}” name, interface) belongs to the publisher and is protected by intellectual property law. Any reproduction or reuse without prior permission is prohibited, except for private use or short quotations with attribution.`,
            "Code published under an open-source licence remains governed by that licence. Third-party brands and names mentioned belong to their respective owners.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "The Site is provided “as is”. The publisher does their best to keep it available and accurate but does not guarantee uninterrupted access, the absence of errors or bugs, or that the projects and games presented will keep existing. Maintenance or changes may interrupt access at any time.",
            "The publisher cannot be held liable for indirect damage resulting from use of the Site, nor for the content of external sites reachable through links (GitHub, Buy Me a Coffee, social networks…), which are governed by their own terms.",
          ],
        },
        {
          heading: "Donations",
          body: [
            "“Support” links lead to Buy Me a Coffee (https://buymeacoffee.com). Donations are voluntary, give no right to any counterpart and are processed entirely by that platform, under its own terms. The publisher never sees your payment details.",
          ],
        },
        {
          heading: "Personal data",
          body: [
            "The processing of your personal data is described in the privacy policy, available from the Site's footer.",
          ],
        },
        {
          heading: "Changes and governing law",
          body: [
            "The publisher may update these Terms at any time; the version in force is the one published on the Site, with its date of last update.",
            `These Terms are governed by French law. In case of dispute, please first write to ${s.contact} to find an amicable solution; failing that, the competent French courts will have jurisdiction, subject to any mandatory consumer protection rules of your country of residence.`,
          ],
        },
      ]),
    };
  }
  return {
    title: "Conditions générales d'utilisation",
    description: `Conditions générales d'utilisation de ${s.domain}.`,
    intro: `Les présentes conditions générales d'utilisation (« CGU ») encadrent l'accès et l'utilisation de ${s.domain} (le « Site »). Naviguer sur le Site vaut acceptation sans réserve des CGU.`,
    sections: numbered([
      {
        heading: "Éditrice",
        body: [
          `Le Site est édité par ${s.publisherShort.fr}. Contact : ${s.contact}. Les informations complètes, hébergement compris, figurent dans les mentions légales.`,
        ],
      },
      {
        heading: "Objet",
        body: [
          `Le Site a pour objet de ${s.purpose.fr}. L'accès est gratuit ; seuls une connexion internet et un navigateur récent sont nécessaires, à ta charge.`,
        ],
      },
      s.service.fr,
      {
        heading: "Bon usage",
        body: [
          "Tu t'engages à ne pas perturber le fonctionnement du Site (requêtes automatisées massives, recherche de failles sans autorisation, tentative d'intrusion, injection de code malveillant…) et à ne pas l'utiliser à des fins illicites.",
          "L'éditrice peut bloquer l'accès de toute personne qui ne respecte pas les CGU, sans préavis.",
        ],
      },
      {
        heading: "Propriété intellectuelle",
        body: [
          `Sauf mention contraire, les contenus du Site (textes, visuels, scènes 3D, logos, le nom « ${s.name} », interface) appartiennent à l'éditrice et sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou réutilisation sans autorisation préalable est interdite, hors usage privé ou courte citation avec mention de la source.`,
          "Le code publié sous licence libre reste régi par cette licence. Les marques et noms de tiers cités appartiennent à leurs titulaires.",
        ],
      },
      {
        heading: "Responsabilité",
        body: [
          "Le Site est fourni « en l'état ». L'éditrice fait de son mieux pour qu'il soit disponible et exact, sans garantir un accès ininterrompu, l'absence d'erreurs ou de bugs, ni la pérennité des projets et jeux présentés. Une maintenance ou une évolution peut interrompre l'accès à tout moment.",
          "L'éditrice ne saurait être tenue responsable des dommages indirects liés à l'utilisation du Site, ni du contenu des sites externes accessibles par des liens (GitHub, Buy Me a Coffee, réseaux sociaux…), régis par leurs propres conditions.",
        ],
      },
      {
        heading: "Dons",
        body: [
          "Les liens « Soutenir » mènent vers Buy Me a Coffee (https://buymeacoffee.com). Les dons sont libres, n'ouvrent droit à aucune contrepartie et sont entièrement traités par cette plateforme, selon ses propres conditions. L'éditrice n'a jamais accès à tes données de paiement.",
        ],
      },
      {
        heading: "Données personnelles",
        body: [
          "Le traitement de tes données personnelles est décrit dans la politique de confidentialité, accessible depuis le pied de page du Site.",
        ],
      },
      {
        heading: "Modification et droit applicable",
        body: [
          "L'éditrice peut modifier les CGU à tout moment ; la version applicable est celle publiée sur le Site, avec sa date de dernière mise à jour.",
          `Les CGU sont soumises au droit français. En cas de litige, écris d'abord à ${s.contact} pour chercher une solution amiable ; à défaut, les tribunaux français compétents seront saisis, sous réserve des règles impératives protégeant les consommateurs de ton pays de résidence.`,
        ],
      },
    ]),
  };
}

/* ------------------------------------------------------------------ */
/* Confidentialité                                                     */
/* ------------------------------------------------------------------ */

function privacy(s: SiteFacts, locale: Locale): LegalDoc {
  if (locale === "en") {
    return {
      title: "Privacy policy",
      description: `How ${s.domain} handles your personal data.`,
      intro: `This policy explains what personal data ${s.domain} (the “Site”) collects, why, and how you can exercise your rights under the General Data Protection Regulation (GDPR) and the French Data Protection Act. In short: the bare minimum, no advertising, no tracking.`,
      sections: numbered([
        {
          heading: "Data controller",
          body: [`${s.publisherShort.en}. Contact: ${s.contact}.`],
        },
        {
          heading: "Data collected",
          body: [
            "Apart from the technical logs described below, the Site collects no data simply because you browse it: no account, no audience measurement, no advertising tracker, no social network pixel. Fonts are served by the Site itself (no call to Google Fonts).",
            "The only other data collected is the data you choose to send through the form described below.",
          ],
        },
        ...s.data.en,
        {
          heading: "Technical logs",
          body: [
            "Like any web server, the host automatically records technical data (IP address, date, requested page, browser) to make the Site work and keep it secure. These logs are kept for a short time by the host (a few days) and are not used to profile visitors. Legal basis: legitimate interest (security of the service).",
          ],
        },
        {
          heading: "Cookies and local storage",
          body: [
            "The Site uses no advertising or audience measurement cookies, so no consent banner is required. It only uses strictly necessary or functional storage, which stays in your browser:",
            "“NEXT_LOCALE” (cookie, 1 year): remembers the language you picked, shared between ghom.fr and its subdomains.",
            ...s.storage.en,
            "You can delete them at any time in your browser settings; the Site will simply go back to its default settings.",
          ],
        },
        {
          heading: "Recipients and processors",
          body: [
            "Your data is only accessible to the publisher. It is never sold, rented or shared for commercial purposes.",
            "Technical processors: Vercel Inc. (hosting, Frankfurt region), Neon, LLC — a Databricks, Inc. subsidiary (database, stored in Frankfurt, Germany) — and Resend (Plus Five Five, Inc., https://resend.com) for sending emails. These companies are based in the United States; any transfer outside the European Union is covered by the EU-US Data Privacy Framework and/or the European Commission's standard contractual clauses.",
            "Buy Me a Coffee links lead to a third-party platform that processes your data under its own policy; the Site sends it no information.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You have the right to access, rectify and erase your data, to restrict or object to its processing, to data portability, and to withdraw your consent at any time. You can also set instructions for what happens to your data after your death.",
            `To exercise these rights, write to ${s.contact}. An answer will be given within one month at most.`,
            "If you believe your rights are not being respected, you can lodge a complaint with the CNIL (https://www.cnil.fr) or the data protection authority of your country.",
          ],
        },
        {
          heading: "Security and changes",
          body: [
            "Data is transmitted over an encrypted connection (HTTPS) and stored in a database only reachable by the publisher.",
            "This policy may change; the version in force is the one published on this page, with its date of last update.",
          ],
        },
      ]),
    };
  }
  return {
    title: "Politique de confidentialité",
    description: `Comment ${s.domain} traite tes données personnelles.`,
    intro: `Cette politique explique quelles données personnelles ${s.domain} (le « Site ») collecte, pourquoi, et comment exercer tes droits au titre du Règlement général sur la protection des données (RGPD) et de la loi Informatique et Libertés. En résumé : le strict minimum, pas de publicité, pas de pistage.`,
    sections: numbered([
      {
        heading: "Responsable du traitement",
        body: [`${s.publisherShort.fr}. Contact : ${s.contact}.`],
      },
      {
        heading: "Données collectées",
        body: [
          "Hormis les journaux techniques décrits plus bas, le Site ne collecte aucune donnée du simple fait de ta navigation : pas de compte, pas de mesure d'audience, pas de traceur publicitaire, pas de pixel de réseau social. Les polices sont servies par le Site lui-même (aucun appel à Google Fonts).",
          "Les seules autres données collectées sont celles que tu choisis d'envoyer via le formulaire décrit ci-dessous.",
        ],
      },
      ...s.data.fr,
      {
        heading: "Journaux techniques",
        body: [
          "Comme tout serveur web, l'hébergeur enregistre automatiquement des données techniques (adresse IP, date, page demandée, navigateur) pour faire fonctionner le Site et le sécuriser. Ces journaux sont conservés peu de temps par l'hébergeur (quelques jours) et ne servent pas à profiler les visiteurs. Base légale : intérêt légitime (sécurité du service).",
        ],
      },
      {
        heading: "Cookies et stockage local",
        body: [
          "Le Site n'utilise aucun cookie publicitaire ni de mesure d'audience : aucun bandeau de consentement n'est donc nécessaire. Il n'utilise que des stockages strictement nécessaires ou fonctionnels, qui restent dans ton navigateur :",
          "« NEXT_LOCALE » (cookie, 1 an) : mémorise la langue choisie, partagée entre ghom.fr et ses sous-domaines.",
          ...s.storage.fr,
          "Tu peux les supprimer à tout moment dans les réglages de ton navigateur ; le Site reprendra simplement ses réglages par défaut.",
        ],
      },
      {
        heading: "Destinataires et sous-traitants",
        body: [
          "Tes données ne sont accessibles qu'à l'éditrice. Elles ne sont jamais vendues, louées ni cédées à des fins commerciales.",
          "Sous-traitants techniques : Vercel Inc. (hébergement, région de Francfort), Neon, LLC — filiale de Databricks, Inc. — (base de données, stockée à Francfort, Allemagne) et Resend (Plus Five Five, Inc., https://resend.com) pour l'envoi des e-mails. Ces sociétés sont établies aux États-Unis ; un éventuel transfert hors de l'Union européenne est encadré par le Data Privacy Framework UE–États-Unis et/ou les clauses contractuelles types de la Commission européenne.",
          "Les liens Buy Me a Coffee mènent vers une plateforme tierce qui traite tes données selon sa propre politique ; le Site ne lui transmet aucune information.",
        ],
      },
      {
        heading: "Tes droits",
        body: [
          "Tu disposes d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition au traitement de tes données, d'un droit à la portabilité, et du droit de retirer ton consentement à tout moment. Tu peux aussi définir des directives sur le sort de tes données après ton décès.",
          `Pour exercer ces droits, écris à ${s.contact}. Une réponse te sera apportée dans un délai d'un mois maximum.`,
          "Si tu estimes que tes droits ne sont pas respectés, tu peux adresser une réclamation à la CNIL (https://www.cnil.fr).",
        ],
      },
      {
        heading: "Sécurité et modifications",
        body: [
          "Les données sont transmises par une connexion chiffrée (HTTPS) et stockées dans une base accessible uniquement à l'éditrice.",
          "Cette politique peut évoluer ; la version applicable est celle publiée sur cette page, avec sa date de dernière mise à jour.",
        ],
      },
    ]),
  };
}

/** Contenu d'une page légale pour un site et une langue. */
export function legalDoc(site: LegalSite, page: LegalPage, locale: Locale): LegalDoc {
  const facts = SITES[site];
  if (page === "legal-notice") return legalNotice(facts, locale);
  if (page === "privacy") return privacy(facts, locale);
  return terms(facts, locale);
}

/** Date de mise à jour formatée dans la langue. */
export function legalUpdatedLabel(locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${LEGAL_UPDATED}T00:00:00Z`));
}
