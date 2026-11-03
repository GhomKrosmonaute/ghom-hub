import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/**
 * Mot de passe admin haché en scrypt (node:crypto, sans dépendance).
 * Format : `scrypt:N:r:p:sel:hash` (base64url). Pas de `$`, que les fichiers .env
 * et docker compose interpréteraient comme une variable.
 */
const KEY_LENGTH = 64;
const PARAMS = { N: 16384, r: 8, p: 1 };

function derive(password: string, salt: Buffer, N: number, r: number, p: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, PARAMS.N, PARAMS.r, PARAMS.p);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    key.toString("base64url"),
  ].join(":");
}

export async function verifyPassword(
  password: string,
  stored: string | undefined,
): Promise<boolean> {
  if (!stored) return false;
  const [scheme, N, r, p, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !N || !r || !p || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  if (expected.length !== KEY_LENGTH) return false;
  try {
    const key = await derive(password, Buffer.from(salt, "base64url"), +N, +r, +p);
    return timingSafeEqual(key, expected);
  } catch {
    return false;
  }
}
