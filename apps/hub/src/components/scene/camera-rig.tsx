"use client";

import { clamp, damp } from "@ghom/core";
import { pointer } from "@ghom/ui/hooks/use-pointer";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Vector3 } from "three";
import { rig } from "./rig";

const lookTarget = new Vector3();

/** Caméra = tête du pilote : inertie, roulis, avancée au scroll. */
export function CameraRig() {
  const prevScroll = useRef(0);
  const roll = useRef(0);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const cam = state.camera;

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
  });

  return null;
}
