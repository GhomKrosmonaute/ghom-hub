"use client";

import { playSfx } from "@ghom/ui/hooks/use-sfx";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useI18n } from "@/i18n/client";
import { controls, nowPlaying } from "../music/audio-state";
import { goTo } from "./sections";

const SECTION_ID = "musique";

/** Vrai tant qu'une partie de la section musique est à l'écran. */
function useSectionVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = document.getElementById(SECTION_ID);
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(Boolean(e?.isIntersecting)), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return visible;
}

const btn =
  "pointer-events-auto grid size-7 shrink-0 place-items-center text-foreground/80 transition hover:text-neon-2 focus-visible:outline focus-visible:outline-neon-2";

/** Mini-lecteur du HUD : visible quand une piste est chargée et que la section musique est hors champ. */
export function MiniPlayer() {
  const { t } = useI18n();
  const np = useSyncExternalStore(
    nowPlaying.subscribe,
    nowPlaying.getSnapshot,
    nowPlaying.getServerSnapshot,
  );
  const inView = useSectionVisible();
  const show = Boolean(np) && !inView;
  const m = t.music;
  const progress = np ? Math.min(np.time / np.duration, 1) : 0;

  return (
    <div
      aria-hidden={!show}
      inert={!show}
      className={`pointer-events-none absolute right-3 bottom-[5.5rem] left-3 transition duration-300 motion-reduce:transition-none sm:right-auto sm:w-80 md:left-24 lg:bottom-12 ${
        show ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 motion-reduce:translate-y-0"
      }`}
    >
      {np && (
        <div
          className={`cyber-clip-sm flex flex-col gap-1.5 border border-neon-2/40 bg-[#05060b]/90 p-2.5 backdrop-blur-md ${show ? "pointer-events-auto" : ""}`}
        >
          <div className="flex items-center gap-2">
            {/* biome-ignore lint/performance/noImgElement: pochette servie par SoundCloud */}
            <img src={np.artwork} alt="" className="size-10 shrink-0 object-cover" />
            <button
              type="button"
              aria-label={t.miniPlayer.open}
              onClick={() => {
                playSfx("click");
                goTo(SECTION_ID);
              }}
              title={`${np.title} · ${np.album}`}
              className="min-w-0 flex-1 text-left"
            >
              <span className="block truncate font-display text-sm font-bold uppercase text-neon-2">
                {np.title}
              </span>
              <span className="hud-label block truncate text-foreground/70">{np.album}</span>
            </button>
            <button
              type="button"
              aria-label={m.prev}
              onClick={() => controls.current?.prev()}
              className={btn}
            >
              <SkipBack className="size-4" />
            </button>
            <button
              type="button"
              aria-label={np.playing ? m.pause : m.play}
              onClick={() => controls.current?.toggle()}
              className={btn}
            >
              {np.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
            <button
              type="button"
              aria-label={m.next}
              onClick={() => controls.current?.next()}
              className={btn}
            >
              <SkipForward className="size-4" />
            </button>
          </div>
          {/* Progression cliquable */}
          <button
            type="button"
            aria-label={m.seek}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              controls.current?.seek(Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1));
            }}
            className="group -my-1 flex h-3 w-full items-center"
          >
            <span className="block h-1 w-full bg-white/20">
              <span className="block h-full bg-neon-2" style={{ width: `${progress * 100}%` }} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
