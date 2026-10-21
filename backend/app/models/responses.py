from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field

class SearchEvent(BaseModel):
    step: int
    type: str  # visit, expand, frontier_add, frontier_update, explored, threshold_update, restart, local_optimum, path_found, search_failed
    node: Union[List[int], str]
    parent: Optional[Union[List[int], str]] = None
    g: Optional[float] = None
    h: Optional[float] = None
    f: Optional[float] = None
    frontier_size: int = 0
    explored_size: int = 0
    explanation: str = ""

class SearchResult(BaseModel):
    algorithm: str
    solution_found: bool
    path: List[Union[List[int], str]] = Field(default_factory=list)
    path_cost: float = 0.0
    path_length: int = 0
    nodes_expanded: int = 0
    nodes_generated: int = 0
    max_frontier_size: int = 0
    execution_time_ms: float = 0.0
    total_events: int = 0
    events: List[SearchEvent] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    optimality_guarantee: str = ""
    completeness_guarantee: str = ""
    summary: str = ""

class AlgorithmMetadata(BaseModel):
    id: str
    name: str
    category: str
    time_complexity: str
    space_complexity: str
    completeness: str
    optimality: str
    requires_heuristic: bool
    supports_weights: bool
    pseudocode: List[str]
    description: str
    viva_questions: List[Dict[str, str]]

class CompareResultItem(BaseModel):
    algorithm: str
    name: str
    solution_found: bool
    path_cost: float
    path_length: int
    nodes_expanded: int
    nodes_generated: int
    max_frontier_size: int
    execution_time_ms: float
    optimality_guarantee: str
    completeness_guarantee: str
    notes: str
    path: List[Union[List[int], str]] = Field(default_factory=list)

class CompareResponse(BaseModel):
    problem_type: str
    results: List[CompareResultItem]
    analysis_narrative: str
    fastest_algorithm: Optional[str] = None
    lowest_cost_algorithm: Optional[str] = None
    least_expanded_algorithm: Optional[str] = None

class MazeGenerateResponse(BaseModel):
    rows: int
    cols: int
    start: List[int]
    goal: List[int]
    walls: List[List[int]]
    terrain: Dict[str, float] = Field(default_factory=dict)
    difficulty: str
    seed: int

class ValidationResponse(BaseModel):
    valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

class ExperimentReport(BaseModel):
    title: str
    description: str
    research_question: str
    configuration: Dict[str, Any]
    results: List[CompareResultItem]
    narrative: str
    viva_takeaways: List[str]
