import { getMessage, listMessages, type MessageFilter } from "@ghom/db/admin";
import { cn } from "@ghom/ui/lib/utils";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MessageView } from "./message-view";

export const metadata = { title: "Messages" };

const FILTERS: { value: MessageFilter; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "unread", label: "Non lus" },
  { value: "read", label: "Lus" },
  { value: "handled", label: "Traités" },
];

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });

export default async function MessagesPage({ searchParams }: PageProps<"/messages">) {
  const sp = await searchParams;
  const filter = FILTERS.find((f) => f.value === sp.filtre)?.value ?? "all";
  const id = typeof sp.id === "string" ? sp.id : undefined;
  const [messages, selected] = await Promise.all([
    listMessages(filter),
    id ? getMessage(id) : Promise.resolve(null),
  ]);
  const href = (params: { filtre?: string; id?: string }) => {
    const q = new URLSearchParams();
    const f = params.filtre ?? filter;
    if (f !== "all") q.set("filtre", f);
    if (params.id) q.set("id", params.id);
    const s = q.toString();
    return s ? `/messages?${s}` : "/messages";
  };

  return (
    <>
      <PageHeader kicker="Comms" title="Messages" />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={href({ filtre: f.value })}
            aria-current={filter === f.value ? "page" : undefined}
            className={cn(
              "cyber-clip-sm border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em]",
              filter === f.value
                ? "border-neon-1 bg-neon-1 text-black"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(260px,360px)_1fr]">
        <ul className="max-h-[70vh] divide-y divide-white/5 overflow-y-auto border border-white/8 bg-[#05060b]/80">
          {messages.length === 0 && (
            <li className="p-6 text-center text-sm text-muted-foreground">Rien ici.</li>
          )}
          {messages.map((m) => {
            const unread = !m.readAt && !m.handled;
            return (
              <li key={m.id}>
                <Link
                  href={href({ id: m.id })}
                  aria-current={m.id === id ? "true" : undefined}
                  className={cn(
                    "block border-l-2 px-4 py-3 transition-colors hover:bg-white/5",
                    m.id === id ? "border-neon-1 bg-neon-1/5" : "border-transparent",
                  )}
                >
                  <div className="flex items-baseline gap-2">
                    {unread && (
                      <>
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-neon-2" />
                        <span className="sr-only">Non lu :</span>
                      </>
                    )}
                    <span className={cn("truncate", unread && "font-semibold")}>{m.name}</span>
                    <span className="ml-auto shrink-0 font-mono text-[0.6rem] text-muted-foreground">
                      {dateFmt.format(m.createdAt)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {m.handled && "✓ "}
                    {m.subject || m.message}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="border border-white/8 bg-[#05060b]/80">
          {selected ? (
            <MessageView message={selected} closeHref={href({})} />
          ) : (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Sélectionne un message.
            </p>
          )}
        </div>
      </div>
    </>
  );
}
