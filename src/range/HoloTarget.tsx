import { memo, useLayoutEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import type { RangeDestination, RangeTargetDef } from "./targets";

const W = 3.4;
const H = 1.25;
const BRACKET = 0.38;
const STROKE = 0.035;

// Values above 1 push these colors past the bloom threshold so they glow.
const IDLE = new THREE.Color(0.45, 1.5, 2.1);
const LOCKED = new THREE.Color(2.3, 0.55, 0.7);
const FLASH = new THREE.Color(3, 3, 3);
const DETAIL = "#8fb4d9";

interface HoloTargetProps {
  def: RangeTargetDef;
  position: [number, number, number];
  scale: number;
  hovered: boolean;
  hitAt: number | null;
  registerHitPlane: (id: RangeDestination, mesh: THREE.Mesh | null) => void;
}

function Bar({ x, y, w, h, color }: { x: number; y: number; w: number; h: number; color: THREE.Color }) {
  return (
    <mesh position={[x, y, 0.01]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

function Brackets({ color }: { color: THREE.Color }) {
  const hx = W / 2;
  const hy = H / 2;
  const corners: [number, number][] = [
    [-1, 1],
    [1, 1],
    [-1, -1],
    [1, -1],
  ];
  return (
    <>
      {corners.map(([sx, sy]) => (
        <group key={`${sx}${sy}`}>
          <Bar x={sx * (hx - BRACKET / 2)} y={sy * hy} w={BRACKET} h={STROKE} color={color} />
          <Bar x={sx * hx} y={sy * (hy - BRACKET / 2)} w={STROKE} h={BRACKET} color={color} />
        </group>
      ))}
    </>
  );
}

function HoloTarget({ def, position, scale, hovered, hitAt, registerHitPlane }: HoloTargetProps) {
  const root = useRef<THREE.Group>(null!);
  const body = useRef<THREE.Group>(null!);
  const spinner = useRef<THREE.Group>(null!);
  const camera = useThree((state) => state.camera);
  const phase = position[0];

  useLayoutEffect(() => {
    root.current.lookAt(camera.position);
  }, [camera, position]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    spinner.current.rotation.z = -t * 0.9;

    if (hitAt === null) {
      body.current.position.y = Math.sin(t * 1.3 + phase) * 0.08;
      const goal = hovered ? 1.06 : 1;
      body.current.scale.setScalar(THREE.MathUtils.lerp(body.current.scale.x, goal, 0.2));
      return;
    }

    const k = Math.min((t - hitAt) / 0.45, 1);
    const size = k < 0.2 ? 1.06 + k : 1.26 * (1 - (k - 0.2) / 0.8);
    body.current.scale.setScalar(Math.max(size, 0.001));
    body.current.rotation.z = k * 0.5;
  });

  const color = hitAt !== null ? FLASH : hovered ? LOCKED : IDLE;
  const ringX = -W / 2 + 0.65;
  const textX = -W / 2 + 1.3;

  return (
    <group ref={root} position={position} scale={scale}>
      <group ref={body}>
        <mesh>
          <planeGeometry args={[W, H]} />
          <meshBasicMaterial color="#071028" transparent opacity={0.62} depthWrite={false} />
        </mesh>
        <Brackets color={color} />

        <group position={[ringX, 0, 0.01]}>
          <mesh>
            <ringGeometry args={[0.36, 0.42, 48]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.17, 0.22, 40]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          <mesh>
            <circleGeometry args={[0.075, 24]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
          <group ref={spinner}>
            {[0, 2.09, 4.19].map((start) => (
              <mesh key={start}>
                <ringGeometry args={[0.5, 0.53, 24, 1, start, 1.4]} />
                <meshBasicMaterial color={color} toneMapped={false} transparent opacity={0.7} />
              </mesh>
            ))}
          </group>
        </group>

        <Text
          font="/fonts/ChakraPetch-Bold.ttf"
          position={[textX, 0.1, 0.01]}
          fontSize={0.36}
          letterSpacing={0.06}
          anchorX="left"
          anchorY="middle"
          // Text keeps the Color it receives and mutates it later, so it needs its own copy.
          color={color.clone()}
          material-toneMapped={false}
        >
          {def.label}
        </Text>
        <Text
          font="/fonts/ChakraPetch-Medium.ttf"
          position={[textX, -0.27, 0.01]}
          fontSize={0.13}
          letterSpacing={0.08}
          anchorX="left"
          anchorY="middle"
          color={DETAIL}
        >
          {def.detail.toUpperCase()}
        </Text>
        <Text
          font="/fonts/ChakraPetch-Bold.ttf"
          position={[W / 2 - 0.16, H / 2 - 0.14, 0.01]}
          fontSize={0.13}
          anchorX="right"
          anchorY="top"
          color={DETAIL}
        >
          {`[${def.hotkey}]`}
        </Text>

        <mesh
          ref={(mesh) => registerHitPlane(def.id, mesh)}
          position={[0, 0, 0.02]}
          userData={{ targetId: def.id }}
        >
          <planeGeometry args={[W + 0.2, H + 0.2]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      </group>
    </group>
  );
}

export default memo(HoloTarget);
