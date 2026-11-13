"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import { Color, type InstancedMesh, type MeshBasicMaterial, Object3D } from "three";
import { rig } from "./rig";

const NEONS = ["#00f0ff", "#ff2bd6", "#8b5cff", "#e8ff3a", "#ff5e1a"];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Tower {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  neon: string;
  strip: "top" | "side" | "none";
}

/** Mégapole procédurale : tours sombres de part et d'autre du couloir, liserés néon. */
export function City({ count = 240 }: { count?: number }) {
  const towersRef = useRef<InstancedMesh>(null);
  const stripsRef = useRef<InstancedMesh>(null);
  const stripsMat = useRef<MeshBasicMaterial>(null);

  // Musique : les néons des tours respirent avec les basses, s'allument sur la caisse claire (teinte multipliée, jamais blanchie).
  useFrame(() => {
    stripsMat.current?.color.setScalar(
      0.7 +
        rig.bass * 1.3 +
        rig.punch * 1.2 +
        rig.mid * 0.7 +
        rig.snare * 0.9 +
        rig.high * 0.4 +
        rig.tick * 0.5,
    );
  });

  const towers = useMemo<Tower[]>(() => {
    const rand = mulberry32(7);
    return Array.from({ length: count }, () => {
      const side = rand() > 0.5 ? 1 : -1;
      const far = rand() ** 1.6;
      const x = side * (6 + far * 38 + rand() * 2);
      const z = 22 - rand() * 150;
      const h = 2 + rand() ** 2 * 22 + far * 10;
      const r = rand();
      return {
        x,
        z,
        w: 1 + rand() * 2.6,
        d: 1 + rand() * 2.6,
        h,
        neon: NEONS[Math.floor(rand() * NEONS.length)]!,
        strip: r < 0.45 ? "top" : r < 0.75 ? "side" : "none",
      };
    });
  }, [count]);

  useLayoutEffect(() => {
    const o = new Object3D();
    const c = new Color();
    const towersMesh = towersRef.current;
    const stripsMesh = stripsRef.current;
    if (!towersMesh || !stripsMesh) return;

    let s = 0;
    towers.forEach((t, i) => {
      o.position.set(t.x, t.h / 2, t.z);
      o.scale.set(t.w, t.h, t.d);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      towersMesh.setMatrixAt(i, o.matrix);

      if (t.strip === "none") return;
      if (t.strip === "top") {
        o.position.set(t.x, t.h + 0.03, t.z);
        o.scale.set(t.w * 1.02, 0.06, t.d * 1.02);
      } else {
        // liseré vertical sur la face qui regarde le couloir
        const face = t.x > 0 ? -1 : 1;
        o.position.set(t.x + (face * t.w) / 2, t.h / 2, t.z + t.d * 0.3);
        o.scale.set(0.06, t.h * 0.92, 0.06);
      }
      o.updateMatrix();
      stripsMesh.setMatrixAt(s, o.matrix);
      // Couleur > 1 pour déclencher le bloom
      stripsMesh.setColorAt(s, c.set(t.neon).multiplyScalar(2.2));
      s++;
    });
    stripsMesh.count = s;
    towersMesh.instanceMatrix.needsUpdate = true;
    stripsMesh.instanceMatrix.needsUpdate = true;
    if (stripsMesh.instanceColor) stripsMesh.instanceColor.needsUpdate = true;
  }, [towers]);

  return (
    <group>
      <instancedMesh
        ref={towersRef}
        args={[undefined, undefined, towers.length]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshStandardMaterial color="#07070d" roughness={0.55} metalness={0.7} />
      </instancedMesh>
      <instancedMesh
        ref={stripsRef}
        args={[undefined, undefined, towers.length]}
        frustumCulled={false}
      >
        <boxGeometry />
        <meshBasicMaterial ref={stripsMat} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}
