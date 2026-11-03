"use server";

import { deleteMessage, markMessage } from "@ghom/db/admin";
import { requireAdmin } from "@/auth/guard";
import { type ActionResult, done, failure } from "@/lib/actions";

export async function setMessageState(
  id: string,
  patch: { read?: boolean; handled?: boolean },
): Promise<ActionResult> {
  await requireAdmin();
  try {
    await markMessage(id, patch);
    const label =
      patch.handled === true
        ? "Message traité"
        : patch.handled === false
          ? "Message rouvert"
          : patch.read
            ? "Marqué comme lu"
            : "Marqué comme non lu";
    return done(label);
  } catch (error) {
    return failure(error);
  }
}

export async function removeMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteMessage(id);
    return done("Message supprimé");
  } catch (error) {
    return failure(error);
  }
}
