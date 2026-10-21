import pytest
from app.algorithms import get_algorithm, ALGORITHM_REGISTRY
from app.algorithms.base import GridEnvironment, GraphEnvironment
from app.maze.presets import PRESET_WEIGHTED_SWAMP, PRESET_ROMANIA_GRAPH, PRESET_DIAMOND_GRAPH
from app.models.state import GridState

@pytest.fixture
def simple_grid_env():
    # 5x5 grid with a small obstacle
    # Start: (0, 0), Goal: (4, 4)
    # Walls at (1, 1), (2, 1), (3, 1)
    grid_state = GridState(
        rows=5,
        cols=5,
        start=[0, 0],
        goal=[4, 4],
        walls=[[1, 1], [2, 1], [3, 1]],
        terrain={},
        diagonal_movement=False
    )
    return GridEnvironment(grid_state, heuristic_name="manhattan")

def test_all_seven_algorithms_registered():
    expected = {"bfs", "dfs", "ucs", "greedy", "astar", "idastar", "hill_climbing"}
    assert set(ALGORITHM_REGISTRY.keys()) == expected

@pytest.mark.parametrize("alg_id", ["bfs", "dfs", "ucs", "greedy", "astar", "idastar"])
def test_solvable_grid_search(simple_grid_env, alg_id):
    alg = get_algorithm(alg_id)
    res = alg.run_search(simple_grid_env, max_events=500, playback_events=True)

    assert res.solution_found is True
    assert len(res.path) > 0
    assert res.path[0] == [0, 0]
    assert res.path[-1] == [4, 4]
    assert res.nodes_expanded > 0
    assert res.execution_time_ms >= 0.0

    # Path continuity check: each consecutive node must be adjacent
    for i in range(len(res.path) - 1):
        r1, c1 = res.path[i]
        r2, c2 = res.path[i + 1]
        dist = abs(r1 - r2) + abs(c1 - c2)
        assert dist == 1, f"Step from {res.path[i]} to {res.path[i+1]} is not a valid 4-directional move"

def test_bfs_ucs_astar_optimal_on_unit_grid(simple_grid_env):
    bfs_res = get_algorithm("bfs").run_search(simple_grid_env)
    ucs_res = get_algorithm("ucs").run_search(simple_grid_env)
    astar_res = get_algorithm("astar").run_search(simple_grid_env)

    # All three must find the identical optimal path cost on unit-cost grid
    assert bfs_res.path_cost == ucs_res.path_cost
    assert ucs_res.path_cost == astar_res.path_cost

def test_weighted_terrain_optimality():
    # In PRESET_WEIGHTED_SWAMP, the direct center is heavy mud (4.5), while detours are unit cost (1.0).
    env = GridEnvironment(PRESET_WEIGHTED_SWAMP, heuristic_name="manhattan")

    ucs_res = get_algorithm("ucs").run_search(env)
    astar_res = get_algorithm("astar").run_search(env)
    bfs_res = get_algorithm("bfs").run_search(env)

    assert ucs_res.solution_found is True
    assert astar_res.solution_found is True
    assert bfs_res.solution_found is True

    # UCS and A* must find the optimal lowest-cost path
    assert ucs_res.path_cost == astar_res.path_cost
    # BFS only minimizes edge count, so its path cost on weighted terrain must be strictly higher!
    assert bfs_res.path_cost > ucs_res.path_cost

def test_romania_map_graph():
    env = GraphEnvironment(PRESET_ROMANIA_GRAPH, heuristic_name="graph_euclidean")

    astar_res = get_algorithm("astar").run_search(env)
    ucs_res = get_algorithm("ucs").run_search(env)

    assert astar_res.solution_found is True
    ustar_path = astar_res.path
    assert len(ustar_path) > 0
    assert ustar_path[0] == "Arad"
    assert ustar_path[-1] == "Bucharest"

    # Classical optimal cost from Arad to Bucharest in AIMA is 418.0
    # (Arad -> Sibiu (140) -> Rimnicu Vilcea (80) -> Pitesti (97) -> Bucharest (101) = 418)
    assert astar_res.path_cost == 418.0
    assert ucs_res.path_cost == 418.0
