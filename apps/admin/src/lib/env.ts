import { domainConfigFromEnv } from "@ghom/core";

/** Configuration serveur de l'admin (jamais exposée au navigateur). */
export const env = {
  get passwordHash() {
    return process.env.ADMIN_PASSWORD_HASH;
  },
  get sessionSecret() {
    return process.env.SESSION_SECRET;
  },
  get revalidateSecret() {
    return process.env.REVALIDATE_SECRET;
  },
  get hubInternalUrl() {
    return process.env.HUB_INTERNAL_URL || "http://localhost:3000";
  },
  get studioInternalUrl() {
    return process.env.STUDIO_INTERNAL_URL || "http://localhost:3001";
  },
  get secure() {
    return process.env.NODE_ENV === "production";
  },
};

/** Même configuration de domaines que les sites publics (validation des sous-domaines, aperçus d'URL). */
export const domains = domainConfigFromEnv(process.env);

export const PUBLIC_URLS = {
  HUB: process.env.NEXT_PUBLIC_HUB_URL || `${domains.protocol}://${domains.rootDomain}`,
  STUDIO:
    process.env.NEXT_PUBLIC_STUDIO_URL ||
    `${domains.protocol}://${domains.studioLabel}.${domains.rootDomain}`,
} as const;
