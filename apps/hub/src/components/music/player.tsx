"use client";

import { type Album, SOUNDCLOUD_PROFILE } from "@ghom/content";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "./audio-state";

const Visualizer = dynamic(() => import("./visualizer"), { ssr: false });

type Texts = {
  tracks: string;
  play: string;
  pause: string;
  next: string;
  prev: string;
  nowPlaying: string;
  idle: string;
  loading: string;
  profile: string;
  albums: string;
};

/** Sous-ensemble utile de l'API du widget SoundCloud (w.soundcloud.com/player/api.js). */
type Widget = {
  bind: (event: string, cb: (e?: { currentPosition?: number }) => void) => void;
  play: () => void;
  pause: () => void;
  skip: (index: number) => void;
  load: (url: string, opts: Record<string, unknown>) => void;
  getCurrentSoundIndex: (cb: (i: number) => void) => void;
};
type SCApi = {
  Widget: ((el: HTMLIFrameElement) => Widget) & { Events: Record<string, string> };
};
declare global {
  interface Window {
    SC?: SCApi;
  }
}

const API = "https://w.soundcloud.com/player/api.js";
const widgetSrc = (album: Album) =>
  `https://w.soundcloud.com/player/?url=${encodeURIComponent(
    `https://api.soundcloud.com/playlists/${album.id}`,
  )}&color=%23ff2fd6&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false`;

function loadApi(): Promise<SCApi> {
  if (window.SC) return Promise.resolve(window.SC);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${API}"]`);
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => (window.SC ? resolve(window.SC) : reject()));
    s.addEventListener("error", () => reject());
    if (!existing) {
      s.src = API;
      s.async = true;
      document.head.appendChild(s);
    }
  });
}

const mmss = (ms: number) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/** Lecteur des albums : widget SoundCloud officiel (barre compacte) piloté par une interface maison. */
export function MusicPlayer({ albums, t }: { albums: Album[]; t: Texts }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const widget = useRef<Widget | null>(null);
  const pending = useRef<number | null>(null);
  const [albumIdx, setAlbumIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);
  const album = albums[albumIdx] as Album;
  const albumRef = useRef(album);
  albumRef.current = album;

  // Le widget (et le visualiseur) ne se chargent qu'à l'approche de la section.
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(!!e?.isIntersecting), {
      rootMargin: "300px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (visible) setArmed(true);
  }, [visible]);

  /** Widget prêt (premier chargement ou album changé) : joue la piste demandée entre-temps. */
  const flush = useCallback(() => {
    setReady(true);
    if (pending.current !== null) {
      widget.current?.skip(pending.current);
      pending.current = null;
    }
  }, []);

  const syncIndex = useCallback(() => {
    widget.current?.getCurrentSoundIndex((i) => {
      setTrackIdx(i);
      audio.track = albumRef.current.tracks[i] ?? null;
    });
  }, []);

  useEffect(() => {
    if (!armed || !frame.current) return;
    let cancelled = false;
    loadApi()
      .then((SC) => {
        if (cancelled || !frame.current) return;
        const w = SC.Widget(frame.current);
        const E = SC.Widget.Events;
        widget.current = w;
        w.bind(E.READY as string, flush);
        w.bind(E.PLAY as string, () => {
          audio.playing = true;
          audio.at = performance.now();
          setPlaying(true);
          syncIndex();
        });
        const stop = () => {
          audio.playing = false;
          setPlaying(false);
        };
        w.bind(E.PAUSE as string, stop);
        w.bind(E.FINISH as string, stop);
        w.bind(E.PLAY_PROGRESS as string, (e) => {
          audio.position = e?.currentPosition ?? 0;
          audio.at = performance.now();
        });
        w.bind(E.SEEK as string, (e) => {
          audio.position = e?.currentPosition ?? 0;
          audio.at = performance.now();
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      audio.playing = false;
    };
  }, [armed, syncIndex, flush]);

  const pickAlbum = (i: number) => {
    if (i === albumIdx) return;
    setAlbumIdx(i);
    setTrackIdx(-1);
    setPlaying(false);
    audio.playing = false;
    audio.track = null;
    const a = albums[i] as Album;
    setReady(false);
    widget.current?.load(`https://api.soundcloud.com/playlists/${a.id}`, {
      auto_play: false,
      color: "#ff2fd6",
      show_comments: false,
      show_teaser: false,
      visual: false,
      callback: flush,
    });
  };

  const playTrack = (i: number) => {
    const w = widget.current;
    if (i === trackIdx) {
      if (playing) w?.pause();
      else w?.play();
      return;
    }
    audio.track = album.tracks[i] ?? null;
    audio.position = 0;
    audio.at = performance.now();
    setTrackIdx(i);
    if (!w || !ready) {
      pending.current = i;
      return;
    }
    w.skip(i);
  };

  const step = (d: number) => {
    const n = album.tracks.length;
    playTrack(((trackIdx < 0 ? 0 : trackIdx + d) + n) % n);
  };

  const current = trackIdx >= 0 ? album.tracks[trackIdx] : undefined;

  return (
    <div ref={root} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Visualiseur */}
      <div className="cyber-clip relative flex min-h-80 flex-col overflow-hidden border border-white/5 bg-[#05060b]/80 backdrop-blur-md lg:min-h-[30rem]">
        <div className="absolute inset-0">
          {armed && <Visualizer reduced={reduced} active={visible} />}
        </div>
        <div className="pointer-events-none relative mt-auto bg-gradient-to-t from-[#05060b] via-[#05060b]/80 to-transparent p-5 pt-16">
          <p className="hud-label flex items-center gap-2 text-neon-2">
            <span
              className={`size-1.5 rounded-full ${playing ? "animate-blink bg-neon-2" : "bg-white/30"}`}
            />
            {current ? t.nowPlaying : armed && !ready ? t.loading : t.idle}
          </p>
          {current && (
            <p className="mt-1 truncate font-display text-xl font-bold uppercase">
              {current.title}
              <span className="ml-2 font-mono text-xs font-normal normal-case text-muted-foreground">
                {album.title}
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Albums + pistes */}
      <div className="cyber-clip flex flex-col border border-white/5 bg-[#05060b]/80 p-5 backdrop-blur-md">
        <p className="hud-label mb-3">{t.albums}</p>
        <div className="grid grid-cols-4 gap-2">
          {albums.map((a, i) => (
            <button
              key={a.id}
              type="button"
              onClick={() => pickAlbum(i)}
              aria-pressed={i === albumIdx}
              className={`group relative overflow-hidden border text-left transition ${
                i === albumIdx
                  ? "border-neon-2 shadow-[0_0_12px_-2px_var(--neon-2)]"
                  : "border-white/10 opacity-60 hover:opacity-100"
              }`}
            >
              {/* biome-ignore lint/performance/noImgElement: pochette servie par SoundCloud */}
              <img
                src={a.artwork}
                alt=""
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <span className="sr-only">{a.title}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-2xl font-bold uppercase">{album.title}</h3>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
            {album.year} · {album.genre} · {album.tracks.length} {t.tracks}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t.prev}
            className="grid size-9 place-items-center border border-white/10 font-mono text-sm hover:border-neon-2 hover:text-neon-2"
          >
            ◂◂
          </button>
          <button
            type="button"
            onClick={() => playTrack(Math.max(trackIdx, 0))}
            aria-label={playing ? t.pause : t.play}
            className="grid h-9 flex-1 place-items-center border border-neon-2/60 bg-neon-2/10 font-mono text-xs uppercase tracking-[0.25em] text-neon-2 hover:bg-neon-2/20"
          >
            {playing ? `❚❚ ${t.pause}` : `▶ ${t.play}`}
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t.next}
            className="grid size-9 place-items-center border border-white/10 font-mono text-sm hover:border-neon-2 hover:text-neon-2"
          >
            ▸▸
          </button>
        </div>

        <ol className="mt-3 max-h-72 flex-1 overflow-y-auto pr-1 lg:max-h-none">
          {album.tracks.map((tr, i) => {
            const on = i === trackIdx;
            return (
              <li key={tr.id}>
                <button
                  type="button"
                  onClick={() => playTrack(i)}
                  className={`flex w-full items-center gap-3 border-b border-white/5 px-2 py-2 text-left font-mono text-sm transition ${
                    on
                      ? "bg-neon-2/10 text-neon-2"
                      : "text-foreground/75 hover:bg-white/[0.03] hover:text-foreground"
                  }`}
                >
                  <span className="w-6 text-[0.65rem] text-muted-foreground">
                    {on && playing ? "▶" : String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 truncate">{tr.title}</span>
                  <span className="text-[0.65rem] text-muted-foreground">{mmss(tr.duration)}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Widget officiel : barre compacte, gardée visible pour l'attribution SoundCloud. */}
        <div className="mt-4 opacity-70 transition hover:opacity-100">
          {armed && (
            <iframe
              ref={frame}
              title={`SoundCloud · ${album.title}`}
              src={widgetSrc(albums[0] as Album)}
              allow="autoplay; encrypted-media"
              className="h-[20px] w-full border-0"
              style={{ colorScheme: "normal" }}
            />
          )}
        </div>
        <a
          href={SOUNDCLOUD_PROFILE}
          target="_blank"
          rel="noopener"
          className="mt-3 self-end font-mono text-[0.65rem] uppercase tracking-[0.2em] text-neon-2 hover:underline"
        >
          {t.profile}
        </a>
      </div>
    </div>
  );
}
