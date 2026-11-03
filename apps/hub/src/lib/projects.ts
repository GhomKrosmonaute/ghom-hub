import {
  type DomainConfig,
  displayHost,
  domainConfigFromEnv,
  KIND_META,
  type Locale,
  localizeProject,
  type Project,
  productRef,
  projectUrl,
  STATUS_META,
} from "@ghom/core";

export const domains: DomainConfig = domainConfigFromEnv(process.env);

export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ||
  `${domains.protocol}://${domains.studioLabel}.${domains.rootDomain}`;

/** Projet enrichi côté serveur : le client reçoit des textes traduits et des URLs déjà résolues. */
export interface ProjectView extends Omit<Project, "translations"> {
  url: string | null;
  host: string | null;
  ref: string;
  kindLabel: string;
  stock: string;
  statusLabel: string;
  tone: "ok" | "warn" | "info" | "dim";
}

/** Projet prêt à afficher dans la langue demandée (textes, libellés, URL résolue). */
export function toView(project: Project, locale: Locale): ProjectView {
  const url = projectUrl(project, domains);
  const { translations: _, ...localized } = localizeProject(project, locale);
  return {
    ...localized,
    url,
    host: displayHost(url),
    ref: productRef(project),
    kindLabel: KIND_META[project.kind].label[locale],
    stock: STATUS_META[project.status].stock[locale],
    statusLabel: STATUS_META[project.status].label[locale],
    tone: STATUS_META[project.status].tone,
  };
}

/** URL d'un autre site du hub, dans la même langue. */
export function withLocale(siteUrl: string, locale: Locale): string {
  return `${siteUrl.replace(/\/$/, "")}/${locale}`;
}
