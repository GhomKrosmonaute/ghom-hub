import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as { __ghomPrisma?: PrismaClient };

/**
 * Client Prisma paresseux (aucune connexion tant qu'on ne l'utilise pas) et unique en dev (HMR).
 *
 * Driver : node-postgres (`pg`) via @prisma/adapter-pg, avec l'URL *pooled* de Neon
 * (`DATABASE_URL`, hôte `-pooler`). Sur Vercel (Fluid compute), `attachDatabasePool`
 * ferme proprement les connexions inactives avant la suspension d'une instance ;
 * en local / Docker, c'est un no-op.
 */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.__ghomPrisma) return globalForPrisma.__ghomPrisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL manquant");
  const pool = new Pool({ connectionString });
  attachDatabasePool(pool);
  const client = new PrismaClient({ adapter: new PrismaPg(pool) });
  globalForPrisma.__ghomPrisma = client;
  return client;
}
