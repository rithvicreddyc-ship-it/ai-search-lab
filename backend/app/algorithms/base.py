import abc
import math
import time
from typing import Any, Callable, Dict, List, Optional, Set, Tuple, Union

from app.algorithms.heuristics import build_graph_heuristic, build_grid_heuristic
from app.models.requests import SearchRequest
from app.models.responses import SearchEvent, SearchResult
from app.models.state import GraphState, GridState

Node = Union[Tuple[int, int], str]

class SearchEnvironment(abc.ABC):
    """Abstract interface defining the state-space and transition model for search."""

    @property
    @abc.abstractmethod
    def start_node(self) -> Node:
        pass

    @property
    @abc.abstractmethod
    def goal_node(self) -> Node:
        pass

    @abc.abstractmethod
    def get_neighbors(self, node: Node) -> List[Tuple[Node, float]]:
        """Returns list of (neighbor_node, step_cost)."""
        pass

    @abc.abstractmethod
    def heuristic(self, node: Node) -> float:
        """Returns heuristic estimate h(node)."""
        pass

    @abc.abstractmethod
    def is_goal(self, node: Node) -> bool:
        """Tests if node is the goal state."""
        pass

    @abc.abstractmethod
    def format_node(self, node: Node) -> Union[List[int], str]:
        """Convert node to JSON-serializable structure."""
        pass


class GridEnvironment(SearchEnvironment):
    """Grid maze environment with configurable dimensions, walls, terrain costs, and movement rules."""

    def __init__(self, grid_state: GridState, heuristic_name: str = "manhattan"):
        self.rows = grid_state.rows
        self.cols = grid_state.cols
        self._start = (grid_state.start[0], grid_state.start[1])
        self._goal = (grid_state.goal[0], grid_state.goal[1])
        self.walls: Set[Tuple[int, int]] = {tuple(w) for w in grid_state.walls}
        self.diagonal = grid_state.diagonal_movement

        # Terrain cost map: defaults to 1.0 per cell
        self.terrain: Dict[Tuple[int, int], float] = {}
        for key_str, cost in (grid_state.terrain or {}).items():
            try:
                parts = key_str.split(",")
                r, c = int(parts[0]), int(parts[1])
                self.terrain[(r, c)] = float(cost)
            except (ValueError, IndexError):
                continue

        self._heuristic_func = build_grid_heuristic(
            heuristic_name, self._goal, diagonal_movement=self.diagonal
        )

    @property
    def start_node(self) -> Tuple[int, int]:
        return self._start

    @property
    def goal_node(self) -> Tuple[int, int]:
        return self._goal

    def is_goal(self, node: Tuple[int, int]) -> bool:
        return node[0] == self._goal[0] and node[1] == self._goal[1]

    def heuristic(self, node: Tuple[int, int]) -> float:
        return self._heuristic_func(node)

    def format_node(self, node: Tuple[int, int]) -> List[int]:
        return [node[0], node[1]]

    def get_neighbors(self, node: Tuple[int, int]) -> List[Tuple[Tuple[int, int], float]]:
        r, c = node
        neighbors: List[Tuple[Tuple[int, int], float]] = []

        # 4 orthogonal directions: North, East, South, West (consistent clockwise exploration order)
        ortho = [(-1, 0), (0, 1), (1, 0), (0, -1)]
        for dr, dc in ortho:
            nr, nc = r + dr, c + dc
            if 0 <= nr < self.rows and 0 <= nc < self.cols and (nr, nc) not in self.walls:
                cost_mult = self.terrain.get((nr, nc), 1.0)
                step_cost = 1.0 * cost_mult
                neighbors.append(((nr, nc), step_cost))

        # 4 diagonal directions: NE, SE, SW, NW
        if self.diagonal:
            diags = [
                (-1, 1, (-1, 0), (0, 1)),   # NE
                (1, 1, (1, 0), (0, 1)),     # SE
                (1, -1, (1, 0), (0, -1)),   # SW
                (-1, -1, (-1, 0), (0, -1))  # NW
            ]
            sqrt2 = math.sqrt(2.0)
            for dr, dc, wall_check1, wall_check2 in diags:
                nr, nc = r + dr, c + dc
                if 0 <= nr < self.rows and 0 <= nc < self.cols and (nr, nc) not in self.walls:
                    # Prevent corner cutting if both adjacent orthogonal cells are walls
                    w1 = (r + wall_check1[0], c + wall_check1[1])
                    w2 = (r + wall_check2[0], c + wall_check2[1])
                    if w1 in self.walls and w2 in self.walls:
                        continue
                    cost_mult = self.terrain.get((nr, nc), 1.0)
                    step_cost = sqrt2 * cost_mult
                    neighbors.append(((nr, nc), step_cost))

        return neighbors


class GraphEnvironment(SearchEnvironment):
    """General graph search environment with directed/undirected weighted edges."""

    def __init__(self, graph_state: GraphState, heuristic_name: str = "graph_euclidean"):
        self._start = graph_state.start
        self._goal = graph_state.goal
        self.nodes = {n.id: n for n in graph_state.nodes}
        self.coords = {n.id: (n.x, n.y) for n in graph_state.nodes}
        self.adjacency: Dict[str, List[Tuple[str, float]]] = {n.id: [] for n in graph_state.nodes}

        for edge in graph_state.edges:
            if edge.weight < 0:
                raise ValueError(f"Negative edge weights ({edge.weight}) are not allowed in classical search environments.")
            if edge.source in self.adjacency and edge.target in self.adjacency:
                self.adjacency[edge.source].append((edge.target, float(edge.weight)))
                if not edge.directed:
                    self.adjacency[edge.target].append((edge.source, float(edge.weight)))

        self._heuristic_func = build_graph_heuristic(
            self._goal, self.coords, heuristic_name=heuristic_name
        )

    @property
    def start_node(self) -> str:
        return self._start

    @property
    def goal_node(self) -> str:
        return self._goal

    def is_goal(self, node: str) -> bool:
        return node == self._goal

    def heuristic(self, node: str) -> float:
        return self._heuristic_func(node)

    def format_node(self, node: str) -> str:
        return str(node)

    def get_neighbors(self, node: str) -> List[Tuple[str, float]]:
        return self.adjacency.get(node, [])


class BaseSearchAlgorithm(abc.ABC):
    """Abstract base class for all search algorithm implementations."""

    id: str = "base"
    name: str = "Base Search"
    category: str = "Uninformed"
    time_complexity: str = "O(b^d)"
    space_complexity: str = "O(b^d)"
    completeness: str = "Yes (under standard conditions)"
    optimality: str = "No"

    @abc.abstractmethod
    def run_search(
        self,
        env: SearchEnvironment,
        max_events: int = 8000,
        playback_events: bool = True,
        **kwargs
    ) -> SearchResult:
        pass

    def reconstruct_path(
        self,
        parents: Dict[Any, Optional[Any]],
        current_node: Any,
        env: SearchEnvironment
    ) -> Tuple[List[Union[List[int], str]], float, int]:
        """Backtracks from current_node using parent map to construct the solution path and compute actual cost."""
        path_nodes: List[Any] = []
        curr = current_node
        while curr is not None:
            path_nodes.append(curr)
            curr = parents.get(curr)

        path_nodes.reverse()
        formatted_path = [env.format_node(n) for n in path_nodes]

        # Calculate exact path cost by checking step costs between consecutive nodes
        path_cost = 0.0
        for i in range(len(path_nodes) - 1):
            u, v = path_nodes[i], path_nodes[i + 1]
            # Find cost from u to v in env neighbors
            step_cost = 1.0
            for neighbor, cost in env.get_neighbors(u):
                if neighbor == v:
                    step_cost = cost
                    break
            path_cost += step_cost

        return formatted_path, round(path_cost, 4), len(path_nodes)
