import { getProjectById } from "@ghom/db/admin";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlashToast } from "@/components/flash-toast";
import { PageHeader } from "@/components/page-header";
import { domains } from "@/lib/env";
import { toFormDefaults } from "../form-defaults";
import { ProjectForm } from "../project-form";

export const metadata = { title: "Modifier un projet" };

export default async function EditProjectPage({
  params,
  searchParams,
}: PageProps<"/projets/[id]">) {
  const [{ id }, { cree }] = await Promise.all([params, searchParams]);
  const project = await getProjectById(id);
  if (!project) notFound();
  return (
    <>
      {cree && (
        <FlashToast message={`« ${project.name} » créé`} cleanHref={`/projets/${project.id}`} />
      )}
      <Link
        href="/projets"
        className="font-mono text-xs text-muted-foreground hover:text-foreground"
      >
        ◂ Projets
      </Link>
      <PageHeader kicker={`Catalogue · ${project.slug}`} title={project.name} />
      <ProjectForm id={project.id} defaults={toFormDefaults(project)} domains={domains} />
    </>
  );
}
