import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type ShotEffectKind = "tracer" | "impact" | "burst";

export interface ShotEffect {
  id: number;
  kind: ShotEffectKind;
  from: THREE.Vector3;
  to: THREE.Vector3;
  normal: THREE.Vector3;
  born: number;
}

const LIFETIME: Record<ShotEffectKind, number> = { tracer: 0.08, impact: 3, burst: 0.55 };
const TRACER = new THREE.Color(2.2, 1.9, 1.3);
const SPARK = new THREE.Color(0.6, 1.8, 2.4);
const UP = new THREE.Vector3(0, 1, 0);

interface EffectProps {
  effect: ShotEffect;
  onExpire: (id: number) => void;
}

function Tracer({ effect, onExpire }: EffectProps) {
  const material = useRef<THREE.MeshBasicMaterial>(null!);
  const { midpoint, quaternion, length } = useMemo(() => {
    const dir = effect.to.clone().sub(effect.from);
    return {
      midpoint: effect.from.clone().add(effect.to).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    };
  }, [effect]);

  useFrame((state) => {
    const k = (state.clock.elapsedTime - effect.born) / LIFETIME.tracer;
    material.current.opacity = Math.max(1 - k, 0);
    if (k >= 1) onExpire(effect.id);
  });

  return (
    <mesh position={midpoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.012, 0.012, length, 6, 1, true]} />
      <meshBasicMaterial
        ref={material}
        color={TRACER}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </mesh>
  );
}

function Ring({ effect, onExpire }: EffectProps) {
  const group = useRef<THREE.Group>(null!);
  const ring = useRef<THREE.Mesh>(null!);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null!);
  const markMat = useRef<THREE.MeshBasicMaterial>(null);
  const burst = effect.kind === "burst";

  useLayoutEffect(() => {
    group.current.position.copy(effect.to).addScaledVector(effect.normal, 0.015);
    group.current.lookAt(effect.to.clone().add(effect.normal));
  }, [effect]);

  useFrame((state) => {
    const age = state.clock.elapsedTime - effect.born;
    const ringK = Math.min(age / (burst ? 0.55 : 0.35), 1);
    ring.current.scale.setScalar(burst ? 0.3 + ringK * 2.4 : 0.4 + ringK * 1.6);
    ringMat.current.opacity = 1 - ringK;
    if (markMat.current) markMat.current.opacity = 0.9 * (1 - age / LIFETIME.impact);
    if (age >= LIFETIME[effect.kind]) onExpire(effect.id);
  });

  return (
    <group ref={group}>
      <mesh ref={ring}>
        <ringGeometry args={[0.14, 0.18, 32]} />
        <meshBasicMaterial
          ref={ringMat}
          color={SPARK}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      {!burst && (
        <mesh>
          <circleGeometry args={[0.045, 16]} />
          <meshBasicMaterial ref={markMat} color={SPARK} transparent depthWrite={false} toneMapped={false} />
        </mesh>
      )}
    </group>
  );
}

interface ShotEffectsProps {
  effects: ShotEffect[];
  onExpire: (id: number) => void;
}

function ShotEffects({ effects, onExpire }: ShotEffectsProps) {
  return (
    <>
      {effects.map((effect) =>
        effect.kind === "tracer" ? (
          <Tracer key={effect.id} effect={effect} onExpire={onExpire} />
        ) : (
          <Ring key={effect.id} effect={effect} onExpire={onExpire} />
        ),
      )}
    </>
  );
}

export default ShotEffects;
