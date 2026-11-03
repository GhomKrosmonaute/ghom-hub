import {
  LEGAL_PAGES,
  legalDoc,
  legalUi,
  legalUpdatedLabel,
  type LegalPage as Page,
} from "@ghom/content";
import { LOCALES, type Locale, localizePath } from "@ghom/core";
import { LinkedText } from "@ghom/ui/components/linked-text";
import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/i18n/server";

export async function legalMetadata(page: Page): Promise<Metadata> {
  const locale = await getLocale();
  const doc = legalDoc("HUB", page, locale);
  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: localizePath(locale, `/${page}`),
      languages: Object.fromEntries(LOCALES.map((l) => [l, localizePath(l, `/${page}`)])),
    },
  };
}

/** Page légale (CGU, confidentialité) habillée façon terminal du hub. */
export async function LegalPage({ page }: { page: Page }) {
  const locale: Locale = await getLocale();
  const doc = legalDoc("HUB", page, locale);
  const ui = legalUi[locale];
  const others = LEGAL_PAGES.filter((p) => p !== page);

  return (
    <main className="tech-grid min-h-dvh bg-void px-6 py-16 md:px-12">
      <article className="mx-auto max-w-3xl">
        <nav className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-[0.2em]">
          <Link
            href={localizePath(locale)}
            className="neon-text underline-offset-8 hover:underline"
          >
            ◂ {ui.back}
          </Link>
          <span className="flex flex-wrap gap-4">
            {others.map((o) => (
              <Link
                key={o}
                href={localizePath(locale, `/${o}`)}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {ui[o]} ▸
              </Link>
            ))}
          </span>
        </nav>

        <header className="mt-12 border-b border-neon-1/20 pb-8">
          <p className="hud-label text-neon-1">ghom.fr · {ui.nav}</p>
          <h1 className="mt-3 font-display text-4xl font-black uppercase md:text-5xl">
            {doc.title}
          </h1>
          <p className="mt-4 font-mono text-xs text-muted-foreground">
            {ui.updated} : {legalUpdatedLabel(locale)}
          </p>
          <p className="mt-6 leading-relaxed text-foreground/85">{doc.intro}</p>
        </header>

        <div className="mt-10 space-y-10">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-xl font-bold uppercase text-neon-1">
                {section.heading}
              </h2>
              <div className="mt-3 space-y-3 leading-relaxed text-foreground/80">
                {section.body.map((p) => (
                  <p key={p}>
                    <LinkedText
                      text={p}
                      className="text-neon-1 underline underline-offset-4 hover:text-foreground"
                    />
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
