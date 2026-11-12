"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import { Color, ShaderMaterial } from "three";
import { rig } from "./rig";

const PILOT = new Color("#00f0ff");
const STUDIO = new Color("#c6ff00");
const ACCENT = new Color("#ff2bd6");
const tmp = new Color();

/** Sol en grille néon, anti-aliasé, qui défile et se fond dans le noir. */
export function NeonFloor() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: PILOT.clone() },
          uAccent: { value: new Color("#ff2bd6") },
          uWidth: { value: 1 },
          uGain: { value: 1 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vWorld;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vWorld = w.xyz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uColor;
          uniform vec3 uAccent;
          uniform float uWidth;
          uniform float uGain;
          varying vec3 vWorld;

          float grid(vec2 p, float size, float width) {
            vec2 g = abs(fract(p / size - 0.5) - 0.5) / fwidth(p / size);
            return 1.0 - min(min(g.x, g.y) / width, 1.0);
          }

          void main() {
            vec2 p = vWorld.xz + vec2(0.0, uTime * 2.0);
            float minor = grid(p, 1.0, uWidth) * 0.18;
            float major = grid(p, 5.0, 1.4 * uWidth);
            float lines = max(minor, major);

            // Couloir central plus lumineux (la "route")
            float lane = smoothstep(1.4, 0.0, abs(vWorld.x)) * (0.5 + 0.5 * sin(p.y * 0.6));
            float dist = length(vWorld.xz - cameraPosition.xz);
            float fade = exp(-dist * 0.045);

            vec3 col = uColor * lines * 1.6 * uGain + uAccent * lane * 0.25 * uGain;
            float alpha = (lines + lane * 0.3) * fade;
            gl_FragColor = vec4(col, alpha);
          }
        `,
      }),
    [],
  );

  useFrame(() => {
    const u = material.uniforms;
    // Musique : défilement à l'horloge musicale, lignes épaissies par les basses ; la couleur
    // glisse vers le magenta plutôt que de monter en luminosité (pas de flash blanc).
    u.uTime!.value = rig.time;
    u.uWidth!.value = 1 + rig.bass * 1.1 + rig.punch * 1.8;
    u.uGain!.value = 1 + Math.min(rig.bass * 0.6 + rig.punch * 0.9, 1.3);
    // Vire au vert acide en approchant du portail studio ; les médiums tirent vers le magenta.
    const t = Math.min(1, Math.max(0, (rig.scroll - 0.55) / 0.25));
    u.uColor!.value.copy(
      tmp
        .copy(PILOT)
        .lerp(STUDIO, t)
        .lerp(ACCENT, Math.min(rig.mid * 0.6 + rig.bass * 0.35 + rig.snare * 0.3, 0.85)),
    );
  });

  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -40]} material={material}>
      <planeGeometry args={[220, 260, 1, 1]} />
    </mesh>
  );
}
