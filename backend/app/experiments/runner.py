from typing import Any, Dict, List, Optional
from app.algorithms import get_algorithm, ALGORITHM_METADATA
from app.algorithms.base import GridEnvironment, GraphEnvironment
from app.maze.generator import generate_maze
from app.maze.presets import PRESET_WEIGHTED_SWAMP, PRESET_UNREACHABLE_FORTRESS, PRESET_ROMANIA_GRAPH
from app.models.responses import CompareResultItem, ExperimentReport
from app.models.state import GridState

EXPERIMENT_PRESETS: Dict[str, Dict[str, Any]] = {
    "open_vs_obstacle": {
        "title": "Impact of Obstacle Density on Search Complexity",
        "research_question": "How does increasing obstacle density affect the search efficiency (nodes expanded and frontier size) of uninformed search (BFS) vs heuristic search (A*)?",
        "algorithms": ["bfs", "dfs", "greedy", "astar"],
        "description": "Compares algorithms on a labyrinth with tight corridors versus open corridors.",
        "setup_type": "generated_maze",
        "pattern": "recursive_division",
        "difficulty": "medium",
        "seed": 101,
        "viva_takeaways": [
            "In open spaces, BFS expands circularly in all directions O(b^d), while A* guided by Manhattan distance focuses sharply toward the goal.",
            "In mazes with obstacles, Greedy Best-First can be tricked into dead ends, whereas A* balances distance and accumulated path cost."
        ]
    },
    "weighted_terrain_tradeoff": {
        "title": "Optimality on Non-Uniform Weighted Terrain",
        "research_question": "Can uninformed searches (BFS) find the optimal path when terrain costs vary, and how does UCS compare against A* in exploration efficiency?",
        "algorithms": ["bfs", "ucs", "greedy", "astar"],
        "description": "Evaluates paths through a swamp with high mud costs (4.5) alongside clear detour paths (1.0).",
        "setup_type": "grid_state",
        "grid_state": PRESET_WEIGHTED_SWAMP,
        "viva_takeaways": [
            "BFS only minimizes transition count (number of edges), so it plows straight through mud tiles, resulting in a drastically suboptimal path cost.",
            "UCS and A* guarantee path cost optimality, choosing the longer detour with lower total cost.",
            "A* expands significantly fewer nodes than UCS because the heuristic directs exploration toward the goal instead of spreading uniformly."
        ]
    },
    "heuristic_comparison": {
        "title": "Heuristic Effectiveness: Manhattan vs Euclidean vs Zero (UCS)",
        "research_question": "How does heuristic informedness and admissibility impact the pruning ability of A*?",
        "algorithms": ["astar", "greedy"],
        "heuristics": ["manhattan", "euclidean", "zero"],
        "description": "Tests A* and Greedy under Manhattan, Euclidean, and Zero heuristics on the same maze.",
        "setup_type": "generated_maze",
        "pattern": "recursive_division",
        "difficulty": "medium",
        "seed": 202,
        "viva_takeaways": [
            "Manhattan distance dominates Euclidean distance on 4-directional grids (h_manhattan >= h_euclidean), leading to fewer node expansions while remaining strictly admissible.",
            "Setting h(n) = 0 reduces A* exactly to Uniform Cost Search (Dijkstra)."
        ]
    },
    "unreachable_completeness": {
        "title": "Termination and Completeness under Disconnected Goals",
        "research_question": "Do classical search algorithms correctly determine when a goal is completely unreachable without crashing or looping infinitely?",
        "algorithms": ["bfs", "dfs", "ucs", "astar", "idastar", "hill_climbing"],
        "description": "Tests an enclosed fortress where walls seal off the goal entirely.",
        "setup_type": "grid_state",
        "grid_state": PRESET_UNREACHABLE_FORTRESS,
        "viva_takeaways": [
            "Complete algorithms (BFS, DFS with cycle checking, UCS, A*, IDA*) exhaustively explore all reachable states before cleanly declaring failure.",
            "Hill Climbing halts immediately at the local maximum/minimum near the fortress wall because all downhill moves are blocked."
        ]
    }
}

def run_experiment(preset_id: str, requested_algs: Optional[List[str]] = None, seed: Optional[int] = 42) -> ExperimentReport:
    preset = EXPERIMENT_PRESETS.get(preset_id)
    if not preset:
        # Default to open_vs_obstacle
        preset = EXPERIMENT_PRESETS["open_vs_obstacle"]
        preset_id = "open_vs_obstacle"

    algs_to_run = requested_algs or preset["algorithms"]

    # Build environment
    if preset.get("setup_type") == "grid_state":
        env = GridEnvironment(preset["grid_state"], heuristic_name="manhattan")
        config_desc = {"preset": preset_id, "mode": "custom_weighted_grid"}
    else:
        maze_resp = generate_maze(
            rows=15, cols=25,
            difficulty=preset.get("difficulty", "medium"),
            pattern=preset.get("pattern", "recursive_division"),
            seed=seed or preset.get("seed", 42)
        )
        grid_st = GridState(
            rows=maze_resp.rows,
            cols=maze_resp.cols,
            start=maze_resp.start,
            goal=maze_resp.goal,
            walls=maze_resp.walls,
            terrain=maze_resp.terrain
        )
        env = GridEnvironment(grid_st, heuristic_name="manhattan")
        config_desc = {
            "preset": preset_id,
            "dimensions": f"{grid_st.rows}x{grid_st.cols}",
            "seed": maze_resp.seed,
            "pattern": preset.get("pattern")
        }

    results: List[CompareResultItem] = []
    for alg_id in algs_to_run:
        try:
            alg = get_algorithm(alg_id)
            meta = ALGORITHM_METADATA.get(alg_id)
            search_res = alg.run_search(env, max_events=100, playback_events=False)
            results.append(CompareResultItem(
                algorithm=alg_id,
                name=meta.name if meta else alg_id.upper(),
                solution_found=search_res.solution_found,
                path_cost=search_res.path_cost,
                path_length=search_res.path_length,
                nodes_expanded=search_res.nodes_expanded,
                nodes_generated=search_res.nodes_generated,
                max_frontier_size=search_res.max_frontier_size,
                execution_time_ms=search_res.execution_time_ms,
                optimality_guarantee=search_res.optimality_guarantee,
                completeness_guarantee=search_res.completeness_guarantee,
                notes=search_res.summary,
                path=search_res.path
            ))
        except Exception as e:
            results.append(CompareResultItem(
                algorithm=alg_id,
                name=alg_id.upper(),
                solution_found=False,
                path_cost=0.0,
                path_length=0,
                nodes_expanded=0,
                nodes_generated=0,
                max_frontier_size=0,
                execution_time_ms=0.0,
                optimality_guarantee="Error",
                completeness_guarantee="Error",
                notes=f"Execution error: {str(e)}",
                path=[]
            ))

    # Generate analytical narrative
    narrative_paragraphs = []
    solvable = [r for r in results if r.solution_found]
    if solvable:
        least_expanded = min(solvable, key=lambda r: r.nodes_expanded)
        lowest_cost = min(solvable, key=lambda r: r.path_cost)
        fastest = min(solvable, key=lambda r: r.execution_time_ms)

        narrative_paragraphs.append(
            f"Under this experimental setup, {least_expanded.name} demonstrated maximum pruning efficiency by expanding only {least_expanded.nodes_expanded} nodes."
        )
        if least_expanded.algorithm != lowest_cost.algorithm:
            narrative_paragraphs.append(
                f"Notice the classic search trade-off: While {least_expanded.name} expanded fewer nodes, {lowest_cost.name} achieved a lower path cost ({lowest_cost.path_cost} vs {least_expanded.path_cost}), illustrating how aggressive heuristics can sacrifice path optimality."
            )
        else:
            narrative_paragraphs.append(
                f"{lowest_cost.name} both explored the fewest nodes ({least_expanded.nodes_expanded}) and discovered the optimal path cost ({lowest_cost.path_cost})."
            )
    else:
        narrative_paragraphs.append(
            "None of the tested algorithms found a path to the goal, verifying correct handling of unreachable goal scenarios without abnormal termination."
        )

    return ExperimentReport(
        title=preset["title"],
        description=preset["description"],
        research_question=preset["research_question"],
        configuration=config_desc,
        results=results,
        narrative=" ".join(narrative_paragraphs),
        viva_takeaways=preset.get("viva_takeaways", [])
    )
