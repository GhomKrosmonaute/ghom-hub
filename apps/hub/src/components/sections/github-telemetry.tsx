import type { Locale } from "@ghom/core";
import type { CSSProperties } from "react";
import { type GithubTelemetry as Data, GITHUB_USER } from "@/lib/github";
import { Panel } from "./section-header";

type Texts = {
  telemetry: string;
  contributions: string;
  streak: string;
  days: string;
  repos: string;
  stars: string;
  less: string;
  more: string;
  profile: string;
};

const LEVEL = [
  "bg-neon-1/[0.08] ring-1 ring-inset ring-neon-1/10",
  "bg-neon-1/35",
  "bg-neon-1/60",
  "bg-neon-1/85",
  "bg-neon-1 shadow-[0_0_6px_var(--neon-1)]",
];

/** Plus longue suite de jours consécutifs avec au moins une contribution. */
function longestStreak(days: Data["days"]) {
  let best = 0;
  let run = 0;
  for (const d of days) {
    run = d.count > 0 || d.level > 0 ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

/** Encart « télémétrie » : compteurs GitHub et calendrier de contributions qui se remplit. */
export function GithubTelemetry({ data, t, locale }: { data: Data; t: Texts; locale: Locale }) {
  // GitHub commence ses semaines le dimanche : on cale le premier jour sur sa ligne.
  const first = data.days[0] as Data["days"][number];
  const offset = new Date(`${first.date}T00:00:00Z`).getUTCDay();
  const cells = [...Array.from({ length: offset }, () => null), ...data.days];
  const weeks = Math.ceil(cells.length / 7);
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });
  const num = new Intl.NumberFormat(locale);
  const stats = [
    [t.contributions, num.format(data.total)],
    [t.streak, `${longestStreak(data.days)} ${t.days}`],
    [t.repos, data.repos === null ? null : num.format(data.repos)],
    [t.stars, data.stars === null ? null : num.format(data.stars)],
  ].filter((s): s is [string, string] => s[1] !== null);

  return (
    <Panel className="p-6">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <p className="hud-label text-neon-2">{t.telemetry}</p>
        <span className="flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-neon-1">
          <span className="size-1.5 animate-blink rounded-full bg-neon-1" />
          live
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-px bg-white/10 font-mono">
        {stats.map(([k, v]) => (
          <div key={k} className="bg-[#05060b] p-3">
            <dt className="text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">{k}</dt>
            <dd className="mt-1 text-xl text-neon-1">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="relative mt-5 overflow-hidden">
        <div
          className="grid gap-[3px]"
          style={{
            gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
            gridTemplateRows: "repeat(7, auto)",
            gridAutoFlow: "column",
          }}
        >
          {cells.map((d, i) =>
            d ? (
              <span
                key={d.date}
                title={`${d.count} · ${fmt.format(new Date(`${d.date}T00:00:00Z`))}`}
                className={`cell-fill aspect-square ${LEVEL[d.level] ?? LEVEL[0]}`}
                style={{ "--col": Math.floor(i / 7) } as CSSProperties}
              />
            ) : (
              // biome-ignore lint/suspicious/noArrayIndexKey: cases vides de début de calendrier, fixes
              <span key={`pad${i}`} />
            ),
          )}
        </div>
        <span
          aria-hidden
          className="telemetry-sweep pointer-events-none absolute inset-y-0 w-10 bg-gradient-to-r from-transparent via-neon-2/35 to-transparent"
        />
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          {t.less}
          {LEVEL.map((c) => (
            <span key={c} className={`size-2.5 ${c}`} />
          ))}
          {t.more}
        </span>
        <a
          href={`https://github.com/${GITHUB_USER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-neon-1 hover:underline"
        >
          {t.profile}
        </a>
      </div>
    </Panel>
  );
}
