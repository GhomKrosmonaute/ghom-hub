"use client";

import { useReducedMotion } from "@ghom/ui/hooks/use-reduced-motion";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { ArcadeRig } from "./arcade-rig";
import { ArcadeEffects } from "./effects";
import { PixelFloor } from "./pixel-floor";
import { VoxelBrain } from "./voxel-brain";

export default function BrainScene() {
  const reduced = useReducedMotion();
  const [dpr, setDpr] = useState(1.5);
  const [fx, setFx] = useState(true);
  const small = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      aria-hidden
      style={{ position: "fixed", inset: 0 }}
      dpr={dpr}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [0, 0.9, 6.5], fov: small ? 65 : 50, near: 0.1, far: 120 }}
    >
      <PerformanceMonitor
        onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
        onDecline={() => setDpr(1)}
        onFallback={() => setFx(false)}
        flipflops={3}
      />
      <color attach="background" args={["#050307"]} />
      <fog attach="fog" args={["#050307", 12, 45]} />
      <ArcadeRig />
      <PixelFloor />
      <VoxelBrain dense={!small} />
      {fx && <ArcadeEffects />}
    </Canvas>
  );
}
