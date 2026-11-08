import type { PageId } from "../types";

export type RangeDestination = PageId | "game";

export interface RangeTargetDef {
  id: RangeDestination;
  hotkey: string;
  label: string;
  detail: string;
  // Positions for landscape and portrait viewports; the camera sits at (0, 1.7, 7).
  wide: [number, number, number];
  tall: [number, number, number];
}

export const RANGE_TARGETS: RangeTargetDef[] = [
  {
    id: "home",
    hotkey: "1",
    label: "ABOUT",
    detail: "Who I am  //  Skills",
    wide: [-5.4, 3.3, -6.5],
    tall: [0, 5.6, -9],
  },
  {
    id: "projects",
    hotkey: "2",
    label: "PROJECTS",
    detail: "Games  //  Software  //  Jams",
    wide: [-1.4, 1.6, -4.5],
    tall: [0, 3.9, -9],
  },
  {
    id: "experience",
    hotkey: "3",
    label: "EXPERIENCE",
    detail: "Roles  //  Training",
    wide: [2.2, 3.5, -7],
    tall: [0, 2.2, -9],
  },
  {
    id: "game",
    hotkey: "4",
    label: "GAME MODE",
    detail: "Free roam  //  Mini-games",
    wide: [5.6, 1.6, -4.5],
    tall: [0, 0.5, -9],
  },
];
