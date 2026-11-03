"use client";

import { pointer } from "@ghom/ui/hooks/use-pointer";
import { useFrame } from "@react-three/fiber";
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  Glitch,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, type ChromaticAberrationEffect, GlitchMode } from "postprocessing";
import { useRef } from "react";
import { Vector2 } from "three";
import { rig } from "./rig";

const caOffset = new Vector2(0.0006, 0.0004);

export function Effects() {
  const ca = useRef<ChromaticAberrationEffect>(null);

  // L'aberration chromatique réagit à la vitesse de scroll : le "glitch" vient du pilotage.
  useFrame(() => {
    const s = 0.0006 + rig.shock * 0.008;
    ca.current?.offset.set(s + pointer.x * 0.0004, s * 0.6);
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        intensity={1.25}
        luminanceThreshold={0.25}
        luminanceSmoothing={0.2}
        radius={0.75}
      />
      <ChromaticAberration
        ref={ca}
        offset={caOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Glitch
        delay={new Vector2(7, 15)}
        duration={new Vector2(0.08, 0.22)}
        strength={new Vector2(0.04, 0.12)}
        mode={GlitchMode.SPORADIC}
        ratio={0.9}
      />
      <Noise premultiply blendFunction={BlendFunction.SCREEN} opacity={0.35} />
      <Vignette darkness={0.85} offset={0.25} />
    </EffectComposer>
  );
}
