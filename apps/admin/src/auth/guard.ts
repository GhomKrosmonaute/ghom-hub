import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { SESSION_COOKIE, verifySession } from "./session";

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySession(token, env.sessionSecret);
}

/**
 * À appeler en tête de chaque Server Action / Route Handler de l'admin.
 * Le proxy filtre déjà les pages, mais une action reste appelable directement :
 * on revérifie toujours (défense en profondeur).
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAuthenticated())) redirect("/login");
}
