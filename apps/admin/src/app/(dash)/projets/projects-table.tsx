"use client";

import {
  KIND_META,
  type Owner,
  PROJECT_STATUSES,
  type ProjectStatus,
  STATUS_META,
} from "@ghom/core";
import type { AdminProject } from "@ghom/db/admin";
import { Button } from "@ghom/ui/components/button";
import { Switch } from "@ghom/ui/components/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ghom/ui/components/table";
import { cn } from "@ghom/ui/lib/utils";
import { ArrowDown, ArrowUp, Pencil, Star } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { DeleteButton } from "@/components/delete-button";
import { toastResult } from "@/lib/toast-result";
import { removeProject, reorderProject, togglePublished } from "./actions";

type Row = Omit<AdminProject, "updatedAt">;

const OWNER_LABEL: Record<Owner, string> = { PERSONAL: "ghom.fr", STUDIO: "Studio" };

export function ProjectsTable({ projects }: { projects: Row[] }) {
  const [owner, setOwner] = useState<Owner>("PERSONAL");
  const [status, setStatus] = useState<ProjectStatus | "ALL">("ALL");
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<Parameters<typeof toastResult>[0]>) =>
    start(async () => {
      toastResult(await fn());
    });

  const rows = projects.filter(
    (p) => p.owner === owner && (status === "ALL" || p.status === status),
  );

  const chip = (on: boolean) =>
    cn(
      "cyber-clip-sm border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em] transition-colors",
      on
        ? "border-neon-1 bg-neon-1 text-black"
        : "border-white/10 text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["PERSONAL", "STUDIO"] as const).map((o) => (
          <button
            key={o}
            type="button"
            className={chip(owner === o)}
            aria-pressed={owner === o}
            onClick={() => setOwner(o)}
          >
            {OWNER_LABEL[o]} · {projects.filter((p) => p.owner === o).length}
          </button>
        ))}
        <span className="mx-2 h-5 w-px bg-white/10" />
        {(["ALL", ...PROJECT_STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={chip(status === s)}
            aria-pressed={status === s}
            onClick={() => setStatus(s)}
          >
            {s === "ALL" ? "Tous" : STATUS_META[s].label.fr}
          </button>
        ))}
      </div>

      <div className={cn("border border-white/8 bg-[#05060b]/80", pending && "opacity-70")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Ordre</TableHead>
              <TableHead>Projet</TableHead>
              <TableHead className="max-md:hidden">Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="max-lg:hidden">Sous-domaine</TableHead>
              <TableHead className="w-24">Publié</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Aucun projet ici.
                </TableCell>
              </TableRow>
            )}
            {rows.map((p, i) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="flex items-center gap-0.5">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      aria-label={`Monter ${p.name}`}
                      disabled={pending || i === 0 || status !== "ALL"}
                      onClick={() => run(() => reorderProject(p.id, "up"))}
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7"
                      aria-label={`Descendre ${p.name}`}
                      disabled={pending || i === rows.length - 1 || status !== "ALL"}
                      onClick={() => run(() => reorderProject(p.id, "down"))}
                    >
                      <ArrowDown />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Link href={`/projets/${p.id}`} className="group flex items-center gap-2.5">
                    <span className="size-2.5 shrink-0" style={{ background: p.accent }} />
                    <span className="font-medium group-hover:text-neon-1">{p.name}</span>
                    {p.featured && (
                      <Star
                        className="size-3.5 fill-neon-3 text-neon-3"
                        aria-label="Mis en avant"
                      />
                    )}
                  </Link>
                  <p className="truncate pl-5 text-xs text-muted-foreground">{p.tagline}</p>
                </TableCell>
                <TableCell className="font-mono text-xs max-md:hidden">
                  {KIND_META[p.kind].label.fr}
                </TableCell>
                <TableCell className="font-mono text-[0.65rem] tracking-[0.1em]">
                  {STATUS_META[p.status].stock.fr}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground max-lg:hidden">
                  {p.subdomain ?? "—"}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={p.published}
                    disabled={pending}
                    aria-label={`Publier ${p.name}`}
                    onCheckedChange={(v) => run(() => togglePublished(p.id, v))}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button asChild size="icon" variant="ghost" className="size-7">
                    <Link href={`/projets/${p.id}`} aria-label={`Modifier ${p.name}`}>
                      <Pencil />
                    </Link>
                  </Button>
                  <DeleteButton
                    name={p.name}
                    description="Cette action est définitive. Pour simplement le cacher des sites, désactive plutôt « Publié »."
                    onConfirm={() => run(() => removeProject(p.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {status !== "ALL" && (
        <p className="font-mono text-xs text-muted-foreground">
          Le réordonnancement n&apos;est disponible qu&apos;avec le filtre « Tous ».
        </p>
      )}
    </div>
  );
}
