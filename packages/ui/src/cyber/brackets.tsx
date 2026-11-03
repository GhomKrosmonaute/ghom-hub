import { cn } from "@ghom/ui/lib/utils";

/** Quatre équerres de visée autour d'un bloc (le parent doit être `relative`). */
export function Brackets({
  className,
  size = 14,
  inset = 0,
}: {
  className?: string;
  size?: number;
  inset?: number;
}) {
  const base = "pointer-events-none absolute border-[var(--glow,var(--primary))]";
  const s = { width: size, height: size };
  return (
    <span aria-hidden className={cn("contents", className)}>
      <span className={cn(base, "border-t border-l")} style={{ ...s, top: inset, left: inset }} />
      <span className={cn(base, "border-t border-r")} style={{ ...s, top: inset, right: inset }} />
      <span
        className={cn(base, "border-b border-l")}
        style={{ ...s, bottom: inset, left: inset }}
      />
      <span
        className={cn(base, "border-b border-r")}
        style={{ ...s, bottom: inset, right: inset }}
      />
    </span>
  );
}
