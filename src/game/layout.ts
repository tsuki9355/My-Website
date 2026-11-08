// World layout shared by the player controller (collision) and the scene (rendering).
// The range's side walls sit at x = ±11 and its back barrier at z = -13.

export const PLAYER_RADIUS = 0.35;
export const EYE_HEIGHT = 1.6;
export const SPAWN = { x: 0, z: 5.5 };

export const BOUNDS = { minX: -10.6, maxX: 10.6, minZ: -12.6, maxZ: 7.6 };
export const REAR_WALL_Z = 8;

export const STATION = { x: 0, z: 1, radius: 0.55 };
export const STATION_REACH = 2.2;

export const GRID_WALL = {
  z: -8,
  centerY: 2.5,
  width: 8.6,
  height: 4.4,
  depth: 0.3,
  cols: 5,
  rows: 3,
  spacingX: 1.45,
  spacingY: 1.15,
  targetRadius: 0.3,
};

export const LUMI_PEDESTAL = { x: -6.8, z: -4, radius: 0.85 };

export interface CircleObstacle {
  x: number;
  z: number;
  radius: number;
}

export interface BoxObstacle {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export const CIRCLE_OBSTACLES: CircleObstacle[] = [STATION, LUMI_PEDESTAL];

export const BOX_OBSTACLES: BoxObstacle[] = [
  {
    minX: -GRID_WALL.width / 2,
    maxX: GRID_WALL.width / 2,
    minZ: GRID_WALL.z - GRID_WALL.depth / 2,
    maxZ: GRID_WALL.z + GRID_WALL.depth / 2,
  },
];

export function gridCellPosition(cell: number): [number, number, number] {
  const col = cell % GRID_WALL.cols;
  const row = Math.floor(cell / GRID_WALL.cols);
  return [
    (col - (GRID_WALL.cols - 1) / 2) * GRID_WALL.spacingX,
    GRID_WALL.centerY + ((GRID_WALL.rows - 1) / 2 - row) * GRID_WALL.spacingY,
    GRID_WALL.z + GRID_WALL.depth / 2 + 0.35,
  ];
}

export const GRID_CELLS = GRID_WALL.cols * GRID_WALL.rows;
