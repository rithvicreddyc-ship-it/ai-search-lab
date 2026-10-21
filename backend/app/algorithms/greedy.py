import heapq
import time
from typing import Any, Dict, List, Optional, Set, Tuple

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment
from app.models.responses import SearchEvent, SearchResult

class GreedyBestFirstSearch(BaseSearchAlgorithm):
    id = "greedy"
    name = "Greedy Best-First Search"
    category = "Informed (Heuristic) Search"
    time_complexity = "O(b^m) worst case; O(b*d) with good heuristic"
    space_complexity = "O(b^m) keeps all nodes in memory"
    completeness = "Complete in finite spaces with cycle checking; Incomplete on infinite spaces"
    optimality = "Not optimal. Ignores accumulated step cost g(n) and can take costly detours"

    def run_search(
        self,
        env: SearchEnvironment,
        max_events: int = 8000,
        playback_events: bool = True,
        **kwargs
    ) -> SearchResult:
        start_time = time.perf_counter()

        start = env.start_node
        start_h = env.heuristic(start)
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
                    explanation="Start node is the goal state."
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
                optimality_guarantee="Non-optimal",
                completeness_guarantee="Complete",
                summary="Start node is already the goal."
            )

        counter = 0
        pq: List[Tuple[float, int, Any]] = [(start_h, counter, start)]
        in_frontier: Set[Any] = {start}
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
                h=round(start_h, 3),
                f=round(start_h, 3),
                frontier_size=1,
                explored_size=0,
                explanation=f"Added start node to priority queue sorted purely by h(n) = {round(start_h, 2)}."
            ))

        while pq:
            max_frontier_size = max(max_frontier_size, len(pq))
            current_h, _, current = heapq.heappop(pq)
            in_frontier.discard(current)

            if current in explored:
                continue

            explored.add(current)
            nodes_expanded += 1

            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="visit",
                    node=env.format_node(current),
                    parent=env.format_node(parents[current]) if parents[current] is not None else None,
                    h=round(current_h, 3),
                    f=round(current_h, 3),
                    frontier_size=len(pq),
                    explored_size=len(explored),
                    explanation=f"Selected node {env.format_node(current)} with best heuristic score h(n) = {round(current_h, 2)}."
                ))

            if env.is_goal(current):
                solution_found = True
                goal_node = current
                break

            neighbors = env.get_neighbors(current)
            for neighbor, cost in neighbors:
                if neighbor not in explored and neighbor not in in_frontier:
                    nodes_generated += 1
                    parents[neighbor] = current
                    h_val = env.heuristic(neighbor)
                    counter += 1
                    heapq.heappush(pq, (h_val, counter, neighbor))
                    in_frontier.add(neighbor)

                    if playback_events and len(events) < max_events:
                        step += 1
                        events.append(SearchEvent(
                            step=step,
                            type="frontier_add",
                            node=env.format_node(neighbor),
                            parent=env.format_node(current),
                            h=round(h_val, 3),
                            f=round(h_val, 3),
                            frontier_size=len(pq),
                            explored_size=len(explored),
                            explanation=f"Evaluated neighbor {env.format_node(neighbor)} with h={round(h_val, 2)}. Added to frontier."
                        ))

                    if env.is_goal(neighbor):
                        solution_found = True
                        goal_node = neighbor
                        pq.clear()
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
                    g=round(path_cost, 3),
                    h=0.0,
                    frontier_size=len(pq),
                    explored_size=len(explored),
                    explanation=f"Goal reached! Reconstructed greedy path of length {path_length} (Cost: {path_cost})."
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
                optimality_guarantee="Non-optimal: Greedy Best-First Search prioritises estimated distance to goal h(n) and ignores path cost g(n).",
                completeness_guarantee="Complete for finite graphs with cycle detection.",
                summary=f"Greedy Best-First reached goal in {nodes_expanded} expansions. Path length: {path_length}, Cost: {path_cost}."
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
                    explanation="Frontier exhausted. No path found to goal."
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
                warnings=["Goal state is unreachable."],
                optimality_guarantee="N/A",
                completeness_guarantee="Complete (finite space exhausted)",
                summary=f"Search exhausted with no path found after {nodes_expanded} expansions."
            )
