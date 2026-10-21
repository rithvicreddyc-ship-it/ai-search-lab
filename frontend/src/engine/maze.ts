import { GridCoordinate, MazeGenerateResponse } from '../types';

export function generateMaze(
  optionsOrRows:
    | {
        rows?: number;
        cols?: number;
        difficulty?: string;
        pattern?: string;
        seed?: number;
        add_terrain?: boolean;
      }
    | number = 15,
  pCols: number = 25,
  pDifficulty: string = 'medium',
  pPattern: string = 'recursive_division',
  pSeed?: number,
  pAddTerrain: boolean = false
): MazeGenerateResponse {
  let rows = 15;
  let cols = 25;
  let difficulty = 'medium';
  let pattern = 'recursive_division';
  let seed: number | undefined = undefined;
  let addTerrain = false;

  if (typeof optionsOrRows === 'object') {
    rows = optionsOrRows.rows ?? 15;
    cols = optionsOrRows.cols ?? 25;
    difficulty = optionsOrRows.difficulty ?? 'medium';
    pattern = optionsOrRows.pattern ?? 'recursive_division';
    seed = optionsOrRows.seed;
    addTerrain = !!optionsOrRows.add_terrain;
  } else {
    rows = optionsOrRows ?? 15;
    cols = pCols ?? 25;
    difficulty = pDifficulty ?? 'medium';
    pattern = pPattern ?? 'recursive_division';
    seed = pSeed;
    addTerrain = pAddTerrain ?? false;
  }
  // Simple deterministic pseudorandom generator
  let s = seed !== undefined ? seed : Math.floor(Math.random() * 999999);
  const random = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const start: GridCoordinate = [1, 1];
  const goal: GridCoordinate = [rows - 2, cols - 2];
  const wallsSet = new Set<string>();

  // Add outer perimeter
  for (let r = 0; r < rows; r++) {
    wallsSet.add(`${r},0`);
    wallsSet.add(`${r},${cols - 1}`);
  }
  for (let c = 0; c < cols; c++) {
    wallsSet.add(`0,${c}`);
    wallsSet.add(`${rows - 1},${c}`);
  }

  const density = difficulty === 'hard' ? 0.38 : difficulty === 'easy' ? 0.2 : 0.28;

  if (pattern === 'recursive_division') {
    // Recursive division or chamber subdivision
    function divide(r1: number, r2: number, c1: number, c2: number) {
      if (r2 - r1 < 2 || c2 - c1 < 2) return;
      const horizontal = r2 - r1 > c2 - c1;
      if (horizontal) {
        const wallR = Math.floor(r1 + 1 + random() * (r2 - r1 - 1));
        const passageC = Math.floor(c1 + random() * (c2 - c1 + 1));
        for (let c = c1; c <= c2; c++) {
          if (c !== passageC) wallsSet.add(`${wallR},${c}`);
        }
        divide(r1, wallR - 1, c1, c2);
        divide(wallR + 1, r2, c1, c2);
      } else {
        const wallC = Math.floor(c1 + 1 + random() * (c2 - c1 - 1));
        const passageR = Math.floor(r1 + random() * (r2 - r1 + 1));
        for (let r = r1; r <= r2; r++) {
          if (r !== passageR) wallsSet.add(`${r},${wallC}`);
        }
        divide(r1, r2, c1, wallC - 1);
        divide(r1, r2, wallC + 1, c2);
      }
    }
    divide(1, rows - 2, 1, cols - 2);
  } else {
    // Random / Rooms
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        if ((r === start[0] && c === start[1]) || (r === goal[0] && c === goal[1])) continue;
        if (random() < density) {
          wallsSet.add(`${r},${c}`);
        }
      }
    }
  }

  // Ensure start and goal are open
  wallsSet.delete(`${start[0]},${start[1]}`);
  wallsSet.delete(`${goal[0]},${goal[1]}`);
  wallsSet.delete(`${start[0] + 1},${start[1]}`);
  wallsSet.delete(`${start[0]},${start[1] + 1}`);
  wallsSet.delete(`${goal[0] - 1},${goal[1]}`);
  wallsSet.delete(`${goal[0]},${goal[1] - 1}`);

  const terrain: Record<string, number> = {};
  if (addTerrain) {
    const patches = 3;
    for (let p = 0; p < patches; p++) {
      const pr = Math.floor(2 + random() * (rows - 4));
      const pc = Math.floor(2 + random() * (cols - 4));
      const cost = 4.5; // mud swamp multiplier
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const tr = pr + dr;
          const tc = pc + dc;
          const k = `${tr},${tc}`;
          if (tr > 0 && tr < rows - 1 && tc > 0 && tc < cols - 1 && !wallsSet.has(k)) {
            terrain[k] = cost;
          }
        }
      }
    }
  }

  const walls: GridCoordinate[] = Array.from(wallsSet).map((k) => {
    const [r, c] = k.split(',').map(Number);
    return [r, c] as GridCoordinate;
  });

  return {
    rows,
    cols,
    start,
    goal,
    walls,
    terrain,
    difficulty,
    seed: s,
  };
}
