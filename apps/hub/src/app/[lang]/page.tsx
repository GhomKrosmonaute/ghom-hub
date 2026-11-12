import { getProjects } from "@ghom/db";
import { Cockpit } from "@/components/hud/cockpit";
import { Arsenal } from "@/components/sections/arsenal";
import { Claude } from "@/components/sections/claude";
import { Comms } from "@/components/sections/comms";
import { Footer } from "@/components/sections/footer";
import { Hero } from "@/components/sections/hero";
import { Music } from "@/components/sections/music";
import { Pilot } from "@/components/sections/pilot";
import { PlayCurious } from "@/components/sections/play-curious";
import { StudioLink } from "@/components/sections/studio-link";
import { getDictionary, getLocale } from "@/i18n/server";
import { domains, STUDIO_URL, toView, withLocale } from "@/lib/projects";

// Régénération ISR : la page reste statique et se met à jour toutes les minutes.
export const revalidate = 60;

export default async function HomePage() {
  const [locale, t] = await Promise.all([getLocale(), getDictionary()]);
  const [personal, studio] = await Promise.all([getProjects("PERSONAL"), getProjects("STUDIO")]);
  const projects = personal.data.map((p) => toView(p, locale));
  const games = studio.data.map((p) => toView(p, locale));
  const offline = personal.source === "fallback";
  const studioUrl = withLocale(STUDIO_URL, locale);

  return (
    <Cockpit
      projects={projects}
      studioUrl={studioUrl}
      offline={offline}
      rootDomain={domains.rootDomain}
    >
      <main className="relative z-10">
        <Hero
          stats={[
            {
              label: t.hero.units,
              value: projects.filter((p) => p.status !== "ARCHIVED").length,
            },
            { label: t.hero.online, value: projects.filter((p) => p.status === "LIVE").length },
            { label: t.hero.games, value: games.length },
          ]}
        />
        <Pilot />
        <PlayCurious />
        <Claude />
        <Arsenal projects={projects} />
        <StudioLink games={games} studioUrl={studioUrl} />
        <Music />
        <Comms />
      </main>
      <div className="relative z-10">
        <Footer studioUrl={studioUrl} />
      </div>
    </Cockpit>
  );
}
