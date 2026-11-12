"use client";

import { type Album, fxSrc, MUSIC_BASE, SOUNDCLOUD_PROFILE, trackSrc } from "@ghom/content";
import { useEffect, useRef, useState } from "react";
import { audio, controls, loadFxTrack, nowPlaying } from "./audio-state";

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
  seek: string;
  album: string;
  error: string;
};

const BASE = process.env.NEXT_PUBLIC_MUSIC_BASE || MUSIC_BASE;

const mmss = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

/**
 * Lecteur maison : un seul élément <audio> branché sur un analyseur Web Audio, que la scène 3D
 * du fond lit à chaque image (vitesses, épaisseurs, couleurs). Le contexte audio naît au premier
 * clic (exigence des navigateurs).
 */
export function MusicPlayer({ albums, t }: { albums: Album[]; t: Texts }) {
  const el = useRef<HTMLAudioElement>(null);
  const ctx = useRef<AudioContext | null>(null);
  const [albumIdx, setAlbumIdx] = useState(0);
  const [trackIdx, setTrackIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const album = albums[albumIdx] as Album;
  const current = trackIdx >= 0 ? album.tracks[trackIdx] : undefined;

  useEffect(
    () => () => {
      audio.playing = false;
      audio.analyser = null;
      audio.el = null;
      audio.fx = null;
      ctx.current?.close();
      controls.current = null;
      nowPlaying.set(null);
    },
    [],
  );

  /** Branche l'analyseur (une seule fois : un élément <audio> n'a qu'une source Web Audio). */
  const ensureGraph = () => {
    const a = el.current;
    if (!a) return;
    if (ctx.current) {
      ctx.current.resume();
      return;
    }
    const ac = new AudioContext();
    const analyser = ac.createAnalyser();
    // 4096 points : ~11 Hz par case, assez fin pour isoler la vraie basse sans trop de latence.
    analyser.fftSize = 4096;
    // Lissage court pour garder l'attaque des kicks ; plage dB élargie pour que les basses
    // d'un morceau très chargé ne saturent pas à 1 en permanence (sinon plus aucun coup ne ressort).
    analyser.smoothingTimeConstant = 0.3;
    analyser.minDecibels = -80;
    analyser.maxDecibels = -10;
    ac.createMediaElementSource(a).connect(analyser);
    analyser.connect(ac.destination);
    ctx.current = ac;
    audio.analyser = analyser;
    ac.resume();
  };

  const start = (aIdx: number, tIdx: number) => {
    const a = el.current;
    const tr = albums[aIdx]?.tracks[tIdx];
    if (!a || !tr) return;
    ensureGraph();
    setAlbumIdx(aIdx);
    setTrackIdx(tIdx);
    setFailed(false);
    setTime(0);
    a.src = trackSrc(tr, BASE);
    audio.el = a;
    audio.fx = null;
    loadFxTrack(fxSrc(tr, BASE)).then((b) => {
      if (a.src.endsWith(`/${tr.id}.mp3`)) audio.fx = b;
    });
    a.play().catch(() => setFailed(true));
  };

  const playTrack = (i: number) => {
    const a = el.current;
    if (!a) return;
    if (i === trackIdx) {
      ensureGraph();
      if (a.paused) a.play().catch(() => setFailed(true));
      else a.pause();
      return;
    }
    start(albumIdx, i);
  };

  const step = (d: number) => {
    const n = album.tracks.length;
    playTrack(((trackIdx < 0 ? 0 : trackIdx + d) + n) % n);
  };

  const pickAlbum = (i: number) => {
    if (i === albumIdx) return;
    el.current?.pause();
    setAlbumIdx(i);
    setTrackIdx(-1);
    setTime(0);
  };

  const seek = (rel: number) => {
    const a = el.current;
    if (!a || !current) return;
    a.currentTime = (rel * current.duration) / 1000;
    setTime(rel * current.duration);
  };

  const onEnded = () => {
    // Enchaîne la piste suivante de l'album, s'arrête à la fin.
    if (trackIdx + 1 < album.tracks.length) start(albumIdx, trackIdx + 1);
  };

  // Mini-lecteur du HUD : commandes (toujours sur le dernier état) et instantané de lecture.
  const latest = useRef({ playTrack, step, seek });
  latest.current = { playTrack, step, seek };
  useEffect(() => {
    controls.current = {
      toggle: () => latest.current.step(0),
      next: () => latest.current.step(1),
      prev: () => latest.current.step(-1),
      seek: (rel) => latest.current.seek(rel),
    };
    return () => {
      controls.current = null;
    };
  }, []);
  useEffect(() => {
    nowPlaying.set(
      current
        ? {
            title: current.title,
            album: album.title,
            artwork: album.artwork,
            playing,
            time,
            duration: current.duration,
          }
        : null,
    );
  }, [current, album, playing, time]);

  const progress = current ? Math.min(time / current.duration, 1) : 0;
  const status = failed
    ? t.error
    : buffering
      ? t.loading
      : playing
        ? t.nowPlaying
        : current
          ? t.pause
          : t.idle;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      {/* biome-ignore lint/a11y/useMediaCaption: pistes musicales instrumentales */}
      <audio
        ref={el}
        crossOrigin="anonymous"
        preload="none"
        onPlay={() => {
          audio.playing = true;
          setPlaying(true);
        }}
        onPause={() => {
          audio.playing = false;
          setPlaying(false);
        }}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime * 1000)}
        onEnded={onEnded}
        onError={() => {
          setFailed(true);
          setBuffering(false);
        }}
      />

      {/* Platine : pochette de l'album en cours, transport et progression. */}
      <div className="cyber-clip flex flex-col border border-white/5 bg-[#05060b]/80 p-5 backdrop-blur-md">
        <p className="hud-label flex items-center gap-2 text-neon-2">
          <span
            className={`size-1.5 shrink-0 rounded-full ${playing ? "animate-blink bg-neon-2" : "bg-white/30"}`}
          />
          {status}
        </p>

        <div className="relative mt-4 aspect-square overflow-hidden border border-white/10 lg:aspect-auto lg:min-h-72 lg:flex-1">
          {/* biome-ignore lint/performance/noImgElement: pochette servie par SoundCloud */}
          <img
            src={album.artwork}
            alt=""
            className={`absolute inset-0 size-full object-cover transition duration-700 ${playing ? "scale-[1.03]" : ""}`}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05060b] via-[#05060b]/85 to-transparent p-4 pt-16">
            <p className="truncate font-display text-3xl font-black uppercase leading-none">
              {current?.title ?? album.title}
            </p>
            <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted-foreground">
              {current ? `${album.title} · ` : ""}
              {album.year} · {album.genre}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label={t.prev}
            className="grid size-10 place-items-center border border-white/10 font-mono text-sm hover:border-neon-2 hover:text-neon-2"
          >
            ◂◂
          </button>
          <button
            type="button"
            onClick={() => playTrack(Math.max(trackIdx, 0))}
            aria-label={playing ? t.pause : t.play}
            className="grid h-10 flex-1 place-items-center border border-neon-2/60 bg-neon-2/10 font-mono text-xs uppercase tracking-[0.25em] text-neon-2 hover:bg-neon-2/20"
          >
            {playing ? `❚❚ ${t.pause}` : `▶ ${t.play}`}
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label={t.next}
            className="grid size-10 place-items-center border border-white/10 font-mono text-sm hover:border-neon-2 hover:text-neon-2"
          >
            ▸▸
          </button>
        </div>

        {/* Progression : la forme d'onde de la piste, cliquable pour se déplacer. */}
        <div className="mt-3 flex items-center gap-3 font-mono text-[0.65rem] text-muted-foreground">
          <span className="w-9 text-right">{mmss(time)}</span>
          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            disabled={!current}
            aria-label={t.seek}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            className="peer sr-only"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            disabled={!current}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              seek((e.clientX - r.left) / r.width);
            }}
            className="flex h-8 flex-1 items-center gap-px peer-focus-visible:outline peer-focus-visible:outline-neon-2 disabled:cursor-default"
          >
            {(current?.wave ?? album.tracks[0]?.wave ?? []).map((v, i, arr) => (
              <span
                key={i}
                className={`flex-1 ${current && i / arr.length < progress ? "bg-neon-2" : "bg-white/15"}`}
                style={{ height: `${Math.max(v, 0.08) * 100}%` }}
              />
            ))}
          </button>
          <span className="w-9">{current ? mmss(current.duration) : "0:00"}</span>
        </div>
      </div>

      {/* Discographie : les albums, puis les pistes de l'album choisi. */}
      <div className="cyber-clip flex flex-col border border-white/5 bg-[#05060b]/80 p-5 backdrop-blur-md">
        <p className="hud-label mb-3">{t.albums}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {albums.map((a, i) => {
            const on = i === albumIdx;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => pickAlbum(i)}
                aria-pressed={on}
                className={`flex items-center gap-3 border p-1.5 pr-3 text-left transition ${
                  on
                    ? "border-neon-2 bg-neon-2/10 shadow-[0_0_12px_-4px_var(--neon-2)]"
                    : "border-white/10 opacity-70 hover:opacity-100"
                }`}
              >
                {/* biome-ignore lint/performance/noImgElement: pochette servie par SoundCloud */}
                <img
                  src={a.artwork}
                  alt=""
                  loading="lazy"
                  className="size-12 shrink-0 object-cover"
                />
                <span className="min-w-0">
                  <span
                    className={`block truncate font-display text-base font-bold uppercase ${on ? "text-neon-2" : ""}`}
                  >
                    {a.title}
                  </span>
                  <span className="block truncate font-mono text-[0.6rem] uppercase tracking-[0.15em] text-muted-foreground">
                    {a.year} · {a.genre}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="hud-label mt-5 mb-1">
          {album.title} · {album.tracks.length} {t.tracks}
        </p>
        <ol className="max-h-96 flex-1 overflow-y-auto pr-1 lg:max-h-none">
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

        <div className="mt-4 flex flex-wrap justify-between gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em]">
          <a
            href={album.url}
            target="_blank"
            rel="noopener"
            className="text-foreground/60 hover:text-foreground"
          >
            {t.album} ▸
          </a>
          <a
            href={SOUNDCLOUD_PROFILE}
            target="_blank"
            rel="noopener"
            className="text-neon-2 hover:underline"
          >
            {t.profile}
          </a>
        </div>
      </div>
    </div>
  );
}
