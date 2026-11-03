import { PROJECT_STATUSES, STATUS_META } from "@ghom/core";
import { dashboardStats } from "@ghom/db/admin";
import Link from "next/link";
import { Card, PageHeader } from "@/components/page-header";

export const metadata = { title: "Tableau de bord" };

const dateFmt = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" });

function Stat({
  label,
  value,
  href,
  tone = "text-neon-1",
}: {
  label: string;
  value: number;
  href: string;
  tone?: string;
}) {
  return (
    <Link
      href={href}
      className="group border border-white/8 bg-[#05060b]/80 p-5 transition-colors hover:border-neon-1/40"
    >
      <p className="hud-label">{label}</p>
      <p className={`mt-1 font-display text-4xl font-bold tabular-nums ${tone}`}>
        {String(value).padStart(2, "0")}
      </p>
    </Link>
  );
}

export default async function DashboardPage() {
  const s = await dashboardStats();
  const totalProjects = Object.values(s.projectsByStatus).reduce((a, b) => a + (b ?? 0), 0);

  return (
    <>
      <PageHeader kicker="Console" title="Tableau de bord" />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Messages non lus"
          value={s.unread}
          href="/messages?filtre=unread"
          tone="text-neon-2"
        />
        <Stat label="À traiter" value={s.pending} href="/messages" />
        <Stat label="Abonnés" value={s.subscribers} href="/abonnes" />
        <Stat
          label="Nouveaux (30 j)"
          value={s.recentSubscribers}
          href="/abonnes"
          tone="text-neon-3"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="hud-label text-neon-2">Derniers messages</h2>
            <Link
              href="/messages"
              className="font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              Tout voir ▸
            </Link>
          </div>
          {s.latestMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun message pour l&apos;instant.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {s.latestMessages.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/messages?id=${m.id}`}
                    className="flex items-baseline gap-3 py-2.5 hover:text-neon-1"
                  >
                    <span
                      className={`size-1.5 shrink-0 rounded-full ${m.readAt || m.handled ? "bg-white/15" : "bg-neon-2"}`}
                    />
                    <span className="truncate font-medium">
                      {m.subject || m.message.slice(0, 60)}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-[0.65rem] text-muted-foreground">
                      {m.name} · {dateFmt.format(m.createdAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="grid gap-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="hud-label text-neon-2">Catalogue · {totalProjects} projets</h2>
              <Link
                href="/projets/nouveau"
                className="font-mono text-xs text-neon-1 hover:underline"
              >
                + Nouveau
              </Link>
            </div>
            <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
              {PROJECT_STATUSES.map((st) => (
                <div key={st} className="flex justify-between border border-white/5 px-3 py-2">
                  <dt className="text-muted-foreground">{STATUS_META[st].label.fr}</dt>
                  <dd className="text-foreground tabular-nums">{s.projectsByStatus[st] ?? 0}</dd>
                </div>
              ))}
            </dl>
          </Card>
          <Card className="p-5">
            <h2 className="hud-label mb-3 text-neon-2">Dernières inscriptions</h2>
            {s.latestSubscribers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Personne encore.</p>
            ) : (
              <ul className="space-y-1.5 font-mono text-xs">
                {s.latestSubscribers.map((sub) => (
                  <li key={sub.id} className="flex justify-between gap-3">
                    <span className="truncate">{sub.email}</span>
                    <span className="shrink-0 text-muted-foreground">
                      {dateFmt.format(sub.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="p-5 font-mono text-xs text-muted-foreground">
            {s.overrides} texte{s.overrides > 1 ? "s" : ""} d&apos;interface personnalisé
            {s.overrides > 1 ? "s" : ""} ·{" "}
            <Link href="/traductions" className="text-neon-1 hover:underline">
              Traductions ▸
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
