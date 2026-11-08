import { useSyncExternalStore } from "react";
import { GRID_CELLS } from "./layout";

export type GridshotPhase = "idle" | "countdown" | "running" | "results";

export const COUNTDOWN_MS = 3000;
export const ROUND_MS = 30000;
const ACTIVE_TARGETS = 3;
const BEST_KEY = "gridshot-best";

export interface ActiveTarget {
  id: number;
  cell: number;
}

export interface GridshotState {
  phase: GridshotPhase;
  phaseStartedAt: number;
  hits: number;
  shots: number;
  best: number;
  newBest: boolean;
  nearStation: boolean;
  targets: ActiveTarget[];
}

function readBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

let state: GridshotState = {
  phase: "idle",
  phaseStartedAt: 0,
  hits: 0,
  shots: 0,
  best: readBest(),
  newBest: false,
  nearStation: false,
  targets: [],
};

const listeners = new Set<() => void>();
let nextTargetId = 0;

function set(partial: Partial<GridshotState>) {
  state = { ...state, ...partial };
  listeners.forEach((listener) => listener());
}

function randomFreeCell(excluded: Set<number>) {
  const free = Array.from({ length: GRID_CELLS }, (_, cell) => cell).filter((cell) => !excluded.has(cell));
  return free[Math.floor(Math.random() * free.length)];
}

function spawnInitialTargets(): ActiveTarget[] {
  const used = new Set<number>();
  return Array.from({ length: ACTIVE_TARGETS }, () => {
    const cell = randomFreeCell(used);
    used.add(cell);
    return { id: nextTargetId++, cell };
  });
}

export const gridshot = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  reset() {
    set({ phase: "idle", targets: [], nearStation: false });
  },

  setNearStation(nearStation: boolean) {
    if (state.nearStation !== nearStation) set({ nearStation });
  },

  start(now: number) {
    if (state.phase === "countdown" || state.phase === "running") return;
    set({ phase: "countdown", phaseStartedAt: now, hits: 0, shots: 0, newBest: false, targets: [] });
  },

  abort() {
    if (state.phase === "countdown" || state.phase === "running") set({ phase: "idle", targets: [] });
  },

  // Replaces the hit target with one in a different cell, never the one just cleared.
  hitTarget(id: number) {
    if (state.phase !== "running") return;
    const hit = state.targets.find((t) => t.id === id);
    if (!hit) return;
    const occupied = new Set(state.targets.map((t) => t.cell));
    const replacement = { id: nextTargetId++, cell: randomFreeCell(occupied) };
    set({
      hits: state.hits + 1,
      shots: state.shots + 1,
      targets: state.targets.map((t) => (t.id === id ? replacement : t)),
    });
  },

  registerMiss() {
    if (state.phase === "running") set({ shots: state.shots + 1 });
  },

  // Advances countdown -> running -> results based on elapsed time.
  tick(now: number) {
    const elapsed = now - state.phaseStartedAt;
    if (state.phase === "countdown" && elapsed >= COUNTDOWN_MS) {
      set({
        phase: "running",
        phaseStartedAt: state.phaseStartedAt + COUNTDOWN_MS,
        targets: spawnInitialTargets(),
      });
    } else if (state.phase === "running" && elapsed >= ROUND_MS) {
      const newBest = state.hits > state.best;
      if (newBest) {
        try {
          localStorage.setItem(BEST_KEY, String(state.hits));
        } catch {
          // Storage can be blocked; the best score still shows for this visit.
        }
      }
      set({ phase: "results", newBest, best: Math.max(state.best, state.hits), targets: [] });
    }
  },
};

export function useGridshot() {
  return useSyncExternalStore(gridshot.subscribe, gridshot.get);
}

export function useGridshotTargets() {
  return useSyncExternalStore(gridshot.subscribe, () => state.targets);
}

export function accuracyOf(s: Pick<GridshotState, "hits" | "shots">) {
  return s.shots ? Math.round((s.hits / s.shots) * 100) : 0;
}
