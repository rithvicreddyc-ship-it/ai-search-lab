import time
from typing import Any, Dict, List

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from app.algorithms import ALGORITHM_METADATA, ALGORITHM_REGISTRY, get_algorithm
from app.algorithms.base import GraphEnvironment, GridEnvironment, SearchEnvironment
from app.experiments import EXPERIMENT_PRESETS, run_experiment
from app.maze import GRAPH_PRESETS, GRID_PRESETS, generate_maze
from app.models.requests import (
    CompareRequest,
    ExperimentRunRequest,
    MazeGenerateRequest,
    SearchRequest,
    ValidateRequest,
)
from app.models.responses import (
    AlgorithmMetadata,
    CompareResponse,
    CompareResultItem,
    ExperimentReport,
    MazeGenerateResponse,
    SearchResult,
    ValidationResponse,
)

app = FastAPI(
    title="AI Search Lab API",
    description="Interactive Search Algorithm Visualiser & Teaching Tool for Classical AI Search (CSE276)",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "app": "AI Search Lab",
        "version": "1.0.0",
        "course": "CSE276 Artificial Intelligence Foundations",
        "algorithms_count": len(ALGORITHM_REGISTRY),
        "available_algorithms": list(ALGORITHM_REGISTRY.keys()),
        "available_heuristics": ["manhattan", "euclidean", "octile", "chebyshev", "graph_euclidean", "zero"],
    }


@app.get("/api/algorithms", response_model=List[AlgorithmMetadata], tags=["Algorithms"])
def list_algorithms() -> List[AlgorithmMetadata]:
    """Returns metadata, pseudocode, time/space complexity, and viva questions for all 7 algorithms."""
    return list(ALGORITHM_METADATA.values())


@app.get("/api/presets", tags=["Presets"])
def get_presets() -> Dict[str, Any]:
    """Returns all preconfigured grid and graph environments."""
    return {
        "grids": {k: {"id": v["id"], "name": v["name"], "description": v["description"], "state": v["state"].model_dump()} for k, v in GRID_PRESETS.items()},
        "graphs": {k: {"id": v["id"], "name": v["name"], "description": v["description"], "state": v["state"].model_dump()} for k, v in GRAPH_PRESETS.items()},
        "experiments": list(EXPERIMENT_PRESETS.keys())
    }


def _create_environment(request: SearchRequest | CompareRequest) -> SearchEnvironment:
    if request.problem_type == "graph":
        if not request.graph:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Graph state must be provided when problem_type is 'graph'."
            )
        try:
            return GraphEnvironment(request.graph, heuristic_name=request.heuristic)
        except ValueError as err:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(err)
            )
    else:
        if not request.grid:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Grid state must be provided when problem_type is 'grid'."
            )
        # Validation checks
        g = request.grid
        if not (0 <= g.start[0] < g.rows and 0 <= g.start[1] < g.cols):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Start coordinate {g.start} is outside grid boundaries ({g.rows}x{g.cols})."
            )
        if not (0 <= g.goal[0] < g.rows and 0 <= g.goal[1] < g.cols):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Goal coordinate {g.goal} is outside grid boundaries ({g.rows}x{g.cols})."
            )
        walls_set = {tuple(w) for w in g.walls}
        if tuple(g.start) in walls_set:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Start coordinate cannot be placed inside an obstacle wall."
            )
        if tuple(g.goal) in walls_set:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Goal coordinate cannot be placed inside an obstacle wall."
            )
        return GridEnvironment(g, heuristic_name=request.heuristic)


@app.post("/api/validate", response_model=ValidationResponse, tags=["Validation"])
def validate_problem(request: ValidateRequest) -> ValidationResponse:
    errors: List[str] = []
    warnings: List[str] = []

    if request.problem_type == "grid":
        if not request.grid:
            return ValidationResponse(valid=False, errors=["Grid configuration missing."])
        g = request.grid
        if g.rows < 3 or g.cols < 3:
            errors.append("Grid dimensions must be at least 3x3.")
        if not (0 <= g.start[0] < g.rows and 0 <= g.start[1] < g.cols):
            errors.append(f"Start {g.start} is out of bounds [0..{g.rows-1}, 0..{g.cols-1}].")
        if not (0 <= g.goal[0] < g.rows and 0 <= g.goal[1] < g.cols):
            errors.append(f"Goal {g.goal} is out of bounds [0..{g.rows-1}, 0..{g.cols-1}].")
        walls_set = {tuple(w) for w in g.walls}
        if tuple(g.start) in walls_set:
            errors.append("Start coordinate is placed on top of a wall.")
        if tuple(g.goal) in walls_set:
            errors.append("Goal coordinate is placed on top of a wall.")
        if g.start == g.goal:
            warnings.append("Start and goal coordinates are identical (trivial solution).")
    else:
        if not request.graph:
            return ValidationResponse(valid=False, errors=["Graph configuration missing."])
        node_ids = {n.id for n in request.graph.nodes}
        if request.graph.start not in node_ids:
            errors.append(f"Start node '{request.graph.start}' is not in nodes list.")
        if request.graph.goal not in node_ids:
            errors.append(f"Goal node '{request.graph.goal}' is not in nodes list.")
        for edge in request.graph.edges:
            if edge.weight < 0:
                errors.append(f"Negative edge weight ({edge.weight}) from '{edge.source}' to '{edge.target}'. Classical search requires weights >= 0.")
            if edge.source not in node_ids:
                errors.append(f"Edge source '{edge.source}' does not exist in graph nodes.")
            if edge.target not in node_ids:
                errors.append(f"Edge target '{edge.target}' does not exist in graph nodes.")

    return ValidationResponse(valid=len(errors) == 0, errors=errors, warnings=warnings)


@app.post("/api/search", response_model=SearchResult, tags=["Search"])
def run_search_endpoint(request: SearchRequest) -> SearchResult:
    """Executes a search algorithm and returns the path, metrics, and step-by-step playback events."""
    env = _create_environment(request)
    try:
        alg = get_algorithm(request.algorithm)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    try:
        result = alg.run_search(
            env=env,
            max_events=request.max_events,
            playback_events=request.playback_events,
            max_sideways=request.max_sideways,
            allow_random_restarts=request.allow_random_restarts,
            max_restarts=request.max_restarts,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Search failed: {str(e)}")


@app.post("/api/compare", response_model=CompareResponse, tags=["Comparison"])
def compare_algorithms(request: CompareRequest) -> CompareResponse:
    """Executes multiple algorithms on the exact same problem state for fair side-by-side comparison."""
    env = _create_environment(request)
    results: List[CompareResultItem] = []

    for alg_id in request.algorithms:
        try:
            alg = get_algorithm(alg_id)
            meta = ALGORITHM_METADATA.get(alg_id)
            res = alg.run_search(
                env=env,
                max_events=200,
                playback_events=False,
                max_sideways=request.max_sideways,
                allow_random_restarts=request.allow_random_restarts
            )
            results.append(CompareResultItem(
                algorithm=alg_id,
                name=meta.name if meta else alg_id.upper(),
                solution_found=res.solution_found,
                path_cost=res.path_cost,
                path_length=res.path_length,
                nodes_expanded=res.nodes_expanded,
                nodes_generated=res.nodes_generated,
                max_frontier_size=res.max_frontier_size,
                execution_time_ms=res.execution_time_ms,
                optimality_guarantee=res.optimality_guarantee,
                completeness_guarantee=res.completeness_guarantee,
                notes=res.summary,
                path=res.path
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
                notes=str(e),
                path=[]
            ))

    # Analytical narrative generation based on real experimental run
    solvable = [r for r in results if r.solution_found]
    narrative_parts = []
    fastest_alg = None
    lowest_cost_alg = None
    least_expanded_alg = None

    if solvable:
        least_expanded = min(solvable, key=lambda r: r.nodes_expanded)
        lowest_cost = min(solvable, key=lambda r: r.path_cost)
        fastest = min(solvable, key=lambda r: r.execution_time_ms)

        fastest_alg = fastest.algorithm
        lowest_cost_alg = lowest_cost.algorithm
        least_expanded_alg = least_expanded.algorithm

        narrative_parts.append(
            f"Under this configuration, {least_expanded.name} was the most pruning-efficient algorithm, expanding only {least_expanded.nodes_expanded} nodes."
        )
        if least_expanded.algorithm != lowest_cost.algorithm:
            narrative_parts.append(
                f"However, {lowest_cost.name} achieved the optimal path cost of {lowest_cost.path_cost} compared to {least_expanded.path_cost} from {least_expanded.name}. This clearly showcases the trade-off between greedy search speed and true path optimality."
            )
        else:
            narrative_parts.append(
                f"{lowest_cost.name} simultaneously achieved optimal path cost ({lowest_cost.path_cost}) with minimal node expansions ({least_expanded.nodes_expanded})."
            )
    else:
        narrative_parts.append(
            "None of the compared algorithms found a path to the goal, verifying that the goal is unreachable from the start node under the current constraints."
        )

    return CompareResponse(
        problem_type=request.problem_type,
        results=results,
        analysis_narrative=" ".join(narrative_parts),
        fastest_algorithm=fastest_alg,
        lowest_cost_algorithm=lowest_cost_alg,
        least_expanded_algorithm=least_expanded_alg
    )


@app.post("/api/maze/generate", response_model=MazeGenerateResponse, tags=["Maze"])
def generate_maze_endpoint(request: MazeGenerateRequest) -> MazeGenerateResponse:
    return generate_maze(
        rows=request.rows,
        cols=request.cols,
        difficulty=request.difficulty,
        pattern=request.pattern,
        seed=request.seed,
        add_terrain=request.add_terrain
    )


@app.post("/api/experiments/run", response_model=ExperimentReport, tags=["Experiments"])
def run_experiment_endpoint(request: ExperimentRunRequest) -> ExperimentReport:
    return run_experiment(
        preset_id=request.preset_id,
        requested_algs=request.algorithms,
        seed=request.seed
    )
