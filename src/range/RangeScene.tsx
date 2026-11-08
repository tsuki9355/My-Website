import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import HoloTarget from "./HoloTarget";
import RangeEnvironment from "./RangeEnvironment";
import ShotEffects, { type ShotEffect, type ShotEffectKind } from "./ShotEffects";
import { RANGE_TARGETS, type RangeDestination } from "./targets";
import type { QualitySettings } from "./quality";

export type ShotOutcome = RangeDestination | "surface" | "miss" | "locked";

export interface RangeApi {
  fire: (x: number, y: number) => ShotOutcome;
  fireAt: (id: RangeDestination) => ShotOutcome;
}

export interface PointerState {
  x: number;
  y: number;
  inside: boolean;
}

interface RangeSceneProps {
  apiRef: RefObject<RangeApi | null>;
  pointer: RefObject<PointerState>;
  quality: QualitySettings;
  onHoverChange: (id: RangeDestination | null) => void;
  onTargetDestroyed: (id: RangeDestination) => void;
  onReady: () => void;
}

const MUZZLE_OFFSET = new THREE.Vector3(0.42, -0.36, -0.8);
const UP_VECTOR = new THREE.Vector3(0, 1, 0);
const DESTROY_DELAY_MS = 450;

function RangeScene({ apiRef, pointer, quality, onHoverChange, onTargetDestroyed, onReady }: RangeSceneProps) {
  const camera = useThree((state) => state.camera);
  const raycaster = useThree((state) => state.raycaster);
  const clock = useThree((state) => state.clock);
  const size = useThree((state) => state.size);
  const aspect = size.width / size.height;
  const tall = aspect < 1.25;

  const solidRef = useRef<THREE.Group>(null);
  const hitPlanes = useRef(new Map<RangeDestination, THREE.Mesh>());
  const hoveredRef = useRef<RangeDestination | null>(null);
  const lockedRef = useRef(false);
  const nextId = useRef(0);
  const flash = useRef<THREE.PointLight>(null!);
  const ndc = useRef(new THREE.Vector2());

  const [hovered, setHovered] = useState<RangeDestination | null>(null);
  const [hit, setHit] = useState<{ id: RangeDestination; at: number } | null>(null);
  const [effects, setEffects] = useState<ShotEffect[]>([]);

  useLayoutEffect(() => {
    camera.lookAt(0, tall ? 2.6 : 2.3, -8);
  }, [camera, tall]);

  // Runs once fonts and textures have finished suspending.
  useEffect(onReady, [onReady]);

  const registerHitPlane = useCallback((id: RangeDestination, mesh: THREE.Mesh | null) => {
    if (mesh) hitPlanes.current.set(id, mesh);
    else hitPlanes.current.delete(id);
  }, []);

  const spawn = useCallback(
    (kind: ShotEffectKind, from: THREE.Vector3, to: THREE.Vector3, normal: THREE.Vector3) => {
      const effect: ShotEffect = { id: nextId.current++, kind, from, to, normal, born: clock.elapsedTime };
      setEffects((list) => [...list.slice(-30), effect]);
    },
    [clock],
  );

  const expire = useCallback((id: number) => {
    setEffects((list) => (list.some((e) => e.id === id) ? list.filter((e) => e.id !== id) : list));
  }, []);

  useEffect(() => {
    const fire = (x: number, y: number): ShotOutcome => {
      if (lockedRef.current) return "locked";

      raycaster.setFromCamera(ndc.current.set(x, y), camera);
      const candidates: THREE.Object3D[] = [...hitPlanes.current.values()];
      if (solidRef.current) candidates.push(solidRef.current);
      const first = raycaster.intersectObjects(candidates, true)[0];

      const muzzle = camera.localToWorld(MUZZLE_OFFSET.clone());
      flash.current.position.copy(muzzle);
      flash.current.intensity = 10;

      if (!first) {
        spawn("tracer", muzzle, raycaster.ray.at(90, new THREE.Vector3()), UP_VECTOR);
        return "miss";
      }

      spawn("tracer", muzzle, first.point.clone(), UP_VECTOR);
      const targetId = first.object.userData.targetId as RangeDestination | undefined;
      const toCamera = camera.position.clone().sub(first.point).normalize();

      if (targetId) {
        lockedRef.current = true;
        setHit({ id: targetId, at: clock.elapsedTime });
        spawn("burst", muzzle, first.point.clone(), toCamera);
        window.setTimeout(() => onTargetDestroyed(targetId), DESTROY_DELAY_MS);
        return targetId;
      }

      const normal = first.face
        ? first.face.normal.clone().transformDirection(first.object.matrixWorld)
        : toCamera;
      spawn("impact", muzzle, first.point.clone(), normal);
      return "surface";
    };

    const fireAt = (id: RangeDestination): ShotOutcome => {
      const plane = hitPlanes.current.get(id);
      if (!plane) return "miss";
      const screen = plane.getWorldPosition(new THREE.Vector3()).project(camera);
      return fire(screen.x, screen.y);
    };

    apiRef.current = { fire, fireAt };
    return () => {
      apiRef.current = null;
    };
  }, [apiRef, camera, clock, raycaster, spawn, onTargetDestroyed]);

  useFrame((_, delta) => {
    flash.current.intensity = Math.max(flash.current.intensity - delta * 90, 0);

    const p = pointer.current;
    let id: RangeDestination | null = null;
    if (p.inside && !lockedRef.current) {
      raycaster.setFromCamera(ndc.current.set(p.x, p.y), camera);
      const over = raycaster.intersectObjects([...hitPlanes.current.values()], false)[0];
      id = (over?.object.userData.targetId as RangeDestination | undefined) ?? null;
    }
    if (id !== hoveredRef.current) {
      hoveredRef.current = id;
      setHovered(id);
      onHoverChange(id);
    }
  });

  return (
    <>
      <RangeEnvironment solidRef={solidRef} showLumi={aspect >= 1.45} reflections={quality.reflections} />

      {RANGE_TARGETS.map((def) => (
        <HoloTarget
          key={def.id}
          def={def}
          position={tall ? def.tall : def.wide}
          scale={tall ? 0.82 : 1}
          hovered={hovered === def.id}
          hitAt={hit?.id === def.id ? hit.at : null}
          registerHitPlane={registerHitPlane}
        />
      ))}

      <ShotEffects effects={effects} onExpire={expire} />
      <pointLight ref={flash} color="#ffd9a0" intensity={0} distance={9} />

      {quality.bloom && (
        <EffectComposer multisampling={quality.multisampling}>
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.85} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          <Vignette offset={0.3} darkness={0.65} />
        </EffectComposer>
      )}
    </>
  );
}

export default memo(RangeScene);
