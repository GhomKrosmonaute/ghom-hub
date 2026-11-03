import { SITES } from "@ghom/content";
import { LOCALES } from "@ghom/core";
import { listOverrides } from "@ghom/db/admin";
import { cn } from "@ghom/ui/lib/utils";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { defaultEntries, isSite, SITE_LABEL } from "./defaults";
import { type TranslationRow, TranslationsTable } from "./translations-table";

export const metadata = { title: "Traductions" };

export default async function TranslationsPage({ searchParams }: PageProps<"/traductions">) {
  const { site: raw } = await searchParams;
  const site = isSite(raw) ? raw : "HUB";
  const overrides = await listOverrides(site);
  const byKey = new Map(overrides.map((o) => [`${o.locale}:${o.key}`, o.value]));

  const [fr, en] = LOCALES.map((l) => defaultEntries(site, l));
  const enMap = new Map(en?.map((e) => [e.key, e.value]));
  const rows: TranslationRow[] = (fr ?? []).map((e) => ({
    key: e.key,
    fr: { default: e.value, override: byKey.get(`fr:${e.key}`) ?? null },
    en: { default: enMap.get(e.key) ?? "", override: byKey.get(`en:${e.key}`) ?? null },
  }));

  return (
    <>
      <PageHeader kicker="Interface · FR / EN" title="Traductions" />
      <div className="mb-4 flex flex-wrap gap-2">
        {SITES.map((s) => (
          <Link
            key={s}
            href={`/traductions?site=${s}`}
            aria-current={s === site ? "page" : undefined}
            className={cn(
              "cyber-clip-sm border px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.15em]",
              s === site
                ? "border-neon-1 bg-neon-1 text-black"
                : "border-white/10 text-muted-foreground hover:text-foreground",
            )}
          >
            {SITE_LABEL[s]}
          </Link>
        ))}
      </div>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
        Chaque texte de l&apos;interface peut être remplacé ici. Le texte d&apos;origine reste dans
        le code et revient avec « Réinitialiser ». Les variables entre accolades (ex.{" "}
        <code>{"{count}"}</code>) doivent être conservées.
      </p>
      <TranslationsTable key={site} site={site} rows={rows} />
    </>
  );
}
