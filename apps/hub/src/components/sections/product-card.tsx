"use client";

import { KIND_META } from "@ghom/core";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import Image from "next/image";
import { useRef } from "react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { ProductGlyph } from "./product-glyph";

export const TONE_CLASS: Record<ProjectView["tone"], string> = {
  ok: "text-neon-1 border-neon-1/60 bg-neon-1/10",
  info: "text-neon-2 border-neon-2/60 bg-neon-2/10",
  warn: "text-neon-3 border-neon-3/60 bg-neon-3/10",
  dim: "text-muted-foreground border-white/20 bg-white/5",
};

/** Fiche produit de la boutique : inclinaison 3D au survol, halo à la couleur du projet. */
export function ProductCard({
  project,
  onInspect,
}: {
  project: ProjectView;
  onInspect: () => void;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLButtonElement>(null);
  const archived = project.status === "ARCHIVED";

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--rx", `${-y * 8}deg`);
    el.style.setProperty("--ry", `${x * 10}deg`);
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <div className="h-full [perspective:900px]">
      <button
        ref={ref}
        type="button"
        data-lock={project.name}
        onClick={() => {
          playSfx("click");
          onInspect();
        }}
        onPointerEnter={() => playSfx("hover")}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ "--glow": project.accent } as React.CSSProperties}
        className={cn(
          "group/card cyber-clip relative flex h-full w-full flex-col overflow-hidden border border-white/5 bg-[#05060b]/95 text-left backdrop-blur-md",
          // Inclinaison seulement pendant le survol : après un scroll sans mouvement de souris,
          // pointerleave ne part pas et la carte restait penchée, décalée et sans flou (Firefox).
          "transition-[transform,box-shadow,border-color] duration-300 ease-out hover:[transform:rotateX(var(--rx,0))_rotateY(var(--ry,0))]",
          "hover:border-[var(--glow)]/60 hover:shadow-[0_0_40px_-12px_var(--glow)] focus-visible:border-[var(--glow)]",
          archived && "opacity-60 grayscale-[0.6] hover:grayscale-0",
        )}
      >
        {/* Reflet qui suit le pointeur */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          style={{
            background:
              "radial-gradient(400px circle at var(--mx,50%) var(--my,50%), color-mix(in oklab, var(--glow) 16%, transparent), transparent 45%)",
          }}
        />

        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
          <span className="font-mono text-[0.65rem] tracking-[0.2em] text-muted-foreground">
            {project.ref}
          </span>
          <span
            className={cn(
              "border px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold tracking-[0.2em]",
              TONE_CLASS[project.tone],
            )}
          >
            {project.stock}
          </span>
        </div>

        <div className="tech-grid relative grid aspect-[16/10] place-items-center overflow-hidden [--neon-1:var(--glow)]">
          {project.coverUrl ? (
            <Image
              src={project.coverUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-80"
            />
          ) : (
            <ProductGlyph
              slug={project.slug}
              code={KIND_META[project.kind].code}
              className="h-[78%] w-auto"
            />
          )}
          <span className="absolute inset-x-0 top-0 h-px bg-[var(--glow)] opacity-0 shadow-[0_0_12px_var(--glow)] group-hover/card:animate-[card-scan_1.2s_ease-in-out] group-hover/card:opacity-100" />
          {project.featured && (
            <span className="absolute top-3 left-3 bg-[var(--glow)] px-1.5 py-0.5 font-mono text-[0.55rem] font-bold tracking-[0.2em] text-black">
              {t.product.featured}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div>
            <p className="hud-label">
              {project.kindLabel} · {project.year}
            </p>
            <h3 className="mt-1 font-display text-2xl font-bold tracking-wide text-foreground transition-colors group-hover/card:text-[var(--glow)]">
              {project.name}
            </h3>
            <p className="mt-1.5 text-sm leading-snug text-foreground/70">{project.tagline}</p>
          </div>
          <ul className="mt-auto flex flex-wrap gap-1.5">
            {project.stack.slice(0, 4).map((s) => (
              <li
                key={s}
                className="bg-white/5 px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground"
              >
                {s}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-white/5 pt-3 font-mono text-[0.65rem] uppercase tracking-[0.18em]">
            <span className="truncate text-muted-foreground">
              {project.host ?? t.product.restricted}
            </span>
            <span className="text-[var(--glow)] transition-transform group-hover/card:translate-x-1">
              {t.product.inspect}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
}
