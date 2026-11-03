"use client";

import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { toast } from "sonner";
import type { ActionResult } from "./actions";

/** Affiche le résultat d'une Server Action ; renvoie true si elle a réussi. */
export function toastResult(result: ActionResult): boolean {
  if (result.ok) {
    toast.success(result.message);
    if (result.warning) toast.warning(result.warning);
    return true;
  }
  playSfx("error");
  toast.error(result.message);
  return false;
}
