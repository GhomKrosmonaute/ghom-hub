"use client";

import { fill } from "@ghom/core";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";

const KEY = "ghom:booted";

type Phase = "boot" | "open" | "done";

/**
 * Séquence d'amorçage de l'exosquelette, puis ouverture de la visière.
 * Sert aussi d'écran de chargement : elle est dans le HTML serveur.
 * Jouée une fois par session, passable au clic / clavier.
 */
export function BootSequence({ projectCount }: { projectCount: number }) {
  const [phase, setPhase] = useState<Phase>("boot");
  const [shown, setShown] = useState(0);

  const { t } = useI18n();
  const lines = t.boot.lines.map((l) => fill(l, { count: projectCount }));

  const open = useCallback(() => {
    setPhase((p) => (p === "boot" ? "open" : p));
  }, []);

  useEffect(() => {
    let already = false;
    try {
      already = sessionStorage.getItem(KEY) === "1";
      sessionStorage.setItem(KEY, "1");
    } catch {}
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (already || reduced) {
      setPhase("open");
      return;
    }
    playSfx("boot");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(i);
      if (i >= lines.length) {
        clearInterval(id);
        setTimeout(open, 350);
      }
    }, 170);
    const skip = () => open();
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
    };
  }, [lines.length, open]);

  useEffect(() => {
    if (phase !== "open") return;
    const id = setTimeout(() => setPhase("done"), 900);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "done") return null;
  const opening = phase === "open";

  return (
    <div aria-hidden className="fixed inset-0 z-[200]">
      {/* Paupières de la visière */}
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-1/2 border-b border-neon-1 bg-void shadow-[0_0_30px_var(--neon-1)] transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]",
          opening && "-translate-y-full",
        )}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-1/2 border-t border-neon-1 bg-void shadow-[0_0_30px_var(--neon-1)] transition-transform duration-700 ease-[cubic-bezier(.7,0,.2,1)]",
          opening && "translate-y-full",
        )}
      />
      <div
        className={cn(
          "absolute inset-0 grid place-items-center p-6 transition-opacity duration-200",
          opening && "opacity-0",
        )}
      >
        <div className="w-full max-w-xl font-mono text-xs leading-relaxed text-neon-1 sm:text-sm">
          {lines.slice(0, Math.max(1, shown)).map((l, i) => (
            <p
              key={i}
              className={cn(
                i === 0 && "mb-3 text-neon-2",
                i === lines.length - 1 && "mt-3 neon-text",
              )}
            >
              {l}
            </p>
          ))}
          <span className="animate-blink">█</span>
          <div className="mt-6 h-1 w-full bg-neon-1/15">
            <div
              className="h-full bg-neon-1 shadow-[0_0_12px_var(--neon-1)] transition-[width] duration-150"
              style={{ width: `${(shown / lines.length) * 100}%` }}
            />
          </div>
          <p className="mt-3 hud-label">{t.boot.skip}</p>
        </div>
      </div>
    </div>
  );
}
