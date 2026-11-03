"use server";

import type { Site } from "@ghom/content";
import { fieldErrors, type Owner, projectInputSchema } from "@ghom/core";
import {
  createProject,
  deleteProject,
  FieldConflictError,
  getProjectById,
  moveProject,
  setProjectPublished,
  updateProject,
} from "@ghom/db/admin";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/auth/guard";
import { type ActionResult, done, failure } from "@/lib/actions";
import { domains } from "@/lib/env";

/** Le hub liste aussi les jeux du studio : un jeu modifié rafraîchit les deux sites. */
function sitesFor(...owners: (Owner | undefined)[]): Site[] {
  return owners.includes("STUDIO") ? ["HUB", "STUDIO"] : ["HUB"];
}

export async function saveProject(id: string | null, input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = projectInputSchema(domains).safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Champs invalides", fieldErrors: fieldErrors(parsed.error) };
  }
  let createdId: string | undefined;
  let previousOwner: Owner | undefined;
  try {
    if (id) {
      previousOwner = (await getProjectById(id))?.owner;
      await updateProject(id, parsed.data);
    } else {
      createdId = (await createProject(parsed.data))?.id;
    }
  } catch (error) {
    if (error instanceof FieldConflictError) {
      return { ok: false, message: error.message, fieldErrors: { [error.field]: [error.message] } };
    }
    return failure(error);
  }
  const result = await done(
    id ? `« ${parsed.data.name} » enregistré` : `« ${parsed.data.name} » créé`,
    sitesFor(parsed.data.owner, previousOwner),
  );
  if (createdId) redirect(`/projets/${createdId}?cree=1`);
  return result;
}

export async function removeProject(id: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    const project = await getProjectById(id);
    await deleteProject(id);
    return done(`« ${project?.name ?? "Projet"} » supprimé`, sitesFor(project?.owner));
  } catch (error) {
    return failure(error);
  }
}

export async function reorderProject(id: string, direction: "up" | "down"): Promise<ActionResult> {
  await requireAdmin();
  try {
    const project = await getProjectById(id);
    await moveProject(id, direction);
    return done("Ordre mis à jour", sitesFor(project?.owner));
  } catch (error) {
    return failure(error);
  }
}

export async function togglePublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin();
  try {
    const project = await setProjectPublished(id, published);
    return done(published ? "Projet publié" : "Projet masqué", sitesFor(project.owner));
  } catch (error) {
    return failure(error);
  }
}
