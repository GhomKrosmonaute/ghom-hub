import type { Locale } from "@ghom/core";
import { DollarSign, Euro } from "lucide-react";

/** Icône des liens de soutien : € en français, $ en anglais. */
export function CurrencyIcon({ locale, className }: { locale: Locale; className?: string }) {
  return locale === "en" ? <DollarSign className={className} /> : <Euro className={className} />;
}
