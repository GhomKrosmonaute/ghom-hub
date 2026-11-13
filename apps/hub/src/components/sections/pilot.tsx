import { localizePath } from "@ghom/core";
import { Brackets } from "@ghom/ui/cyber/brackets";
import Link from "next/link";
import type * as React from "react";
import { getProfile } from "@/content/profile";
import { getDictionary, getLocale } from "@/i18n/server";
import { getGithubTelemetry } from "@/lib/github";
import { sectionCode } from "../hud/sections";
import { BackpackSchematic } from "./backpack-schematic";
import { GithubTelemetry } from "./github-telemetry";
import { Panel, SectionHeader } from "./section-header";

/** Emblème du pilote : monogramme « G » anguleux dans un réticule de visée. */
function PilotEmblem() {
  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);
  const spin =
    "origin-center [transform-box:fill-box] motion-safe:animate-[spin_var(--d)_linear_infinite]";
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden>
      <defs>
        <linearGradient id="emblem-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--neon-1)" />
          <stop offset="1" stopColor="var(--neon-2)" />
        </linearGradient>
        <clipPath id="emblem-hex">
          <path d="M100 30 160.6 65v70L100 170 39.4 135V65Z" />
        </clipPath>
      </defs>
      {/* Couronne graduée, rotation lente */}
      <g className={spin} style={{ "--d": "60s" } as React.CSSProperties}>
        {ticks.map((a) => (
          <line
            key={a}
            x1="100"
            y1="4"
            x2="100"
            y2={a % 90 === 0 ? 14 : 9}
            stroke="var(--neon-1)"
            strokeWidth={a % 90 === 0 ? 2 : 1}
            opacity={a % 90 === 0 ? 0.9 : 0.4}
            transform={`rotate(${a} 100 100)`}
          />
        ))}
      </g>
      {/* Arcs de verrouillage, rotation inverse */}
      <g
        className={`${spin} [animation-direction:reverse]`}
        style={{ "--d": "24s" } as React.CSSProperties}
        fill="none"
        stroke="var(--neon-2)"
        strokeWidth="1.5"
      >
        <path d="M100 18a82 82 0 0 1 58 24" />
        <path d="M100 182a82 82 0 0 1-58-24" />
      </g>
      {/* Hexagone */}
      <path
        d="M100 30 160.6 65v70L100 170 39.4 135V65Z"
        fill="#05060b"
        stroke="var(--neon-1)"
        strokeWidth="1.5"
      />
      <path
        d="M100 40 152 70v60l-52 30-52-30V70Z"
        fill="none"
        stroke="var(--neon-1)"
        strokeDasharray="2 4"
        opacity=".35"
      />
      {/* Monogramme */}
      <path
        d="M128 76H84L72 88v24l12 12h32l12-12v-14h-26"
        fill="none"
        stroke="url(#emblem-g)"
        strokeWidth="11"
        strokeLinejoin="miter"
        transform="translate(100 100) scale(.85) translate(-100 -100)"
        className="drop-shadow-[0_0_6px_var(--neon-1)]"
      />
      {/* Balayage */}
      <g clipPath="url(#emblem-hex)">
        <rect x="30" y="30" width="140" height="2" fill="var(--neon-1)" opacity=".5">
          <animate attributeName="y" values="30;168;30" dur="5s" repeatCount="indefinite" />
        </rect>
      </g>
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
            <PilotEmblem />
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
              [t.pilot.activity, t.pilot.activityValue],
              [t.pilot.base, profile.location],
              [t.pilot.status, t.pilot.statusValue],
              [t.pilot.experience, t.pilot.experienceValue],
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
