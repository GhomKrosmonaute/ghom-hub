import { describe, expect, test } from "bun:test";
import { hashPassword, verifyPassword } from "./password";
import { LoginLimiter } from "./rate-limit";
import { SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

const SECRET = "x".repeat(40);

describe("session", () => {
  test("signée puis vérifiée", async () => {
    const token = await signSession(SECRET);
    expect(await verifySession(token, SECRET)).toBe(true);
  });

  test("rejette signature altérée, autre secret, expiration et formats invalides", async () => {
    const now = Date.now();
    const token = await signSession(SECRET, now);
    const [exp, sig] = token.split(".");
    expect(await verifySession(`${exp}.${sig}x`, SECRET)).toBe(false);
    expect(await verifySession(`${Number(exp) + 999}.${sig}`, SECRET)).toBe(false);
    expect(await verifySession(token, "y".repeat(40))).toBe(false);
    expect(await verifySession(token, SECRET, now + (SESSION_TTL_SECONDS + 1) * 1000)).toBe(false);
    for (const bad of [undefined, "", "abc", "1.2.3", "x.y"]) {
      expect(await verifySession(bad, SECRET)).toBe(false);
    }
  });

  test("secret absent ou trop court : signature impossible, vérification refusée", async () => {
    await expect(signSession("court")).rejects.toThrow();
    expect(await verifySession("1.x", undefined)).toBe(false);
  });
});

describe("mot de passe", () => {
  test("hash puis vérification", async () => {
    const stored = await hashPassword("correct horse battery staple");
    expect(stored).toStartWith("scrypt:");
    expect(stored).not.toContain("$");
    expect(await verifyPassword("correct horse battery staple", stored)).toBe(true);
    expect(await verifyPassword("Correct horse battery staple", stored)).toBe(false);
  });

  test("hash absent ou corrompu → refus", async () => {
    expect(await verifyPassword("x", undefined)).toBe(false);
    expect(await verifyPassword("x", "scrypt:1:2")).toBe(false);
    expect(await verifyPassword("x", "bcrypt:a:b:c:d:e")).toBe(false);
  });
});

describe("LoginLimiter", () => {
  test("bloque après 5 échecs par IP puis libère après la fenêtre", () => {
    const l = new LoginLimiter(5, 100, 1000);
    for (let i = 0; i < 5; i++) l.fail("1.1.1.1", i);
    expect(l.retryAfter("1.1.1.1", 10)).toBeGreaterThan(0);
    expect(l.retryAfter("2.2.2.2", 10)).toBe(0);
    expect(l.retryAfter("1.1.1.1", 1001)).toBe(0);
  });

  test("plafond global contre une attaque distribuée", () => {
    const l = new LoginLimiter(5, 3, 1000);
    l.fail("a", 0);
    l.fail("b", 0);
    l.fail("c", 0);
    expect(l.retryAfter("d", 1)).toBeGreaterThan(0);
  });

  test("reset après une connexion réussie", () => {
    const l = new LoginLimiter(2, 100, 1000);
    l.fail("a", 0);
    l.fail("a", 0);
    l.reset("a");
    expect(l.retryAfter("a", 1)).toBe(0);
  });
});
