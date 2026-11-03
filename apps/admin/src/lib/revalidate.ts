import "server-only";
import type { Site } from "@ghom/content";
import { env } from "./env";

/**
 * Demande aux sites publics de régénérer leurs pages tout de suite
 * (sinon l'ISR s'en charge en 60 s). Un échec n'annule pas l'enregistrement.
 */
export async function revalidateSites(sites: readonly Site[]): Promise<Site[]> {
  const urls: Record<Site, string> = { HUB: env.hubInternalUrl, STUDIO: env.studioInternalUrl };
  const results = await Promise.all(
    [...new Set(sites)].map(async (site) => {
      try {
        const res = await fetch(`${urls[site].replace(/\/$/, "")}/api/revalidate`, {
          method: "POST",
          headers: { authorization: `Bearer ${env.revalidateSecret ?? ""}` },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        });
        return res.ok ? null : site;
      } catch {
        return site;
      }
    }),
  );
  return results.filter((s): s is Site => s !== null);
}
