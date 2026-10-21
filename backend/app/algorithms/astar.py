import heapq
import time
from typing import Any, Dict, List, Optional, Set, Tuple

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment
from app.models.responses import SearchEvent, SearchResult

class AStarSearch(BaseSearchAlgorithm):
    id = "astar"
    name = "A* Search"
    category = "Informed (Heuristic) Search"
    time_complexity = "O(b^d) worst case; sub-exponential with accurate heuristic"
    space_complexity = "O(b^d) exponential memory footprint"
    completeness = "Complete if step costs >= eps > 0"
    optimality = "Optimal if heuristic h(n) is admissible (tree search) or consistent (graph search)"

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
                optimality_guarantee="Optimal (start is goal)",
                completeness_guarantee="Complete",
                summary="Start node is the goal."
            )

        counter = 0
        start_f = 0.0 + start_h
        # Entry: (f_score, h_score, counter, node)
        pq: List[Tuple[float, float, int, Any]] = [(start_f, start_h, counter, start)]
        g_costs: Dict[Any, float] = {start: 0.0}
        f_costs: Dict[Any, float] = {start: start_f}
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
                h=round(start_h, 3),
                f=round(start_f, 3),
                frontier_size=1,
                explored_size=0,
                explanation=f"Initialised priority queue with start node: g=0.0, h={round(start_h, 2)}, f={round(start_f, 2)}."
            ))

        while pq:
            max_frontier_size = max(max_frontier_size, len(pq))
            curr_f, curr_h, _, current = heapq.heappop(pq)

            # Check if this is a stale entry with worse f-score than recorded
            curr_g = g_costs.get(current, float("inf"))
            if curr_f > f_costs.get(current, float("inf")):
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
                    g=round(curr_g, 3),
                    h=round(curr_h, 3),
                    f=round(curr_f, 3),
                    frontier_size=len(pq),
                    explored_size=len(explored),
                    explanation=f"Selected lowest f(n) node {env.format_node(current)}: f={round(curr_f, 2)} (g={round(curr_g, 2)} + h={round(curr_h, 2)})."
                ))

            # A* goal check upon removal from priority queue guarantees optimality
            if env.is_goal(current):
                solution_found = True
                goal_node = current
                break

            neighbors = env.get_neighbors(current)
            for neighbor, step_cost in neighbors:
                if step_cost < 0:
                    raise ValueError(f"Negative step cost ({step_cost}) detected. A* requires non-negative edge costs.")

                tentative_g = curr_g + step_cost
                old_g = g_costs.get(neighbor, float("inf"))

                if tentative_g < old_g:
                    # Cheaper path found!
                    is_new = neighbor not in g_costs
                    h_val = env.heuristic(neighbor)
                    tentative_f = tentative_g + h_val

                    # If neighbor was in closed set but a cheaper path was found, reopen it
                    was_explored = neighbor in explored
                    if was_explored:
                        explored.remove(neighbor)

                    g_costs[neighbor] = tentative_g
                    f_costs[neighbor] = tentative_f
                    parents[neighbor] = current
                    counter += 1
                    heapq.heappush(pq, (tentative_f, h_val, counter, neighbor))

                    if is_new:
                        nodes_generated += 1

                    if playback_events and len(events) < max_events:
                        step += 1
                        event_type = "frontier_add" if is_new else "frontier_update"
                        expl = (
                            f"Added {env.format_node(neighbor)}: g={round(tentative_g, 2)}, h={round(h_val, 2)}, f={round(tentative_f, 2)}."
                            if is_new else
                            f"Re-evaluated {env.format_node(neighbor)} with cheaper path: new f={round(tentative_f, 2)} < old f={round(curr_f, 2)}."
                        )
                        events.append(SearchEvent(
                            step=step,
                            type=event_type,
                            node=env.format_node(neighbor),
                            parent=env.format_node(current),
                            g=round(tentative_g, 3),
                            h=round(h_val, 3),
                            f=round(tentative_f, 3),
                            frontier_size=len(pq),
                            explored_size=len(explored),
                            explanation=expl
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
                    h=0.0,
                    f=round(path_cost, 3),
                    frontier_size=len(pq),
                    explored_size=len(explored),
                    explanation=f"Goal popped from priority queue with optimal cost {path_cost}! Path length: {path_length}."
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
                optimality_guarantee="Guaranteed Optimal (when heuristic is admissible / consistent)",
                completeness_guarantee="Complete (finite branching, step cost >= eps > 0)",
                summary=f"A* found optimal path of cost {path_cost} (length {path_length}) in {nodes_expanded} expansions."
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
                    explanation="A* search queue exhausted without reaching goal. Goal is disconnected."
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
                completeness_guarantee="Complete (space exhausted)",
                summary=f"A* explored all accessible nodes ({len(explored)} expanded). Goal is unreachable."
            )
