import { describe, expect, test } from "bun:test";
import { contactSchema, fieldErrors, subscribeSchema } from "../validation";

describe("contactSchema", () => {
  test("accepte un message valide et normalise", () => {
    const r = contactSchema.parse({
      name: "  Neo  ",
      email: " NEO@Matrix.io ",
      message: "Salut, on travaille ensemble ?",
    });
    expect(r).toEqual({
      name: "Neo",
      email: "neo@matrix.io",
      subject: "",
      message: "Salut, on travaille ensemble ?",
      website: "",
    });
  });

  test("rejette email invalide et message trop court", () => {
    const r = contactSchema.safeParse({ name: "Neo", email: "nope", message: "court" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const errs = fieldErrors(r.error);
      expect(Object.keys(errs).sort()).toEqual(["email", "message"]);
    }
  });

  test("honeypot rempli → rejet", () => {
    const r = contactSchema.safeParse({
      name: "Bot",
      email: "bot@spam.io",
      message: "Achetez mes trucs maintenant",
      website: "http://spam",
    });
    expect(r.success).toBe(false);
  });
});

describe("subscribeSchema", () => {
  test("normalise l'email", () => {
    expect(subscribeSchema.parse({ email: " Player1@Arcade.FR" }).email).toBe("player1@arcade.fr");
  });
});
