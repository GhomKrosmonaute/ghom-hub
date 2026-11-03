"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from "three";

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
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          attribute float aSeed;
          varying float vSeed;
          varying float vFade;
          void main() {
            vec3 p = position;
            p.y = mod(p.y - uTime * (1.5 + aSeed * 4.0), 30.0);
            p.x += sin(uTime * 0.5 + aSeed * 40.0) * 0.3;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (2.0 + aSeed * 3.0) * (12.0 / -mv.z);
            vSeed = aSeed;
            vFade = smoothstep(60.0, 5.0, -mv.z);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uA;
          uniform vec3 uB;
          varying float vSeed;
          varying float vFade;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            // goutte étirée verticalement
            float d = length(c * vec2(3.0, 0.7));
            float a = smoothstep(0.5, 0.0, d) * vFade;
            vec3 col = mix(uA, uB, step(0.82, vSeed));
            gl_FragColor = vec4(col * 1.8, a);
          }
        `,
      }),
    [],
  );

  useFrame((state) => {
    material.uniforms.uTime!.value = state.clock.elapsedTime;
  });

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
