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
import {
  BlendFunction,
  type BloomEffect,
  type ChromaticAberrationEffect,
  GlitchMode,
  type NoiseEffect,
} from "postprocessing";
import { useRef } from "react";
import { Vector2 } from "three";
import { rig } from "./rig";

const caOffset = new Vector2(0.0006, 0.0004);

export function Effects() {
  const ca = useRef<ChromaticAberrationEffect>(null);
  const bloom = useRef<BloomEffect>(null);
  const noise = useRef<NoiseEffect>(null);

  // L'aberration chromatique réagit à la vitesse de scroll : le "glitch" vient du pilotage.
  useFrame(() => {
    const s =
      0.0006 + rig.shock * 0.008 + rig.punch * 0.005 + rig.tick * 0.002 + rig.snare * 0.0015;
    ca.current?.offset.set(s + pointer.x * 0.0004, s * 0.6);
    // Musique : un bloom qui monte doucement sur les basses, plafonné pour éviter les flashs blancs.
    if (bloom.current)
      bloom.current.intensity =
        1.25 + Math.min(rig.bass * 1.1 + rig.punch * 1.2 + rig.mid * 0.4 + rig.snare * 0.35, 2.2);
    // Aigus : le grain de l'image monte avec les cymbales et crépite sur les charlestons.
    if (noise.current)
      noise.current.blendMode.opacity.value = 0.35 + rig.high * 0.3 + rig.tick * 0.3;
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        ref={bloom}
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
      <Noise ref={noise} premultiply blendFunction={BlendFunction.SCREEN} opacity={0.35} />
      <Vignette darkness={0.85} offset={0.25} />
    </EffectComposer>
  );
}
