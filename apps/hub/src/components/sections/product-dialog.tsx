"use client";

import { KIND_META } from "@ghom/core";
import { Button } from "@ghom/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ghom/ui/components/dialog";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import { Code2, Rocket } from "lucide-react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { TONE_CLASS } from "./product-card";
import { ProductGlyph } from "./product-glyph";

/** Fiche technique détaillée d'un projet. */
export function ProductDialog({
  project,
  onClose,
}: {
  project: ProjectView | null;
  onClose: () => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={Boolean(project)} onOpenChange={(o) => !o && onClose()}>
      {project && (
        <DialogContent
          style={{ "--glow": project.accent } as React.CSSProperties}
          closeLabel={t.product.close}
          className="max-h-[90dvh] overflow-y-auto p-0 sm:max-w-3xl"
        >
          <div className="grid md:grid-cols-[1fr_1.2fr]">
            <div className="tech-grid relative grid min-h-56 place-items-center border-b border-white/5 [--neon-1:var(--glow)] md:border-r md:border-b-0">
              <ProductGlyph
                slug={project.slug}
                code={KIND_META[project.kind].code}
                className="h-52 w-52"
              />
              <span className="absolute bottom-3 left-3 font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                {project.ref}
              </span>
            </div>
            <div className="space-y-5 p-6">
              <DialogHeader className="text-left">
                <span
                  className={cn(
                    "w-fit border px-1.5 py-0.5 font-mono text-[0.55rem] font-semibold tracking-[0.2em]",
                    TONE_CLASS[project.tone],
                  )}
                >
                  {project.stock}
                </span>
                <DialogTitle className="font-display text-3xl font-black tracking-wide text-[var(--glow)]">
                  {project.name}
                </DialogTitle>
                <DialogDescription className="text-base text-foreground/80">
                  {project.tagline}
                </DialogDescription>
              </DialogHeader>

              <p className="leading-relaxed text-foreground/75">{project.description}</p>

              <dl className="grid grid-cols-2 gap-px bg-white/5 font-mono text-[0.68rem] uppercase tracking-[0.12em]">
                {[
                  [t.product.type, project.kindLabel],
                  [t.product.status, project.statusLabel],
                  [t.product.year, String(project.year)],
                  [t.product.host, project.host ?? "—"],
                ].map(([k, v]) => (
                  <div key={k} className="bg-popover p-2.5">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="mt-0.5 truncate normal-case tracking-normal text-foreground">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>

              <div>
                <p className="hud-label mb-2">{t.product.components}</p>
                <ul className="flex flex-wrap gap-1.5">
                  {[...project.stack, ...project.tags.map((t) => `#${t}`)].map((s) => (
                    <li
                      key={s}
                      className="border border-[var(--glow)]/30 px-2 py-0.5 font-mono text-xs text-foreground/80"
                    >
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                {project.url && project.status !== "ARCHIVED" && (
                  <Button asChild onClick={() => playSfx("click")}>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-lock={t.product.launch}
                    >
                      <Rocket /> {t.product.launch}
                    </a>
                  </Button>
                )}
                {project.repoUrl && (
                  <Button asChild variant="outline">
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-lock={t.product.source}
                    >
                      <Code2 /> {t.product.source}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
