"use client";

import { LocaleSwitch } from "@ghom/ui/cyber/locale-switch";
import { SfxToggle } from "@ghom/ui/cyber/sfx-toggle";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { useArcade } from "./score";
import { goTo, STAGES } from "./stages";

const pad = (n: number, l = 6) => String(n).padStart(l, "0");

/**
 * Cadre de borne d'arcade : écran CRT aux coins arrondis, compteurs de score,
 * crédits et sélection de stage. Le pendant "arcade" de la visière du hub.
 */
export function Bezel({ hubUrl, rootDomain }: { hubUrl: string; rootDomain: string }) {
  const { t, locale } = useI18n();
  const { score, hiScore, credits } = useArcade();
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => {
        for (const e of es) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const id of ["start", ...STAGES.map((s) => s.id)]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 select-none">
      {/* Masque CRT : coins arrondis + bombé de l'écran */}
      <div className="absolute inset-2 rounded-[28px] shadow-[0_0_0_120px_#000,inset_0_0_140px_rgb(0_0_0/0.85),inset_0_0_0_2px_rgb(198_255_0/0.12)] md:inset-3 md:rounded-[40px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgb(0_0_0/0.55))]" />
      <div className="scanlines absolute inset-0 opacity-70" />
      <div className="absolute inset-0 animate-flicker bg-white/[0.012]" />

      {/* Compteurs */}
      <div className="pixel-font absolute top-5 right-8 left-8 grid grid-cols-3 text-[0.6rem] md:top-7 md:right-14 md:left-14 md:text-xs">
        <div>
          <p className="text-neon-2">1UP</p>
          <p className="text-foreground tabular-nums">{pad(score)}</p>
        </div>
        <div className="text-center">
          <p className="text-neon-2">HI-SCORE</p>
          <p className="text-neon-1 tabular-nums">{pad(hiScore)}</p>
        </div>
        <div className="text-right">
          <p className="text-neon-2">{t.bezel.credit}</p>
          <p
            className={cn(
              "tabular-nums",
              credits > 0 ? "text-neon-1" : "animate-blink text-foreground",
            )}
          >
            {pad(credits, 2)}
          </p>
        </div>
      </div>

      {/* Stages */}
      <nav
        aria-label={t.stages.aria}
        className="pointer-events-auto absolute top-1/2 right-6 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      >
        {STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            onPointerEnter={() => playSfx("hover")}
            onClick={() => {
              playSfx("click");
              goTo(s.id);
            }}
            className={cn(
              "pixel-font flex items-center gap-2 text-[0.6rem] uppercase transition-colors",
              active === s.id ? "text-neon-1" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active === s.id && <span className="animate-blink">▶</span>}
            <span className="text-neon-2">{s.code}</span>
            {t.stages[s.id]}
          </button>
        ))}
      </nav>

      {/* Bas d'écran */}
      <div className="pixel-font pointer-events-auto absolute right-8 bottom-5 left-8 flex items-center justify-between text-[0.55rem] md:right-14 md:bottom-7 md:left-14 md:text-[0.6rem]">
        <a href={hubUrl} className="text-muted-foreground transition-colors hover:text-[#00f0ff]">
          ◀ GHOM.FR
        </a>
        <span className="hidden text-muted-foreground md:inline">© NO BRAIN NO GAME</span>
        <span className="flex items-center gap-4">
          <LocaleSwitch
            locale={locale}
            rootDomain={rootDomain}
            label={t.bezel.language}
            className="pixel-font"
          />
          <SfxToggle className="pixel-font" />
        </span>
      </div>
    </div>
  );
}
