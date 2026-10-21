import random
from typing import Dict, List, Optional, Set, Tuple
from app.models.responses import MazeGenerateResponse

def generate_maze(
    rows: int = 15,
    cols: int = 25,
    difficulty: str = "medium",
    pattern: str = "recursive_division",
    seed: Optional[int] = None,
    add_terrain: bool = False
) -> MazeGenerateResponse:
    rng = random.Random(seed if seed is not None else random.randint(1, 999999))
    actual_seed = seed if seed is not None else rng.randint(1, 999999)

    # Standard start and goal
    start = [1, 1]
    goal = [rows - 2, cols - 2]

    walls: Set[Tuple[int, int]] = set()

    # Outer border walls
    for r in range(rows):
        walls.add((r, 0))
        walls.add((r, cols - 1))
    for c in range(cols):
        walls.add((0, c))
        walls.add((rows - 1, c))

    if pattern == "recursive_division":
        _recursive_division(walls, 1, rows - 2, 1, cols - 2, rng, difficulty)
    elif pattern == "random":
        _random_obstacles(walls, rows, cols, rng, difficulty)
    elif pattern == "rooms":
        _room_maze(walls, rows, cols, rng, difficulty)
    else:  # prim
        _prim_maze(walls, rows, cols, rng)

    # Ensure start and goal are always open and accessible
    walls.discard((start[0], start[1]))
    walls.discard((goal[0], goal[1]))
    # Also ensure at least one neighbor of start and goal is open
    walls.discard((start[0] + 1, start[1]))
    walls.discard((start[0], start[1] + 1))
    walls.discard((goal[0] - 1, goal[1]))
    walls.discard((goal[0], goal[1] - 1))

    # Optional terrain costs (mud / water)
    terrain: Dict[str, float] = {}
    if add_terrain:
        num_patches = rng.randint(2, 4)
        for _ in range(num_patches):
            pr = rng.randint(2, rows - 3)
            pc = rng.randint(2, cols - 3)
            cost_type = rng.choice([2.5, 4.0])
            radius = rng.randint(1, 3)
            for dr in range(-radius, radius + 1):
                for dc in range(-radius, radius + 1):
                    tr, tc = pr + dr, pc + dc
                    if (
                        0 < tr < rows - 1 and 0 < tc < cols - 1
                        and (tr, tc) not in walls
                        and [tr, tc] != start
                        and [tr, tc] != goal
                    ):
                        terrain[f"{tr},{tc}"] = cost_type

    walls_list = [[r, c] for r, c in sorted(walls)]
    return MazeGenerateResponse(
        rows=rows,
        cols=cols,
        start=start,
        goal=goal,
        walls=walls_list,
        terrain=terrain,
        difficulty=difficulty,
        seed=actual_seed
    )

def _recursive_division(
    walls: Set[Tuple[int, int]],
    r1: int,
    r2: int,
    c1: int,
    c2: int,
    rng: random.Random,
    difficulty: str
):
    width = c2 - c1
    height = r2 - r1
    if width < 2 or height < 2:
        return

    # Density adjustment by difficulty
    if difficulty == "easy" and rng.random() < 0.25:
        return

    horizontal = height > width if height != width else rng.choice([True, False])

    if horizontal:
        # Choose a wall row that is an even offset
        possible_walls = [r for r in range(r1 + 1, r2) if (r - r1) % 2 == 1 or width < 4]
        if not possible_walls:
            return
        wall_r = rng.choice(possible_walls)
        passage_c = rng.randint(c1, c2)

        for c in range(c1, c2 + 1):
            if c != passage_c:
                walls.add((wall_r, c))

        _recursive_division(walls, r1, wall_r - 1, c1, c2, rng, difficulty)
        _recursive_division(walls, wall_r + 1, r2, c1, c2, rng, difficulty)
    else:
        possible_walls = [c for c in range(c1 + 1, c2) if (c - c1) % 2 == 1 or height < 4]
        if not possible_walls:
            return
        wall_c = rng.choice(possible_walls)
        passage_r = rng.randint(r1, r2)

        for r in range(r1, r2 + 1):
            if r != passage_r:
                walls.add((r, wall_c))

        _recursive_division(walls, r1, r2, c1, wall_c - 1, rng, difficulty)
        _recursive_division(walls, r1, r2, wall_c + 1, c2, rng, difficulty)

def _random_obstacles(
    walls: Set[Tuple[int, int]],
    rows: int,
    cols: int,
    rng: random.Random,
    difficulty: str
):
    density_map = {"easy": 0.15, "medium": 0.28, "hard": 0.38}
    density = density_map.get(difficulty, 0.28)

    for r in range(1, rows - 1):
        for c in range(1, cols - 1):
            if rng.random() < density:
                walls.add((r, c))

def _room_maze(
    walls: Set[Tuple[int, int]],
    rows: int,
    cols: int,
    rng: random.Random,
    difficulty: str
):
    # Create internal dividing grid with frequent doorways
    step_r = max(4, rows // 3)
    step_c = max(4, cols // 4)

    for r in range(step_r, rows - 1, step_r):
        passage1 = rng.randint(1, cols // 2)
        passage2 = rng.randint(cols // 2 + 1, cols - 2)
        for c in range(1, cols - 1):
            if c != passage1 and c != passage2:
                walls.add((r, c))

    for c in range(step_c, cols - 1, step_c):
        passage1 = rng.randint(1, rows // 2)
        passage2 = rng.randint(rows // 2 + 1, rows - 2)
        for r in range(1, rows - 1):
            if r != passage1 and r != passage2:
                walls.add((r, c))

def _prim_maze(
    walls: Set[Tuple[int, int]],
    rows: int,
    cols: int,
    rng: random.Random
):
    # Initialize all internal cells as walls
    for r in range(1, rows - 1):
        for c in range(1, cols - 1):
            walls.add((r, c))

    # Carve with randomized Prim's
    start_r, start_c = 1, 1
    walls.discard((start_r, start_c))

    frontier = []
    for dr, dc in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
        nr, nc = start_r + dr, start_c + dc
        if 1 <= nr < rows - 1 and 1 <= nc < cols - 1:
            frontier.append((nr, nc, start_r, start_c))

    visited = {(start_r, start_c)}

    while frontier:
        idx = rng.randint(0, len(frontier) - 1)
        r, c, pr, pc = frontier.pop(idx)
        if (r, c) not in visited:
            visited.add((r, c))
            walls.discard((r, c))
            # Carve wall between (r, c) and (pr, pc)
            walls.discard(((r + pr) // 2, (c + pc) // 2))

            for dr, dc in [(-2, 0), (2, 0), (0, -2), (0, 2)]:
                nr, nc = r + dr, c + dc
                if 1 <= nr < rows - 1 and 1 <= nc < cols - 1 and (nr, nc) not in visited:
                    frontier.append((nr, nc, r, c))
