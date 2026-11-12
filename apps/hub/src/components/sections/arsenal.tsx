"use client";

import { countByKind, filterCatalog, KIND_META, type ProjectKind } from "@ghom/core";
import { Input } from "@ghom/ui/components/input";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import { Search } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import type { ProjectView } from "@/lib/projects";
import { ProductCard } from "./product-card";
import { ProductDialog } from "./product-dialog";
import { SectionHeader } from "./section-header";

type KindFilter = ProjectKind | "ALL";

export function Arsenal({ projects }: { projects: ProjectView[] }) {
  const { t, locale } = useI18n();
  const [kind, setKind] = useState<KindFilter>("ALL");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [inspected, setInspected] = useState<ProjectView | null>(null);
  const deferredQuery = useDeferredValue(query);

  const counts = useMemo(() => countByKind(projects), [projects]);
  const kinds = Object.keys(counts) as ProjectKind[];

  const visible = useMemo(() => {
    const filtered = filterCatalog(projects, {
      kinds: kind === "ALL" ? undefined : [kind],
      query: deferredQuery,
      hideArchived: !showArchived,
    });
    // filterCatalog renvoie des Project ; on retrouve les vues enrichies
    const byId = new Map(projects.map((p) => [p.id, p]));
    return filtered.map((p) => byId.get(p.id)!);
  }, [projects, kind, deferredQuery, showArchived]);

  const archivedCount = projects.filter((p) => p.status === "ARCHIVED").length;

  const chip = (value: KindFilter, label: string, count: number) => (
    <button
      key={value}
      type="button"
      onClick={() => {
        playSfx("click");
        setKind(value);
      }}
      aria-pressed={kind === value}
      className={cn(
        "cyber-clip-sm border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] transition-all",
        kind === value
          ? "border-neon-1 bg-neon-1 text-black shadow-[0_0_18px_-4px_var(--neon-1)]"
          : "border-white/10 text-muted-foreground hover:border-neon-1/50 hover:text-foreground",
      )}
    >
      {label} <span className="opacity-60">{String(count).padStart(2, "0")}</span>
    </button>
  );

  return (
    <section id="arsenal" className="relative scroll-mt-10 px-6 py-28 md:px-28 lg:px-40">
      <SectionHeader code="02" kicker={t.arsenal.kicker} title={t.arsenal.title} />

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {chip("ALL", t.arsenal.all, projects.length)}
          {kinds.map((k) => chip(k, KIND_META[k].label[locale], counts[k] ?? 0))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {archivedCount > 0 && (
            <button
              type="button"
              onClick={() => setShowArchived((v) => !v)}
              aria-pressed={showArchived}
              className={cn(
                "whitespace-nowrap font-mono text-[0.65rem] uppercase tracking-[0.18em] transition-colors",
                showArchived ? "text-neon-3" : "text-muted-foreground hover:text-foreground",
              )}
            >
              [{showArchived ? "x" : " "}] {t.arsenal.archived}
            </button>
          )}
          <div className="relative block min-w-[12rem] flex-1 lg:w-72 lg:flex-none">
            <label htmlFor="arsenal-search" className="sr-only">
              {t.arsenal.searchLabel}
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neon-1/70" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              id="arsenal-search"
              placeholder={t.arsenal.searchPlaceholder}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="cyber-clip border border-dashed border-white/10 bg-black/50 p-12 text-center font-mono text-sm text-muted-foreground">
          {t.arsenal.empty}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((p, i) => (
            <div
              key={p.id}
              className="h-full animate-in fade-in slide-in-from-bottom-4 fill-mode-both duration-500"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <ProductCard project={p} onInspect={() => setInspected(p)} />
            </div>
          ))}
        </div>
      )}

      <ProductDialog project={inspected} onClose={() => setInspected(null)} />
    </section>
  );
}
