import type { Track } from "@ghom/content";

/**
 * État de lecture partagé entre le lecteur (widget SoundCloud) et le visualiseur 3D.
 * Objet mutable lu à chaque image : pas de rendu React à 60 fps.
 */
export const audio = {
  playing: false,
  track: null as Track | null,
  /** Dernière position connue (ms) et instant où elle a été reçue. */
  position: 0,
  at: 0,
};

/** Position estimée entre deux événements PLAY_PROGRESS du widget. */
export function currentPosition(now = performance.now()) {
  return audio.playing ? audio.position + (now - audio.at) : audio.position;
}

/** Amplitude (0–1) de la forme d'onde à une position relative (0–1), interpolée. */
export function sampleWave(wave: number[], rel: number) {
  if (wave.length === 0) return 0;
  const x = Math.min(Math.max(rel, 0), 1) * (wave.length - 1);
  const i = Math.floor(x);
  const a = wave[i] ?? 0;
  const b = wave[Math.min(i + 1, wave.length - 1)] ?? a;
  return a + (b - a) * (x - i);
}
