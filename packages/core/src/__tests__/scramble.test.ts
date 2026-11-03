import { describe, expect, test } from "bun:test";
import { clamp, damp, scrambleFrame, telemetry } from "../scramble";

describe("scrambleFrame", () => {
  const rand = () => 0;

  test("progress 1 → texte final", () => {
    expect(scrambleFrame("GHOM", 1, rand)).toBe("GHOM");
  });

  test("progress 0 → tout brouillé (sauf espaces)", () => {
    expect(scrambleFrame("A B", 0, rand, "#")).toBe("# #");
  });

  test("révélation progressive gauche → droite", () => {
    expect(scrambleFrame("ABCD", 0.5, rand, "#")).toBe("AB##");
  });

  test("garde la longueur en caractères (unicode)", () => {
    expect([...scrambleFrame("NÉON", 0.25, Math.random)].length).toBe(4);
  });

  test("borne le progress", () => {
    expect(scrambleFrame("XY", 3, rand, "#")).toBe("XY");
    expect(scrambleFrame("XY", -1, rand, "#")).toBe("##");
  });
});

describe("maths", () => {
  test("damp converge vers la cible", () => {
    let v = 0;
    for (let i = 0; i < 200; i++) v = damp(v, 10, 8, 1 / 60);
    expect(v).toBeCloseTo(10, 3);
  });

  test("damp avec dt=0 ne bouge pas", () => {
    expect(damp(3, 10, 8, 0)).toBe(3);
  });

  test("clamp", () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
  });

  test("telemetry", () => {
    expect(telemetry(7)).toBe("007");
    expect(telemetry(12.345, 3, 1)).toBe("012.3");
    expect(telemetry(-4, 2)).toBe("-04");
  });
});
