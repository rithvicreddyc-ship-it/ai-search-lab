import pytest
from app.algorithms import get_algorithm
from app.algorithms.base import GridEnvironment, GraphEnvironment
from app.maze.presets import PRESET_UNREACHABLE_FORTRESS
from app.models.state import GridState, GraphState, GraphNode, GraphEdge

def test_start_equals_goal():
    grid = GridState(
        rows=5,
        cols=5,
        start=[2, 2],
        goal=[2, 2],
        walls=[],
        terrain={}
    )
    env = GridEnvironment(grid)

    for alg_id in ["bfs", "dfs", "ucs", "greedy", "astar", "idastar", "hill_climbing"]:
        res = get_algorithm(alg_id).run_search(env)
        assert res.solution_found is True
        assert res.path_length == 1
        assert res.path_cost == 0.0
        assert res.path == [[2, 2]]

def test_unreachable_goal():
    env = GridEnvironment(PRESET_UNREACHABLE_FORTRESS)

    for alg_id in ["bfs", "dfs", "ucs", "astar", "idastar"]:
        res = get_algorithm(alg_id).run_search(env)
        assert res.solution_found is False
        assert len(res.path) == 0
        assert res.nodes_expanded > 0

def test_negative_edge_weight_rejected():
    # Graph with a negative edge
    bad_graph = GraphState(
        nodes=[
            GraphNode(id="A", label="A"),
            GraphNode(id="B", label="B")
        ],
        edges=[
            GraphEdge(source="A", target="B", weight=-5.0)
        ],
        start="A",
        goal="B"
    )

    with pytest.raises(ValueError, match="Negative edge weights"):
        GraphEnvironment(bad_graph)

def test_disconnected_graph():
    disconnected = GraphState(
        nodes=[
            GraphNode(id="A", label="A"),
            GraphNode(id="B", label="B"),
            GraphNode(id="C", label="C")
        ],
        edges=[
            GraphEdge(source="A", target="B", weight=2.0)
            # C is completely isolated
        ],
        start="A",
        goal="C"
    )
    env = GraphEnvironment(disconnected)

    for alg_id in ["bfs", "ucs", "astar"]:
        res = get_algorithm(alg_id).run_search(env)
        assert res.solution_found is False
        assert len(res.path) == 0

def test_hill_climbing_local_optimum_detection():
    # In a local optimum setup, hill climbing terminates cleanly with warnings
    from app.maze.presets import PRESET_LOCAL_OPTIMUM_TRAP
    env = GridEnvironment(PRESET_LOCAL_OPTIMUM_TRAP)

    hc_res = get_algorithm("hill_climbing").run_search(
        env, max_sideways=5, allow_random_restarts=False
    )
    assert hc_res.solution_found is False
    assert len(hc_res.warnings) > 0
    assert "local" in hc_res.warnings[0].lower()
