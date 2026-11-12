import { GlitchText } from "@ghom/ui/cyber/glitch-text";
import { ScrambleText } from "@ghom/ui/cyber/scramble-text";
import { getProfile } from "@/content/profile";
import { getDictionary, getLocale } from "@/i18n/server";
import { HeroActions } from "./hero-actions";

export async function Hero({ stats }: { stats: { label: string; value: number }[] }) {
  const [t, locale] = await Promise.all([getDictionary(), getLocale()]);
  const profile = await getProfile(locale);
  return (
    <section
      id="cockpit"
      className="relative flex min-h-dvh items-center px-6 pt-24 pb-28 md:px-28 lg:px-40"
    >
      <div className="relative z-10 max-w-3xl">
        <p className="hud-label mb-4 flex items-center gap-3 text-neon-1">
          <span className="inline-block h-px w-10 bg-neon-1" />
          {t.hero.identified} · {profile.unit}
        </p>

        <h1 className="font-display text-[clamp(5rem,19vw,15rem)] leading-[0.8] font-black tracking-tight">
          <GlitchText text={profile.handle} className="neon-text" />
        </h1>

        <ScrambleText
          as="p"
          text={profile.role}
          duration={1100}
          className="mt-6 inline-block bg-[#05060b]/55 font-mono text-sm uppercase tracking-[0.35em] text-neon-2 backdrop-blur-[2px] md:bg-transparent md:text-base md:backdrop-blur-none"
        />
        <p className="mt-6 max-w-xl bg-[#05060b]/55 text-lg leading-relaxed text-foreground/90 backdrop-blur-[2px] md:bg-transparent md:text-xl md:backdrop-blur-none">
          {profile.tagline}
        </p>

        <HeroActions />

        <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
          {stats.map((s) => (
            <div key={s.label}>
              <dt className="hud-label">{s.label}</dt>
              <dd className="font-display text-3xl font-bold text-neon-1 tabular-nums">
                {String(s.value).padStart(2, "0")}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="hud-label">{t.hero.scroll}</span>
        <span className="h-10 w-px animate-pulse bg-gradient-to-b from-neon-1 to-transparent" />
      </div>
    </section>
  );
}
