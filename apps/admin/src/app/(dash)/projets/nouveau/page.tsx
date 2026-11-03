import { PageHeader } from "@/components/page-header";
import { domains } from "@/lib/env";
import { toFormDefaults } from "../form-defaults";
import { ProjectForm } from "../project-form";

export const metadata = { title: "Nouveau projet" };

export default function NewProjectPage() {
  return (
    <>
      <PageHeader kicker="Catalogue · Nouveau" title="Nouveau projet" />
      <ProjectForm id={null} defaults={toFormDefaults(null)} domains={domains} />
    </>
  );
}
