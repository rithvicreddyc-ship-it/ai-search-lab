from typing import Any, Dict, List
from app.models.state import GraphEdge, GraphNode, GraphState, GridState

# ==================== GRID PRESETS ====================

PRESET_CLASSIC_LABYRINTH = GridState(
    rows=15,
    cols=25,
    start=[1, 1],
    goal=[13, 23],
    walls=[
        # Outer borders
        *[[r, 0] for r in range(15)],
        *[[r, 24] for r in range(15)],
        *[[0, c] for c in range(25)],
        *[[14, c] for c in range(25)],
        # Internal maze corridors
        *[[2, c] for c in range(2, 20)],
        *[[4, c] for c in range(5, 23)],
        *[[6, c] for c in range(2, 21)],
        *[[8, c] for c in range(5, 24)],
        *[[10, c] for c in range(1, 20)],
        *[[12, c] for c in range(4, 23)],
        *[[r, 12] for r in range(2, 10) if r != 5],
    ],
    terrain={},
    diagonal_movement=False
)

PRESET_WEIGHTED_SWAMP = GridState(
    rows=13,
    cols=21,
    start=[6, 2],
    goal=[6, 18],
    walls=[
        *[[r, 0] for r in range(13)],
        *[[r, 20] for r in range(13)],
        *[[0, c] for c in range(21)],
        *[[12, c] for c in range(21)],
        # Central barriers leaving upper and lower corridors open
        *[[2, c] for c in range(7, 14)],
        *[[10, c] for c in range(7, 14)],
    ],
    # Direct horizontal path through row 5, 6, 7 is heavy mud/swamp (cost 4.0),
    # while outer detour corridors at rows 1 and 11 have cost 1.0!
    # Tests UCS and A* (taking the detour) vs BFS and Greedy (plowing through mud).
    terrain={
        f"{r},{c}": 4.5
        for r in range(4, 9)
        for c in range(6, 15)
    },
    diagonal_movement=False
)

PRESET_LOCAL_OPTIMUM_TRAP = GridState(
    rows=13,
    cols=21,
    start=[6, 3],
    goal=[6, 17],
    walls=[
        *[[r, 0] for r in range(13)],
        *[[r, 20] for r in range(13)],
        *[[0, c] for c in range(21)],
        *[[12, c] for c in range(21)],
        # U-shaped concave trap facing the start node:
        # Surrounds the goal or blocks direct path
        *[[r, 11] for r in range(3, 10)],   # Back of U
        *[[3, c] for c in range(7, 12)],    # Top arm
        *[[9, c] for c in range(7, 12)],    # Bottom arm
    ],
    terrain={},
    diagonal_movement=False
)

PRESET_UNREACHABLE_FORTRESS = GridState(
    rows=13,
    cols=21,
    start=[2, 2],
    goal=[6, 15],
    walls=[
        *[[r, 0] for r in range(13)],
        *[[r, 20] for r in range(13)],
        *[[0, c] for c in range(21)],
        *[[12, c] for c in range(21)],
        # Sealed wall box around goal
        *[[4, c] for c in range(13, 18)],
        *[[8, c] for c in range(13, 18)],
        *[[r, 13] for r in range(4, 9)],
        *[[r, 17] for r in range(4, 9)],
    ],
    terrain={},
    diagonal_movement=False
)

# ==================== GRAPH PRESETS ====================

# Classic Romania Map from Russell & Norvig: Artificial Intelligence: A Modern Approach
ROMANIA_NODES = [
    GraphNode(id="Arad", label="Arad", x=70.0, y=140.0),
    GraphNode(id="Zerind", label="Zerind", x=90.0, y=80.0),
    GraphNode(id="Oradea", label="Oradea", x=120.0, y=30.0),
    GraphNode(id="Sibiu", label="Sibiu", x=220.0, y=180.0),
    GraphNode(id="Timisoara", label="Timisoara", x=75.0, y=260.0),
    GraphNode(id="Lugoj", label="Lugoj", x=160.0, y=300.0),
    GraphNode(id="Mehadia", label="Mehadia", x=165.0, y=365.0),
    GraphNode(id="Drobeta", label="Drobeta", x=160.0, y=430.0),
    GraphNode(id="Craiova", label="Craiova", x=270.0, y=430.0),
    GraphNode(id="RimnicuVilcea", label="Rimnicu Vilcea", x=250.0, y=260.0),
    GraphNode(id="Fagaras", label="Fagaras", x=340.0, y=180.0),
    GraphNode(id="Pitesti", label="Pitesti", x=360.0, y=320.0),
    GraphNode(id="Bucharest", label="Bucharest", x=470.0, y=360.0),
    GraphNode(id="Giurgiu", label="Giurgiu", x=440.0, y=450.0),
    GraphNode(id="Urziceni", label="Urziceni", x=540.0, y=320.0),
    GraphNode(id="Hirsova", label="Hirsova", x=630.0, y=320.0),
    GraphNode(id="Eforie", label="Eforie", x=660.0, y=410.0),
    GraphNode(id="Vaslui", label="Vaslui", x=600.0, y=200.0),
    GraphNode(id="Iasi", label="Iasi", x=560.0, y=110.0),
    GraphNode(id="Neamt", label="Neamt", x=460.0, y=70.0),
]

ROMANIA_EDGES = [
    GraphEdge(source="Arad", target="Zerind", weight=75.0),
    GraphEdge(source="Arad", target="Sibiu", weight=140.0),
    GraphEdge(source="Arad", target="Timisoara", weight=118.0),
    GraphEdge(source="Zerind", target="Oradea", weight=71.0),
    GraphEdge(source="Oradea", target="Sibiu", weight=151.0),
    GraphEdge(source="Timisoara", target="Lugoj", weight=111.0),
    GraphEdge(source="Lugoj", target="Mehadia", weight=70.0),
    GraphEdge(source="Mehadia", target="Drobeta", weight=75.0),
    GraphEdge(source="Drobeta", target="Craiova", weight=120.0),
    GraphEdge(source="Sibiu", target="Fagaras", weight=99.0),
    GraphEdge(source="Sibiu", target="RimnicuVilcea", weight=80.0),
    GraphEdge(source="RimnicuVilcea", target="Craiova", weight=146.0),
    GraphEdge(source="RimnicuVilcea", target="Pitesti", weight=97.0),
    GraphEdge(source="Craiova", target="Pitesti", weight=138.0),
    GraphEdge(source="Fagaras", target="Bucharest", weight=211.0),
    GraphEdge(source="Pitesti", target="Bucharest", weight=101.0),
    GraphEdge(source="Bucharest", target="Giurgiu", weight=90.0),
    GraphEdge(source="Bucharest", target="Urziceni", weight=85.0),
    GraphEdge(source="Urziceni", target="Hirsova", weight=98.0),
    GraphEdge(source="Hirsova", target="Eforie", weight=86.0),
    GraphEdge(source="Urziceni", target="Vaslui", weight=142.0),
    GraphEdge(source="Vaslui", target="Iasi", weight=92.0),
    GraphEdge(source="Iasi", target="Neamt", weight=87.0),
]

PRESET_ROMANIA_GRAPH = GraphState(
    nodes=ROMANIA_NODES,
    edges=ROMANIA_EDGES,
    start="Arad",
    goal="Bucharest"
)

PRESET_DIAMOND_GRAPH = GraphState(
    nodes=[
        GraphNode(id="S", label="Start (S)", x=50.0, y=200.0),
        GraphNode(id="A", label="A (Fast)", x=200.0, y=100.0),
        GraphNode(id="B", label="B (Scenic)", x=200.0, y=300.0),
        GraphNode(id="C", label="C (Mountain)", x=350.0, y=80.0),
        GraphNode(id="D", label="D (Valley)", x=350.0, y=320.0),
        GraphNode(id="G", label="Goal (G)", x=500.0, y=200.0),
    ],
    edges=[
        GraphEdge(source="S", target="A", weight=3.0),
        GraphEdge(source="S", target="B", weight=2.0),
        GraphEdge(source="A", target="C", weight=4.0),
        GraphEdge(source="A", target="D", weight=8.0),
        GraphEdge(source="B", target="D", weight=3.0),
        GraphEdge(source="C", target="G", weight=2.0),
        GraphEdge(source="D", target="G", weight=6.0),
    ],
    start="S",
    goal="G"
)

GRID_PRESETS: Dict[str, Dict[str, Any]] = {
    "classic_labyrinth": {
        "id": "classic_labyrinth",
        "name": "Classic Labyrinth",
        "description": "Dense, winding corridors challenging uninformed vs informed exploration.",
        "state": PRESET_CLASSIC_LABYRINTH
    },
    "weighted_swamp": {
        "id": "weighted_swamp",
        "name": "Weighted Mud Swamp",
        "description": "Direct center is expensive mud (cost 4.5); detours are free (cost 1.0). Highlights cost-aware search (UCS, A*) vs unweighted search (BFS, Greedy).",
        "state": PRESET_WEIGHTED_SWAMP
    },
    "local_optimum_trap": {
        "id": "local_optimum_trap",
        "name": "U-Shaped Obstacle Trap",
        "description": "Concave obstacle directly between start and goal. Traps greedy heuristic and hill climbing while A* and BFS escape.",
        "state": PRESET_LOCAL_OPTIMUM_TRAP
    },
    "unreachable_fortress": {
        "id": "unreachable_fortress",
        "name": "Unreachable Fortress",
        "description": "Completely sealed goal inside walls to verify completeness and termination when no path exists.",
        "state": PRESET_UNREACHABLE_FORTRESS
    }
}

GRAPH_PRESETS: Dict[str, Dict[str, Any]] = {
    "romania": {
        "id": "romania",
        "name": "Romania Map (AIMA Classic)",
        "description": "Famous 20-city Romania roadmap from Russell & Norvig, travelling from Arad to Bucharest.",
        "state": PRESET_ROMANIA_GRAPH
    },
    "diamond": {
        "id": "diamond",
        "name": "Diamond Multi-Path Network",
        "description": "Multiple competing paths with varying edge costs. Demonstrates path cost optimization.",
        "state": PRESET_DIAMOND_GRAPH
    }
}
