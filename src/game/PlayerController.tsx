import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BOUNDS,
  BOX_OBSTACLES,
  CIRCLE_OBSTACLES,
  EYE_HEIGHT,
  PLAYER_RADIUS,
  SPAWN,
  STATION,
  STATION_REACH,
} from "./layout";
import { gridshot } from "./gridshotStore";

const RUN_SPEED = 5.4;
const WALK_SPEED = 2.8;
const JUMP_VELOCITY = 5.2;
const GRAVITY = 16;
const BASE_SENSITIVITY = 0.0022;
const MAX_PITCH = 1.5;

interface PlayerState {
  x: number;
  y: number;
  z: number;
  vy: number;
  yaw: number;
  pitch: number;
  grounded: boolean;
}

function resolveCollisions(p: PlayerState) {
  p.x = Math.min(Math.max(p.x, BOUNDS.minX + PLAYER_RADIUS), BOUNDS.maxX - PLAYER_RADIUS);
  p.z = Math.min(Math.max(p.z, BOUNDS.minZ + PLAYER_RADIUS), BOUNDS.maxZ - PLAYER_RADIUS);

  for (const c of CIRCLE_OBSTACLES) {
    const dx = p.x - c.x;
    const dz = p.z - c.z;
    const dist = Math.hypot(dx, dz);
    const min = c.radius + PLAYER_RADIUS;
    if (dist < min && dist > 1e-6) {
      p.x = c.x + (dx / dist) * min;
      p.z = c.z + (dz / dist) * min;
    }
  }

  for (const b of BOX_OBSTACLES) {
    const minX = b.minX - PLAYER_RADIUS;
    const maxX = b.maxX + PLAYER_RADIUS;
    const minZ = b.minZ - PLAYER_RADIUS;
    const maxZ = b.maxZ + PLAYER_RADIUS;
    if (p.x <= minX || p.x >= maxX || p.z <= minZ || p.z >= maxZ) continue;
    // Push out along whichever side is closest.
    const pushes = [p.x - minX, maxX - p.x, p.z - minZ, maxZ - p.z];
    const smallest = Math.min(...pushes);
    if (smallest === pushes[0]) p.x = minX;
    else if (smallest === pushes[1]) p.x = maxX;
    else if (smallest === pushes[2]) p.z = minZ;
    else p.z = maxZ;
  }
}

interface PlayerControllerProps {
  active: RefObject<boolean>;
  sensitivity: RefObject<number>;
}

function PlayerController({ active, sensitivity }: PlayerControllerProps) {
  const camera = useThree((state) => state.camera);
  const player = useRef<PlayerState>({
    x: SPAWN.x,
    y: 0,
    z: SPAWN.z,
    vy: 0,
    yaw: 0,
    pitch: 0,
    grounded: true,
  });
  const keys = useRef(new Set<string>());

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!active.current) return;
      const p = player.current;
      const scale = BASE_SENSITIVITY * sensitivity.current;
      p.yaw -= e.movementX * scale;
      p.pitch = Math.min(Math.max(p.pitch - e.movementY * scale, -MAX_PITCH), MAX_PITCH);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (!active.current) return;
      keys.current.add(e.code);
      const p = player.current;
      if (e.code === "Space") {
        e.preventDefault();
        if (p.grounded) {
          p.vy = JUMP_VELOCITY;
          p.grounded = false;
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => keys.current.delete(e.code);
    const onBlur = () => keys.current.clear();

    document.addEventListener("mousemove", onMouseMove);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, [active, sensitivity]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const p = player.current;
    const k = keys.current;
    if (!active.current) k.clear();

    const forward = (k.has("KeyW") ? 1 : 0) - (k.has("KeyS") ? 1 : 0);
    const strafe = (k.has("KeyD") ? 1 : 0) - (k.has("KeyA") ? 1 : 0);
    if (forward || strafe) {
      const speed = k.has("ShiftLeft") || k.has("ShiftRight") ? WALK_SPEED : RUN_SPEED;
      const length = Math.hypot(forward, strafe);
      const sin = Math.sin(p.yaw);
      const cos = Math.cos(p.yaw);
      // Camera forward is (-sin, -cos) on the ground plane and right is (cos, -sin).
      p.x += ((-sin * forward + cos * strafe) / length) * speed * dt;
      p.z += ((-cos * forward - sin * strafe) / length) * speed * dt;
    }

    p.vy -= GRAVITY * dt;
    p.y += p.vy * dt;
    if (p.y <= 0) {
      p.y = 0;
      p.vy = 0;
      p.grounded = true;
    }

    resolveCollisions(p);

    camera.position.set(p.x, p.y + EYE_HEIGHT, p.z);
    // Yaw before pitch, so looking up and down never rolls the view.
    camera.rotation.set(p.pitch, p.yaw, 0, "YXZ");

    gridshot.setNearStation(Math.hypot(p.x - STATION.x, p.z - STATION.z) < STATION_REACH);
  });

  return null;
}

export default PlayerController;
