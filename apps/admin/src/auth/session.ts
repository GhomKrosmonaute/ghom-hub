/**
 * Session admin : un cookie `<expiration>.<signature>` signé en HMAC-SHA256.
 * Web Crypto uniquement → utilisable dans le proxy comme dans les Server Actions.
 * Pas de stockage serveur : changer SESSION_SECRET déconnecte toutes les sessions.
 */
export const SESSION_COOKIE = "ghom_admin";
export const SESSION_TTL_SECONDS = 7 * 24 * 3600;
const MIN_SECRET_LENGTH = 32;

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  return Buffer.from(bytes).toString("base64url");
}

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return toBase64Url(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

function assertSecret(secret: string | undefined): asserts secret is string {
  if (!secret || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`SESSION_SECRET manquant ou trop court (${MIN_SECRET_LENGTH} caractères min.)`);
  }
}

export async function signSession(secret: string | undefined, now = Date.now()): Promise<string> {
  assertSecret(secret);
  const exp = Math.floor(now / 1000) + SESSION_TTL_SECONDS;
  return `${exp}.${await hmac(secret, `ghom-admin.${exp}`)}`;
}

export async function verifySession(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (!token || !secret || secret.length < MIN_SECRET_LENGTH) return false;
  const [expRaw, signature, ...rest] = token.split(".");
  if (!expRaw || !signature || rest.length > 0 || !/^\d+$/.test(expRaw)) return false;
  if (Number(expRaw) * 1000 <= now) return false;
  const expected = await hmac(secret, `ghom-admin.${expRaw}`);
  // comparaison en temps constant
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++)
    diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
