"use server";

import { contactSchemaFor, type FormState, fieldErrors, isLocale } from "@ghom/core";
import { saveContactMessage } from "@ghom/db";
import { loadDictionary } from "@/i18n/load";

export async function sendContact(locale: string, input: unknown): Promise<FormState> {
  const lang = isLocale(locale) ? locale : "fr";
  const t = (await loadDictionary(lang)).contact;
  const parsed = contactSchemaFor(lang).safeParse(input);
  if (!parsed.success) {
    // Honeypot rempli : on fait semblant que tout va bien.
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return { status: "success", message: t.received };
    }
    return { status: "error", message: t.invalid, fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await saveContactMessage(parsed.data);
    return { status: "success", message: t.receivedDelay };
  } catch (error) {
    console.error("[contact]", error);
    return { status: "error", message: t.serverDown };
  }
}
