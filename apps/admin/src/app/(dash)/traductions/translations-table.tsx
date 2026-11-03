"use client";

import { LOCALE_META, type Locale } from "@ghom/core";
import { Button } from "@ghom/ui/components/button";
import { Textarea } from "@ghom/ui/components/textarea";
import { cn } from "@ghom/ui/lib/utils";
import { Check, Loader2, RotateCcw, Search } from "lucide-react";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import { toastResult } from "@/lib/toast-result";
import { resetTranslation, saveTranslation } from "./actions";

type Cell = { default: string; override: string | null };
export type TranslationRow = { key: string; fr: Cell; en: Cell };

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function CellEditor({
  site,
  locale,
  rowKey,
  cell,
}: {
  site: string;
  locale: Locale;
  rowKey: string;
  cell: Cell;
}) {
  const current = cell.override ?? cell.default;
  const [value, setValue] = useState(current);
  const [pending, start] = useTransition();
  const dirty = value !== current;
  const id = `${locale}-${rowKey}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <label
          htmlFor={id}
          className="font-mono text-[0.6rem] tracking-[0.2em] text-muted-foreground"
        >
          {LOCALE_META[locale].short}
        </label>
        {cell.override !== null && (
          <span className="bg-neon-2/15 px-1.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-neon-2">
            Personnalisé
          </span>
        )}
      </div>
      <Textarea
        id={id}
        rows={Math.min(6, Math.max(1, Math.ceil(value.length / 60)))}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className={cn("min-h-9 text-sm", dirty && "border-neon-3/60")}
      />
      {cell.override !== null && (
        <p className="truncate font-mono text-[0.6rem] text-muted-foreground" title={cell.default}>
          Origine : {cell.default}
        </p>
      )}
      {(dirty || cell.override !== null) && (
        <div className="flex gap-1">
          {dirty && (
            <>
              <Button
                size="sm"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    if (!toastResult(await saveTranslation(site, locale, rowKey, value))) return;
                  })
                }
              >
                {pending ? <Loader2 className="animate-spin" /> : <Check />} Enregistrer
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setValue(current)}>
                Annuler
              </Button>
            </>
          )}
          {!dirty && cell.override !== null && (
            <Button
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  if (toastResult(await resetTranslation(site, locale, rowKey)))
                    setValue(cell.default);
                })
              }
            >
              <RotateCcw /> Réinitialiser
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function TranslationsTable({ site, rows }: { site: string; rows: TranslationRow[] }) {
  const [query, setQuery] = useState("");
  const [onlyCustom, setOnlyCustom] = useState(false);
  const deferred = useDeferredValue(query);

  const visible = useMemo(() => {
    const q = normalize(deferred.trim());
    return rows.filter((r) => {
      if (onlyCustom && r.fr.override === null && r.en.override === null) return false;
      if (!q) return true;
      return normalize(
        [r.key, r.fr.default, r.fr.override ?? "", r.en.default, r.en.override ?? ""].join(" "),
      ).includes(q);
    });
  }, [rows, deferred, onlyCustom]);

  // Regroupement par section (premier segment de la clé)
  const groups = useMemo(() => {
    const map = new Map<string, TranslationRow[]>();
    for (const r of visible) {
      const section = r.key.split(".")[0] ?? "";
      map.set(section, [...(map.get(section) ?? []), r]);
    }
    return [...map];
  }, [visible]);

  const customCount = rows.filter((r) => r.fr.override !== null || r.en.override !== null).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative w-full max-w-sm">
          <label htmlFor="t-search" className="sr-only">
            Rechercher un texte
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neon-1/70" />
          <input
            id="t-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Clé ou texte…"
            className="h-9 w-full border border-white/10 bg-black/40 pr-3 pl-9 font-mono text-sm outline-none focus:border-neon-1/60"
          />
        </div>
        <label className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyCustom}
            onChange={(e) => setOnlyCustom(e.target.checked)}
          />
          Personnalisés seulement ({customCount})
        </label>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {visible.length} textes
        </span>
      </div>

      {groups.map(([section, items]) => (
        <section key={section} className="border border-white/8 bg-[#05060b]/80">
          <h2 className="border-b border-white/8 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] text-neon-2">
            {section}
          </h2>
          <ul className="divide-y divide-white/5">
            {items.map((r) => (
              <li key={r.key} className="grid gap-3 p-4 lg:grid-cols-[200px_1fr_1fr]">
                <code className="break-all font-mono text-xs text-neon-1/80">{r.key}</code>
                <CellEditor site={site} locale="fr" rowKey={r.key} cell={r.fr} />
                <CellEditor site={site} locale="en" rowKey={r.key} cell={r.en} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {groups.length === 0 && (
        <p className="py-10 text-center text-muted-foreground">Aucun texte trouvé.</p>
      )}
    </div>
  );
}
