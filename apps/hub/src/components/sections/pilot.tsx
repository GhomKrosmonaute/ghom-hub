import { localizePath } from "@ghom/core";
import { Brackets } from "@ghom/ui/cyber/brackets";
import Link from "next/link";
import { getProfile } from "@/content/profile";
import { getDictionary, getLocale } from "@/i18n/server";
import { getGithubTelemetry } from "@/lib/github";
import { sectionCode } from "../hud/sections";
import { BackpackSchematic } from "./backpack-schematic";
import { GithubTelemetry } from "./github-telemetry";
import { Panel, SectionHeader } from "./section-header";

/** Emblème du pilote : un casque de mecha stylisé en SVG. */
function HelmetEmblem() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="visor" x1="0" x2="1">
          <stop offset="0" stopColor="var(--neon-1)" />
          <stop offset="1" stopColor="var(--neon-2)" />
        </linearGradient>
      </defs>
      <g fill="none" stroke="var(--neon-1)" strokeWidth="1.5">
        <path d="M100 18 152 40 170 92 158 150 128 178H72L42 150 30 92 48 40Z" fill="#05060b" />
        <path d="M100 18 100 50M48 40 72 60M152 40 128 60" opacity=".5" />
        <path d="M58 150 80 132h40l22 18M86 164h28" opacity=".7" />
        <path d="M30 92h-10l-6 22 14 10M170 92h10l6 22-14 10" />
      </g>
      <path d="M50 86 72 70h56l22 16-8 22H58Z" fill="url(#visor)" opacity=".9">
        <animate
          attributeName="opacity"
          values=".9;.55;.9;.9;.4;.9"
          dur="4s"
          repeatCount="indefinite"
        />
      </path>
      <path d="M62 84h76" stroke="#fff" strokeWidth="1" opacity=".6" />
      <circle
        cx="100"
        cy="100"
        r="94"
        fill="none"
        stroke="var(--neon-1)"
        strokeDasharray="2 6"
        opacity=".35"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 100"
          to="360 100 100"
          dur="40s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}

export async function Pilot() {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const [profile, github] = await Promise.all([getProfile(locale), getGithubTelemetry()]);
  return (
    <section id="pilote" className="relative scroll-mt-10 px-6 py-28 md:px-28 lg:px-40">
      <SectionHeader code={sectionCode("pilote")} kicker={t.pilot.kicker} title={t.pilot.title} />

      <div className="grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] lg:items-start">
        {/* Carte d'identité */}
        <Panel className="min-w-0 p-6 lg:sticky lg:top-24">
          <Brackets inset={8} />
          <div className="mx-auto aspect-square w-48">
            <HelmetEmblem />
          </div>
          <div className="mt-4 text-center">
            <p className="font-display text-4xl font-black tracking-wider neon-text">
              {profile.handle}
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {profile.role}
            </p>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-px bg-white/5 font-mono text-[0.7rem] uppercase tracking-[0.15em]">
            {[
              [t.pilot.unit, profile.unit],
              [t.pilot.base, profile.location],
              [t.pilot.status, t.pilot.statusValue],
              [t.pilot.clearance, t.pilot.clearanceValue],
            ].map(([k, v]) => (
              <div key={k} className="bg-[#05060b] p-3">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="mt-1 text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <Link
            href={localizePath(locale, "/cv")}
            data-lock="CV"
            className="cyber-clip-sm mt-6 block border border-neon-2 bg-neon-2/10 px-3 py-2.5 text-center font-mono text-xs uppercase tracking-[0.2em] text-neon-2 transition-colors hover:bg-neon-2 hover:text-void"
          >
            {locale === "fr" ? "▸ Voir le CV" : "▸ View résumé"}
          </Link>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {profile.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                data-lock={l.label}
                className="cyber-clip-sm whitespace-nowrap border border-neon-1/40 px-1.5 py-2 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-neon-1 transition-colors hover:bg-neon-1/15"
              >
                {l.label}
              </a>
            ))}
          </div>
        </Panel>

        <div className="grid min-w-0 gap-6">
          <Panel className="p-6 md:p-8">
            <p className="hud-label mb-4 text-neon-2">{t.pilot.briefing}</p>
            <div className="space-y-4 text-lg leading-relaxed text-foreground/85">
              {profile.bio.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </Panel>

          <Panel className="p-6">
            <p className="hud-label mb-5 text-neon-2">{t.pilot.systems}</p>
            <BackpackSchematic systems={profile.systems} />
          </Panel>

          <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
            <div className="grid min-w-0 gap-6">
              <Panel className="p-6">
                <p className="hud-label mb-5 text-neon-2">{t.pilot.loadout}</p>
                <ul className="flex flex-wrap gap-2">
                  {profile.loadout.map((item) => (
                    <li
                      key={item}
                      className="border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-foreground/80 transition-colors hover:border-neon-1/60 hover:text-neon-1"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </Panel>
              {github && <GithubTelemetry data={github} t={t.pilot} locale={locale} />}
            </div>

            <Panel className="p-6">
              <p className="hud-label mb-4 text-neon-2">{t.pilot.logbook}</p>
              <ol className="relative space-y-4 border-l border-neon-1/30 pl-5">
                {profile.logbook.map((l) => (
                  <li key={l.year + l.entry} className="relative">
                    <span className="absolute top-1.5 -left-[23.5px] size-2 rotate-45 border border-neon-1 bg-void" />
                    <span className="font-mono text-xs text-neon-1">{l.year}</span>
                    <p className="text-sm text-foreground/80">{l.entry}</p>
                  </li>
                ))}
              </ol>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
