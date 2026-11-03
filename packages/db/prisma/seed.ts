import path from "node:path";
import { config } from "dotenv";

config({ path: path.resolve(import.meta.dirname, "../../../.env"), quiet: true });

const { getPrisma } = await import("../src/client");
const { SEED_PROJECTS } = await import("../src/seed-data");

const prisma = getPrisma();

for (const project of SEED_PROJECTS) {
  await prisma.project.upsert({
    where: { slug: project.slug },
    create: project,
    update: project,
  });
}

console.log(`✔ ${SEED_PROJECTS.length} projets synchronisés`);
await prisma.$disconnect();
