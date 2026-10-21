from typing import Dict, List, Type

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment, GridEnvironment, GraphEnvironment
from app.algorithms.bfs import BreadthFirstSearch
from app.algorithms.dfs import DepthFirstSearch
from app.algorithms.ucs import UniformCostSearch
from app.algorithms.greedy import GreedyBestFirstSearch
from app.algorithms.astar import AStarSearch
from app.algorithms.idastar import IterativeDeepeningAStar
from app.algorithms.hill_climbing import HillClimbingSearch
from app.models.responses import AlgorithmMetadata

ALGORITHM_REGISTRY: Dict[str, Type[BaseSearchAlgorithm]] = {
    "bfs": BreadthFirstSearch,
    "dfs": DepthFirstSearch,
    "ucs": UniformCostSearch,
    "greedy": GreedyBestFirstSearch,
    "astar": AStarSearch,
    "idastar": IterativeDeepeningAStar,
    "hill_climbing": HillClimbingSearch,
}

ALGORITHM_METADATA: Dict[str, AlgorithmMetadata] = {
    "bfs": AlgorithmMetadata(
        id="bfs",
        name="Breadth-First Search (BFS)",
        category="Uninformed Search",
        time_complexity="O(b^d)",
        space_complexity="O(b^d)",
        completeness="Complete: Guaranteed to find a solution if one exists (finite branching factor b).",
        optimality="Optimal: Finds the shortest path when all step costs are equal (unit cost).",
        requires_heuristic=False,
        supports_weights=False,
        pseudocode=[
            "function BFS(problem):",
            "  node = problem.INITIAL_STATE",
            "  if problem.IS_GOAL(node): return path(node)",
            "  frontier = FIFOQueue([node])",
            "  explored = Set()",
            "  while frontier is not empty:",
            "    node = frontier.POP()",
            "    explored.ADD(node)",
            "    for each action in problem.ACTIONS(node):",
            "      child = problem.RESULT(node, action)",
            "      if child not in explored and child not in frontier:",
            "        if problem.IS_GOAL(child): return path(child)",
            "        frontier.PUSH(child)",
            "  return FAILURE"
        ],
        description="Explores a state space level by level using a FIFO queue. BFS guarantees finding a solution with the minimum number of transitions, making it optimal when all actions share identical cost.",
        viva_questions=[
            {
                "question": "Under what condition is BFS guaranteed to find an optimal path?",
                "answer": "BFS is optimal when all step costs are equal (uniform/unit cost). If step costs vary, BFS finds the path with the fewest edges, which might not have the lowest total cost."
            },
            {
                "question": "What is the primary practical drawback of BFS?",
                "answer": "Its exponential memory requirement O(b^d). Because it stores every node in the frontier at each depth level, memory exhaustion typically occurs before time limits are reached."
            }
        ]
    ),
    "dfs": AlgorithmMetadata(
        id="dfs",
        name="Depth-First Search (DFS)",
        category="Uninformed Search",
        time_complexity="O(b^m) where m is maximum depth",
        space_complexity="O(b*m) linear memory",
        completeness="Complete in finite state spaces with cycle prevention; Incomplete in infinite spaces.",
        optimality="Not optimal: DFS dives deep along the first branch and may return a convoluted, highly suboptimal path.",
        requires_heuristic=False,
        supports_weights=False,
        pseudocode=[
            "function DFS(problem):",
            "  frontier = LIFOStack([problem.INITIAL_STATE])",
            "  explored = Set()",
            "  while frontier is not empty:",
            "    node = frontier.POP()",
            "    if problem.IS_GOAL(node): return path(node)",
            "    if node not in explored:",
            "      explored.ADD(node)",
            "      for each child in problem.EXPAND(node):",
            "        if child not in explored:",
            "          frontier.PUSH(child)",
            "  return FAILURE"
        ],
        description="Traverses a search tree deeply along each branch using a LIFO stack before backtracking. DFS uses minimal linear memory O(bm), but does not guarantee the shortest path.",
        viva_questions=[
            {
                "question": "Why is DFS preferred over BFS in specific problem domains?",
                "answer": "DFS has linear space complexity O(bm) compared to BFS's exponential O(b^d). In domains with many solutions or when finding any path quickly is sufficient, DFS uses dramatically less RAM."
            },
            {
                "question": "Can DFS get trapped in an infinite loop?",
                "answer": "Yes, on graphs with cycles or infinite state spaces, DFS can enter an infinite loop unless duplicate detection (visited set) or depth limits are enforced."
            }
        ]
    ),
    "ucs": AlgorithmMetadata(
        id="ucs",
        name="Uniform Cost Search (UCS / Dijkstra)",
        category="Uninformed Search",
        time_complexity="O(b^(1 + floor(C*/eps)))",
        space_complexity="O(b^(1 + floor(C*/eps)))",
        completeness="Complete: If step costs >= eps > 0.",
        optimality="Optimal: Guaranteed to return the lowest-cost path for any non-negative edge costs.",
        requires_heuristic=False,
        supports_weights=True,
        pseudocode=[
            "function UCS(problem):",
            "  node = problem.INITIAL_STATE",
            "  frontier = PriorityQueue(key=g_cost) with [(0, node)]",
            "  explored = Set()",
            "  while frontier is not empty:",
            "    (cost, node) = frontier.POP_MIN()",
            "    if problem.IS_GOAL(node): return path(node)",
            "    if node not in explored:",
            "      explored.ADD(node)",
            "      for (child, step_cost) in problem.EXPAND(node):",
            "        new_cost = cost + step_cost",
            "        if child not in explored or new_cost < g(child):",
            "          frontier.INSERT_OR_UPDATE(new_cost, child)",
            "  return FAILURE"
        ],
        description="Expands the node with the lowest cumulative path cost g(n) using a priority queue. Equivalent to Dijkstra's algorithm, UCS guarantees finding the optimal path through terrain with varying weights.",
        viva_questions=[
            {
                "question": "Why must the goal test be applied when a node is removed from the priority queue, rather than when it is generated?",
                "answer": "Because a cheaper path to the goal node might be discovered later through another branch with smaller step costs. Testing when popped guarantees all cheaper possibilities have been checked."
            },
            {
                "question": "What happens if an edge in UCS has a negative weight?",
                "answer": "UCS assumes path costs are monotonically non-decreasing. Negative edge weights violate this assumption and can cause cycles or incorrect premature termination. Bellman-Ford is needed for negative weights."
            }
        ]
    ),
    "greedy": AlgorithmMetadata(
        id="greedy",
        name="Greedy Best-First Search",
        category="Informed (Heuristic) Search",
        time_complexity="O(b^m) worst case; dramatically faster with accurate heuristics",
        space_complexity="O(b^m) keeps all generated nodes in frontier and memory",
        completeness="Complete in finite state spaces with cycle detection; Incomplete on infinite graphs.",
        optimality="Not optimal: Prioritises immediate heuristic estimate h(n) without considering past cost g(n).",
        requires_heuristic=True,
        supports_weights=False,
        pseudocode=[
            "function GreedyBestFirst(problem, h):",
            "  frontier = PriorityQueue(key=h) with [problem.INITIAL_STATE]",
            "  explored = Set()",
            "  while frontier is not empty:",
            "    node = frontier.POP_MIN()",
            "    if problem.IS_GOAL(node): return path(node)",
            "    explored.ADD(node)",
            "    for child in problem.EXPAND(node):",
            "      if child not in explored and child not in frontier:",
            "        frontier.PUSH(child, priority=h(child))",
            "  return FAILURE"
        ],
        description="Uses a heuristic evaluation function h(n) estimating distance to the goal to guide search aggressively toward the destination. While very fast, it ignores accumulated cost g(n) and can take suboptimal detours around obstacles.",
        viva_questions=[
            {
                "question": "How does Greedy Best-First Search differ fundamentally from A* Search?",
                "answer": "Greedy Best-First Search uses f(n) = h(n), considering only estimated distance to goal. A* uses f(n) = g(n) + h(n), balancing both accumulated cost and remaining distance for optimality."
            },
            {
                "question": "Can Greedy Best-First Search get misled by a concave obstacle / dead end?",
                "answer": "Yes. If an obstacle curves toward the goal, Greedy will plunge into the dead end because heuristic values keep decreasing, until forced to expand other options."
            }
        ]
    ),
    "astar": AlgorithmMetadata(
        id="astar",
        name="A* Search",
        category="Informed (Heuristic) Search",
        time_complexity="O(b^d) worst case; O(d) with perfect heuristic",
        space_complexity="O(b^d) exponential memory to store all frontier and closed nodes",
        completeness="Complete: Guaranteed to find a solution if one exists (with positive step costs).",
        optimality="Guaranteed optimal if h(n) is admissible (tree search) or consistent/monotonic (graph search).",
        requires_heuristic=True,
        supports_weights=True,
        pseudocode=[
            "function AStar(problem, h):",
            "  start = problem.INITIAL_STATE",
            "  frontier = PriorityQueue(key=f) with [(h(start), start)]",
            "  g_cost = {start: 0}",
            "  explored = Set()",
            "  while frontier is not empty:",
            "    node = frontier.POP_MIN()",
            "    if problem.IS_GOAL(node): return path(node)",
            "    explored.ADD(node)",
            "    for (child, cost) in problem.EXPAND(node):",
            "      tentative_g = g_cost[node] + cost",
            "      if tentative_g < g_cost.get(child, infinity):",
            "        g_cost[child] = tentative_g",
            "        f = tentative_g + h(child)",
            "        frontier.INSERT_OR_UPDATE(f, child)",
            "  return FAILURE"
        ],
        description="The gold standard in heuristic pathfinding. Evaluates nodes using f(n) = g(n) + h(n), balancing the exact cost to reach node n with the estimated remaining distance to the goal. Optimally efficient among all search algorithms with the same heuristic.",
        viva_questions=[
            {
                "question": "What is the difference between an admissible heuristic and a consistent heuristic?",
                "answer": "An admissible heuristic never overestimates the true cost to the goal: h(n) <= h*(n). A consistent (monotonic) heuristic satisfies the triangle inequality: h(n) <= c(n, a, n') + h(n'). Consistency implies admissibility and guarantees that the first time a node is expanded, its path is optimal."
            },
            {
                "question": "Why is Manhattan distance admissible for 4-directional unit grid movement but NOT for 8-directional diagonal movement?",
                "answer": "In 8-directional movement, diagonal steps cost sqrt(2) ~ 1.414, but Manhattan distance assumes horizontal + vertical steps costing 2.0. Therefore, Manhattan overestimates diagonal distance, violating admissibility."
            }
        ]
    ),
    "idastar": AlgorithmMetadata(
        id="idastar",
        name="Iterative Deepening A* (IDA*)",
        category="Informed (Heuristic) Search",
        time_complexity="O(b^d) worst case; repeated exploration of shallow levels",
        space_complexity="O(d) linear memory proportional to solution depth",
        completeness="Complete: If step costs >= eps > 0.",
        optimality="Optimal: When the heuristic h(n) is admissible.",
        requires_heuristic=True,
        supports_weights=True,
        pseudocode=[
            "function IDA*(problem, h):",
            "  threshold = h(problem.INITIAL_STATE)",
            "  while true:",
            "    (found, min_exceeded) = DFS_SEARCH(start, 0, threshold)",
            "    if found: return path",
            "    if min_exceeded == infinity: return FAILURE",
            "    threshold = min_exceeded"
        ],
        description="Overcomes the memory bottleneck of A* by executing depth-first searches bounded by an f-cost threshold. In each iteration, the threshold is updated to the minimum f-cost that exceeded the previous cutoff.",
        viva_questions=[
            {
                "question": "What primary problem does IDA* solve compared to standard A*?",
                "answer": "A* suffers from exponential memory consumption O(b^d) as all frontier and explored nodes remain in RAM. IDA* requires only linear memory O(d) proportional to depth, enabling search in huge state spaces."
            },
            {
                "question": "What is the computational downside of IDA* on unit grids or continuous domains?",
                "answer": "If many nodes have distinct f-costs, the threshold may only increase by a tiny increment each iteration, causing excessive re-traversal of earlier levels."
            }
        ]
    ),
    "hill_climbing": AlgorithmMetadata(
        id="hill_climbing",
        name="Hill Climbing (Steepest Descent)",
        category="Local Search",
        time_complexity="O(infinity) if trapped in infinite loops; practically terminates quickly",
        space_complexity="O(1) constant memory (stores only current state)",
        completeness="Incomplete: Readily gets stuck in local minima, plateaus, and ridges.",
        optimality="Not optimal: Makes greedy local decisions without maintaining an exploration frontier.",
        requires_heuristic=True,
        supports_weights=False,
        pseudocode=[
            "function HillClimbing(problem, h):",
            "  current = problem.INITIAL_STATE",
            "  while true:",
            "    if problem.IS_GOAL(current): return path(current)",
            "    neighbor = neighbor with min h(neighbor)",
            "    if h(neighbor) >= h(current):",
            "      return FAILURE (local optimum reached)",
            "    current = neighbor"
        ],
        description="A local search algorithm that continually moves in the direction of increasing quality (or decreasing heuristic distance to goal). It maintains no frontier, using constant O(1) memory, but is vulnerable to local minima, plateaus, and ridges.",
        viva_questions=[
            {
                "question": "Why does Hill Climbing fail even when a clear path to the goal exists?",
                "answer": "Hill climbing is purely local. If an obstacle requires moving temporarily away from the goal (increasing h(n)), hill climbing detects that all immediate neighbors have higher h(n) and terminates at that local minimum."
            },
            {
                "question": "How can Hill Climbing be modified to escape plateaus or local optima?",
                "answer": "By allowing sideways moves up to a threshold, utilizing random restarts (Random-Restart Hill Climbing), or applying probabilistic moves like Simulated Annealing."
            }
        ]
    )
}

def get_algorithm(algorithm_id: str) -> BaseSearchAlgorithm:
    alg_class = ALGORITHM_REGISTRY.get(algorithm_id.lower())
    if not alg_class:
        raise ValueError(f"Unknown algorithm: {algorithm_id}. Supported: {list(ALGORITHM_REGISTRY.keys())}")
    return alg_class()

__all__ = [
    "BaseSearchAlgorithm", "SearchEnvironment", "GridEnvironment", "GraphEnvironment",
    "BreadthFirstSearch", "DepthFirstSearch", "UniformCostSearch", "GreedyBestFirstSearch",
    "AStarSearch", "IterativeDeepeningAStar", "HillClimbingSearch",
    "ALGORITHM_REGISTRY", "ALGORITHM_METADATA", "get_algorithm"
]
