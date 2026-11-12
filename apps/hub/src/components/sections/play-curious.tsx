import { PLAY_CURIOUS_URL, type PlayCuriousProject, playCuriousProjects } from "@ghom/content";
import type { Locale } from "@ghom/core";
import Image from "next/image";
import type { CSSProperties } from "react";
import { getDictionary, getLocale } from "@/i18n/server";
import { sectionCode } from "../hud/sections";
import { Panel, SectionHeader } from "./section-header";

type Texts = Awaited<ReturnType<typeof getDictionary>>["playcurious"];

const accent = (p: PlayCuriousProject) => ({ "--accent": p.accent }) as CSSProperties;

function Stack({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <li
          key={s}
          className="border border-white/10 px-1.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-foreground/70"
        >
          {s}
        </li>
      ))}
    </ul>
  );
}

function Cover({ p, className = "" }: { p: PlayCuriousProject; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-black ${className}`} style={accent(p)}>
      {p.image ? (
        <Image
          src={p.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
        />
      ) : (
        <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_50%_60%,color-mix(in_srgb,var(--accent)_30%,transparent),transparent_65%)]">
          <span className="font-display text-4xl font-black tracking-widest text-[var(--accent)] opacity-80">
            {p.name
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_2px,rgba(0,0,0,.18)_2px_3px)]" />
    </div>
  );
}

function Featured({ p, t, locale }: { p: PlayCuriousProject; t: Texts; locale: Locale }) {
  const x = p.texts[locale];
  return (
    <Panel className="group grid overflow-hidden lg:grid-cols-[1.15fr_1fr]">
      <Cover p={p} className="aspect-[16/9] lg:aspect-auto lg:min-h-80" />
      <div className="flex flex-col gap-4 p-6 md:p-8" style={accent(p)}>
        <p className="hud-label text-[var(--accent)]">{x.meta}</p>
        <h3 className="font-display text-4xl leading-none font-black uppercase md:text-5xl">
          {p.name}
        </h3>
        <p className="inline-flex w-fit items-center gap-2 border border-[var(--accent)]/60 bg-[var(--accent)]/10 px-2.5 py-1 font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
          <span className="size-1.5 animate-blink rounded-full bg-[var(--accent)]" />
          {x.role}
        </p>
        <p className="leading-relaxed text-foreground/80">{x.pitch}</p>
        <div>
          <p className="hud-label mb-2">{t.work}</p>
          <ul className="space-y-1 font-mono text-sm text-foreground/80">
            {x.work.map((w) => (
              <li key={w} className="flex gap-2">
                <span className="text-[var(--accent)]">▸</span>
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <Stack items={p.stack} />
          <a
            href={p.url}
            target="_blank"
            rel="noopener"
            data-lock={p.name}
            className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
          >
            {t.open}
          </a>
        </div>
      </div>
    </Panel>
  );
}

function Card({ p, t, locale }: { p: PlayCuriousProject; t: Texts; locale: Locale }) {
  const x = p.texts[locale];
  const tool = p.kind === "tool";
  return (
    <Panel className="group flex flex-col overflow-hidden">
      {!tool && <Cover p={p} className="aspect-[16/8]" />}
      <div className="flex flex-1 flex-col gap-3 p-5" style={accent(p)}>
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-xl font-bold uppercase" style={{ color: p.accent }}>
            {p.name}
          </h3>
          <span className="shrink-0 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-[var(--accent)]">
            {x.role}
          </span>
        </div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
          {x.meta}
        </p>
        <p className="text-sm leading-relaxed text-foreground/75">{x.pitch}</p>
        <ul className="space-y-0.5 font-mono text-xs text-foreground/70">
          {x.work.map((w) => (
            <li key={w}>
              <span className="text-[var(--accent)]">▸</span> {w}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
          <Stack items={p.stack} />
          <a
            href={p.url}
            target="_blank"
            rel="noopener"
            data-lock={p.name}
            className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[var(--accent)] hover:underline"
          >
            {tool ? t.source : t.open}
          </a>
        </div>
      </div>
    </Panel>
  );
}

/** Archives Play Curious : les serious games et les outils du studio sur lesquels j'ai travaillé. */
export async function PlayCurious() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const tx = t.playcurious;
  const featured = playCuriousProjects.filter((p) => p.featured);
  const games = playCuriousProjects.filter((p) => p.kind === "game" && !p.featured);
  const tools = playCuriousProjects.filter((p) => p.kind === "tool");

  return (
    <section
      id="playcurious"
      className="relative scroll-mt-10 px-6 py-28 md:px-28 lg:px-40"
      style={{ "--glow": "#3dffb0" } as CSSProperties}
    >
      <SectionHeader code={sectionCode("playcurious")} kicker={tx.kicker} title={tx.title} />

      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <p className="max-w-2xl text-lg leading-relaxed text-foreground/75">
          <span className="text-plate">{tx.intro}</span>
        </p>
        <div className="flex flex-col items-end gap-1 font-mono text-xs uppercase tracking-[0.2em]">
          <span className="text-[#3dffb0]">{tx.period}</span>
          <a
            href={PLAY_CURIOUS_URL}
            target="_blank"
            rel="noopener"
            className="text-muted-foreground hover:text-foreground"
          >
            {tx.studio}
          </a>
        </div>
      </div>

      <div className="space-y-6">
        {featured.map((p) => (
          <Featured key={p.slug} p={p} t={tx} locale={locale} />
        ))}
        <p className="hud-label pt-4">{tx.games}</p>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {games.map((p) => (
            <Card key={p.slug} p={p} t={tx} locale={locale} />
          ))}
        </div>
        <p className="hud-label pt-4">{tx.tools}</p>
        <div className="grid gap-6 md:grid-cols-2">
          {tools.map((p) => (
            <Card key={p.slug} p={p} t={tx} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
