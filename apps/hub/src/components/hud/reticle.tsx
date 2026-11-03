"use client";

import { damp } from "@ghom/core";
import { pointer } from "@ghom/ui/hooks/use-pointer";
import { useReducedMotion } from "@ghom/ui/hooks/use-reduced-motion";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";

/**
 * Réticule de visée : le point central est exact (précision),
 * l'anneau a de l'inertie, et se resserre en "LOCK" sur les éléments interactifs.
 */
export function Reticle() {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const fallbackLabel = t.reticle.target;
  const [enabled, setEnabled] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    setEnabled(fine && !reduced);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-reticle");
    let raf = 0;
    let last = performance.now();
    let wasLocked = false;
    const s = { x: window.innerWidth / 2, y: window.innerHeight / 2, scale: 1, rot: 0 };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      s.x = damp(s.x, pointer.px, 14, dt);
      s.y = damp(s.y, pointer.py, 14, dt);
      s.scale = damp(s.scale, pointer.locked ? 0.62 : 1, 12, dt);
      s.rot += dt * (pointer.locked ? 220 : 40);

      if (dot.current)
        dot.current.style.transform = `translate3d(${pointer.px}px, ${pointer.py}px, 0)`;
      if (ring.current) {
        ring.current.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) scale(${s.scale}) rotate(${s.rot}deg)`;
        ring.current.dataset.locked = String(pointer.locked);
      }
      if (label.current) {
        label.current.style.transform = `translate3d(${s.x + 28}px, ${s.y + 14}px, 0)`;
        label.current.style.opacity = pointer.locked ? "1" : "0";
        if (pointer.locked)
          label.current.textContent = `LOCK ▸ ${pointer.lockLabel || fallbackLabel}`;
      }
      if (pointer.locked && !wasLocked) playSfx("lock");
      wasLocked = pointer.locked;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-reticle");
    };
  }, [enabled, fallbackLabel]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={dot}
        className="absolute -top-[3px] -left-[3px] size-1.5 bg-neon-2 shadow-[0_0_8px_var(--neon-2)]"
      />
      <div
        ref={ring}
        className="group absolute -top-5 -left-5 size-10 will-change-transform data-[locked=true]:[&>span]:border-neon-2"
      >
        <span className="absolute inset-0 rounded-full border border-dashed border-neon-1/80" />
        <span className="absolute top-0 left-1/2 h-2 w-px -translate-x-1/2 bg-neon-1" />
        <span className="absolute bottom-0 left-1/2 h-2 w-px -translate-x-1/2 bg-neon-1" />
        <span className="absolute top-1/2 left-0 h-px w-2 -translate-y-1/2 bg-neon-1" />
        <span className="absolute top-1/2 right-0 h-px w-2 -translate-y-1/2 bg-neon-1" />
      </div>
      <div
        ref={label}
        className="absolute top-0 left-0 whitespace-nowrap border-l border-neon-2 bg-black/70 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-neon-2 opacity-0 transition-opacity"
      />
    </div>
  );
}
