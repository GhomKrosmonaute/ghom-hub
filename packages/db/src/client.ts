import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as { __ghomPrisma?: PrismaClient };

/** Client Prisma paresseux (aucune connexion tant qu'on ne l'utilise pas) et unique en dev (HMR). */
export function getPrisma(): PrismaClient {
  if (globalForPrisma.__ghomPrisma) return globalForPrisma.__ghomPrisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL manquant");
  const client = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  globalForPrisma.__ghomPrisma = client;
  return client;
}
