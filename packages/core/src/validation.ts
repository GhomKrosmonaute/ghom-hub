import { z } from "zod";
import { DEFAULT_LOCALE, fill, type Locale, type Localized } from "./i18n";

const MESSAGES: Localized<{
  max: string;
  nameShort: string;
  messageShort: string;
  email: string;
}> = {
  fr: {
    max: "{max} caractères maximum",
    nameShort: "Indicatif trop court (2 caractères min.)",
    messageShort: "Message trop court (10 caractères min.)",
    email: "Adresse e-mail invalide",
  },
  en: {
    max: "{max} characters maximum",
    nameShort: "Call sign too short (2 characters min.)",
    messageShort: "Message too short (10 characters min.)",
    email: "Invalid e-mail address",
  },
};

/** Schéma du formulaire de contact, messages d'erreur dans la langue demandée. */
export function contactSchemaFor(locale: Locale) {
  const m = MESSAGES[locale];
  const max = (n: number) => fill(m.max, { max: n });
  return z.object({
    name: z.string().trim().min(2, m.nameShort).max(80, max(80)),
    email: z.string().trim().toLowerCase().email(m.email),
    subject: z.string().trim().max(120, max(120)).optional().default(""),
    message: z.string().trim().min(10, m.messageShort).max(4000, max(4000)),
    /** Honeypot anti-bot : doit rester vide. */
    website: z.string().max(0).optional().default(""),
  });
}
export const contactSchema = contactSchemaFor(DEFAULT_LOCALE);
export type ContactInput = z.input<typeof contactSchema>;
export type ContactData = z.output<typeof contactSchema>;

export function subscribeSchemaFor(locale: Locale) {
  return z.object({
    email: z.string().trim().toLowerCase().email(MESSAGES[locale].email),
    website: z.string().max(0).optional().default(""),
  });
}
export const subscribeSchema = subscribeSchemaFor(DEFAULT_LOCALE);
export type SubscribeInput = z.input<typeof subscribeSchema>;

export type FormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[]> };

/** Aplati les erreurs zod en { champ: [messages] } pour l'UI. */
export function fieldErrors(error: z.ZodError): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = [];
    out[key].push(issue.message);
  }
  return out;
}
