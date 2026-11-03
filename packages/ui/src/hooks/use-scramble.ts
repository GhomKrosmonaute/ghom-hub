"use client";

import { scrambleFrame } from "@ghom/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * Texte qui se "décrypte". Renvoie le texte courant et une fonction `replay`.
 * Rendu serveur = texte final (pas de flash illisible pour le SEO / sans JS).
 */
export function useScramble(text: string, { duration = 700, autoplay = true } = {}) {
  const [output, setOutput] = useState(text);
  const raf = useRef<number | null>(null);
  const reduced = useReducedMotion();

  const replay = useCallback(() => {
    if (reduced) {
      setOutput(text);
      return;
    }
    if (raf.current) cancelAnimationFrame(raf.current);
    const start = performance.now();
    let lastSwap = 0;
    const tick = (now: number) => {
      const t = (now - start) / duration;
      // On change les glyphes ~30 fois/s pour garder un effet lisible
      if (now - lastSwap > 33 || t >= 1) {
        setOutput(scrambleFrame(text, t));
        lastSwap = now;
      }
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [text, duration, reduced]);

  useEffect(() => {
    if (autoplay) replay();
    else setOutput(text);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [autoplay, replay, text]);

  return { output, replay };
}
