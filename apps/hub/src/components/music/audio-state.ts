/**
 * État audio partagé entre le lecteur et le visualiseur 3D. Objet mutable lu à chaque image :
 * pas de rendu React à 60 fps. L'analyseur Web Audio est branché sur l'élément <audio> du lecteur.
 */
export const audio = {
  playing: false,
  analyser: null as AnalyserNode | null,
  el: null as HTMLAudioElement | null,
  /** Pistes d'animation du morceau en cours (précalculées) : enveloppes et instants des coups. */
  fx: null as FxTrack | null,
};

export type FxTrack = {
  fps: number;
  bass: Uint8Array;
  mid: Uint8Array;
  high: Uint8Array;
  hits: number[];
  /** Puissance de chaque coup de basse (0–1) : forte quand la basse est rare. */
  power: number[];
  snares: number[];
  ticks: number[];
};

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** Charge les pistes d'animation d'un morceau (null si absentes : repli sur l'analyseur en direct). */
export async function loadFxTrack(url: string): Promise<FxTrack | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = (await r.json()) as {
      fps: number;
      env: string;
      mid: string;
      high: string;
      hits: number[];
      power?: number[];
      snares: number[];
      ticks: number[];
    };
    return {
      fps: j.fps,
      bass: bytes(j.env),
      mid: bytes(j.mid),
      high: bytes(j.high),
      hits: j.hits,
      power: j.power ?? j.hits.map(() => 1),
      snares: j.snares,
      ticks: j.ticks,
    };
  } catch {
    return null;
  }
}

/** Indice du premier coup entre les deux positions de lecture, ou -1. (liste triée) */
function crossed(times: number[], from: number, to: number) {
  for (let i = 0; i < times.length; i++) {
    const h = times[i] as number;
    if (h > to) return -1;
    if (h > from) return i;
  }
  return -1;
}

/** Valeur interpolée d'une enveloppe à l'instant t. */
function at(env: Uint8Array, fps: number, t: number) {
  const f = t * fps;
  const i = Math.floor(f);
  const a = (env[i] ?? 0) / 255;
  const b = (env[i + 1] ?? 0) / 255;
  return a + (b - a) * (f - i);
}

export type Bands = {
  /** Vraie basse (35–100 Hz : kick et basse « bass music »), 0–1 : seule source des impacts. */
  sub: number;
  /** Sous-basses + basses (20–150 Hz), 0–1 : le moteur du visualiseur. */
  bass: number;
  /** Médiums (150 Hz – 2 kHz), 0–1. */
  mid: number;
  /** Aigus (2–10 kHz), 0–1. */
  high: number;
  /** Impulsion de kick : 1 au coup, décroît ensuite vers 0. */
  kick: number;
  /** Impulsion de caisse claire / accent médium. */
  snare: number;
  /** Impulsion de charleston / transitoire aiguë. */
  tick: number;
};

const bands: Bands = { sub: 0, bass: 0, mid: 0, high: 0, kick: 0, snare: 0, tick: 0 };
let bins: Uint8Array<ArrayBuffer> | null = null;
let slow = 0; // moyenne lente de la vraie basse : référence pour détecter les coups
let since = 1; // secondes depuis le dernier kick
let prevTime = -1; // position de lecture à l'image précédente (piste de basse)
let prevSub = 0; // vraie basse à l'image précédente : sa montée brutale = un coup

function mean(data: Uint8Array, from: number, to: number) {
  let sum = 0;
  const end = Math.max(from + 1, to);
  for (let i = from; i < end; i++) sum += data[i] ?? 0;
  return sum / (end - from) / 255;
}

/**
 * Lit le spectre courant et met à jour les bandes. Le kick est une détection d'attaque :
 * les basses dépassent nettement leur moyenne récente, avec un délai minimal entre deux coups.
 */
export function readBands(dt: number): Bands {
  const an = audio.analyser;
  bands.kick *= Math.exp(-dt * 7);
  bands.snare *= Math.exp(-dt * 9);
  bands.tick *= Math.exp(-dt * 16);
  since += dt;
  if (!an || !audio.playing) {
    bands.sub *= Math.exp(-dt * 4);
    bands.bass *= Math.exp(-dt * 4);
    bands.mid *= Math.exp(-dt * 4);
    bands.high *= Math.exp(-dt * 4);
    return bands;
  }
  if (!bins || bins.length !== an.frequencyBinCount) bins = new Uint8Array(an.frequencyBinCount);
  an.getByteFrequencyData(bins);
  const hz = an.context.sampleRate / an.fftSize;
  const bin = (f: number) => Math.max(1, Math.round(f / hz));

  bands.bass = mean(bins, bin(20), bin(150));
  bands.mid = mean(bins, bin(150), bin(2000));
  bands.high = mean(bins, bin(2000), bin(10000));

  // Pistes précalculées : synchronisées sur la position de lecture, chaque bande est isolée
  // et normalisée sur le morceau, et les coups sont déjà validés.
  const fx = audio.fx;
  const el = audio.el;
  if (fx && el) {
    const t = el.currentTime;
    bands.sub = at(fx.bass, fx.fps, t);
    bands.mid = at(fx.mid, fx.fps, t);
    bands.high = at(fx.high, fx.fps, t);
    if (prevTime >= 0 && t > prevTime && t - prevTime < 0.5) {
      const k = crossed(fx.hits, prevTime, t);
      if (k >= 0) bands.kick = Math.max(bands.kick, fx.power[k] ?? 1);
      if (crossed(fx.snares, prevTime, t) >= 0) bands.snare = 1;
      if (crossed(fx.ticks, prevTime, t) >= 0) bands.tick = 1;
    }
    prevTime = t;
    return bands;
  }
  prevTime = -1;

  const sub = mean(bins, bin(35), bin(100));
  bands.sub = sub;

  // Kick : uniquement sur la vraie basse, pas sur les caisses claires ni les médiums.
  const rise = sub - prevSub;
  prevSub = sub;
  if (((rise > 0.04 && sub > slow) || sub - slow > 0.12) && sub > 0.25 && since > 0.12) {
    bands.kick = 1;
    since = 0;
  }
  slow += (sub - slow) * (1 - Math.exp(-dt * 3));
  return bands;
}

/** Magasin externe pour l'UI (mini-lecteur du HUD) : instantané de la piste en cours + commandes. */
export type NowPlaying = {
  title: string;
  album: string;
  artwork: string;
  playing: boolean;
  /** Position et durée en ms. */
  time: number;
  duration: number;
};

export type PlayerControls = {
  toggle: () => void;
  next: () => void;
  prev: () => void;
  /** Position relative (0–1). */
  seek: (rel: number) => void;
};

let snapshot: NowPlaying | null = null;
const listeners = new Set<() => void>();

export const nowPlaying = {
  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
  getSnapshot: () => snapshot,
  getServerSnapshot: () => null as NowPlaying | null,
  set(next: NowPlaying | null) {
    snapshot = next;
    for (const fn of listeners) fn();
  },
};

/** Commandes enregistrées par le lecteur (null quand il est démonté). */
export const controls: { current: PlayerControls | null } = { current: null };
