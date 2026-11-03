import { isBearerAuthorized } from "@ghom/core";
import { revalidatePath } from "next/cache";

/**
 * Appelé par l'admin après chaque modification : régénère les pages de toutes
 * les langues sans attendre l'ISR. Protégé par REVALIDATE_SECRET.
 */
export async function POST(request: Request) {
  if (!isBearerAuthorized(request.headers.get("authorization"), process.env.REVALIDATE_SECRET)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  revalidatePath("/[lang]", "layout");
  return Response.json({ ok: true, revalidatedAt: new Date().toISOString() });
}
