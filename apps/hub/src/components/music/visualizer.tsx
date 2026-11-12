"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useMemo, useRef } from "react";
import { Color, type InstancedMesh, type Mesh, Object3D, Vector3 } from "three";
import { audio, currentPosition, sampleWave } from "./audio-state";

const BARS = 72;
const RADIUS = 2.2;
const dummy = new Object3D();
const c1 = new Color("#00f0ff");
const c2 = new Color("#ff2fd6");
const tmp = new Color();
const size = new Vector3();

/**
 * Anneau de barres : chaque barre lit la forme d'onde autour de la tête de lecture
 * (fenêtre glissante), modulée par un léger bruit pour imiter un spectre.
 */
function Ring({ reduced }: { reduced: boolean }) {
  const bars = useRef<InstancedMesh>(null);
  const core = useRef<Mesh>(null);
  const halo = useRef<Mesh>(null);
  const levels = useMemo(() => new Float32Array(BARS), []);
  const colored = useRef(false);
  // L'anneau (rayon + barres au maximum ≈ 3,6) tient toujours dans le plus petit côté du canvas.
  const viewport = useThree((s) => s.viewport);
  const fit = Math.min(1, Math.min(viewport.width, viewport.height) / 2 / 3.7);

  useFrame((state, dt) => {
    const mesh = bars.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    const track = audio.track;
    const rel = track ? currentPosition() / track.duration : 0;
    const amp = track && audio.playing ? sampleWave(track.wave, rel) : 0;
    const ease = 1 - Math.exp(-dt * 10);

    for (let i = 0; i < BARS; i++) {
      const side = i < BARS / 2 ? i : BARS - 1 - i; // symétrie gauche/droite
      const offset = (side / (BARS / 2) - 0.5) * 0.04; // ±2 % du morceau autour de la tête
      const local = track && audio.playing ? sampleWave(track.wave, rel + offset) : 0;
      const jitter = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t * (6 + (side % 7)) + side * 1.7);
      const target = audio.playing ? 0.08 + local * jitter * 1.6 : 0.06 + 0.03 * Math.sin(t + i);
      const lv = (levels[i] ?? 0) + (target - (levels[i] ?? 0)) * ease;
      levels[i] = lv;

      const a = (i / BARS) * Math.PI * 2;
      dummy.position.set(Math.cos(a) * RADIUS, Math.sin(a) * RADIUS, 0);
      dummy.rotation.set(0, 0, a - Math.PI / 2);
      dummy.scale.set(1, Math.min(Math.max(lv * 2, 0.05), 1.3), 1);
      dummy.translateY(Math.min(Math.max(lv * 2, 0.05), 1.3) / 2);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (!colored.current) mesh.setColorAt(i, tmp.copy(c1).lerp(c2, side / (BARS / 2)));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (!colored.current && mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true;
      colored.current = true;
    }

    if (core.current) {
      const s = 0.9 + amp * 0.6;
      core.current.scale.lerp(size.setScalar(s), ease);
      if (!reduced) {
        core.current.rotation.x += dt * (0.2 + amp);
        core.current.rotation.y += dt * (0.3 + amp * 1.5);
      }
    }
    if (halo.current && !reduced) halo.current.rotation.z -= dt * (0.1 + amp * 0.8);
  });

  return (
    <group rotation={[-0.35, 0, 0]} scale={fit}>
      <instancedMesh ref={bars} args={[undefined, undefined, BARS]}>
        <boxGeometry args={[0.07, 1, 0.07]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.1, 1]} />
        <meshBasicMaterial color="#ff2fd6" wireframe toneMapped={false} />
      </mesh>
      <mesh ref={halo}>
        <torusGeometry args={[RADIUS - 0.25, 0.012, 8, 128]} />
        <meshBasicMaterial color="#00f0ff" toneMapped={false} />
      </mesh>
    </group>
  );
}

/** `active` : la scène ne tourne que lorsque la section est à l'écran. */
export default function Visualizer({ reduced, active }: { reduced: boolean; active: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 9.5], fov: 45 }}
      gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}
      frameloop={active ? "always" : "never"}
    >
      <Ring reduced={reduced} />
      <EffectComposer multisampling={0}>
        <Bloom intensity={1.4} luminanceThreshold={0.1} mipmapBlur />
      </EffectComposer>
    </Canvas>
  );
}
