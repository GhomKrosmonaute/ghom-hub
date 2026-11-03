"use server";

import { type FormState, fieldErrors, isLocale, subscribeSchemaFor } from "@ghom/core";
import { addSubscriber } from "@ghom/db";
import { loadDictionary } from "@/i18n/load";

export async function subscribe(locale: string, input: unknown): Promise<FormState> {
  const lang = isLocale(locale) ? locale : "fr";
  const t = (await loadDictionary(lang)).insertCoin;
  const parsed = subscribeSchemaFor(lang).safeParse(input);
  if (!parsed.success) {
    if (parsed.error.issues.some((i) => i.path[0] === "website")) {
      return { status: "success", message: t.accepted };
    }
    return { status: "error", message: t.rejected, fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await addSubscriber(parsed.data, "nbng");
    return { status: "success", message: t.acceptedDetail };
  } catch (error) {
    console.error("[subscribe]", error);
    return { status: "error", message: t.outOfOrder };
  }
}
