import { describe, expect, test } from "bun:test";
import { BOARD_Y, buildBrain } from "./brain-voxels";

describe("buildBrain", () => {
  const brain = buildBrain(0.1, 0.2, () => 0.5);

  test("tailles des buffers cohérentes", () => {
    expect(brain.count).toBeGreaterThan(500);
    expect(brain.home.length).toBe(brain.count * 3);
    expect(brain.board.length).toBe(brain.count * 3);
    expect(brain.seed.length).toBe(brain.count);
  });

  test("scissure inter-hémisphérique vide (au-dessus du tronc)", () => {
    for (let i = 0; i < brain.count; i++) {
      const x = brain.home[i * 3]!;
      const y = brain.home[i * 3 + 1]!;
      if (y > -0.34) expect(Math.abs(x)).toBeGreaterThanOrEqual(0.07);
    }
  });

  test("symétrie gauche/droite approximative", () => {
    let left = 0;
    let right = 0;
    for (let i = 0; i < brain.count; i++) brain.home[i * 3]! < 0 ? left++ : right++;
    expect(Math.abs(left - right) / brain.count).toBeLessThan(0.1);
  });

  test("le plateau aligne chaque voxel sur une case, au-dessus de la base", () => {
    const pitch = brain.step * 1.18;
    const half = (n: number) => Math.abs(n / pitch - Math.round((n / pitch) * 2) / 2);
    for (let i = 0; i < brain.count; i++) {
      const x = brain.board[i * 3]!;
      const y = brain.board[i * 3 + 1]!;
      const z = brain.board[i * 3 + 2]!;
      expect(y).toBeGreaterThanOrEqual(BOARD_Y - 1e-4);
      expect(half(x)).toBeLessThan(1e-3);
      expect(half(z)).toBeLessThan(1e-3);
    }
  });

  test("aucune case n'accueille deux voxels au même étage", () => {
    const seen = new Set<string>();
    for (let i = 0; i < brain.count; i++) {
      const key = [0, 1, 2].map((k) => brain.board[i * 3 + k]!.toFixed(3)).join("|");
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
});
