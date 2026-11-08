import { memo, useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import RangeEnvironment from "../range/RangeEnvironment";
import ShotEffects, { type ShotEffect, type ShotEffectKind } from "../range/ShotEffects";
import type { QualitySettings } from "../range/quality";
import PlayerController from "./PlayerController";
import GridshotRange from "./GridshotRange";
import { gridshot, useGridshotTargets } from "./gridshotStore";
import { REAR_WALL_Z } from "./layout";

export type GameShotOutcome = "target" | "surface" | "miss";

export interface GameApi {
  fire: () => GameShotOutcome;
}

interface GameSceneProps {
  apiRef: RefObject<GameApi | null>;
  active: RefObject<boolean>;
  sensitivity: RefObject<number>;
  quality: QualitySettings;
  onReady: () => void;
}

const MUZZLE_OFFSET = new THREE.Vector3(0.3, -0.26, -0.6);
const SCREEN_CENTER = new THREE.Vector2(0, 0);
const UP = new THREE.Vector3(0, 1, 0);
const STRIP = new THREE.Color(0.35, 1.3, 1.9);

// Closes off the end of the range behind the landing camera, which was never visible before.
function RearWalls({ solidRef }: { solidRef: RefObject<THREE.Group | null> }) {
  return (
    <>
      <group ref={solidRef}>
        <mesh position={[0, 1.2, REAR_WALL_Z]}>
          <boxGeometry args={[22.4, 2.4, 0.4]} />
          <meshStandardMaterial color="#0b1122" metalness={0.6} roughness={0.4} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 11, 1.2, 7]}>
            <boxGeometry args={[0.4, 2.4, 2]} />
            <meshStandardMaterial color="#0b1122" metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 2.42, REAR_WALL_Z - 0.22]}>
        <boxGeometry args={[22.4, 0.05, 0.05]} />
        <meshBasicMaterial color={STRIP} toneMapped={false} />
      </mesh>
    </>
  );
}

function GameScene({ apiRef, active, sensitivity, quality, onReady }: GameSceneProps) {
  const camera = useThree((state) => state.camera);
  const raycaster = useThree((state) => state.raycaster);
  const clock = useThree((state) => state.clock);
  const targets = useGridshotTargets();

  const envSolid = useRef<THREE.Group>(null);
  const rearSolid = useRef<THREE.Group>(null);
  const wallSolid = useRef<THREE.Group>(null);
  const stationSolid = useRef<THREE.Group>(null);
  const targetMeshes = useRef(new Map<number, THREE.Mesh>());
  const flash = useRef<THREE.PointLight>(null!);
  const nextEffectId = useRef(0);
  const [effects, setEffects] = useState<ShotEffect[]>([]);

  useEffect(onReady, [onReady]);

  const registerTarget = useCallback((id: number, mesh: THREE.Mesh | null) => {
    if (mesh) targetMeshes.current.set(id, mesh);
    else targetMeshes.current.delete(id);
  }, []);

  const spawn = useCallback(
    (kind: ShotEffectKind, from: THREE.Vector3, to: THREE.Vector3, normal: THREE.Vector3) => {
      const effect: ShotEffect = { id: nextEffectId.current++, kind, from, to, normal, born: clock.elapsedTime };
      setEffects((list) => [...list.slice(-30), effect]);
    },
    [clock],
  );

  const expire = useCallback((id: number) => {
    setEffects((list) => (list.some((e) => e.id === id) ? list.filter((e) => e.id !== id) : list));
  }, []);

  useEffect(() => {
    apiRef.current = {
      fire() {
        raycaster.setFromCamera(SCREEN_CENTER, camera);
        const candidates: THREE.Object3D[] = [...targetMeshes.current.values()];
        for (const solid of [envSolid, rearSolid, wallSolid, stationSolid]) {
          if (solid.current) candidates.push(solid.current);
        }
        const first = raycaster.intersectObjects(candidates, true)[0];

        const muzzle = camera.localToWorld(MUZZLE_OFFSET.clone());
        flash.current.position.copy(muzzle);
        flash.current.intensity = 8;

        if (!first) {
          spawn("tracer", muzzle, raycaster.ray.at(90, new THREE.Vector3()), UP);
          gridshot.registerMiss();
          return "miss";
        }

        spawn("tracer", muzzle, first.point.clone(), UP);
        const toCamera = camera.position.clone().sub(first.point).normalize();
        const targetId = first.object.userData.targetId as number | undefined;

        if (targetId !== undefined) {
          const center = first.object.getWorldPosition(new THREE.Vector3());
          spawn("burst", muzzle, center, toCamera);
          gridshot.hitTarget(targetId);
          return "target";
        }

        const normal = first.face
          ? first.face.normal.clone().transformDirection(first.object.matrixWorld)
          : toCamera;
        spawn("impact", muzzle, first.point.clone(), normal);
        gridshot.registerMiss();
        return "surface";
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, camera, raycaster, spawn]);

  useFrame((_, delta) => {
    flash.current.intensity = Math.max(flash.current.intensity - delta * 80, 0);
    gridshot.tick(performance.now());
  });

  return (
    <>
      <RangeEnvironment solidRef={envSolid} showLumi reflections={quality.reflections} />
      <RearWalls solidRef={rearSolid} />
      <GridshotRange
        targets={targets}
        registerTarget={registerTarget}
        wallRef={wallSolid}
        stationRef={stationSolid}
      />
      <PlayerController active={active} sensitivity={sensitivity} />

      <ShotEffects effects={effects} onExpire={expire} />
      <pointLight ref={flash} color="#ffd9a0" intensity={0} distance={7} />

      {quality.bloom && (
        <EffectComposer multisampling={quality.multisampling}>
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.85} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.3} darkness={0.55} />
        </EffectComposer>
      )}
    </>
  );
}

export default memo(GameScene);
