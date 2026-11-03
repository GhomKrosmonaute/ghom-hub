"use client";

import type { AdminMessage } from "@ghom/db/admin";
import { Button } from "@ghom/ui/components/button";
import { Check, Mail, MailOpen, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";
import { DeleteButton } from "@/components/delete-button";
import { toastResult } from "@/lib/toast-result";
import { removeMessage, setMessageState } from "./actions";

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" });

export function MessageView({ message, closeHref }: { message: AdminMessage; closeHref: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const marked = useRef<string | null>(null);

  // Ouvrir un message non lu le marque comme lu (une seule fois).
  useEffect(() => {
    if (message.readAt || marked.current === message.id) return;
    marked.current = message.id;
    void setMessageState(message.id, { read: true });
  }, [message.id, message.readAt]);

  const run = (patch: { read?: boolean; handled?: boolean }) =>
    start(async () => {
      toastResult(await setMessageState(message.id, patch));
    });

  const subject = message.subject || "(sans objet)";
  const reply = `mailto:${message.email}?subject=${encodeURIComponent(`Re: ${subject}`)}`;

  return (
    <article className="p-6">
      <header className="border-b border-white/8 pb-4">
        <p className="hud-label">{dateFmt.format(new Date(message.createdAt))}</p>
        <h2 className="mt-1 font-display text-2xl font-bold">{subject}</h2>
        <p className="mt-1 font-mono text-sm">
          {message.name} · <span className="text-neon-1">{message.email}</span>
        </p>
      </header>
      <p className="mt-5 whitespace-pre-wrap leading-relaxed text-foreground/90">
        {message.message}
      </p>
      <div className="mt-8 flex flex-wrap gap-2 border-t border-white/8 pt-5">
        <Button asChild>
          <a href={reply}>
            <Mail /> Répondre
          </a>
        </Button>
        {message.handled ? (
          <Button variant="outline" disabled={pending} onClick={() => run({ handled: false })}>
            <RotateCcw /> Rouvrir
          </Button>
        ) : (
          <Button variant="outline" disabled={pending} onClick={() => run({ handled: true })}>
            <Check /> Marquer traité
          </Button>
        )}
        <Button variant="ghost" disabled={pending} onClick={() => run({ read: false })}>
          <MailOpen /> Non lu
        </Button>
        <span className="ml-auto">
          <DeleteButton
            name={`le message de ${message.name}`}
            onConfirm={() =>
              start(async () => {
                if (toastResult(await removeMessage(message.id))) router.push(closeHref);
              })
            }
          >
            <Button variant="ghost" className="hover:text-destructive">
              <Trash2 /> Supprimer
            </Button>
          </DeleteButton>
        </span>
      </div>
    </article>
  );
}
