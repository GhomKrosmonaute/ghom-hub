"use server";

import { deleteSubscriber } from "@ghom/db/admin";
import { requireAdmin } from "@/auth/guard";
import { type ActionResult, done, failure } from "@/lib/actions";

export async function removeSubscriber(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await deleteSubscriber(id);
    return done("Abonné supprimé");
  } catch (error) {
    return failure(error);
  }
}
