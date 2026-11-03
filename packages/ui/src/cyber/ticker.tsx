import { cn } from "@ghom/ui/lib/utils";

/** Bandeau défilant infini (CSS only). */
export function Ticker({
  items,
  className,
  speed = 40,
  separator = "◆",
}: {
  items: string[];
  className?: string;
  /** secondes pour un tour complet */
  speed?: number;
  separator?: string;
}) {
  const row = items.flatMap((item, i) => [
    <span key={`i${i}`}>{item}</span>,
    <span key={`s${i}`} className="text-[var(--glow,var(--primary))]">
      {separator}
    </span>,
  ]);
  return (
    <div className={cn("relative flex overflow-hidden whitespace-nowrap", className)} aria-hidden>
      {[0, 1].map((k) => (
        <div
          key={k}
          className="flex shrink-0 items-center gap-6 pr-6"
          style={{ animation: `ticker ${speed}s linear infinite` }}
        >
          {row}
        </div>
      ))}
    </div>
  );
}
