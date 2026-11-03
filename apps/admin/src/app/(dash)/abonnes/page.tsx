import { listSubscribers } from "@ghom/db/admin";
import { Download, Search } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { SubscribersTable } from "./subscribers-table";

export const metadata = { title: "Abonnés" };

export default async function SubscribersPage({ searchParams }: PageProps<"/abonnes">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const subscribers = await listSubscribers(query);

  return (
    <>
      <PageHeader kicker="Newsletter · Insert coin" title="Abonnés">
        <a
          href="/abonnes/export"
          className="cyber-clip-sm inline-flex items-center gap-2 border border-neon-1/50 px-4 py-2 font-mono text-xs uppercase tracking-[0.15em] text-neon-1 hover:bg-neon-1/10"
        >
          <Download className="size-4" /> Export CSV
        </a>
      </PageHeader>
      <search className="relative mb-4 block max-w-sm">
        <form>
          <label htmlFor="q" className="sr-only">
            Rechercher un e-mail
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neon-1/70" />
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder="Rechercher un e-mail…"
            className="h-9 w-full border border-white/10 bg-black/40 pr-3 pl-9 font-mono text-sm outline-none focus:border-neon-1/60"
          />
        </form>
      </search>
      <SubscribersTable
        subscribers={subscribers.map((s) => ({
          id: s.id,
          email: s.email,
          source: s.source,
          createdAt: s.createdAt.toISOString(),
        }))}
      />
      <p className="mt-3 font-mono text-xs text-muted-foreground">
        {subscribers.length} abonné{subscribers.length > 1 ? "s" : ""}
        {query && ` pour « ${query} »`}
      </p>
    </>
  );
}
