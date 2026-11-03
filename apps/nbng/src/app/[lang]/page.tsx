import { FUNDING_URLS } from "@ghom/content";
import { getProjects } from "@ghom/db";
import { ArcadeShell } from "@/components/arcade/arcade-shell";
import { GameSelect } from "@/components/sections/game-select";
import { Hero } from "@/components/sections/hero";
import { InsertCoin } from "@/components/sections/insert-coin";
import { Studio } from "@/components/sections/studio";
import { getDictionary, getLocale } from "@/i18n/server";
import { domains, HUB_URL, toView, withLocale } from "@/lib/projects";

export const revalidate = 60;

export default async function StudioPage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const { data } = await getProjects("STUDIO");
  const games = data.map((p) => toView(p, locale));
  const hubUrl = withLocale(HUB_URL, locale);

  return (
    <ArcadeShell hubUrl={hubUrl} games={games} rootDomain={domains.rootDomain}>
      <main className="relative z-10">
        <Hero gameCount={games.length} />
        <GameSelect games={games} />
        <Studio
          hubUrl={hubUrl}
          stats={[
            { label: t.studio.stats.games, value: games.length },
            {
              label: t.studio.stats.playable,
              value: games.filter((g) => g.status === "LIVE" || g.status === "BETA").length,
            },
            {
              label: t.studio.stats.inDev,
              value: games.filter((g) => g.status === "IN_DEV" || g.status === "PROTOTYPE").length,
            },
            { label: t.studio.stats.brain, value: 1 },
          ]}
        />
        <InsertCoin />
        <footer className="pixel-font px-8 pt-6 pb-24 text-center text-[0.6rem] text-muted-foreground">
          NO BRAIN NO GAME · {t.footer.by}{" "}
          <a href={hubUrl} className="text-[#00f0ff] hover:underline">
            GHOM.FR
          </a>
          {" · "}
          <a
            href={FUNDING_URLS.studio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-neon-2 hover:underline"
          >
            {t.footer.support}
          </a>
        </footer>
      </main>
    </ArcadeShell>
  );
}
