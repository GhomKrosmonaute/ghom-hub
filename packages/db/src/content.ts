import { defaultProfile, type ProfileData, parseProfile, type Site } from "@ghom/content";
import type { Locale } from "@ghom/core";
import { getPrisma } from "./client";
import { withFallback } from "./fallback";

/** Profil édité dans l'admin, sinon celui par défaut (base vide, invalide ou injoignable). */
export async function getProfileData(): Promise<ProfileData> {
  const { data } = await withFallback(
    "getProfileData",
    async () => {
      const row = await getPrisma().profile.findUnique({ where: { id: "main" } });
      return (row && parseProfile(row.data)) ?? defaultProfile;
    },
    () => defaultProfile,
  );
  return data;
}

/** Surcharges de textes d'un site dans une langue : { "hero.scroll": "…" }. */
export async function getOverrides(site: Site, locale: Locale): Promise<Record<string, string>> {
  const { data } = await withFallback(
    `getOverrides(${site},${locale})`,
    async () => {
      const rows = await getPrisma().translationOverride.findMany({ where: { site, locale } });
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    },
    () => ({}),
  );
  return data;
}
