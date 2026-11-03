"use client";

import { damp } from "@ghom/core";
import { pointer } from "@ghom/ui/hooks/use-pointer";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BoxGeometry, Color, type Group, InstancedBufferAttribute, ShaderMaterial } from "three";
import { buildBrain } from "./brain-voxels";
import { rig } from "./rig";

/**
 * Le logo vivant du studio : un cerveau en voxels.
 * Au scroll il se déploie en plateau tactique : le cerveau devient le jeu
 * (« no brain, no game »). Des influx électriques le parcourent en continu.
 * Tout est calculé dans le vertex shader : une seule draw call.
 */
export function VoxelBrain({ dense = true }: { dense?: boolean }) {
  const group = useRef<Group>(null);
  const { viewport } = useThree();
  const narrow = viewport.aspect < 1;

  const brain = useMemo(() => buildBrain(dense ? 0.07 : 0.1), [dense]);

  const geometry = useMemo(() => {
    const g = new BoxGeometry(1, 1, 1);
    g.setAttribute("aHome", new InstancedBufferAttribute(brain.home, 3));
    g.setAttribute("aBoard", new InstancedBufferAttribute(brain.board, 3));
    g.setAttribute("aSeed", new InstancedBufferAttribute(brain.seed, 1));
    return g;
  }, [brain]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uExplode: { value: 0 },
          uSize: { value: brain.step * 0.86 },
          uPitch: { value: brain.step * 1.18 },
          uGlitchY: { value: 10 },
          uGlitchX: { value: 0 },
          uA: { value: new Color("#c6ff00") },
          uB: { value: new Color("#ff5e1a") },
          uC: { value: new Color("#a855ff") },
        },
        vertexShader: /* glsl */ `
          uniform float uTime;
          uniform float uExplode;
          uniform float uSize;
          uniform float uGlitchY;
          uniform float uGlitchX;
          attribute vec3 aHome;
          attribute vec3 aBoard;
          attribute float aSeed;
          varying vec3 vNormal;
          varying vec3 vLocal;
          varying vec3 vHome;
          varying float vSeed;
          varying float vExplode;
          varying vec3 vBoard;

          mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
          mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

          void main() {
            // déploiement échelonné : les voxels quittent le cerveau un par un
            float e = clamp(uExplode * 1.6 - aSeed * 0.6, 0.0, 1.0);
            e = e * e * (3.0 - 2.0 * e);
            // en vol : arc de trajectoire au-dessus du plateau
            float flight = e * (1.0 - e);

            vec3 p = mix(aHome, aBoard, e);
            p.y += flight * (1.2 + aSeed * 1.5);
            // respiration du cerveau
            p += aHome * sin(uTime * 1.4) * 0.012 * (1.0 - e);

            // bande de glitch horizontale
            if (abs(aHome.y - uGlitchY) < 0.06) p.x += uGlitchX;

            // les voxels tournoient en vol puis se posent bien alignés sur leur case
            mat3 spin = rotY(flight * 4.0 * (aSeed * 6.28)) * rotX(flight * 4.0 * aSeed * 4.0);
            float size = uSize;
            vec3 local = spin * (position * size);

            vNormal = normalize(normalMatrix * (spin * normal));
            vLocal = position;
            vHome = aHome;
            vSeed = aSeed;
            vExplode = e;
            vBoard = aBoard;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p + local, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uA;
          uniform vec3 uB;
          uniform vec3 uC;
          varying vec3 vNormal;
          varying vec3 vLocal;
          varying vec3 vHome;
          varying float vSeed;
          varying float vExplode;
          varying vec3 vBoard;
          uniform float uPitch;

          void main() {
            vec3 base = mix(uA, uB, smoothstep(-1.1, 1.3, vHome.z + vHome.y * 0.6));
            base = mix(base, uC, step(0.93, vSeed));

            // influx électriques qui parcourent le cerveau
            // sur le plateau, l'onde devient un balayage radial depuis le centre
            float r = mix(length(vHome), length(vBoard.xz) * 0.6, vExplode);
            float wave = smoothstep(0.07, 0.0, abs(fract(r * 0.9 - uTime * 0.35) - 0.5));
            // damier : une case sur deux plus sombre
            vec2 cell = floor(vBoard.xz / uPitch + 0.5);
            float checker = mod(cell.x + cell.y, 2.0);
            base *= mix(1.0, 0.55 + 0.45 * checker, vExplode);
            // arêtes lumineuses : look pixel / voxel
            vec3 a = abs(vLocal) * 2.0;
            float edge = smoothstep(0.78, 0.95, max(max(min(a.x, a.y), min(a.y, a.z)), min(a.x, a.z)));

            float light = 0.35 + 0.65 * max(dot(vNormal, normalize(vec3(0.4, 0.8, 0.6))), 0.0);
            vec3 col = base * light * 0.45 + base * edge * 1.1 + mix(base, vec3(1.0), 0.5) * wave * 0.9;
            col *= 1.0 + vExplode * 0.25;
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [brain.step],
  );

  const glitchTimer = useRef(2);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const u = material.uniforms;
    u.uTime!.value = t;
    // 0 en haut de page → plateau entièrement déployé à ~30 % du scroll
    const target = Math.min(1, rig.scroll / 0.3) + rig.shock * 0.25;
    u.uExplode!.value = damp(u.uExplode!.value as number, target, 3, dt);

    glitchTimer.current -= dt;
    if (glitchTimer.current < 0) {
      u.uGlitchY!.value = (Math.random() - 0.5) * 1.6;
      u.uGlitchX!.value = (Math.random() - 0.5) * 0.5;
      glitchTimer.current = Math.random() < 0.3 ? 0.06 : 1.5 + Math.random() * 3;
    } else if (glitchTimer.current < 1.4) {
      u.uGlitchY!.value = 10;
    }

    const g = group.current;
    if (!g) return;
    g.rotation.y = damp(g.rotation.y, t * 0.25 + pointer.x * 0.8, 2, dt);
    // plateau déployé : on le remet à plat pour qu'il ne traverse pas le sol
    const flat = Math.min(1, u.uExplode!.value as number);
    g.rotation.x = damp(g.rotation.x, (-pointer.y * 0.35 + 0.15) * (1 - flat), 2, dt);
    g.position.y = (narrow ? 1.9 : 0.9) + Math.sin(t * 1.2) * 0.08;
  });

  return (
    <group ref={group} position={[narrow ? 0 : 1.9, 0.9, 0]} scale={narrow ? 1.25 : 1.65}>
      <instancedMesh args={[geometry, material, brain.count]} frustumCulled={false} />
      <pointLight color="#c6ff00" intensity={10} distance={10} />
    </group>
  );
}
