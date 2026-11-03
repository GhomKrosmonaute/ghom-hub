import { localizeProfile } from "@ghom/content";
import type { Locale } from "@ghom/core";
import { getProfileData } from "@ghom/db";
import { cache } from "react";

/**
 * Présentation de GHOM dans une langue. Elle s'édite dans l'admin (admin.ghom.fr) ;
 * les valeurs par défaut sont dans packages/content/src/profile.ts.
 */
export const getProfile = cache(async (locale: Locale) =>
  localizeProfile(await getProfileData(), locale),
);
