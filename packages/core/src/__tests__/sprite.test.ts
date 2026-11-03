import { describe, expect, test } from "bun:test";
import { pixelSprite } from "../sprite";

describe("pixelSprite", () => {
  test("dimensions", () => {
    const s = pixelSprite("void-runner", 11, 9);
    expect(s.length).toBe(9);
    for (const row of s) expect(row.length).toBe(11);
  });

  test("déterministe", () => {
    expect(pixelSprite("brawl")).toEqual(pixelSprite("brawl"));
  });

  test("différent selon la graine", () => {
    expect(pixelSprite("a")).not.toEqual(pixelSprite("b"));
  });

  test("symétrique horizontalement", () => {
    for (const row of pixelSprite("neon-crypt", 12, 10)) {
      expect(row).toEqual([...row].reverse());
    }
  });
});
