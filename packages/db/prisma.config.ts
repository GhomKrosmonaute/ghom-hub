import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Le .env vit à la racine du monorepo.
config({ path: path.resolve(import.meta.dirname, "../../.env"), quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "bun prisma/seed.ts",
  },
  datasource: {
    // Migrations : connexion directe si fournie (Neon la nomme DATABASE_URL_UNPOOLED ; l'URL "pooler" ne convient pas
    // à `migrate deploy`). `prisma generate` n'a pas besoin d'une vraie URL.
    url:
      process.env.DIRECT_DATABASE_URL ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL ||
      "postgresql://placeholder@localhost:5432/placeholder",
  },
});
