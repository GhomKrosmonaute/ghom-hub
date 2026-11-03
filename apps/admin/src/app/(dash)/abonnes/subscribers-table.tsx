"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ghom/ui/components/table";
import { useTransition } from "react";
import { DeleteButton } from "@/components/delete-button";
import { toastResult } from "@/lib/toast-result";
import { removeSubscriber } from "./actions";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export function SubscribersTable({
  subscribers,
}: {
  subscribers: { id: string; email: string; source: string; createdAt: string }[];
}) {
  const [pending, start] = useTransition();
  return (
    <div className={`border border-white/8 bg-[#05060b]/80 ${pending ? "opacity-70" : ""}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>E-mail</TableHead>
            <TableHead className="max-sm:hidden">Source</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscribers.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                Aucun abonné.
              </TableCell>
            </TableRow>
          )}
          {subscribers.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-sm">{s.email}</TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground max-sm:hidden">
                {s.source}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {dateFmt.format(new Date(s.createdAt))}
              </TableCell>
              <TableCell className="text-right">
                <DeleteButton
                  name={s.email}
                  onConfirm={() =>
                    start(async () => void toastResult(await removeSubscriber(s.id)))
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
