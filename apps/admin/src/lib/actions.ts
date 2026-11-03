import "server-only";
import type { Site } from "@ghom/content";
import { revalidatePath } from "next/cache";
import { revalidateSites } from "./revalidate";

export type ActionResult =
  | { ok: true; message: string; warning?: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

/**
 * Fin d'une mutation réussie : rafraîchit l'admin, puis les sites publics concernés.
 * Si un site ne répond pas, on prévient sans annuler (l'ISR prendra le relais).
 */
export async function done(message: string, sites: readonly Site[] = []): Promise<ActionResult> {
  revalidatePath("/", "layout");
  const failed = sites.length ? await revalidateSites(sites) : [];
  return {
    ok: true,
    message,
    warning: failed.length
      ? `Enregistré, mais ${failed.join(" / ")} n'a pas pu être rafraîchi : la mise à jour publique prendra jusqu'à 60 s.`
      : undefined,
  };
}

export function failure(
  error: unknown,
  fallback = "Opération impossible : base injoignable ?",
): ActionResult {
  console.error("[admin]", error);
  return { ok: false, message: fallback };
}
