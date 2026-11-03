"use client";

import { useSyncExternalStore } from "react";

/** Score et crédits de la "borne" : purement ludique, persistés localement. */
const KEY = "nbng:credits";
const listeners = new Set<() => void>();
const state = { score: 0, credits: 0, hiScore: 133700 };
let snapshot = { ...state };

function emit() {
  snapshot = { ...state };
  for (const l of listeners) l();
}

if (typeof window !== "undefined") {
  try {
    state.credits = Number(localStorage.getItem(KEY) ?? 0) || 0;
    snapshot = { ...state };
  } catch {}
}

export function addScore(points: number) {
  state.score = Math.min(999999, state.score + Math.round(points));
  if (state.score > state.hiScore) state.hiScore = state.score;
  emit();
}

export function addCredit() {
  state.credits = Math.min(99, state.credits + 1);
  try {
    localStorage.setItem(KEY, String(state.credits));
  } catch {}
  emit();
}

const SERVER = { score: 0, credits: 0, hiScore: 133700 };

export function useArcade() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => SERVER,
  );
}
