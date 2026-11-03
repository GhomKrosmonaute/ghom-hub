/** Comparaison en temps constant (évite de laisser fuiter la longueur du préfixe commun). */
export function safeEqual(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < max; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * Vérifie un en-tête `Authorization: Bearer <secret>`.
 * Un secret absent ou trop court refuse tout (pas de revalidation ouverte par erreur).
 */
export function isBearerAuthorized(header: string | null, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || !header?.startsWith("Bearer ")) return false;
  return safeEqual(header.slice(7), secret);
}
