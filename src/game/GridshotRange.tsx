import { memo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { GRID_CELLS, GRID_WALL, STATION, gridCellPosition } from "./layout";
import { useGridshot, type ActiveTarget } from "./gridshotStore";

const CYAN = new THREE.Color(0.45, 1.5, 2.1);
const TARGET = new THREE.Color(0.5, 1.7, 2.4);
const SOCKET = new THREE.Color(0.2, 0.55, 0.8);
const FONT_BOLD = "/fonts/ChakraPetch-Bold.ttf";
const FONT_MEDIUM = "/fonts/ChakraPetch-Medium.ttf";

function Target({
  target,
  registerTarget,
}: {
  target: ActiveTarget;
  registerTarget: (id: number, mesh: THREE.Mesh | null) => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const born = useRef<number | null>(null);

  useFrame((state) => {
    born.current ??= state.clock.elapsedTime;
    const k = Math.min((state.clock.elapsedTime - born.current) / 0.12, 1);
    group.current.scale.setScalar(0.3 + 0.7 * k);
  });

  return (
    <group ref={group} position={gridCellPosition(target.cell)}>
      <mesh ref={(mesh) => registerTarget(target.id, mesh)} userData={{ targetId: target.id }}>
        <sphereGeometry args={[GRID_WALL.targetRadius, 24, 16]} />
        <meshBasicMaterial color={TARGET} toneMapped={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[GRID_WALL.targetRadius + 0.06, GRID_WALL.targetRadius + 0.09, 32]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function TargetWall() {
  return (
    <group>
      <mesh position={[0, GRID_WALL.centerY, GRID_WALL.z]}>
        <boxGeometry args={[GRID_WALL.width, GRID_WALL.height, GRID_WALL.depth]} />
        <meshStandardMaterial color="#070d1f" metalness={0.6} roughness={0.45} />
      </mesh>
      {/* Glowing frame along the top and bottom edges. */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          position={[0, GRID_WALL.centerY + (side * GRID_WALL.height) / 2, GRID_WALL.z + GRID_WALL.depth / 2 + 0.01]}
        >
          <planeGeometry args={[GRID_WALL.width, 0.04]} />
          <meshBasicMaterial color={CYAN} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: GRID_CELLS }, (_, cell) => {
        const [x, y, z] = gridCellPosition(cell);
        return (
          <mesh key={cell} position={[x, y, z - 0.33]}>
            <ringGeometry args={[0.16, 0.18, 24]} />
            <meshBasicMaterial color={SOCKET} toneMapped={false} transparent opacity={0.5} />
          </mesh>
        );
      })}
      <Text
        font={FONT_BOLD}
        position={[0, GRID_WALL.centerY + GRID_WALL.height / 2 + 0.35, GRID_WALL.z]}
        fontSize={0.38}
        letterSpacing={0.18}
        color={CYAN.clone()}
        material-toneMapped={false}
      >
        GRIDSHOT
      </Text>
    </group>
  );
}

function StationSign() {
  const { phase, best, nearStation } = useGridshot();
  const busy = phase === "countdown" || phase === "running";
  const prompt = busy ? "IN PROGRESS" : phase === "results" ? "[E] PLAY AGAIN" : "[E] START";

  // A small screen on the player-facing side of the console, tilted up so it reads from above
  // without blocking the line of sight to the target wall.
  return (
    <group position={[0, 1.02, STATION.radius * 0.55]} rotation={[-1.0, 0, 0]}>
      <mesh>
        <planeGeometry args={[0.78, 0.42]} />
        <meshBasicMaterial color="#04081a" />
      </mesh>
      <Text font={FONT_BOLD} position={[0, 0.1, 0.005]} fontSize={0.085} letterSpacing={0.14} color={CYAN.clone()} material-toneMapped={false}>
        GRIDSHOT
      </Text>
      <Text font={FONT_MEDIUM} position={[0, -0.01, 0.005]} fontSize={0.042} letterSpacing={0.12} color="#8fb4d9">
        {`30 SECONDS  //  BEST ${best}`}
      </Text>
      <Text
        font={FONT_BOLD}
        position={[0, -0.11, 0.005]}
        fontSize={0.05}
        letterSpacing={0.12}
        color={nearStation && !busy ? "#ffffff" : "#8fb4d9"}
      >
        {prompt}
      </Text>
    </group>
  );
}

// Spinning diamond above the console so it's easy to find from across the range.
function Beacon() {
  const diamond = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    diamond.current.rotation.y = t * 1.5;
    diamond.current.position.y = 2.35 + Math.sin(t * 2) * 0.06;
  });
  return (
    <mesh ref={diamond}>
      <octahedronGeometry args={[0.13, 0]} />
      <meshBasicMaterial color={CYAN} toneMapped={false} />
    </mesh>
  );
}

function Station({ solidRef }: { solidRef: RefObject<THREE.Group | null> }) {
  const ring = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ring.current.rotation.z = state.clock.elapsedTime * 0.8;
  });

  return (
    <group position={[STATION.x, 0, STATION.z]}>
      <group ref={solidRef}>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[STATION.radius * 0.8, STATION.radius, 1, 6]} />
          <meshStandardMaterial color="#0d1428" metalness={0.7} roughness={0.35} />
        </mesh>
      </group>
      <mesh position={[0, 1.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.3, 6]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      <mesh ref={ring} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.05, 48, 1, 0, Math.PI * 1.6]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} transparent opacity={0.6} />
      </mesh>
      <StationSign />
      <Beacon />
    </group>
  );
}

interface GridshotRangeProps {
  targets: ActiveTarget[];
  registerTarget: (id: number, mesh: THREE.Mesh | null) => void;
  wallRef: RefObject<THREE.Group | null>;
  stationRef: RefObject<THREE.Group | null>;
}

function GridshotRange({ targets, registerTarget, wallRef, stationRef }: GridshotRangeProps) {
  return (
    <>
      <group ref={wallRef}>
        <TargetWall />
      </group>
      <Station solidRef={stationRef} />
      {targets.map((target) => (
        <Target key={target.id} target={target} registerTarget={registerTarget} />
      ))}
    </>
  );
}

export default memo(GridshotRange);
