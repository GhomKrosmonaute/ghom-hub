/** Stages (sections) du portail ; libellés dans le dictionnaire (`t.stages[id]`). */
export const STAGES = [
  { id: "jeux", code: "1-1" },
  { id: "studio", code: "1-2" },
  { id: "insert-coin", code: "1-3" },
] as const;

export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return Boolean(t?.closest("input, textarea, select, [contenteditable=true]"));
}
