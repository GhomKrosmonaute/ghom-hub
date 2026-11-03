import { cn } from "@ghom/ui/lib/utils";
import type * as React from "react";

/** Champ terminal : fond noir, filet néon, halo au focus. */
export const fieldBase =
  "w-full min-w-0 border border-input bg-black/60 px-3 font-mono text-sm text-foreground caret-[var(--glow,var(--primary))] shadow-[inset_0_0_18px_-10px_var(--glow,var(--primary))] transition-[border-color,box-shadow,background] outline-none placeholder:text-muted-foreground/60 selection:bg-primary selection:text-primary-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-[var(--glow,var(--primary))] focus-visible:bg-black/80 focus-visible:shadow-[inset_0_0_22px_-8px_var(--glow,var(--primary)),0_0_18px_-6px_var(--glow,var(--primary))] aria-invalid:border-destructive aria-invalid:shadow-[inset_0_0_18px_-8px_var(--destructive)]";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldBase, "h-11 py-1", className)}
      {...props}
    />
  );
}

export { Input };
