from typing import Dict, List, Optional, Tuple, Union
from pydantic import BaseModel, Field

Coordinate = Tuple[int, int]

class NodeCoord(BaseModel):
    row: int
    col: int

class GraphNode(BaseModel):
    id: str
    label: Optional[str] = None
    x: float = 0.0
    y: float = 0.0

class GraphEdge(BaseModel):
    source: str
    target: str
    weight: float = 1.0
    directed: bool = False

class GridState(BaseModel):
    rows: int = Field(default=15, ge=3, le=60)
    cols: int = Field(default=25, ge=3, le=60)
    start: List[int] = Field(..., description="[row, col] for start node")
    goal: List[int] = Field(..., description="[row, col] for goal node")
    walls: List[List[int]] = Field(default_factory=list, description="List of [row, col] wall coordinates")
    terrain: Dict[str, float] = Field(default_factory=dict, description="Mapping 'row,col' to cost multiplier (e.g. mud=3.0)")
    diagonal_movement: bool = Field(default=False, description="Allow 8-directional movement")

class GraphState(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    start: str
    goal: str
