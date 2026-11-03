/**
 * Génère les secrets de l'admin :
 *   bun admin:hash                (à la racine ; demande le mot de passe)
 *   bun admin:hash "mot de passe"
 */
import { randomBytes } from "node:crypto";
import { hashPassword } from "../src/auth/password";

const password = process.argv[2] ?? prompt("Mot de passe admin :")?.trim();
if (!password || password.length < 12) {
  console.error("✖ Mot de passe requis (12 caractères minimum).");
  process.exit(1);
}

console.log(`
À copier dans .env (dev) ou infra/.env.prod (prod) :

ADMIN_PASSWORD_HASH=${await hashPassword(password)}
SESSION_SECRET=${randomBytes(32).toString("base64url")}
REVALIDATE_SECRET=${randomBytes(32).toString("base64url")}
`);
