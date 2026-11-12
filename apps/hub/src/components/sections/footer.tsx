import { FUNDING_URLS, legalUi } from "@ghom/content";
import { localizePath } from "@ghom/core";
import Link from "next/link";
import { getProfile } from "@/content/profile";
import { getDictionary, getLocale } from "@/i18n/server";

export async function Footer({ studioUrl }: { studioUrl: string }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const profile = await getProfile(locale);
  return (
    <footer className="relative px-6 pt-10 pb-28 md:px-28 lg:px-40 lg:pb-16">
      <div className="flex flex-col gap-4 border-t border-neon-1/20 pt-6 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-foreground/70 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-8">
        <span className="whitespace-nowrap">
          © {new Date().getFullYear()} {profile.handle} · ghom.fr
        </span>
        <nav
          aria-label={legalUi[locale].nav}
          className="flex flex-wrap items-center gap-x-6 gap-y-2 [&_a]:whitespace-nowrap"
        >
          <Link
            href={localizePath(locale, "/legal-notice")}
            className="transition-colors hover:text-foreground"
          >
            {legalUi[locale]["legal-notice"]}
          </Link>
          <Link
            href={localizePath(locale, "/terms")}
            className="transition-colors hover:text-foreground"
          >
            {legalUi[locale].terms}
          </Link>
          <Link
            href={localizePath(locale, "/privacy")}
            className="transition-colors hover:text-foreground"
          >
            {legalUi[locale].privacy}
          </Link>
        </nav>
        <span className="flex flex-wrap items-center gap-x-6 gap-y-2 whitespace-nowrap">
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
