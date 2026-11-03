import { describe, expect, test } from "bun:test";
import { cn } from "./utils";

describe("cn", () => {
  test("fusionne et dédoublonne les classes tailwind", () => {
    expect(cn("px-2 text-sm", false && "hidden", "px-4")).toBe("text-sm px-4");
  });
});
