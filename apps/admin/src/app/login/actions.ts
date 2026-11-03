"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/auth/password";
import { loginLimiter } from "@/auth/rate-limit";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/auth/session";
import { env } from "@/lib/env";

export type LoginState = { error?: string };

/** IP du client : Caddy écrase X-Forwarded-For, la dernière valeur est la sienne. */
async function clientIp() {
  const h = await headers();
  const forwarded = h
    .get("x-forwarded-for")
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return forwarded?.at(-1) ?? h.get("x-real-ip") ?? "local";
}

/** N'autorise que des chemins internes (pas d'open redirect). */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const ip = await clientIp();
  const wait = loginLimiter.retryAfter(ip);
  if (wait > 0) {
    return { error: `Trop de tentatives. Réessaie dans ${Math.ceil(wait / 60)} min.` };
  }
  if (!env.passwordHash || !env.sessionSecret) {
    return { error: "Admin non configuré : ADMIN_PASSWORD_HASH et SESSION_SECRET requis." };
  }

  const password = form.get("password");
  const ok = typeof password === "string" && (await verifyPassword(password, env.passwordHash));
  if (!ok) {
    loginLimiter.fail(ip);
    return { error: "Accès refusé." };
  }

  loginLimiter.reset(ip);
  (await cookies()).set(SESSION_COOKIE, await signSession(env.sessionSecret), {
    httpOnly: true,
    secure: env.secure,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}
