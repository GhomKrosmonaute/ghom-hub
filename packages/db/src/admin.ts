/**
 * Requêtes réservées à l'app d'administration (apps/admin).
 * Pas de repli ici : si la base est injoignable, l'admin doit le dire clairement.
 */

import type { ProfileData, Site } from "@ghom/content";
import type { Locale, ProjectFormData, ProjectStatus } from "@ghom/core";
import { getPrisma } from "./client";
import { Prisma } from "./generated/prisma/client";
import { toProject } from "./queries";

// ───────────────────────── Projets ─────────────────────────

export async function listAllProjects() {
  const rows = await getPrisma().project.findMany({
    orderBy: [{ owner: "asc" }, { sortOrder: "asc" }, { name: "asc" }],
  });
  return rows.map((row) => ({
    ...toProject(row),
    published: row.published,
    updatedAt: row.updatedAt,
  }));
}
export type AdminProject = Awaited<ReturnType<typeof listAllProjects>>[number];

export async function getProjectById(id: string) {
  const row = await getPrisma().project.findUnique({ where: { id } });
  return row ? { ...toProject(row), published: row.published } : null;
}

/** Erreur métier lisible (contrainte d'unicité) rattachée à un champ du formulaire. */
export class FieldConflictError extends Error {
  constructor(
    readonly field: string,
    message: string,
  ) {
    super(message);
  }
}

function asConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = String((error.meta as { target?: unknown } | undefined)?.target ?? "");
    if (target.includes("slug")) throw new FieldConflictError("slug", "Ce slug est déjà pris");
    throw new FieldConflictError("subdomain", "Ce sous-domaine est déjà utilisé");
  }
  throw error;
}

export async function createProject(data: ProjectFormData) {
  try {
    return await getPrisma().project.create({ data });
  } catch (error) {
    asConflict(error);
  }
}

export async function updateProject(id: string, data: ProjectFormData) {
  try {
    return await getPrisma().project.update({ where: { id }, data });
  } catch (error) {
    asConflict(error);
  }
}

export async function deleteProject(id: string) {
  return getPrisma().project.delete({ where: { id } });
}

export async function setProjectPublished(id: string, published: boolean) {
  return getPrisma().project.update({ where: { id }, data: { published } });
}

/** Échange la place d'un projet avec son voisin (même propriétaire), puis renumérote 1..n. */
export async function moveProject(id: string, direction: "up" | "down") {
  const prisma = getPrisma();
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  const siblings = await prisma.project.findMany({
    where: { owner: project.owner },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true },
  });
  const ids = siblings.map((s) => s.id);
  const i = ids.indexOf(id);
  const j = direction === "up" ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  await prisma.$transaction(
    ids.map((pid, index) =>
      prisma.project.update({ where: { id: pid }, data: { sortOrder: index + 1 } }),
    ),
  );
}

// ───────────────────────── Messages ─────────────────────────

export type MessageFilter = "unread" | "read" | "handled" | "all";

export async function listMessages(filter: MessageFilter = "all") {
  const where =
    filter === "unread"
      ? { readAt: null, handled: false }
      : filter === "read"
        ? { readAt: { not: null }, handled: false }
        : filter === "handled"
          ? { handled: true }
          : {};
  return getPrisma().contactMessage.findMany({ where, orderBy: { createdAt: "desc" } });
}
export type AdminMessage = Awaited<ReturnType<typeof listMessages>>[number];

export async function getMessage(id: string) {
  return getPrisma().contactMessage.findUnique({ where: { id } });
}

export async function markMessage(id: string, patch: { read?: boolean; handled?: boolean }) {
  return getPrisma().contactMessage.update({
    where: { id },
    data: {
      ...(patch.read === undefined ? {} : { readAt: patch.read ? new Date() : null }),
      ...(patch.handled === undefined ? {} : { handled: patch.handled }),
    },
  });
}

export async function deleteMessage(id: string) {
  return getPrisma().contactMessage.delete({ where: { id } });
}

// ───────────────────────── Abonnés ─────────────────────────

export async function listSubscribers(query = "") {
  const q = query.trim();
  return getPrisma().subscriber.findMany({
    where: q ? { email: { contains: q, mode: "insensitive" } } : {},
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteSubscriber(id: string) {
  return getPrisma().subscriber.delete({ where: { id } });
}

/** Échappement CSV (RFC 4180) + neutralisation des formules tableur (=, +, -, @). */
export function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function subscribersCsv(): Promise<string> {
  const rows = await listSubscribers();
  const lines = rows.map((r) =>
    [r.email, r.source, r.createdAt.toISOString()].map(csvCell).join(","),
  );
  return ["email,source,created_at", ...lines].join("\r\n");
}

// ───────────────────────── Profil & textes ─────────────────────────

export async function saveProfileData(data: ProfileData) {
  const json = data as unknown as Prisma.InputJsonValue;
  return getPrisma().profile.upsert({
    where: { id: "main" },
    create: { id: "main", data: json },
    update: { data: json },
  });
}

export async function resetProfileData() {
  await getPrisma().profile.deleteMany({ where: { id: "main" } });
}

export async function hasCustomProfile() {
  return (await getPrisma().profile.count({ where: { id: "main" } })) > 0;
}

export async function listOverrides(site: Site) {
  return getPrisma().translationOverride.findMany({ where: { site } });
}

export async function setOverride(site: Site, locale: Locale, key: string, value: string) {
  return getPrisma().translationOverride.upsert({
    where: { site_locale_key: { site, locale, key } },
    create: { site, locale, key, value },
    update: { value },
  });
}

export async function resetOverride(site: Site, locale: Locale, key: string) {
  await getPrisma().translationOverride.deleteMany({ where: { site, locale, key } });
}

// ───────────────────────── Tableau de bord ─────────────────────────

export async function dashboardStats() {
  const prisma = getPrisma();
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const [unread, pending, subscribers, recentSubscribers, byStatus, overrides, latest, latestSubs] =
    await Promise.all([
      prisma.contactMessage.count({ where: { readAt: null, handled: false } }),
      prisma.contactMessage.count({ where: { handled: false } }),
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { createdAt: { gte: since } } }),
      prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.translationOverride.count(),
      prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
      prisma.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);
  return {
    unread,
    pending,
    subscribers,
    recentSubscribers,
    projectsByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])) as Partial<
      Record<ProjectStatus, number>
    >,
    overrides,
    latestMessages: latest,
    latestSubscribers: latestSubs,
  };
}
