from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["algorithms_count"] == 7
    assert "bfs" in data["available_algorithms"]

def test_algorithms_metadata_endpoint():
    response = client.get("/api/algorithms")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 7
    ids = [a["id"] for a in data]
    assert "astar" in ids
    assert "ucs" in ids

def test_presets_endpoint():
    response = client.get("/api/presets")
    assert response.status_code == 200
    data = response.json()
    assert "classic_labyrinth" in data["grids"]
    assert "romania" in data["graphs"]

def test_search_endpoint_grid():
    payload = {
        "algorithm": "astar",
        "problem_type": "grid",
        "grid": {
            "rows": 10,
            "cols": 10,
            "start": [0, 0],
            "goal": [9, 9],
            "walls": [[1, 0], [1, 1], [1, 2]],
            "terrain": {},
            "diagonal_movement": False
        },
        "heuristic": "manhattan",
        "playback_events": True
    }
    response = client.post("/api/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["solution_found"] is True
    assert data["algorithm"] == "astar"
    assert len(data["path"]) > 0
    assert len(data["events"]) > 0

def test_compare_endpoint():
    payload = {
        "algorithms": ["bfs", "astar", "greedy"],
        "problem_type": "grid",
        "grid": {
            "rows": 10,
            "cols": 10,
            "start": [1, 1],
            "goal": [8, 8],
            "walls": []
        },
        "heuristic": "manhattan"
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 3
    assert data["analysis_narrative"] != ""

def test_maze_generate_endpoint():
    payload = {
        "rows": 15,
        "cols": 25,
        "difficulty": "medium",
        "pattern": "recursive_division",
        "seed": 12345
    }
    response = client.post("/api/maze/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["rows"] == 15
    assert data["cols"] == 25
    assert len(data["walls"]) > 0
    assert data["seed"] == 12345

def test_experiments_run_endpoint():
    payload = {
        "preset_id": "weighted_terrain_tradeoff",
        "seed": 42
    }
    response = client.post("/api/experiments/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] != ""
    assert len(data["results"]) >= 2
    assert len(data["viva_takeaways"]) > 0
