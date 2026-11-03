/** Sections du hub ; les libellés viennent du dictionnaire (`t.sections[id]`). */
export const SECTIONS = [
  { id: "pilote", code: "01" },
  { id: "arsenal", code: "02" },
  { id: "studio", code: "03" },
  { id: "comms", code: "04" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];

export function goTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export function isTyping(e: KeyboardEvent) {
  const t = e.target as HTMLElement | null;
  return Boolean(t?.closest("input, textarea, select, [contenteditable=true], [cmdk-root]"));
}
