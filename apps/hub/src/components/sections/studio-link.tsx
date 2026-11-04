import { GlitchText } from "@ghom/ui/cyber/glitch-text";
import { Ticker } from "@ghom/ui/cyber/ticker";
import { getDictionary } from "@/i18n/server";
import type { ProjectView } from "@/lib/projects";
import { SectionHeader } from "./section-header";
import { StudioCta } from "./studio-cta";

/** Transmission entrante du studio : le portail vers nobrainnogame.ghom.fr. */
export async function StudioLink({
  games,
  studioUrl,
}: {
  games: ProjectView[];
  studioUrl: string;
}) {
  const t = await getDictionary();
  const live = games.filter((g) => g.playable).length;

  return (
    <section
      id="studio"
      className="relative scroll-mt-10 px-6 py-28 md:px-28 lg:px-40"
      style={{ "--glow": "#c6ff00" } as React.CSSProperties}
    >
      <SectionHeader code="03" kicker={t.studio.kicker} title={t.studio.title} />

      <div className="cyber-clip relative overflow-hidden border border-[#c6ff00]/30 bg-black/80 backdrop-blur-md">
        <Ticker
          items={t.studio.ticker}
          className="border-b border-[#c6ff00]/20 bg-[#c6ff00]/5 py-2 font-mono text-[0.65rem] tracking-[0.3em] text-[#c6ff00]/80"
        />
        <div className="grid gap-10 p-6 md:p-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="hud-label text-[#ff5e1a]">{t.studio.label}</p>
            <h3 className="mt-3 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.85] font-black uppercase">
              <GlitchText
                text="No Brain"
                className="block text-[#c6ff00] [text-shadow:0_0_24px_#c6ff0080]"
              />
              <GlitchText text="No Game" className="block text-foreground" />
            </h3>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-foreground/75">
              {t.studio.body}
            </p>
            <StudioCta href={studioUrl} />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-px bg-[#c6ff00]/10">
              <div className="bg-black p-4">
                <p className="hud-label">{t.studio.catalog}</p>
                <p className="font-display text-4xl font-black text-[#c6ff00]">
                  {String(games.length).padStart(2, "0")}
                </p>
              </div>
              <div className="bg-black p-4">
                <p className="hud-label">{t.studio.playable}</p>
                <p className="font-display text-4xl font-black text-[#ff5e1a]">
                  {String(live).padStart(2, "0")}
                </p>
              </div>
            </div>
            <ul className="divide-y divide-white/5 border border-white/5">
              {games.slice(0, 4).map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-display font-bold" style={{ color: g.accent }}>
                      {g.name}
                    </p>
                    <p className="truncate font-mono text-[0.65rem] text-muted-foreground">
                      {g.genre}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[0.55rem] tracking-[0.2em] text-muted-foreground">
                    {g.stock}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
