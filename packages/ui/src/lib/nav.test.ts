import { describe, expect, test } from "bun:test";
import { wantsNativeMenu } from "./nav";

const el = (editable: boolean) =>
  ({ closest: () => (editable ? {} : null) }) as unknown as EventTarget;

describe("wantsNativeMenu", () => {
  test("menu du site par défaut", () => {
    expect(wantsNativeMenu({ shiftKey: false, target: el(false) })).toBe(false);
    expect(wantsNativeMenu({ shiftKey: false, target: null }, "")).toBe(false);
  });

  test("menu natif dans les champs, sur sélection, ou avec Maj", () => {
    expect(wantsNativeMenu({ shiftKey: false, target: el(true) })).toBe(true);
    expect(wantsNativeMenu({ shiftKey: false, target: el(false) }, "du texte")).toBe(true);
    expect(wantsNativeMenu({ shiftKey: true, target: el(false) })).toBe(true);
  });
});
