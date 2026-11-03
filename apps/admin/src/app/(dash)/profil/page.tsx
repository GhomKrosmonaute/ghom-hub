import { getProfileData } from "@ghom/db";
import { hasCustomProfile } from "@ghom/db/admin";
import { PageHeader } from "@/components/page-header";
import { PUBLIC_URLS } from "@/lib/env";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  const [profile, custom] = await Promise.all([getProfileData(), hasCustomProfile()]);
  return (
    <>
      <PageHeader kicker="ghom.fr · Dossier pilote" title="Profil">
        <a
          href={`${PUBLIC_URLS.HUB}/#pilote`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          Voir sur le site ▸
        </a>
      </PageHeader>
      <ProfileForm defaults={profile} custom={custom} />
    </>
  );
}
