"use client";

import { clamp, damp } from "@ghom/core";
import { pointer } from "@ghom/ui/hooks/use-pointer";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { type PerspectiveCamera, Vector3 } from "three";
import { readBands } from "../music/audio-state";
import { rig } from "./rig";

const lookTarget = new Vector3();

/** Caméra = tête du pilote : inertie, roulis, avancée au scroll. */
export function CameraRig() {
  const prevScroll = useRef(0);
  const roll = useRef(0);
  const baseFov = useRef<number | null>(null);
  const prevKick = useRef(0);
  const shakeT = useRef(9);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const cam = state.camera;

    // Le son du lecteur pilote toute la scène : on le lit une fois par image, ici.
    const b = readBands(dt);
    // Basse rare = basse puissante : chaque coup arrive déjà pondéré par sa rareté (b.kick),
    // et l'activité récente calme la lumière continue pour qu'un morceau chargé reste supportable.
    const newHit = b.kick > 0.05 && b.kick > prevKick.current + 0.05;
    prevKick.current = b.kick;
    if (newHit) rig.busy += 0.3;
    rig.busy *= Math.exp(-dt * 0.4);
    const calm = 1 / (1 + rig.busy * 1.2);
    rig.bass = damp(rig.bass, b.sub * calm, 6, dt);
    rig.mid = damp(rig.mid, b.mid, 8, dt);
    rig.high = damp(rig.high, b.high, 10, dt);
    rig.kick = damp(rig.kick, b.kick, 18, dt);
    // Attaque immédiate, relâche rapide : les accents restent nets.
    rig.snare = b.snare > rig.snare ? b.snare : damp(rig.snare, b.snare, 12, dt);
    rig.tick = b.tick > rig.tick ? b.tick : damp(rig.tick, b.tick, 20, dt);
    // Impact : la puissance du coup (déjà pondérée par sa rareté), relâche plus lente et douce.
    if (newHit) rig.punch = Math.max(rig.punch, b.kick);
    rig.punch = damp(rig.punch, 0, 4, dt);
    rig.time += dt * (1 + rig.bass * rig.bass * 2.5 + rig.punch * 3);

    rig.scroll = damp(rig.scroll, pointer.scroll, 4, dt);
    const instantVel = dt > 0 ? (rig.scroll - prevScroll.current) / dt : 0;
    prevScroll.current = rig.scroll;
    rig.velocity = damp(rig.velocity, instantVel, 6, dt);
    rig.shock = Math.max(rig.shock - dt * 1.8, clamp(Math.abs(rig.velocity) * 2.2, 0, 1));

    const s = rig.scroll;
    const tx = pointer.x * 0.7;
    const ty = 1.7 + pointer.y * 0.35 + Math.sin(state.clock.elapsedTime * 0.8) * 0.04;
    const tz = 8 - s * 52;

    cam.position.x = damp(cam.position.x, tx, 2.6, dt);
    cam.position.y = damp(cam.position.y, ty + s * 1.2, 2.6, dt);
    cam.position.z = damp(cam.position.z, tz, 3.2, dt);

    lookTarget.set(pointer.x * 1.6, 1.9 + pointer.y * 0.9, cam.position.z - 10);
    cam.lookAt(lookTarget);

    // Roulis façon tête qui accompagne le mouvement
    roll.current = damp(roll.current, -pointer.x * 0.045 - rig.velocity * 0.4, 3, dt);
    cam.rotateZ(roll.current);

    // Coup de basse : une seule secousse amortie (pas de tremblement aléatoire) et un coup de zoom.
    shakeT.current += dt;
    if (newHit) shakeT.current = 0;
    cam.position.y +=
      Math.sin(shakeT.current * 38) * Math.exp(-shakeT.current * 9) * rig.punch * 0.07;
    const persp = cam as PerspectiveCamera;
    baseFov.current ??= persp.fov;
    persp.fov = baseFov.current + rig.punch * 7;
    persp.updateProjectionMatrix();
  });

  return null;
}
