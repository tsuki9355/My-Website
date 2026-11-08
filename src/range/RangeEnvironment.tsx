import { memo, useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Billboard,
  Grid,
  Instance,
  Instances,
  MeshReflectorMaterial,
  Stars,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";

const STRIP = new THREE.Color(0.35, 1.3, 1.9);
const STRIP_SOFT = new THREE.Color(0.25, 0.7, 1.1);
const BEACON = new THREE.Color(2.4, 0.4, 0.5);

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Building {
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  windows: { y: number; lit: boolean }[];
}

const SKYLINE: Building[] = (() => {
  const rand = seeded(42);
  const list: Building[] = [];
  for (let x = -44; x <= 44; x += 3.2 + rand() * 2.5) {
    const h = 3 + rand() * 10;
    list.push({
      x,
      z: -30 - rand() * 14,
      w: 2 + rand() * 2.4,
      d: 2 + rand() * 3,
      h,
      windows: Array.from({ length: Math.floor(h / 1.6) }, (_, i) => ({
        y: 1 + i * 1.6,
        lit: rand() > 0.55,
      })),
    });
  }
  return list;
})();

const BEACON_INDICES = SKYLINE.map((b, i) => [b.h, i])
  .sort((a, b) => b[0] - a[0])
  .slice(0, 4)
  .map(([, i]) => i);

function makeMoonTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size / 2;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#d9def0";
  ctx.fillRect(0, 0, size, size / 2);
  const rand = seeded(7);
  for (let i = 0; i < 70; i++) {
    const r = 2 + rand() * 12;
    ctx.fillStyle = `rgba(120, 130, 165, ${0.15 + rand() * 0.3})`;
    ctx.beginPath();
    ctx.arc(rand() * size, rand() * (size / 2), r, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Moon() {
  const texture = useMemo(() => makeMoonTexture(), []);
  return (
    <mesh position={[-26, 31, -95]} rotation={[0.3, 0.6, 0]}>
      <sphereGeometry args={[8, 48, 32]} />
      <meshBasicMaterial map={texture} color={[1.45, 1.5, 1.7]} toneMapped={false} fog={false} />
    </mesh>
  );
}

const LIT_WINDOWS = SKYLINE.flatMap((b) =>
  b.windows
    .filter((win) => win.lit)
    .map((win) => ({ key: `${b.x}:${win.y}`, x: b.x, y: win.y, z: b.z + b.d / 2 + 0.01, w: b.w * 0.7 })),
);

// Instanced so the whole skyline costs two draw calls instead of one per building and window.
function Skyline() {
  const beacon = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame((state) => {
    beacon.current.opacity = Math.sin(state.clock.elapsedTime * 2.2) > 0.6 ? 1 : 0.08;
  });

  return (
    <group>
      <Instances limit={SKYLINE.length} frames={1}>
        <boxGeometry />
        <meshBasicMaterial color="#0c1328" fog={false} />
        {SKYLINE.map((b) => (
          <Instance key={b.x} position={[b.x, b.h / 2, b.z]} scale={[b.w, b.h, b.d]} />
        ))}
      </Instances>
      <Instances limit={LIT_WINDOWS.length} frames={1}>
        <planeGeometry />
        <meshBasicMaterial color={STRIP_SOFT} toneMapped={false} fog={false} />
        {LIT_WINDOWS.map((win) => (
          <Instance key={win.key} position={[win.x, win.y, win.z]} scale={[win.w, 0.12, 1]} />
        ))}
      </Instances>
      <Instances limit={BEACON_INDICES.length} frames={1}>
        <sphereGeometry args={[0.18, 12, 8]} />
        <meshBasicMaterial ref={beacon} color={BEACON} toneMapped={false} fog={false} transparent />
        {BEACON_INDICES.map((i) => (
          <Instance key={i} position={[SKYLINE[i].x, SKYLINE[i].h + 0.25, SKYLINE[i].z]} />
        ))}
      </Instances>
    </group>
  );
}

function LumiHologram() {
  const texture = useTexture("/Lumi-hero.png", (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });
  const material = useRef<THREE.MeshBasicMaterial>(null!);
  const figure = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    figure.current.position.y = 1.35 + Math.sin(t * 1.6) * 0.06;
    material.current.opacity = 0.78 + Math.sin(t * 23) * 0.04 + (Math.sin(t * 0.7) > 0.97 ? -0.35 : 0);
  });

  return (
    <group position={[-6.8, 0, -4]}>
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.75, 0.85, 0.24, 40]} />
        <meshStandardMaterial color="#0d1428" metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.62, 48]} />
        <meshBasicMaterial color={STRIP} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.6, 0.62, 2.1, 40, 1, true]} />
        <meshBasicMaterial
          color="#4fd8ff"
          transparent
          opacity={0.07}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <Billboard>
        <group ref={figure}>
          <mesh>
            <planeGeometry args={[1.3, 1.86]} />
            <meshBasicMaterial
              ref={material}
              map={texture}
              color={[0.8, 1.15, 1.45]}
              transparent
              alphaTest={0.05}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      </Billboard>
    </group>
  );
}

interface RangeEnvironmentProps {
  solidRef: RefObject<THREE.Group | null>;
  showLumi: boolean;
  reflections: boolean;
}

function RangeEnvironment({ solidRef, showLumi, reflections }: RangeEnvironmentProps) {
  return (
    <>
      <color attach="background" args={["#03050c"]} />
      <fog attach="fog" args={["#03050c", 16, 62]} />
      <ambientLight intensity={0.35} />
      <hemisphereLight args={["#8fa8ff", "#05070f", 0.45]} />
      <directionalLight position={[-18, 22, -40]} intensity={0.7} color="#a9bcff" />

      <Stars radius={110} depth={40} count={2500} factor={3.5} saturation={0} fade speed={0.4} />
      <Moon />
      <Skyline />

      {/* Everything in this group can take bullet impacts. */}
      <group ref={solidRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[120, 120]} />
          {reflections ? (
            // Re-renders the scene from below every frame, so it's reserved for the high tier.
            <MeshReflectorMaterial
              resolution={512}
              blur={[200, 60]}
              mixBlur={1}
              mixStrength={18}
              roughness={0.9}
              depthScale={1.1}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#050812"
              metalness={0.75}
            />
          ) : (
            <meshStandardMaterial color="#050812" metalness={0.75} roughness={0.5} />
          )}
        </mesh>

        <mesh position={[0, 0.8, -13]}>
          <boxGeometry args={[36, 1.6, 0.5]} />
          <meshStandardMaterial color="#0b1122" metalness={0.6} roughness={0.4} />
        </mesh>

        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 11, 1.2, -3.5]}>
            <boxGeometry args={[0.4, 2.4, 19]} />
            <meshStandardMaterial color="#0b1122" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>

      <mesh position={[0, 1.62, -12.74]}>
        <boxGeometry args={[36, 0.05, 0.04]} />
        <meshBasicMaterial color={STRIP} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.35, -12.74]}>
        <boxGeometry args={[36, 0.03, 0.04]} />
        <meshBasicMaterial color={STRIP_SOFT} toneMapped={false} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 10.78, 2.42, -3.5]}>
            <boxGeometry args={[0.05, 0.05, 19]} />
            <meshBasicMaterial color={STRIP} toneMapped={false} />
          </mesh>
          {[2, -2, -6, -10].map((z) => (
            <mesh key={z} position={[side * 10.78, 1.2, z]}>
              <boxGeometry args={[0.04, 2.2, 0.06]} />
              <meshBasicMaterial color={STRIP_SOFT} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}

      <Grid
        position={[0, 0.005, 0]}
        args={[10, 10]}
        infiniteGrid
        cellSize={0.6}
        cellThickness={0.6}
        cellColor="#14223f"
        sectionSize={3}
        sectionThickness={1.1}
        sectionColor="#2b74ad"
        fadeDistance={42}
        fadeStrength={1.4}
      />

      {showLumi && <LumiHologram />}
    </>
  );
}

export default memo(RangeEnvironment);
