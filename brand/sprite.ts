/**
 * Mascotte / logo No Brain No Game : un soldat cyberpunk dont la tête est un cerveau,
 * épée-laser à la main. Pixel art 32×31 dessiné à la main, assemblé à partir de
 * pièces (cerveau, corps, bras, épée) pour rester lisible et retouchable.
 */

export const PALETTE: Record<string, string> = {
  K: "#0b0814", // contour
  b: "#8f1f5c", // cerveau sombre (circonvolutions)
  p: "#ff4f9a", // cerveau
  P: "#ff9ccc", // cerveau clair
  w: "#ffffff", // reflet / cœur de lame
  g: "#1f1b2e", // armure sombre
  G: "#353049", // armure
  H: "#5d5780", // armure claire
  L: "#c6ff00", // néon vert acide
  O: "#ff5e1a", // néon orange
  V: "#a855ff", // néon violet
};

export const WIDTH = 32;
export const HEIGHT = 31;

interface Part {
  x: number;
  y: number;
  rows: string[];
}

const BRAIN: Part = {
  x: 9,
  y: 1,
  rows: [
    "...KKKKKKK...",
    "..KPwPbPPpK..",
    ".KPpbPbPbpPK.",
    "KpPbbpbpbbPpK",
    "KPppPpbpPppPK",
    "KpbbpPbPpbOOK",
    "KPpPbbbbbPpPK",
    ".KbppPbPppbK.",
    "..KKKKKKKKK..",
  ],
};

const COLLAR: Part = { x: 12, y: 10, rows: ["KLLLLLK"] };

const BODY: Part = {
  x: 6,
  y: 11,
  rows: [
    ".KKKKKKKKKKKKKKKKKK.",
    "KHHGKgGGGGGGGGgKGHHK",
    "KHGGKgGGGOOGGGgKGGHK",
    "KGggKgGLOwwOLGgKggGK",
    "KKKKKgGGLOOLGGgKKKK.",
    "KHGK.KgGGLLGGgK.....",
    "KGGK.KVVOVVOVVK.....",
    "KGGK.KggggggggK.....",
    "KHHHKKgGGKKGGgK.....",
    ".KKK.KGGGKKGGGK.....",
    ".....KGHGKKGHGK.....",
    ".....KgLgKKgLgK.....",
    ".....KGGGKKGGGK.....",
    ".....KGHGKKGHGK.....",
    ".....KGGGKKGGGK.....",
    "....KKOGGKKGGOKK....",
    "....KHHHHKKHHHHK....",
    "...KHHHHHKKHHHHHK...",
    "...KKKKKKKKKKKKKK...",
  ],
};

const ARM: Part = { x: 22, y: 16, rows: ["KHGK", ".KGGK"] };

const SWORD: Part = {
  x: 25,
  y: 0,
  rows: [
    "..K..",
    ".KLK.",
    ".KwK.",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "KLwLK",
    "VVVVV",
    ".KOK.",
    ".KOK.",
    ".KOK.",
    ".KVK.",
  ],
};

const HAND: Part = { x: 25, y: 18, rows: ["KHHHK", "KHGHK"] };

/** Ordre de dessin : le plus en arrière d'abord. */
const PARTS = [BODY, ARM, BRAIN, COLLAR, SWORD, HAND];

/** Grille finale : `null` = transparent, sinon une couleur hexadécimale. */
export function spriteGrid(parts: Part[] = PARTS, w = WIDTH, h = HEIGHT): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({ length: h }, () => Array(w).fill(null));
  for (const part of parts) {
    const width = part.rows[0]!.length;
    part.rows.forEach((row, dy) => {
      if (row.length !== width && part !== ARM) {
        throw new Error(`Ligne ${dy} de largeur ${row.length} au lieu de ${width}`);
      }
      [...row].forEach((ch, dx) => {
        if (ch === ".") return;
        const color = PALETTE[ch];
        if (!color) throw new Error(`Couleur inconnue « ${ch} »`);
        const gx = part.x + dx;
        const gy = part.y + dy;
        if (gy < h && gx < w) grid[gy]![gx] = color;
      });
    });
  }
  return grid;
}

/** Icône simplifiée 16×16 (favicon) : le cerveau seul, sur son collier néon. */
export function headGrid(): (string | null)[][] {
  return spriteGrid(
    [
      { ...BRAIN, x: 1, y: 2 },
      { ...COLLAR, x: 4, y: 11 },
      { x: 4, y: 12, rows: ["KGGGGGK", ".KKKKK."] },
    ],
    16,
    16,
  );
}

/** Rectangles SVG (fusion horizontale des pixels identiques), net à toute échelle. */
export function gridToSvgRects(grid: (string | null)[][], px: number, ox = 0, oy = 0): string {
  const out: string[] = [];
  grid.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const c = row[x];
      if (!c) {
        x++;
        continue;
      }
      let run = 1;
      while (row[x + run] === c) run++;
      out.push(
        `<rect x="${ox + x * px}" y="${oy + y * px}" width="${run * px}" height="${px}" fill="${c}"/>`,
      );
      x += run;
    }
  });
  return out.join("");
}

/** Pixels RGBA bruts (pour une conversion exacte en PNG via ImageMagick). */
export function gridToRgba(grid: (string | null)[][]): Uint8Array {
  const h = grid.length;
  const w = grid[0]!.length;
  const buf = new Uint8Array(w * h * 4);
  grid.forEach((row, y) => {
    row.forEach((c, x) => {
      if (!c) return;
      const i = (y * w + x) * 4;
      buf[i] = Number.parseInt(c.slice(1, 3), 16);
      buf[i + 1] = Number.parseInt(c.slice(3, 5), 16);
      buf[i + 2] = Number.parseInt(c.slice(5, 7), 16);
      buf[i + 3] = 255;
    });
  });
  return buf;
}
