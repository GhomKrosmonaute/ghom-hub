"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from "three";
import { rig } from "./rig";

/** Pluie de particules lumineuses, entièrement animée sur GPU. */
export function DataRain({ count = 1800 }: { count?: number }) {
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 70;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = 15 - Math.random() * 110;
      seed[i] = Math.random();
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uA: { value: new Color("#00f0ff") },
          uB: { value: new Color("#ff2bd6") },
          uSize: { value: 1 },
          uMix: { value: 0.82 },
          uSpark: { value: 0 },
          uSeed: { value: 0 },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uSize;
          uniform float uSpark;
          uniform float uSeed;
          attribute float aSeed;
          varying float vSpark;
          varying float vSeed;
          varying float vFade;
          void main() {
            vec3 p = position;
            p.y = mod(p.y - uTime * (1.5 + aSeed * 4.0), 30.0);
            p.x += sin(uTime * 0.5 + aSeed * 40.0) * 0.3;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            // Aigus : à chaque charleston, un quart des gouttes (tirées au hasard) étincelle.
            vSpark = step(0.75, fract(aSeed * 97.13 + uSeed)) * uSpark;
            gl_PointSize = (2.0 + aSeed * 3.0) * uSize * (1.0 + vSpark * 1.8) * (12.0 / -mv.z);
            vSeed = aSeed;
            vFade = smoothstep(60.0, 5.0, -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uA;
          uniform vec3 uB;
          uniform float uMix;
          varying float vSeed;
          varying float vFade;
          varying float vSpark;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            // goutte étirée verticalement
            float d = length(c * vec2(3.0, 0.7));
            float a = smoothstep(0.5, 0.0, d) * vFade;
            vec3 col = mix(uA, uB, step(uMix, vSeed));
            col = mix(col, vec3(0.75, 1.0, 1.0), vSpark * 0.55);
            gl_FragColor = vec4(col * (1.8 + vSpark * 2.2), a);
          }
        `,
      }),
    [],
  );

  // Musique : la pluie tombe à l'horloge musicale, grossit avec les basses et les aigus,
  // étincelle sur les charlestons, et les médiums font passer plus de gouttes au magenta.
  const lastTick = useRef(0);
  useFrame(() => {
    const u = material.uniforms;
    // Nouveau coup aigu : nouveau tirage des gouttes qui étincellent.
    if (rig.tick > lastTick.current + 0.3) u.uSeed!.value = Math.random();
    lastTick.current = rig.tick;
    u.uSpark!.value = rig.tick;
    u.uTime!.value = rig.time;
    u.uSize!.value = 1 + rig.bass * 0.9 + rig.high * 0.6 + rig.punch * 1.2;
    u.uMix!.value = 0.82 - rig.mid * 0.45;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
