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

def test_search_hotels():
    payload = {
        "city": "Mumbai",
        "checkin_date": "2023-12-05",
        "checkout_date": "2023-12-10"
    }
    response = client.post("/api/search-hotels", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "hotels" in data

def test_search_trains():
    payload = {
        "from_station": "NDLS",
        "to_station": "BCT",
        "travel_date": "2023-12-15"
    }
    response = client.post("/api/search-trains", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "trains" in data

def test_booking_flow():
    # 1. Get all bookings
    res = client.get("/api/bookings")
    assert res.status_code == 200
    initial_count = len(res.json()["bookings"])

    # 2. Create a booking
    payload = {
        "service_type": "hotel",
        "item_name": "Taj Mahal Palace",
        "total_fare": 15000,
        "details": {}
    }
    res = client.post("/api/book-service", json=payload)
    assert res.status_code == 200
    pnr = res.json()["booking"]["pnr"]
    assert pnr.startswith("MMTHOT")

    # 3. Verify booking added
    res = client.get("/api/bookings")
    assert len(res.json()["bookings"]) == initial_count + 1

    # 4. Cancel booking
    res = client.delete(f"/api/bookings/{pnr}")
    assert res.status_code == 200

    # 5. Verify booking removed
    res = client.get("/api/bookings")
    assert len(res.json()["bookings"]) == initial_count
