import { FUNDING_URLS } from "@ghom/content";
import { getProfile } from "@/content/profile";
import { getDictionary, getLocale } from "@/i18n/server";

export async function Footer({ studioUrl }: { studioUrl: string }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const profile = await getProfile(locale);
  return (
    <footer className="relative px-6 pt-10 pb-28 md:px-28 lg:px-40 lg:pb-16">
      <div className="flex flex-col gap-4 border-t border-neon-1/20 pt-6 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>
          © {new Date().getFullYear()} {profile.handle} · ghom.fr
        </span>
        <span className="flex gap-6">
          <a href={studioUrl} className="transition-colors hover:text-[#c6ff00]">
            nobrainnogame.ghom.fr ▸
          </a>
          <a
            href={FUNDING_URLS.personal}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#ff5e1a]"
          >
            {t.footer.support}
          </a>
          <span className="hidden md:inline">{t.footer.shortcuts}</span>
        </span>
      </div>
    </footer>
  );
}
