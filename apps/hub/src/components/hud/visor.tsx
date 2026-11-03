"use client";

import { damp, LOCALE_META, telemetry } from "@ghom/core";
import { LocaleSwitch } from "@ghom/ui/cyber/locale-switch";
import { SfxToggle } from "@ghom/ui/cyber/sfx-toggle";
import { pointer } from "@ghom/ui/hooks/use-pointer";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import { Command } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { goTo, SECTIONS } from "./sections";
import { useActiveSection } from "./use-active-section";

/** Plaque d'armure d'angle. Les 4 coins sont le même SVG, en miroir. */
function CornerPlate({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 190"
      className={cn(
        "pointer-events-none absolute h-[19vh] max-h-[190px] min-h-[110px] w-auto",
        className,
      )}
      aria-hidden
    >
      <defs>
        <linearGradient id="plate" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0b0c14" />
          <stop offset="1" stopColor="#020204" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <path d="M0 0H300L276 16H86L18 84V172L0 190Z" fill="url(#plate)" />
      <path
        d="M276 16H86L18 84V172"
        fill="none"
        stroke="var(--neon-1)"
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M260 24H92L26 90"
        fill="none"
        stroke="var(--neon-1)"
        strokeWidth="0.6"
        opacity="0.35"
      />
      <path d="M150 16h40M200 16h18" stroke="var(--neon-2)" strokeWidth="3" />
      <circle cx="40" cy="40" r="3" fill="var(--neon-2)" className="animate-flicker" />
    </svg>
  );
}

function Clock() {
  const { locale } = useI18n();
  const [now, setNow] = useState<string>("--:--:--");
  useEffect(() => {
    const fmt = () =>
      setNow(new Date().toLocaleTimeString(LOCALE_META[locale].intl, { hour12: false }));
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, [locale]);
  return <span suppressHydrationWarning>{now}</span>;
}

/**
 * Visière HUD : tout est en `pointer-events-none` sauf les commandes.
 * Le calque entier a une légère inertie (casque qui suit la tête avec retard).
 */
export function Visor({
  onOpenPalette,
  offline,
  rootDomain,
}: {
  onOpenPalette: () => void;
  offline: boolean;
  rootDomain: string;
}) {
  const { t, locale } = useI18n();
  const layer = useRef<HTMLDivElement>(null);
  const compass = useRef<HTMLDivElement>(null);
  const horizon = useRef<HTMLDivElement>(null);
  const coords = useRef<HTMLSpanElement>(null);
  const alt = useRef<HTMLSpanElement>(null);
  const altBar = useRef<HTMLDivElement>(null);
  const active = useActiveSection();

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const s = { x: 0, y: 0, scroll: 0, roll: 0 };
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      s.x = damp(s.x, pointer.x, 3.5, dt);
      s.y = damp(s.y, pointer.y, 3.5, dt);
      s.scroll = damp(s.scroll, pointer.scroll, 6, dt);
      s.roll = damp(s.roll, pointer.x * 4, 3, dt);

      if (layer.current) {
        layer.current.style.transform = `translate3d(${-s.x * 7}px, ${s.y * 5}px, 0)`;
      }
      if (compass.current) {
        compass.current.style.transform = `translateX(${-(s.x * 120 + s.scroll * 600)}px)`;
      }
      if (horizon.current) {
        horizon.current.style.transform = `translateY(${-s.y * 10}px) rotate(${s.roll}deg)`;
      }
      if (coords.current) {
        coords.current.textContent = `X ${telemetry(s.x * 100, 3)} · Y ${telemetry(s.y * 100, 3)}`;
      }
      if (alt.current) alt.current.textContent = telemetry(s.scroll * 999, 3);
      if (altBar.current) altBar.current.style.transform = `scaleY(${s.scroll})`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div aria-hidden={false} className="pointer-events-none fixed inset-0 z-40 select-none">
      {/* Verre du casque : vignette + reflet */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0/0.75)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_40%,rgb(255_255_255/0.025)_48%,transparent_56%)]" />
      <div className="scanlines absolute inset-0 opacity-60" />

      <div ref={layer} className="absolute -inset-2 will-change-transform">
        <CornerPlate className="top-0 left-0" />
        <CornerPlate className="top-0 right-0 -scale-x-100" />
        <CornerPlate className="bottom-0 left-0 -scale-y-100" />
        <CornerPlate className="right-0 bottom-0 -scale-100" />

        {/* ── Barre haute ── */}
        <div className="absolute top-4 right-6 left-6 flex items-start justify-between gap-4 md:top-5 md:right-28 md:left-28">
          <div className="hud-label hidden text-neon-1 md:block">
            GHOM<span className="text-neon-2">{"//"}</span>EXO-7
            <div className="mt-1 text-muted-foreground">
              SYNC <span className="text-foreground">98.4%</span> · PWR{" "}
              <span className="text-foreground">▮▮▮▮▮▯</span>
            </div>
          </div>

          {/* Boussole */}
          <div className="relative mx-auto hidden h-8 w-[min(40vw,420px)] overflow-hidden border-x border-neon-1/40 md:block [mask-image:linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]">
            <div ref={compass} className="absolute top-0 left-1/2 flex will-change-transform">
              {Array.from({ length: 72 }, (_, i) => {
                const deg = ((i - 36) * 10 + 360) % 360;
                const label = { 0: "N", 90: "E", 180: "S", 270: t.visor.west }[deg];
                return (
                  <div key={i} className="flex w-6 shrink-0 flex-col items-center">
                    <span
                      className={cn("block w-px bg-neon-1/70", i % 3 === 0 ? "h-3" : "h-1.5")}
                    />
                    {i % 3 === 0 && (
                      <span
                        className={cn(
                          "font-mono text-[9px]",
                          label ? "text-neon-2" : "text-muted-foreground",
                        )}
                      >
                        {label ?? deg}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-neon-2" />
          </div>

          <div className="pointer-events-auto ml-auto flex items-center gap-4 font-mono text-[0.65rem] tracking-[0.2em] md:ml-0">
            <span className="hidden text-muted-foreground sm:inline">
              <Clock />
            </span>
            <LocaleSwitch locale={locale} rootDomain={rootDomain} label={t.visor.language} />
            <SfxToggle />
            <button
              type="button"
              onClick={() => {
                playSfx("click");
                onOpenPalette();
              }}
              data-lock={t.visor.terminal}
              aria-label={t.visor.terminal}
              className="inline-flex items-center gap-1 border border-neon-1/40 px-2 py-1 text-neon-1 transition-colors hover:bg-neon-1/10"
            >
              <Command className="size-3" />K
            </button>
          </div>
        </div>

        {/* ── Rail gauche : navigation ── */}
        <nav
          aria-label={t.sections.aria}
          className="pointer-events-auto absolute top-1/2 left-5 hidden -translate-y-1/2 flex-col gap-3 lg:flex"
        >
          {SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <button
                key={s.id}
                type="button"
                data-lock={t.sections[s.id]}
                onClick={() => {
                  playSfx("click");
                  goTo(s.id);
                }}
                onPointerEnter={() => playSfx("hover")}
                className={cn(
                  "group flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.25em] transition-colors",
                  on ? "text-neon-1" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-px transition-all duration-300",
                    on
                      ? "w-8 bg-neon-1 shadow-[0_0_8px_var(--neon-1)]"
                      : "w-3 bg-current group-hover:w-5",
                  )}
                />
                <span className="text-neon-2/80">{s.code}</span>
                <span
                  className={cn(
                    "transition-opacity",
                    on ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                >
                  {t.sections[s.id]}
                </span>
              </button>
            );
          })}
        </nav>

        {/* ── Rail droit : altimètre = progression ── */}
        <div className="absolute top-1/2 right-6 hidden h-[38vh] -translate-y-1/2 items-stretch gap-2 lg:flex">
          <div className="flex flex-col justify-between text-right font-mono text-[9px] text-muted-foreground">
            {[...Array(9)].map((_, i) => (
              <span key={i}>{telemetry((8 - i) * 125, 3)}</span>
            ))}
          </div>
          <div className="relative w-1.5 border border-neon-1/40">
            <div
              ref={altBar}
              className="absolute inset-0 origin-top bg-neon-1/70 shadow-[0_0_10px_var(--neon-1)]"
            />
          </div>
          <div className="absolute -bottom-6 right-0 hud-label">
            ALT{" "}
            <span ref={alt} className="text-neon-1">
              000
            </span>
          </div>
        </div>

        {/* ── Horizon artificiel ── */}
        <div className="absolute top-1/2 left-1/2 hidden h-px w-[22vw] -translate-x-1/2 md:block">
          <div
            ref={horizon}
            className="flex items-center justify-between opacity-30 will-change-transform"
          >
            <span className="h-px w-[30%] bg-neon-1" />
            <span className="size-1.5 rotate-45 border border-neon-1" />
            <span className="h-px w-[30%] bg-neon-1" />
          </div>
        </div>

        {/* ── Barre basse ── */}
        <div className="absolute right-6 bottom-4 left-6 flex items-end justify-between md:right-28 md:bottom-5 md:left-28">
          <div className="hud-label">
            <span
              className={cn(
                "mr-2 inline-block size-1.5 rounded-full",
                offline ? "bg-neon-3 animate-blink" : "bg-neon-1",
              )}
            />
            {offline ? t.visor.offline : t.visor.nominal}
          </div>
          <span ref={coords} className="hud-label hidden md:inline">
            X 000 · Y 000
          </span>
        </div>
      </div>

      {/* Navigation mobile */}
      <nav
        aria-label={t.sections.aria}
        className="pointer-events-auto absolute right-3 bottom-10 left-3 flex justify-between border border-neon-1/30 bg-black/70 px-2 py-1.5 backdrop-blur lg:hidden"
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(s.id)}
            className={cn(
              "px-2 py-1 font-mono text-[0.6rem] uppercase tracking-[0.18em]",
              active === s.id ? "text-neon-1" : "text-muted-foreground",
            )}
          >
            <span className="text-neon-2">{s.code}</span> {t.sections[s.id]}
          </button>
        ))}
      </nav>
    </div>
  );
}
