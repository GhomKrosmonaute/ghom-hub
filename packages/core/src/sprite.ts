import { hashString } from "./catalog";

/**
 * Sprite pixel façon "space invader", symétrique horizontalement,
 * dérivé de façon déterministe d'une graine (le slug d'un jeu).
 * Renvoie une grille [ligne][colonne] de booléens.
 */
export function pixelSprite(seed: string, width = 11, height = 9): boolean[][] {
  let state = hashString(seed) || 1;
  const next = () => {
    // xorshift32
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  const half = Math.ceil(width / 2);
  const grid: boolean[][] = [];
  for (let y = 0; y < height; y++) {
    const row: boolean[] = new Array(width).fill(false);
    for (let x = 0; x < half; x++) {
      // plus dense vers le centre pour obtenir une silhouette lisible
      const center = 1 - Math.abs(x - half + 1) / half;
      const on = next() < 0.35 + center * 0.3;
      row[x] = on;
      row[width - 1 - x] = on;
    }
    grid.push(row);
  }
  // garantit au moins une colonne centrale pleine (le "corps")
  const mid = Math.floor(width / 2);
  for (let y = 1; y < height - 1; y++) {
    grid[y]![mid] = true;
    grid[y]![width - 1 - mid] = true;
  }
  return grid;
}
