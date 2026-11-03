"use client";

import { clamp, damp } from "@ghom/core";
import { pointer } from "@ghom/ui/hooks/use-pointer";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { rig } from "./rig";

export function ArcadeRig() {
  const prev = useRef(0);
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    rig.scroll = damp(rig.scroll, pointer.scroll, 4, dt);
    const v = dt > 0 ? (rig.scroll - prev.current) / dt : 0;
    prev.current = rig.scroll;
    rig.velocity = damp(rig.velocity, v, 6, dt);
    rig.shock = Math.max(rig.shock - dt * 2, clamp(Math.abs(rig.velocity) * 2, 0, 1));

    const cam = state.camera;
    cam.position.x = damp(cam.position.x, pointer.x * 0.5, 2.5, dt);
    cam.position.y = damp(cam.position.y, 0.9 + pointer.y * 0.3 - rig.scroll * 1.5, 2.5, dt);
    cam.position.z = damp(cam.position.z, 6.5 - rig.scroll * 3, 2.5, dt);
    cam.lookAt(pointer.x * 0.4, 0.6 - rig.scroll * 1.2, 0);
  });
  return null;
}
