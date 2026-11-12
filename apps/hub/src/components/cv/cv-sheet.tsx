import { type Cv, cv, cvPdfPath } from "@ghom/content";
import { LOCALES, type Locale, localizePath } from "@ghom/core";
import Link from "next/link";
import { PrintButton } from "./print-button";

const LOGO = (
  <svg viewBox="0 0 32 32" className="size-12 shrink-0" aria-hidden>
    <path d="M6 4h20l2 2v8l-6 4H10L4 14V6z" fill="none" stroke="var(--neon-1)" strokeWidth="2" />
    <path d="M9 10h5M18 10h5" stroke="var(--neon-2)" strokeWidth="2.5" />
    <path d="M8 22h16M11 27h10" stroke="var(--neon-1)" strokeWidth="1.5" />
  </svg>
);

function Title({ children }: { children: string }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-mono text-[0.7rem] font-bold uppercase tracking-[0.25em] text-neon-1">
      <span className="h-px w-4 bg-neon-1" />
      {children}
    </h2>
  );
}

function Timeline({ entries, compact }: { entries: Cv["experience"]; compact?: boolean }) {
  return (
    <ol className="relative space-y-3.5 border-l border-neon-1/30 pl-4">
      {entries.map((e) => (
        <li key={`${e.org}${e.title}`} className="relative">
          <span className="absolute top-1.5 -left-[1.3rem] size-2 rotate-45 border border-neon-2 bg-[#05060b]" />
          <div className="flex flex-col gap-x-3 sm:flex-row sm:items-baseline sm:justify-between print:flex-row print:items-baseline print:justify-between">
            <p className={compact ? "text-[0.78rem] font-semibold" : "font-semibold"}>
              {e.title}
              <span className="font-normal text-neon-1"> · {e.org}</span>
            </p>
            <p className="shrink-0 font-mono text-[0.68rem] text-neon-2">{e.period}</p>
          </div>
          {e.meta && <p className="font-mono text-[0.65rem] uppercase text-white/50">{e.meta}</p>}
          {e.points.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-[0.8rem] leading-snug text-white/80">
              {e.points.map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="text-neon-1">›</span>
                  {p}
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ol>
  );
}

/** CV imprimable : une feuille A4, identique à l'écran, à l'impression et dans le PDF. */
export function CvSheet({ locale }: { locale: Locale }) {
  const t = cv[locale];
  const other = LOCALES.find((l) => l !== locale) as Locale;
  return (
    <main className="cv-page tech-grid min-h-dvh bg-void px-4 py-8 print:bg-transparent print:p-0">
      <nav className="mx-auto mb-6 flex max-w-[210mm] flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.2em] print:hidden">
        <Link href={localizePath(locale)} className="neon-text underline-offset-8 hover:underline">
          ◂ {t.ui.back}
        </Link>
        <span className="flex flex-wrap items-center gap-3">
          <Link
            href={localizePath(other, "/cv")}
            className="border border-white/25 px-3 py-2 text-foreground/80 transition-colors hover:border-neon-1 hover:text-neon-1"
          >
            {other.toUpperCase()}
          </Link>
          <PrintButton label={t.ui.print} />
          <a
            href={cvPdfPath(locale)}
            download
            className="border border-neon-1 bg-neon-1/10 px-3 py-2 text-neon-1 transition-colors hover:bg-neon-1 hover:text-void"
          >
            ↓ {t.ui.download}
          </a>
        </span>
      </nav>

      <article className="cv-sheet mx-auto flex w-full max-w-[210mm] flex-col overflow-hidden bg-[#05060b] text-white shadow-[0_0_40px_rgba(0,240,255,.15)] ring-1 ring-neon-1/30 md:aspect-[210/297] print:shadow-none print:ring-0">
        <header className="relative border-b border-neon-1/40 bg-[radial-gradient(circle_at_90%_0%,rgba(255,43,214,.25),transparent_55%),linear-gradient(180deg,#0b1020,#05060b)] px-8 pt-7 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {LOGO}
              <div>
                <h1 className="font-display text-2xl font-black sm:text-3xl uppercase tracking-wide">
                  {t.name}
                </h1>
                <p className="text-lg text-neon-2">{t.role}</p>
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.15em] text-white/60">
                  {t.location}
                </p>
              </div>
            </div>
            <ul className="space-y-0.5 font-mono sm:text-right print:text-right text-[0.7rem] text-white/80">
              {t.contact.map((c) => (
                <li key={c.href}>
                  <a href={c.href} className="hover:text-neon-1">
                    {c.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-4 text-[0.82rem] leading-relaxed text-white/85">{t.summary}</p>
        </header>

        <div className="grid flex-1 gap-6 px-8 py-5 md:grid-cols-[minmax(0,1fr)_14rem] print:grid-cols-[minmax(0,1fr)_14rem]">
          <div className="space-y-6">
            <section>
              <Title>{t.ui.experience}</Title>
              <Timeline entries={t.experience} />
            </section>
            <section>
              <Title>{t.ui.education}</Title>
              <Timeline entries={t.education} compact />
            </section>
          </div>
          <aside className="space-y-5">
            <section>
              <Title>{t.ui.skills}</Title>
              <div className="space-y-2">
                {t.skills.map((g) => (
                  <div key={g.group}>
                    <p className="font-mono text-[0.62rem] uppercase tracking-[0.15em] text-white/50">
                      {g.group}
                    </p>
                    <p className="mt-1 flex flex-wrap gap-1">
                      {g.items.map((s) => (
                        <span
                          key={s}
                          className="border border-neon-1/30 bg-neon-1/5 px-1.5 py-0.5 text-[0.7rem]"
                        >
                          {s}
                        </span>
                      ))}
                    </p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <Title>{t.ui.certifications}</Title>
              <ul className="space-y-1.5 text-[0.75rem] leading-snug text-white/80">
                {t.certifications.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
            <section>
              <Title>{t.ui.interests}</Title>
              <ul className="space-y-1 text-[0.75rem] text-white/80">
                {t.interests.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          </aside>
        </div>

        <footer className="border-t border-neon-1/40 bg-[#0b1020] px-8 py-4">
          <Title>{t.ui.highlights}</Title>
          <ul className="grid gap-3 text-[0.75rem] leading-snug text-white/85 md:grid-cols-3 print:grid-cols-3">
            {t.highlights.map((h) => (
              <li key={h} className="border-l-2 border-neon-2 pl-2">
                {h}
              </li>
            ))}
          </ul>
        </footer>
      </article>
    </main>
  );
}
