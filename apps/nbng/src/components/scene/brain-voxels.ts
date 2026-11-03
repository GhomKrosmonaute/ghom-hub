/**
 * Échantillonne un cerveau stylisé en voxels :
 * deux hémisphères (ellipsoïdes) séparés par une scissure, des circonvolutions
 * (bruit sinusoïdal sur la surface) et un cervelet. On ne garde que la "coque"
 * pour limiter le nombre d'instances.
 *
 * Chaque voxel a aussi une place sur un plateau tactique (cases en relief) :
 * au scroll, le cerveau se déploie en terrain de jeu. Pas de cerveau, pas de jeu.
 */
export interface BrainVoxels {
  home: Float32Array;
  /** Position du voxel une fois le plateau déployé. */
  board: Float32Array;
  seed: Float32Array;
  count: number;
  step: number;
}

function folds(x: number, y: number, z: number) {
  return (
    Math.sin(x * 7.1 + Math.sin(z * 3.3)) *
    Math.sin(y * 6.3 + 1.7) *
    Math.sin(z * 5.7 + Math.cos(x * 2.1)) *
    0.11
  );
}

/** Distance normalisée (<1 = dedans) à l'hémisphère, cervelet inclus. */
function brainField(x: number, y: number, z: number): number {
  const ax = Math.abs(x);
  if (ax < 0.07 && y > -0.35) return 2; // scissure inter-hémisphérique
  // hémisphère : centré sur ±0.5, plus large en z (avant-arrière), aplati en dessous
  const hx = (ax - 0.5) / 0.62;
  const hy = y / (y > 0 ? 0.82 : 0.6);
  const hz = z / 1.2;
  const cortex = Math.sqrt(hx * hx + hy * hy + hz * hz) - folds(x, y, z);
  // cervelet : petite masse en bas à l'arrière
  const cx = x / 0.75;
  const cy = (y + 0.55) / 0.3;
  const cz = (z + 0.75) / 0.42;
  const cerebellum = Math.sqrt(cx * cx + cy * cy + cz * cz) - folds(x * 2, y * 2, z * 2) * 0.6;
  return Math.min(cortex, cerebellum);
}

export function buildBrain(
  step = 0.085,
  shell = 0.2,
  rand: () => number = Math.random,
): BrainVoxels {
  const home: number[] = [];
  for (let x = -1.25; x <= 1.25; x += step) {
    for (let y = -0.95; y <= 0.95; y += step) {
      for (let z = -1.35; z <= 1.35; z += step) {
        const d = brainField(x, y, z);
        if (d < 1 && d > 1 - shell) home.push(x, y, z);
      }
    }
  }
  const count = home.length / 3;
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) seed[i] = rand();
  return { home: new Float32Array(home), board: buildBoard(count, step), seed, count, step };
}

/** Hauteur (en voxels) d'une case : plaines, plateaux et quelques tours de garde. */
export function tileHeight(cx: number, cz: number): number {
  const relief = Math.sin(cx * 0.55) + Math.cos(cz * 0.47) + Math.sin((cx + cz) * 0.31);
  let h = 1 + Math.max(0, Math.round(relief));
  if ((cx * 7 + cz * 13) % 17 === 0 && relief > 0) h += 3;
  return h;
}

/** Altitude locale du plateau (sous le cerveau). */
export const BOARD_Y = -1.45;

/**
 * Range `count` voxels en colonnes sur une grille carrée, en partant du centre
 * pour que le plateau reste compact. Les cases sont espacées d'un joint.
 */
export function buildBoard(count: number, step: number): Float32Array {
  const pitch = step * 1.18;
  let side = 2;
  const cellsFor = (n: number) => {
    const cells: [number, number][] = [];
    const half = (n - 1) / 2;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) cells.push([i - half, j - half]);
    return cells;
  };
  let cells = cellsFor(side);
  const capacity = (c: [number, number][]) =>
    c.reduce((sum, [x, z]) => sum + tileHeight(Math.round(x), Math.round(z)), 0);
  while (capacity(cells) < count) {
    side++;
    cells = cellsFor(side);
  }
  cells.sort(
    (a, b) => Math.max(Math.abs(a[0]), Math.abs(a[1])) - Math.max(Math.abs(b[0]), Math.abs(b[1])),
  );

  const board = new Float32Array(count * 3);
  let i = 0;
  for (const [x, z] of cells) {
    const h = tileHeight(Math.round(x), Math.round(z));
    for (let k = 0; k < h && i < count; k++, i++) {
      board[i * 3] = x * pitch;
      board[i * 3 + 1] = BOARD_Y + k * step;
      board[i * 3 + 2] = z * pitch;
    }
    if (i >= count) break;
  }
  return board;
}
