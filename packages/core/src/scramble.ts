export const GLYPHS = "アイウエオカキクケコサシスセソ01#$%&*+=<>/\\|ﾊﾋﾌﾍﾎ▓▒░";

/**
 * Frame d'un effet "décryptage" : les caractères se révèlent de gauche à droite.
 * @param progress 0 → tout brouillé, 1 → texte final
 * @param rand générateur [0,1) injectable pour des tests déterministes
 */
export function scrambleFrame(
  target: string,
  progress: number,
  rand: () => number = Math.random,
  glyphs: string = GLYPHS,
): string {
  const p = Math.min(1, Math.max(0, progress));
  const chars = [...target];
  const revealed = Math.floor(chars.length * p);
  const pool = [...glyphs];
  return chars
    .map((c, i) => {
      if (i < revealed || c === " ") return c;
      return pool[Math.floor(rand() * pool.length)] ?? c;
    })
    .join("");
}

/** Interpolation exponentielle indépendante du framerate (pour lisser caméras/curseurs). */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/** Format télémétrie : 7 → "007", 12.345 → "012.3" */
export function telemetry(value: number, digits = 3, decimals = 0): string {
  const fixed = Math.abs(value).toFixed(decimals);
  const [int = "0", dec] = fixed.split(".");
  const sign = value < 0 ? "-" : "";
  return `${sign}${int.padStart(digits, "0")}${dec !== undefined ? `.${dec}` : ""}`;
}
