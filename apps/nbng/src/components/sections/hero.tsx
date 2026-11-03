import { fill } from "@ghom/core";
import { GlitchText } from "@ghom/ui/cyber/glitch-text";
import { getDictionary } from "@/i18n/server";
import { PressStart } from "./press-start";

export async function Hero({ gameCount }: { gameCount: number }) {
  const t = await getDictionary();
  return (
    <section
      id="start"
      className="relative flex min-h-dvh items-center px-8 pt-28 pb-24 md:px-20 lg:px-28"
    >
      <div className="max-w-4xl">
        <p className="pixel-font mb-6 text-xs text-neon-2">{t.hero.kicker}</p>
        <h1 className="font-display text-[clamp(3.6rem,13vw,10.5rem)] leading-[0.82] uppercase">
          <GlitchText text="No Brain" className="extrude block text-neon-1" />
          <GlitchText text="No Game" className="extrude block text-foreground" />
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80 md:text-xl">
          {t.hero.pitch} <span className="text-neon-1">{t.hero.highlight}</span>
        </p>
        <PressStart />
        <p className="pixel-font mt-6 text-[0.6rem] text-muted-foreground">
          {fill(t.hero.memory, { count: String(gameCount).padStart(2, "0") })}
        </p>
      </div>
    </section>
  );
}
