import collections
import time
from typing import Any, Dict, List, Optional, Set, Tuple

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment
from app.models.responses import SearchEvent, SearchResult

class BreadthFirstSearch(BaseSearchAlgorithm):
    id = "bfs"
    name = "Breadth-First Search (BFS)"
    category = "Uninformed Search"
    time_complexity = "O(b^d)"
    space_complexity = "O(b^d)"
    completeness = "Complete (finite branching factor b)"
    optimality = "Optimal if all step costs are equal (unit cost)"

    def run_search(
        self,
        env: SearchEnvironment,
        max_events: int = 8000,
        playback_events: bool = True,
        **kwargs
    ) -> SearchResult:
        start_time = time.perf_counter()

        start = env.start_node
        if env.is_goal(start):
            exec_time = (time.perf_counter() - start_time) * 1000.0
            events = []
            if playback_events:
                events.append(SearchEvent(
                    step=1,
                    type="path_found",
                    node=env.format_node(start),
                    g=0.0,
                    h=0.0,
                    f=0.0,
                    frontier_size=0,
                    explored_size=1,
                    explanation="Start node is already the goal state."
                ))
            return SearchResult(
                algorithm=self.id,
                solution_found=True,
                path=[env.format_node(start)],
                path_cost=0.0,
                path_length=1,
                nodes_expanded=0,
                nodes_generated=1,
                max_frontier_size=1,
                execution_time_ms=round(exec_time, 3),
                total_events=len(events),
                events=events,
                optimality_guarantee="Optimal (unit costs)",
                completeness_guarantee="Complete",
                summary="Start node is the goal. Immediate solution found."
            )

        queue = collections.deque([start])
        in_queue: Set[Any] = {start}
        explored: Set[Any] = set()
        parents: Dict[Any, Optional[Any]] = {start: None}

        events: List[SearchEvent] = []
        step = 0
        nodes_expanded = 0
        nodes_generated = 1
        max_frontier_size = 1
        solution_found = False
        goal_node = None

        if playback_events:
            step += 1
            events.append(SearchEvent(
                step=step,
                type="frontier_add",
                node=env.format_node(start),
                frontier_size=1,
                explored_size=0,
                explanation="Initialised FIFO queue with start node."
            ))

        while queue:
            max_frontier_size = max(max_frontier_size, len(queue))
            current = queue.popleft()
            in_queue.remove(current)

            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="visit",
                    node=env.format_node(current),
                    parent=env.format_node(parents[current]) if parents[current] is not None else None,
                    frontier_size=len(queue),
                    explored_size=len(explored),
                    explanation=f"Popped node {env.format_node(current)} from front of FIFO queue (level-by-level exploration)."
                ))

            explored.add(current)
            nodes_expanded += 1

            if env.is_goal(current):
                solution_found = True
                goal_node = current
                break

            neighbors = env.get_neighbors(current)
            for neighbor, cost in neighbors:
                if neighbor not in explored and neighbor not in in_queue:
                    nodes_generated += 1
                    parents[neighbor] = current
                    queue.append(neighbor)
                    in_queue.add(neighbor)

                    if playback_events and len(events) < max_events:
                        step += 1
                        events.append(SearchEvent(
                            step=step,
                            type="frontier_add",
                            node=env.format_node(neighbor),
                            parent=env.format_node(current),
                            frontier_size=len(queue),
                            explored_size=len(explored),
                            explanation=f"Added unvisited neighbor {env.format_node(neighbor)} to back of FIFO queue."
                        ))

                    # Early goal check optimization for BFS (standard in graph search BFS)
                    if env.is_goal(neighbor):
                        solution_found = True
                        goal_node = neighbor
                        queue.clear()
                        break

            if solution_found:
                break

        exec_time = (time.perf_counter() - start_time) * 1000.0

        if solution_found and goal_node is not None:
            path, path_cost, path_length = self.reconstruct_path(parents, goal_node, env)
            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="path_found",
                    node=env.format_node(goal_node),
                    frontier_size=len(queue),
                    explored_size=len(explored),
                    explanation=f"Goal reached! Reconstructed optimal shortest path of length {path_length}."
                ))
            return SearchResult(
                algorithm=self.id,
                solution_found=True,
                path=path,
                path_cost=path_cost,
                path_length=path_length,
                nodes_expanded=nodes_expanded,
                nodes_generated=nodes_generated,
                max_frontier_size=max_frontier_size,
                execution_time_ms=round(exec_time, 3),
                total_events=len(events),
                events=events,
                optimality_guarantee="Optimal for uniform/unit-step costs; may be suboptimal on weighted terrain.",
                completeness_guarantee="Complete: Guaranteed to find a solution if one exists.",
                summary=f"BFS found a solution exploring {nodes_expanded} nodes. Path length: {path_length}, Cost: {path_cost}."
            )
        else:
            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="search_failed",
                    node=env.format_node(start),
                    frontier_size=0,
                    explored_size=len(explored),
                    explanation="Queue exhausted without reaching goal. Goal is unreachable."
                ))
            return SearchResult(
                algorithm=self.id,
                solution_found=False,
                path=[],
                path_cost=0.0,
                path_length=0,
                nodes_expanded=nodes_expanded,
                nodes_generated=nodes_generated,
                max_frontier_size=max_frontier_size,
                execution_time_ms=round(exec_time, 3),
                total_events=len(events),
                events=events,
                warnings=["Goal state is completely disconnected or blocked by obstacles."],
                optimality_guarantee="N/A (No path exists)",
                completeness_guarantee="Complete (Proved goal is unreachable)",
                summary=f"Search exhausted all reachable states ({len(explored)} explored). Goal cannot be reached."
            )
