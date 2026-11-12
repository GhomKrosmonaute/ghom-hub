"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group } from "three";
import { rig } from "./rig";

/** Portail hexagonal au bout du couloir : le passage vers No Brain No Game. */
export function StudioPortal() {
  const ref = useRef<Group>(null);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    // Horloge musicale : rotation et battement du cœur suivent les basses.
    const t = rig.time;
    const spin = dt * (1 + rig.bass * 2.5);
    const [outer, inner, core] = g.children;
    if (outer) outer.rotation.z += spin * 0.15;
    if (inner) inner.rotation.z -= spin * (0.4 + rig.shock * 3);
    if (core) core.scale.setScalar(1 + Math.sin(t * 3) * 0.06 + rig.bass * 0.08);
    // Le portail "s'allume" quand on approche de la section studio
    const near = Math.min(1, Math.max(0, (rig.scroll - 0.5) / 0.3));
    g.scale.setScalar(0.7 + near * 0.5);
  });

  return (
    <group ref={ref} position={[0, 6.5, -62]}>
      <mesh>
        <torusGeometry args={[7, 0.08, 6, 6]} />
        <meshBasicMaterial color={[1.6, 3, 0]} toneMapped={false} />
      </mesh>
      <mesh>
        <torusGeometry args={[5.6, 0.05, 6, 6]} />
        <meshBasicMaterial color={[3, 0.9, 0.1]} toneMapped={false} />
      </mesh>
      <mesh>
        <circleGeometry args={[5.4, 6]} />
        <meshBasicMaterial color="#c6ff00" transparent opacity={0.06} toneMapped={false} />
      </mesh>
    </group>
  );
}
