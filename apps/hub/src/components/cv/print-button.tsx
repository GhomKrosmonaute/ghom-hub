"use client";

export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border border-white/25 px-3 py-2 uppercase text-foreground/80 transition-colors hover:border-neon-1 hover:text-neon-1"
    >
      {label}
    </button>
  );
}
