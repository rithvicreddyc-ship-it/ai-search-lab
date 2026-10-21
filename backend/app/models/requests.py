from typing import List, Literal, Optional
from pydantic import BaseModel, Field
from app.models.state import GridState, GraphState

AlgorithmType = Literal["bfs", "dfs", "ucs", "greedy", "astar", "idastar", "hill_climbing"]
ProblemType = Literal["grid", "graph"]
HeuristicType = Literal["manhattan", "euclidean", "octile", "chebyshev", "graph_euclidean", "zero"]
DifficultyType = Literal["easy", "medium", "hard"]
MazePatternType = Literal["recursive_division", "random", "prim", "rooms"]

class SearchRequest(BaseModel):
    algorithm: AlgorithmType
    problem_type: ProblemType = "grid"
    grid: Optional[GridState] = None
    graph: Optional[GraphState] = None
    heuristic: HeuristicType = "manhattan"
    diagonal_movement: bool = False
    max_sideways: int = Field(default=10, ge=0, le=100)
    allow_random_restarts: bool = False
    max_restarts: int = Field(default=3, ge=0, le=10)
    playback_events: bool = True
    max_events: int = Field(default=8000, ge=100, le=20000)

class CompareRequest(BaseModel):
    algorithms: List[AlgorithmType] = Field(..., min_length=2, max_length=7)
    problem_type: ProblemType = "grid"
    grid: Optional[GridState] = None
    graph: Optional[GraphState] = None
    heuristic: HeuristicType = "manhattan"
    diagonal_movement: bool = False
    max_sideways: int = 10
    allow_random_restarts: bool = False

class ValidateRequest(BaseModel):
    problem_type: ProblemType = "grid"
    grid: Optional[GridState] = None
    graph: Optional[GraphState] = None

class MazeGenerateRequest(BaseModel):
    rows: int = Field(default=15, ge=5, le=50)
    cols: int = Field(default=25, ge=5, le=50)
    difficulty: DifficultyType = "medium"
    pattern: MazePatternType = "recursive_division"
    seed: Optional[int] = None
    add_terrain: bool = False

class ExperimentRunRequest(BaseModel):
    preset_id: str
    algorithms: Optional[List[AlgorithmType]] = None
    seed: Optional[int] = 42
