from fastapi.testclient import TestClient
from server import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "SUCCESS", "message": "SKYLINE X API is running gracefully."}

def test_search_flights():
    payload = {
        "origin": "DEL",
        "destination": "BOM",
        "depart_date": "2023-12-01"
    }
    response = client.post("/api/search-flights", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "flights" in data
    assert len(data["flights"]) > 0
