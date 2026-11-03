"use client";

import { useEffect } from "react";

/**
 * État pointeur global, partagé entre le HUD (DOM) et la scène 3D (useFrame)
 * sans re-render React : on lit `pointer` directement dans les boucles d'animation.
 * x/y normalisés dans [-1, 1] (y vers le haut, comme en NDC three.js).
 */
export const pointer = {
  x: 0,
  y: 0,
  px: 0,
  py: 0,
  /** 0 → haut de page, 1 → bas de page */
  scroll: 0,
  scrollVelocity: 0,
  /** true si un élément interactif est survolé (verrouillage de cible) */
  locked: false,
  lockLabel: "",
  isTouch: false,
};

let installed = 0;
let lastScrollY = 0;

function onMove(e: PointerEvent) {
  pointer.isTouch = e.pointerType === "touch";
  pointer.px = e.clientX;
  pointer.py = e.clientY;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
  const target =
    e.target instanceof Element
      ? e.target.closest<HTMLElement>(
          "[data-lock], a, button, [role=button], [role^=menuitem], input, textarea",
        )
      : null;
  pointer.locked = Boolean(target);
  pointer.lockLabel =
    target?.dataset.lock ??
    target?.getAttribute("aria-label") ??
    target?.textContent?.trim().slice(0, 28) ??
    "";
}

function onScroll() {
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const y = window.scrollY;
  pointer.scroll = y / max;
  pointer.scrollVelocity = y - lastScrollY;
  lastScrollY = y;
}

/** Installe les listeners une seule fois, quel que soit le nombre de composants qui l'appellent. */
export function usePointerTracking() {
  useEffect(() => {
    if (installed++ === 0) {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }
    return () => {
      if (--installed === 0) {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerdown", onMove);
        window.removeEventListener("scroll", onScroll);
      }
    };
  }, []);
}
