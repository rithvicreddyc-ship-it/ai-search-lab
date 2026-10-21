import random
import time
from typing import Any, Dict, List, Optional, Set, Tuple

from app.algorithms.base import BaseSearchAlgorithm, SearchEnvironment
from app.models.responses import SearchEvent, SearchResult

class HillClimbingSearch(BaseSearchAlgorithm):
    id = "hill_climbing"
    name = "Hill Climbing (Steepest-Descent Local Search)"
    category = "Local Search"
    time_complexity = "O(infinity) if looping; practically terminates quickly at local extrema"
    space_complexity = "O(1) keeps only current state in memory"
    completeness = "Incomplete: Can get permanently stuck in local optima, ridges, or plateaus"
    optimality = "Not optimal: Sacrifices global exploration for immediate local heuristic improvement"

    def run_search(
        self,
        env: SearchEnvironment,
        max_events: int = 8000,
        playback_events: bool = True,
        max_sideways: int = 10,
        allow_random_restarts: bool = False,
        max_restarts: int = 3,
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

        events: List[SearchEvent] = []
        step = 0
        total_nodes_expanded = 0
        total_nodes_generated = 1

        restarts_done = 0
        current_start = start
        overall_best_path: List[Any] = []
        overall_best_h = start_h
        solution_found = False
        goal_node = None
        parents: Dict[Any, Optional[Any]] = {start: None}

        while restarts_done <= (max_restarts if allow_random_restarts else 0):
            current = current_start
            current_h = env.heuristic(current)
            visited_in_run: Set[Any] = {current}
            consecutive_sideways = 0

            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="visit" if restarts_done == 0 else "restart",
                    node=env.format_node(current),
                    h=round(current_h, 3),
                    f=round(current_h, 3),
                    frontier_size=1,
                    explored_size=total_nodes_expanded,
                    explanation=(
                        f"Starting hill-climbing descent at {env.format_node(current)} with h={round(current_h, 2)}."
                        if restarts_done == 0 else
                        f"--- Random Restart #{restarts_done}: Re-launching search from {env.format_node(current)} (h={round(current_h, 2)}) ---"
                    )
                ))

            # Inner hill climbing loop
            while True:
                total_nodes_expanded += 1

                if env.is_goal(current):
                    solution_found = True
                    goal_node = current
                    break

                neighbors = env.get_neighbors(current)
                if not neighbors:
                    # Dead end
                    if playback_events and len(events) < max_events:
                        step += 1
                        events.append(SearchEvent(
                            step=step,
                            type="local_optimum",
                            node=env.format_node(current),
                            h=round(current_h, 3),
                            frontier_size=0,
                            explored_size=total_nodes_expanded,
                            explanation=f"Trapped in dead end at {env.format_node(current)} (no unblocked neighbors)."
                        ))
                    break

                # Evaluate all neighbors to find steepest descent (lowest heuristic score)
                best_neighbor = None
                best_h = float("inf")
                sideways_candidates: List[Any] = []

                for neighbor, cost in neighbors:
                    total_nodes_generated += 1
                    nh = env.heuristic(neighbor)
                    if nh < best_h:
                        best_h = nh
                        best_neighbor = neighbor

                    if abs(nh - current_h) < 1e-6 and neighbor not in visited_in_run:
                        sideways_candidates.append(neighbor)

                # Check if best neighbor is strictly better
                if best_h < current_h:
                    consecutive_sideways = 0
                    parents[best_neighbor] = current
                    current = best_neighbor
                    current_h = best_h
                    visited_in_run.add(current)

                    if current_h < overall_best_h:
                        overall_best_h = current_h

                    if playback_events and len(events) < max_events:
                        step += 1
                        events.append(SearchEvent(
                            step=step,
                            type="visit",
                            node=env.format_node(current),
                            parent=env.format_node(parents[current]),
                            h=round(current_h, 3),
                            f=round(current_h, 3),
                            frontier_size=len(neighbors),
                            explored_size=total_nodes_expanded,
                            explanation=f"Steepest descent: moved to neighbor {env.format_node(current)} with improved h={round(current_h, 2)}."
                        ))

                elif sideways_candidates and consecutive_sideways < max_sideways:
                    # Sideways move on plateau
                    consecutive_sideways += 1
                    chosen = sideways_candidates[0]
                    parents[chosen] = current
                    current = chosen
                    current_h = best_h
                    visited_in_run.add(current)

                    if playback_events and len(events) < max_events:
                        step += 1
                        events.append(SearchEvent(
                            step=step,
                            type="visit",
                            node=env.format_node(current),
                            parent=env.format_node(parents[current]),
                            h=round(current_h, 3),
                            f=round(current_h, 3),
                            frontier_size=len(neighbors),
                            explored_size=total_nodes_expanded,
                            explanation=f"Traversing flat plateau (sideways move {consecutive_sideways}/{max_sideways}) to {env.format_node(current)} (h={round(current_h, 2)})."
                        ))
                else:
                    # Stuck in local optimum or plateau limit reached
                    if playback_events and len(events) < max_events:
                        step += 1
                        events.append(SearchEvent(
                            step=step,
                            type="local_optimum",
                            node=env.format_node(current),
                            h=round(current_h, 3),
                            frontier_size=0,
                            explored_size=total_nodes_expanded,
                            explanation=f"Local optimum detected at {env.format_node(current)}: all {len(neighbors)} neighbors have h >= {round(current_h, 2)} and sideways limit reached."
                        ))
                    break

            if solution_found:
                break

            restarts_done += 1
            if allow_random_restarts and restarts_done <= max_restarts:
                # Pick a random neighbor from the environment or perturb start
                nbrs = env.get_neighbors(start)
                if nbrs:
                    current_start = random.choice(nbrs)[0]
                else:
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
                    frontier_size=0,
                    explored_size=total_nodes_expanded,
                    explanation=f"Goal reached! Hill climbing found path of length {path_length} (Cost: {path_cost})."
                ))
            return SearchResult(
                algorithm=self.id,
                solution_found=True,
                path=path,
                path_cost=path_cost,
                path_length=path_length,
                nodes_expanded=total_nodes_expanded,
                nodes_generated=total_nodes_generated,
                max_frontier_size=4,
                execution_time_ms=round(exec_time, 3),
                total_events=len(events),
                events=events,
                optimality_guarantee="Non-optimal: Local steepest descent trajectory without backtracking or global cost awareness.",
                completeness_guarantee="Incomplete: Succeeded in this instance, but prone to local optima in general.",
                summary=f"Hill climbing found the goal in {total_nodes_expanded} steps. Path length: {path_length}, Cost: {path_cost}."
            )
        else:
            if playback_events and len(events) < max_events:
                step += 1
                events.append(SearchEvent(
                    step=step,
                    type="search_failed",
                    node=env.format_node(current),
                    frontier_size=0,
                    explored_size=total_nodes_expanded,
                    explanation="Hill climbing search terminated at local optimum without reaching goal."
                ))
            return SearchResult(
                algorithm=self.id,
                solution_found=False,
                path=[],
                path_cost=0.0,
                path_length=0,
                nodes_expanded=total_nodes_expanded,
                nodes_generated=total_nodes_generated,
                max_frontier_size=4,
                execution_time_ms=round(exec_time, 3),
                total_events=len(events),
                events=events,
                warnings=[
                    "Hill climbing is a local search algorithm. It terminated because it encountered a local minimum or plateau where no immediate neighbor had a better heuristic score."
                ],
                optimality_guarantee="N/A",
                completeness_guarantee="Incomplete (Cannot guarantee reaching the goal even when a path exists)",
                summary=f"Search halted at local optimum with h={round(current_h, 2)} after {total_nodes_expanded} evaluations. No downhill move available."
            )
