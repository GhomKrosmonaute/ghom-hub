"use client";

import { useEffect, useRef, useState } from "react";

/** Jauge segmentée qui se remplit quand elle entre dans le champ de vision. */
export function SystemBar({
  code,
  label,
  level,
  delay = 0,
}: {
  code: string;
  label: string;
  level: number;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting) {
        setOn(true);
        io.disconnect();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="group">
      <div className="mb-1.5 flex items-baseline justify-between font-mono text-[0.7rem] uppercase tracking-[0.18em]">
        <span>
          <span className="mr-2 text-neon-2">{code}</span>
          {label}
        </span>
        <span className="text-neon-1 tabular-nums">{level}%</span>
      </div>
      <div className="h-2.5 bg-white/5">
        <div
          className="hud-gauge-fill h-full shadow-[0_0_10px_-2px_var(--neon-1)] transition-[width] duration-[1400ms] ease-[cubic-bezier(.2,.8,.2,1)]"
          style={{ width: on ? `${level}%` : "0%", transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  );
}
