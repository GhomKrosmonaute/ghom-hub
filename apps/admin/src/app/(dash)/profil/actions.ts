"use server";

import { profileSchema } from "@ghom/content";
import { fieldErrors } from "@ghom/core";
import { resetProfileData, saveProfileData } from "@ghom/db/admin";
import { requireAdmin } from "@/auth/guard";
import { type ActionResult, done, failure } from "@/lib/actions";

export async function saveProfile(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Champs invalides", fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await saveProfileData(parsed.data);
    return done("Profil enregistré", ["HUB"]);
  } catch (error) {
    return failure(error);
  }
}

export async function resetProfile(): Promise<ActionResult> {
  await requireAdmin();
  try {
    await resetProfileData();
    return done("Profil réinitialisé (valeurs par défaut)", ["HUB"]);
  } catch (error) {
    return failure(error);
  }
}
