import time
from typing import Any, Dict, List, Optional, Set

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment
from app.models.responses import SearchEvent, SearchResult

class DepthFirstSearch(BaseSearchAlgorithm):
    id = "dfs"
    name = "Depth-First Search (DFS)"
    category = "Uninformed Search"
    time_complexity = "O(b^m) where m is maximum depth"
    space_complexity = "O(b*m) linear memory"
    completeness = "Complete for finite graphs with cycle detection; Incomplete on infinite graphs"
    optimality = "Not optimal. Often finds very long, meandering paths"

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
                optimality_guarantee="Non-optimal",
                completeness_guarantee="Complete (cycle-checked)",
                summary="Start node is the goal. Immediate solution found."
            )

        stack: List[Any] = [start]
        in_stack: Set[Any] = {start}
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
                explanation="Pushed start node onto LIFO stack."
            ))

        while stack:
            max_frontier_size = max(max_frontier_size, len(stack))
            current = stack.pop()
            in_stack.discard(current)

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
                    frontier_size=len(stack),
                    explored_size=len(explored),
                    explanation=f"Popped node {env.format_node(current)} from top of LIFO stack to explore deeper."
                ))

            if env.is_goal(current):
                solution_found = True
                goal_node = current
                break

            neighbors = env.get_neighbors(current)
            # Push in reverse order so the first clockwise neighbor is popped first
            for neighbor, cost in reversed(neighbors):
                if neighbor not in explored and neighbor not in in_stack:
                    nodes_generated += 1
                    parents[neighbor] = current
                    stack.append(neighbor)
                    in_stack.add(neighbor)

                    if playback_events and len(events) < max_events:
                        step += 1
                        events.append(SearchEvent(
                            step=step,
                            type="frontier_add",
                            node=env.format_node(neighbor),
                            parent=env.format_node(current),
                            frontier_size=len(stack),
                            explored_size=len(explored),
                            explanation=f"Pushed branch node {env.format_node(neighbor)} onto top of stack."
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
                    frontier_size=len(stack),
                    explored_size=len(explored),
                    explanation=f"Goal discovered! Reconstructed path of length {path_length} (DFS does not guarantee shortest path)."
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
                optimality_guarantee="Non-optimal: DFS follows deep trajectories without considering path cost.",
                completeness_guarantee="Complete for finite spaces with cycle checking.",
                summary=f"DFS found a path of length {path_length} after expanding {nodes_expanded} nodes. Path cost: {path_cost}."
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
                    explanation="Stack empty without reaching goal. Goal is unreachable."
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
                warnings=["Goal state is completely unreachable."],
                optimality_guarantee="N/A",
                completeness_guarantee="Complete (finite space exhausted)",
                summary=f"Search exhausted all reachable branches ({len(explored)} explored). Goal cannot be reached."
            )
