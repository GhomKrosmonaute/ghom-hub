"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, ShaderMaterial } from "three";

/** Sol en damier lumineux + champ d'étoiles carrées qui scintillent. */
export function PixelFloor() {
  const floor = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uA: { value: new Color("#ff5e1a") },
          uB: { value: new Color("#a855ff") },
        },
        vertexShader: /* glsl */ `
          varying vec3 vW;
          void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uA; uniform vec3 uB; varying vec3 vW;
          void main() {
            vec2 p = vW.xz * 0.5 + vec2(0.0, uTime * 0.6);
            vec2 g = abs(fract(p - 0.5) - 0.5) / fwidth(p);
            float line = 1.0 - min(min(g.x, g.y), 1.0);
            vec2 cell = floor(p);
            float checker = mod(cell.x + cell.y, 2.0);
            float flick = step(0.985, fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453 + floor(uTime * 2.0) * 0.137));
            float d = length(vW.xz - cameraPosition.xz);
            float fade = exp(-d * 0.06);
            vec3 col = mix(uA, uB, smoothstep(-20.0, 10.0, vW.z)) * (line * 1.4 + checker * 0.04 + flick * 0.8);
            gl_FragColor = vec4(col, (line + checker * 0.05 + flick * 0.6) * fade);
          }
        `,
      }),
    [],
  );

  const stars = useMemo(() => {
    const n = 900;
    const pos = new Float32Array(n * 3);
    const seed = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 80;
      pos[i * 3 + 1] = Math.random() * 30 - 2;
      pos[i * 3 + 2] = -10 - Math.random() * 50;
      seed[i] = Math.random();
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new BufferAttribute(seed, 1));
    return g;
  }, []);

  const starMat = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `
          uniform float uTime; attribute float aSeed; varying float vA; varying float vS;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (aSeed > 0.9 ? 6.0 : 3.0);
            vA = step(0.5, fract(uTime * (0.3 + aSeed) + aSeed * 10.0)) * 0.7 + 0.3;
            vS = aSeed;
          }
        `,
        fragmentShader: /* glsl */ `
          varying float vA; varying float vS;
          void main() {
            vec3 c = vS > 0.8 ? vec3(0.78, 1.0, 0.0) : (vS > 0.6 ? vec3(1.0, 0.37, 0.1) : vec3(0.85, 0.8, 1.0));
            gl_FragColor = vec4(c * 1.6, vA); // carrés : pas de découpe circulaire
          }
        `,
      }),
    [],
  );

  useFrame((s) => {
    floor.uniforms.uTime!.value = s.clock.elapsedTime;
    starMat.uniforms.uTime!.value = s.clock.elapsedTime;
  });

  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.6, -20]} material={floor}>
        <planeGeometry args={[160, 120]} />
      </mesh>
      <points geometry={stars} material={starMat} frustumCulled={false} />
    </>
  );
}
