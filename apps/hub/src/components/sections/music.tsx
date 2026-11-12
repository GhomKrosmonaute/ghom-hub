import { albums } from "@ghom/content";
import type { CSSProperties } from "react";
import { getDictionary } from "@/i18n/server";
import { sectionCode } from "../hud/sections";
import { MusicPlayer } from "../music/player";
import { SectionHeader } from "./section-header";

/** Mes albums SoundCloud, avec un visualiseur 3D qui suit la piste en cours. */
export async function Music() {
  const t = await getDictionary();
  const { kicker, title, intro, ...texts } = t.music;
  return (
    <section
      id="musique"
      className="relative scroll-mt-10 px-6 py-28 md:px-28 lg:px-40"
      style={{ "--glow": "#ff2fd6" } as CSSProperties}
    >
      <SectionHeader code={sectionCode("musique")} kicker={kicker} title={title} />
      <p className="mb-10 max-w-2xl text-lg leading-relaxed text-foreground/75">{intro}</p>
      <MusicPlayer albums={albums} t={texts} />
    </section>
  );
}
