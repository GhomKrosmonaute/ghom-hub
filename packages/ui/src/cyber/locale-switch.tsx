"use client";

import { LOCALE_META, LOCALES, type Locale } from "@ghom/core";
import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { switchLocale } from "@ghom/ui/lib/nav";
import { cn } from "@ghom/ui/lib/utils";

/** Sélecteur FR / EN compact pour les barres de HUD. */
export function LocaleSwitch({
  locale,
  rootDomain,
  label,
  className,
}: {
  locale: Locale;
  rootDomain?: string;
  /** Libellé accessible du groupe, ex. « Langue ». */
  label: string;
  className?: string;
}) {
  return (
    <nav
      aria-label={label}
      className={cn(
        "inline-flex items-center font-mono text-[0.6rem] uppercase tracking-[0.2em]",
        className,
      )}
    >
      {LOCALES.map((l, i) => {
        const on = l === locale;
        return (
          <span key={l} className="inline-flex items-center">
            {i > 0 && <span className="px-1 text-muted-foreground/50">/</span>}
            <button
              type="button"
              lang={l}
              aria-pressed={on}
              aria-label={LOCALE_META[l].name}
              data-lock={LOCALE_META[l].name}
              disabled={on}
              onClick={() => {
                playSfx("click");
                switchLocale(l, rootDomain);
              }}
              className={cn(
                "transition-colors disabled:cursor-default",
                on
                  ? "text-[var(--glow,var(--primary))]"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {LOCALE_META[l].short}
            </button>
          </span>
        );
      })}
    </nav>
  );
}
