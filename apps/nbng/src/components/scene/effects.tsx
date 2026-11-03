"use client";

import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Pixelation,
  Scanline,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, type ChromaticAberrationEffect } from "postprocessing";
import { useRef } from "react";
import { Vector2 } from "three";
import { rig } from "./rig";

const offset = new Vector2(0.001, 0.0005);

/** Post-process "borne d'arcade" : pixelisation, balayage CRT, bloom. */
export function ArcadeEffects() {
  const ca = useRef<ChromaticAberrationEffect>(null);
  useFrame(() => {
    const s = 0.0008 + rig.shock * 0.01;
    ca.current?.offset.set(s, s * 0.5);
  });
  return (
    <EffectComposer multisampling={0}>
      <Pixelation granularity={3} />
      <Bloom mipmapBlur intensity={1.1} luminanceThreshold={0.3} radius={0.7} />
      <ChromaticAberration ref={ca} offset={offset} radialModulation={false} modulationOffset={0} />
      <Scanline blendFunction={BlendFunction.OVERLAY} density={1.4} opacity={0.35} />
      <Vignette darkness={0.9} offset={0.2} />
    </EffectComposer>
  );
}
