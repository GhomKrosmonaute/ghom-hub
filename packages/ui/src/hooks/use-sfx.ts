"use client";

import { useSyncExternalStore } from "react";

/**
 * Sons d'interface synthétisés en WebAudio (aucun fichier audio).
 * Désactivés par défaut ; l'état est mémorisé en localStorage.
 */
type Sfx = "hover" | "click" | "boot" | "lock" | "error" | "coin";

const KEY = "ghom:sfx";
const listeners = new Set<() => void>();
let enabled = false;
let ctx: AudioContext | null = null;

function read() {
  try {
    enabled = localStorage.getItem(KEY) === "1";
  } catch {
    enabled = false;
  }
}

if (typeof window !== "undefined") read();

export function setSfxEnabled(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem(KEY, value ? "1" : "0");
  } catch {}
  for (const l of listeners) l();
  if (value) playSfx("boot");
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export function playSfx(kind: Sfx) {
  if (!enabled || typeof window === "undefined") return;
  ctx ??= new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  switch (kind) {
    case "hover":
      return tone(1800, 0.04, "square", 0.015);
    case "click":
      tone(520, 0.08, "square", 0.04, 1400);
      return;
    case "lock":
      tone(1200, 0.05, "sine", 0.03);
      setTimeout(() => tone(1600, 0.06, "sine", 0.03), 55);
      return;
    case "boot":
      tone(90, 0.6, "sawtooth", 0.035, 440);
      setTimeout(() => tone(880, 0.12, "sine", 0.03), 450);
      return;
    case "coin":
      tone(988, 0.08, "square", 0.04);
      setTimeout(() => tone(1319, 0.3, "square", 0.04), 80);
      return;
    case "error":
      return tone(140, 0.25, "sawtooth", 0.05, 70);
  }
}

export function useSfxEnabled(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => enabled,
    () => false,
  );
}
