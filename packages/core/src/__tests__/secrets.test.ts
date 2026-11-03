import { describe, expect, test } from "bun:test";
import { isBearerAuthorized, safeEqual } from "../secrets";

describe("secrets", () => {
  test("safeEqual", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
  });

  test("isBearerAuthorized", () => {
    const secret = "0123456789abcdef-secret";
    expect(isBearerAuthorized(`Bearer ${secret}`, secret)).toBe(true);
    expect(isBearerAuthorized(`Bearer ${secret}x`, secret)).toBe(false);
    expect(isBearerAuthorized(secret, secret)).toBe(false);
    expect(isBearerAuthorized(null, secret)).toBe(false);
    expect(isBearerAuthorized("Bearer short", "short")).toBe(false);
    expect(isBearerAuthorized("Bearer ", undefined)).toBe(false);
  });
});
