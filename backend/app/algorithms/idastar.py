import time
from typing import Any, Dict, List, Optional, Set, Tuple

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment
from app.models.responses import SearchEvent, SearchResult

class IterativeDeepeningAStar(BaseSearchAlgorithm):
    id = "idastar"
    name = "Iterative Deepening A* (IDA*)"
    category = "Informed (Heuristic) Search"
    time_complexity = "O(b^d) worst case; relies on branching factor & threshold increases"
    space_complexity = "O(d) linear memory proportional to depth"
    completeness = "Complete if step costs >= eps > 0"
    optimality = "Optimal if heuristic is admissible"

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
                optimality_guarantee="Optimal",
                completeness_guarantee="Complete",
                summary="Start node is the goal."
            )

        threshold = start_h
        events: List[SearchEvent] = []
        step = 0
        total_nodes_expanded = 0
        total_nodes_generated = 1
        max_stack_depth = 1
        solution_path: Optional[List[Any]] = None
        iteration = 0

        max_iterations = 60
        max_expansions = 12000

        while iteration < max_iterations and total_nodes_expanded < max_expansions:
            iteration += 1
            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="threshold_update",
                    node=env.format_node(start),
                    f=round(threshold, 3),
                    frontier_size=1,
                    explored_size=total_nodes_expanded,
                    explanation=f"--- IDA* Iteration {iteration}: Setting f-cost threshold bound to {round(threshold, 2)} ---"
                ))

            # DFS recursion with current threshold
            # Path tracks the current DFS branch to avoid cycles: [(node, g_cost)]
            path: List[Tuple[Any, float]] = [(start, 0.0)]
            path_set: Set[Any] = {start}

            def search_recursive(
                curr: Any,
                g: float,
                bound: float
            ) -> Tuple[Optional[List[Any]], float]:
                nonlocal step, total_nodes_expanded, total_nodes_generated, max_stack_depth

                max_stack_depth = max(max_stack_depth, len(path))
                h = env.heuristic(curr)
                f = g + h

                if f > bound:
                    # Pruned this branch; return the exceeded f-cost as candidate for next bound
                    return None, f

                if env.is_goal(curr):
                    # Found goal within current threshold bound!
                    return [node for node, _ in path], f

                if total_nodes_expanded >= max_expansions:
                    return None, float("inf")

                total_nodes_expanded += 1
                min_exceeded = float("inf")

                if playback_events and len(events) < max_events:
                    step += 1
                    events.append(SearchEvent(
                        step=step,
                        type="visit",
                        node=env.format_node(curr),
                        parent=env.format_node(path[-2][0]) if len(path) >= 2 else None,
                        g=round(g, 3),
                        h=round(h, 3),
                        f=round(f, 3),
                        frontier_size=len(path),
                        explored_size=total_nodes_expanded,
                        explanation=f"Traversing node {env.format_node(curr)} (depth={len(path)}): g={round(g, 1)}, h={round(h, 1)}, f={round(f, 1)} <= threshold {round(bound, 1)}."
                    ))

                neighbors = env.get_neighbors(curr)
                for neighbor, cost in neighbors:
                    if neighbor not in path_set:
                        total_nodes_generated += 1
                        path.append((neighbor, g + cost))
                        path_set.add(neighbor)

                        found_path, next_bound = search_recursive(neighbor, g + cost, bound)
                        if found_path is not None:
                            return found_path, next_bound

                        if next_bound < min_exceeded:
                            min_exceeded = next_bound

                        path.pop()
                        path_set.remove(neighbor)

                return None, min_exceeded

            res_path, min_exceeded = search_recursive(start, 0.0, threshold)
            if res_path is not None:
                solution_path = res_path
                break

            if min_exceeded == float("inf"):
                # No branches exceeded bound, meaning entire state space explored and no goal exists
                break

            threshold = min_exceeded

        exec_time = (time.perf_counter() - start_time) * 1000.0

        if solution_path is not None:
            # Reconstruct path and cost
            formatted_path = [env.format_node(n) for n in solution_path]
            path_cost = 0.0
            for i in range(len(solution_path) - 1):
                u, v = solution_path[i], solution_path[i + 1]
                for nbr, cost in env.get_neighbors(u):
                    if nbr == v:
                        path_cost += cost
                        break

            path_length = len(solution_path)
            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="path_found",
                    node=env.format_node(solution_path[-1]),
                    g=round(path_cost, 3),
                    f=round(threshold, 3),
                    frontier_size=0,
                    explored_size=total_nodes_expanded,
                    explanation=f"Goal discovered at threshold {round(threshold, 2)}! Solution path length: {path_length}, Cost: {path_cost}."
                ))

            return SearchResult(
                algorithm=self.id,
                solution_found=True,
                path=formatted_path,
                path_cost=round(path_cost, 4),
                path_length=path_length,
                nodes_expanded=total_nodes_expanded,
                nodes_generated=total_nodes_generated,
                max_frontier_size=max_stack_depth,
                execution_time_ms=round(exec_time, 3),
                total_events=len(events),
                events=events,
                optimality_guarantee="Guaranteed Optimal (with admissible heuristic)",
                completeness_guarantee="Complete (step costs >= eps > 0)",
                summary=f"IDA* completed in {iteration} threshold iterations, expanding {total_nodes_expanded} nodes. Path cost: {round(path_cost, 2)}."
            )
        else:
            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="search_failed",
                    node=env.format_node(start),
                    frontier_size=0,
                    explored_size=total_nodes_expanded,
                    explanation="All thresholds exhausted without finding goal. Goal is unreachable."
                ))
            return SearchResult(
                algorithm=self.id,
                solution_found=False,
                path=[],
                path_cost=0.0,
                path_length=0,
                nodes_expanded=total_nodes_expanded,
                nodes_generated=total_nodes_generated,
                max_frontier_size=max_stack_depth,
                execution_time_ms=round(exec_time, 3),
                total_events=len(events),
                events=events,
                warnings=["Goal state is completely unreachable."],
                optimality_guarantee="N/A",
                completeness_guarantee="Complete (search space exhausted)",
                summary=f"IDA* searched up to threshold {round(threshold, 2)} with {total_nodes_expanded} expansions. No path exists."
            )
