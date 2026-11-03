"use client";

import { setSfxEnabled, useSfxEnabled } from "@ghom/ui/hooks/use-sfx";
import { cn } from "@ghom/ui/lib/utils";
import { Volume2, VolumeX } from "lucide-react";

export function SfxToggle({ className }: { className?: string }) {
  const on = useSfxEnabled();
  return (
    <button
      type="button"
      onClick={() => setSfxEnabled(!on)}
      aria-pressed={on}
      data-lock={on ? "AUDIO OFF" : "AUDIO ON"}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] transition-colors",
        on ? "text-[var(--glow,var(--primary))]" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {on ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
      SFX {on ? "ON" : "OFF"}
    </button>
  );
}
