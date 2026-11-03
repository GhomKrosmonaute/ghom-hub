"use client";

import { damp } from "@ghom/core";
import { pointer } from "@ghom/ui/hooks/use-pointer";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  type Group,
  IcosahedronGeometry,
  type Mesh,
  ShaderMaterial,
} from "three";
import { rig } from "./rig";

/**
 * Le "réacteur" de l'exosquelette : sphère fresnel, coque icosaèdre filaire,
 * anneaux gyroscopiques. Il suit le regard du pilote.
 */
export function ExoCore() {
  const group = useRef<Group>(null);
  const rings = useRef<Group>(null);
  const shell = useRef<Mesh>(null);
  const { viewport } = useThree();
  const narrow = viewport.aspect < 1;

  const fresnel = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new Color("#00f0ff") },
          uPulse: { value: 0 },
        },
        vertexShader: /* glsl */ `
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vNormal = normalize(normalMatrix * normal);
            vView = normalize(-mv.xyz);
            vPos = position;
            gl_Position = projectionMatrix * mv;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uPulse;
          varying vec3 vNormal;
          varying vec3 vView;
          varying vec3 vPos;
          void main() {
            float f = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.4);
            float bands = 0.5 + 0.5 * sin(vPos.y * 18.0 - uTime * 3.0);
            vec3 col = uColor * (f * 2.4 + bands * 0.12 + uPulse * 0.6);
            gl_FragColor = vec4(col, f + bands * 0.06);
          }
        `,
      }),
    [],
  );

  const shellGeo = useMemo(() => new IcosahedronGeometry(1.25, 1), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;

    fresnel.uniforms.uTime!.value = t;
    fresnel.uniforms.uPulse!.value = 0.5 + 0.5 * Math.sin(t * 2.2) + rig.shock;

    g.rotation.y = damp(g.rotation.y, pointer.x * 0.6, 3, dt);
    g.rotation.x = damp(g.rotation.x, -pointer.y * 0.4, 3, dt);
    g.position.y = (narrow ? 3.4 : 2.1) + Math.sin(t * 1.1) * 0.12;

    if (shell.current) {
      shell.current.rotation.y += dt * 0.25;
      shell.current.rotation.z += dt * 0.1;
      const s = 1 + rig.shock * 0.18;
      shell.current.scale.setScalar(s);
    }
    if (rings.current) {
      const [a, b, c] = rings.current.children;
      if (a) a.rotation.x += dt * 0.9;
      if (b) b.rotation.y += dt * 0.7;
      if (c) c.rotation.z -= dt * 0.5;
    }
  });

  return (
    <group ref={group} position={[narrow ? 0 : 2.7, 2.1, 0.5]}>
      <mesh material={fresnel}>
        <sphereGeometry args={[0.85, 64, 64]} />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshBasicMaterial color={[4, 4, 4]} toneMapped={false} />
      </mesh>
      <lineSegments ref={shell}>
        <edgesGeometry args={[shellGeo]} />
        <lineBasicMaterial color={[2.4, 0.3, 2]} toneMapped={false} transparent opacity={0.85} />
      </lineSegments>
      <group ref={rings}>
        {[1.7, 2.0, 2.35].map((r, i) => (
          <mesh key={r} rotation={[i * 0.9, i * 0.6, 0]}>
            <torusGeometry args={[r, 0.012, 8, 160]} />
            <meshBasicMaterial
              color={i === 1 ? [2.6, 0.4, 2.2] : [0.2, 2.4, 2.8]}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
      <pointLight color="#00f0ff" intensity={14} distance={14} />
    </group>
  );
}
