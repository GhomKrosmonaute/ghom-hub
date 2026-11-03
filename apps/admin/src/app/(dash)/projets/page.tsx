import { listAllProjects } from "@ghom/db/admin";
import { Plus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ProjectsTable } from "./projects-table";

export const metadata = { title: "Projets & jeux" };

export default async function ProjectsPage() {
  const projects = await listAllProjects();
  return (
    <>
      <PageHeader kicker="Catalogue" title="Projets & jeux">
        <Link
          href="/projets/nouveau"
          className="cyber-clip-sm inline-flex items-center gap-2 bg-neon-1 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-black hover:brightness-110"
        >
          <Plus className="size-4" /> Nouveau projet
        </Link>
      </PageHeader>
      <ProjectsTable projects={projects.map(({ updatedAt: _, ...p }) => p)} />
    </>
  );
}
