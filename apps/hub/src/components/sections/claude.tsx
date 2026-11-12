import { claudeBuilds, SATANE_GHOM } from "@ghom/content";
import Image from "next/image";
import type { CSSProperties } from "react";
import { getDictionary, getLocale } from "@/i18n/server";
import { getYoutubeStats } from "@/lib/youtube";
import { sectionCode } from "../hud/sections";
import { Panel, SectionHeader } from "./section-header";

const ORANGE = "#ff8a3d";

/** Ce que je construis avec Claude : l'agent Satané Ghom (stats en direct) et les autres réalisations. */
export async function Claude() {
  const [t, locale, yt] = await Promise.all([getDictionary(), getLocale(), getYoutubeStats()]);
  const tx = t.claude;
  const num = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const stats = yt
    ? (
        [
          [tx.subscribers, yt.subscribers],
          [tx.views, yt.views],
          [tx.videos, yt.videos],
        ] as const
      ).filter(([, v]) => v !== null)
    : [];

  return (
    <section
      id="claude"
      className="relative scroll-mt-10 px-6 py-28 md:px-28 lg:px-40"
      style={{ "--glow": ORANGE, "--accent": ORANGE } as CSSProperties}
    >
      <SectionHeader code={sectionCode("claude")} kicker={tx.kicker} title={tx.title} />
      <p className="mb-10 max-w-3xl text-lg leading-relaxed text-foreground/75">
        <span className="text-plate">{tx.intro}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel className="flex flex-col gap-6 p-6 md:p-8">
          <div>
            <p className="hud-label flex items-center gap-2 text-[var(--accent)]">
              <span className="size-1.5 animate-blink rounded-full bg-[var(--accent)]" />
              {tx.agentLabel}
            </p>
            <h3 className="mt-3 font-display text-4xl leading-none font-black uppercase md:text-5xl">
              {tx.agentTitle}
            </h3>
          </div>
          <p className="leading-relaxed text-foreground/80">{tx.agentBody}</p>

          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.15em]">
            {tx.pipeline.map((step, i) => (
              <li key={step} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[var(--accent)]/60">→</span>}
                <span className="border border-[var(--accent)]/40 bg-[var(--accent)]/[0.07] px-2 py-1 text-foreground/85">
                  {step}
                </span>
              </li>
            ))}
          </ol>

          {stats.length > 0 && (
            <dl className="grid grid-cols-3 gap-px bg-white/10 font-mono">
              {stats.map(([k, v]) => (
                <div key={k} className="bg-[#05060b] p-3">
                  <dt className="text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                    {k}
                  </dt>
                  <dd className="mt-1 text-2xl text-[var(--accent)]">{num.format(v as number)}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 font-mono text-xs uppercase tracking-[0.2em]">
            <span className="text-muted-foreground">
              {tx.since} {date.format(new Date(`${SATANE_GHOM.since}T00:00:00Z`))}
            </span>
            <span className="flex gap-5">
              <a
                href={SATANE_GHOM.site}
                target="_blank"
                rel="noopener"
                className="text-foreground/70 hover:text-foreground"
              >
                {tx.site}
              </a>
              <a
                href={SATANE_GHOM.url}
                target="_blank"
                rel="noopener"
                data-lock="Satané Ghom"
                className="text-[var(--accent)] hover:underline"
              >
                {tx.channel}
              </a>
            </span>
          </div>
        </Panel>

        <Panel className="flex flex-col p-6">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <p className="hud-label text-neon-2">{tx.latest}</p>
            <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--accent)]">
              <span className="size-1.5 animate-blink rounded-full bg-[var(--accent)]" />
              live
            </span>
          </div>
          <ul className="flex flex-col divide-y divide-white/10">
            {(yt?.latest ?? []).map((v) => (
              <li key={v.id}>
                <a
                  href={`https://www.youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener"
                  className="group flex gap-3 py-3"
                >
                  <Image
                    src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`}
                    alt=""
                    width={320}
                    height={180}
                    className="aspect-video w-28 shrink-0 object-cover opacity-80 transition group-hover:opacity-100"
                  />
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="line-clamp-2 text-sm leading-snug text-foreground/85 group-hover:text-foreground">
                      {v.title}
                    </span>
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                      {date.format(new Date(v.published))}
                      {v.views !== null && ` · ${num.format(v.views)} ${tx.viewsShort}`}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr]">
        {claudeBuilds.map((b) => {
          const x = b.texts[locale];
          return (
            <Panel key={b.slug} className="flex flex-col gap-3 p-6">
              <p className="hud-label">{tx.builds}</p>
              <h3 className="font-display text-2xl font-bold uppercase text-[var(--accent)]">
                {b.name}
              </h3>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
                {x.kicker}
              </p>
              <p className="text-sm leading-relaxed text-foreground/75">{x.body}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                <ul className="flex flex-wrap gap-1.5">
                  {b.tags.map((s) => (
                    <li
                      key={s}
                      className="border border-white/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-foreground/70"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
                {b.href && (
                  <a
                    href={b.href}
                    target="_blank"
                    rel="noopener"
                    className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
                  >
                    GitHub ▸
                  </a>
                )}
              </div>
            </Panel>
          );
        })}
        <Panel className="flex flex-col gap-3 p-6">
          <p className="hud-label">{tx.skills}</p>
          <ul className="flex flex-wrap gap-2">
            {tx.skillList.map((s) => (
              <li
                key={s}
                className="border border-[var(--accent)]/40 bg-[var(--accent)]/[0.07] px-2 py-1 font-mono text-xs text-foreground/85"
              >
                {s}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
