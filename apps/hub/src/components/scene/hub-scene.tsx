"use client";

import { useReducedMotion } from "@ghom/ui/hooks/use-reduced-motion";
import { PerformanceMonitor } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";
import { CameraRig } from "./camera-rig";
import { City } from "./city";
import { DataRain } from "./data-rain";
import { Effects } from "./effects";
import { ExoCore } from "./exo-core";
import { NeonFloor } from "./neon-floor";
import { StudioPortal } from "./studio-portal";

export default function HubScene() {
  const reduced = useReducedMotion();
  const [dpr, setDpr] = useState(1.5);
  const small = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <Canvas
      aria-hidden
      className="!fixed inset-0"
      style={{ position: "fixed", inset: 0 }}
      dpr={dpr}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ position: [0, 1.7, 8], fov: small ? 70 : 55, near: 0.1, far: 220 }}
    >
      {/* Si les perfs faiblissent : on baisse la résolution, jamais les effets
          (bloom + aberration chromatique font l'identité visuelle du hub). */}
      <PerformanceMonitor
        onIncline={() => setDpr(Math.min(2, window.devicePixelRatio))}
        onDecline={() => setDpr(1)}
        onFallback={() => setDpr(1)}
        flipflops={3}
      />
      <color attach="background" args={["#020204"]} />
      <fogExp2 attach="fog" args={["#06030c", 0.028]} />
      <hemisphereLight args={["#6a3cff", "#000000", 0.6]} />
      <directionalLight position={[-10, 20, 5]} intensity={0.4} color="#00f0ff" />

      <CameraRig />
      <NeonFloor />
      <City count={small ? 140 : 260} />
      <ExoCore />
      <StudioPortal />
      <DataRain count={small ? 700 : 1800} />
      <Effects />
    </Canvas>
  );
}
