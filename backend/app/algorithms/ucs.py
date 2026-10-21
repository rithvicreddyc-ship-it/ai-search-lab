import heapq
import time
from typing import Any, Dict, List, Optional, Set, Tuple

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment
from app.models.responses import SearchEvent, SearchResult

class UniformCostSearch(BaseSearchAlgorithm):
    id = "ucs"
    name = "Uniform Cost Search (UCS / Dijkstra)"
    category = "Uninformed Search"
    time_complexity = "O(b^(1 + floor(C*/eps))) where C* is optimal cost"
    space_complexity = "O(b^(1 + floor(C*/eps)))"
    completeness = "Complete if step costs >= eps > 0"
    optimality = "Optimal for any non-negative step costs"

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
                optimality_guarantee="Optimal (cost=0)",
                completeness_guarantee="Complete",
                summary="Start node is the goal."
            )

        # Priority queue entries: (g_cost, insertion_counter, node)
        counter = 0
        pq: List[Tuple[float, int, Any]] = [(0.0, counter, start)]
        g_costs: Dict[Any, float] = {start: 0.0}
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
                g=0.0,
                f=0.0,
                frontier_size=1,
                explored_size=0,
                explanation="Initialised priority queue with start node (g=0.0)."
            ))

        while pq:
            max_frontier_size = max(max_frontier_size, len(pq))
            current_g, _, current = heapq.heappop(pq)

            # Ignore stale priority queue entries with superseded higher cost
            if current in explored or current_g > g_costs.get(current, float("inf")):
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
                    g=round(current_g, 3),
                    f=round(current_g, 3),
                    frontier_size=len(pq),
                    explored_size=len(explored),
                    explanation=f"Popped node {env.format_node(current)} from priority queue with minimum path cost g(n) = {round(current_g, 2)}."
                ))

            # Goal test happens when popped from priority queue (essential for optimality in UCS)
            if env.is_goal(current):
                solution_found = True
                goal_node = current
                break

            neighbors = env.get_neighbors(current)
            for neighbor, step_cost in neighbors:
                if step_cost < 0:
                    raise ValueError(f"Negative step cost ({step_cost}) detected. UCS requires non-negative edge costs.")

                tentative_g = current_g + step_cost
                old_g = g_costs.get(neighbor, float("inf"))

                if tentative_g < old_g:
                    is_new = neighbor not in g_costs
                    g_costs[neighbor] = tentative_g
                    parents[neighbor] = current
                    counter += 1
                    heapq.heappush(pq, (tentative_g, counter, neighbor))
                    if is_new:
                        nodes_generated += 1

                    if playback_events and len(events) < max_events:
                        step += 1
                        event_type = "frontier_add" if is_new else "frontier_update"
                        expl_text = (
                            f"Discovered neighbor {env.format_node(neighbor)} with path cost g={round(tentative_g, 2)}."
                            if is_new else
                            f"Improved cheaper path to node {env.format_node(neighbor)}: new g={round(tentative_g, 2)} < old g={round(old_g, 2)}."
                        )
                        events.append(SearchEvent(
                            step=step,
                            type=event_type,
                            node=env.format_node(neighbor),
                            parent=env.format_node(current),
                            g=round(tentative_g, 3),
                            f=round(tentative_g, 3),
                            frontier_size=len(pq),
                            explored_size=len(explored),
                            explanation=expl_text
                        ))

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
                    f=round(path_cost, 3),
                    frontier_size=len(pq),
                    explored_size=len(explored),
                    explanation=f"Goal popped from priority queue with optimal cost {path_cost}! Optimal solution path confirmed."
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
                optimality_guarantee="Guaranteed Optimal (for all non-negative edge costs)",
                completeness_guarantee="Complete (step costs >= eps > 0)",
                summary=f"UCS found optimal path with cost {path_cost} (length {path_length}) after expanding {nodes_expanded} nodes."
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
                    explanation="Priority queue exhausted without reaching goal. Goal is unreachable."
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
                warnings=["Goal state is disconnected."],
                optimality_guarantee="N/A",
                completeness_guarantee="Complete (explored entire connected component)",
                summary=f"UCS explored all reachable states ({len(explored)} expanded). Goal is unreachable."
            )
