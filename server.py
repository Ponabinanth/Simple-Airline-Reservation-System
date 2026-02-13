from datetime import datetime
import random
import time

from flask import Flask, jsonify, request, send_from_directory

app = Flask(__name__, static_folder=".")

# Mock flight inventory
flights_data = [
    {
        "id": 1,
        "flightNumber": "DL401",
        "airline": "Delta",
        "logo": "D",
        "departs": "08:00 AM",
        "arrives": "11:00 AM",
        "duration": "3h 00m",
        "price": 345,
        "type": "Non-stop",
    },
    {
        "id": 2,
        "flightNumber": "UA218",
        "airline": "United",
        "logo": "U",
        "departs": "10:30 AM",
        "arrives": "02:45 PM",
        "duration": "4h 15m",
        "price": 290,
        "type": "1 Stop",
    },
    {
        "id": 3,
        "flightNumber": "BA176",
        "airline": "British Airways",
        "logo": "BA",
        "departs": "06:00 PM",
        "arrives": "06:00 AM",
        "duration": "7h 00m",
        "price": 850,
        "type": "Non-stop",
    },
    {
        "id": 4,
        "flightNumber": "EK202",
        "airline": "Emirates",
        "logo": "E",
        "departs": "09:15 PM",
        "arrives": "11:30 AM",
        "duration": "14h 15m",
        "price": 1200,
        "type": "Non-stop",
    },
    {
        "id": 5,
        "flightNumber": "LH401",
        "airline": "Lufthansa",
        "logo": "L",
        "departs": "04:20 PM",
        "arrives": "07:50 AM",
        "duration": "9h 30m",
        "price": 940,
        "type": "1 Stop",
    },
]

# In-memory bookings database for this process
bookings = {}
booking_references = []


def _make_reference():
    while True:
        ref = f"SKY{random.randint(1000, 9999)}"
        if ref not in bookings:
            return ref


def _simulate_live_status():
    # Rotates status based on current minute to mimic real-time updates.
    minute = datetime.now().minute
    cycle = ["On Time", "Boarding", "Delayed", "On Time"]
    status = cycle[minute % len(cycle)]
    gate = f"{random.choice(['A', 'B', 'C', 'D'])}{random.randint(1, 30)}"
    return status, gate


@app.route("/")
def serve_index():
    return send_from_directory(".", "index.html")


@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(".", path)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(
        {
            "status": "ok",
            "time": datetime.now().isoformat(timespec="seconds"),
            "bookings": len(bookings),
        }
    )


@app.route("/api/flights", methods=["GET"])
def get_flights():
    time.sleep(0.4)
    origin = request.args.get("origin", "").strip()
    destination = request.args.get("destination", "").strip()
    date = request.args.get("date", "").strip()

    # This demo backend returns the full mock list; parameters are accepted for client compatibility.
    return jsonify(
        {
            "meta": {"origin": origin, "destination": destination, "date": date},
            "flights": flights_data,
        }
    )


@app.route("/api/book", methods=["POST"])
def book_flight():
    time.sleep(0.8)
    data = request.get_json(silent=True) or {}
    passenger = data.get("passenger", {})
    flight_id = data.get("flightId")

    required_fields = [
        passenger.get("firstName"),
        passenger.get("lastName"),
        passenger.get("email"),
        passenger.get("phone"),
        passenger.get("passport"),
    ]
    if not flight_id or not all(required_fields):
        return jsonify({"status": "error", "message": "Missing required booking fields."}), 400

    flight = next((f for f in flights_data if f["id"] == flight_id), None)
    if not flight:
        return jsonify({"status": "error", "message": "Selected flight not found."}), 404

    ref = _make_reference()
    booking = {
        "reference": ref,
        "status": "Booked",
        "createdAt": datetime.now().isoformat(timespec="seconds"),
        "flightDetails": flight,
        "passenger": passenger,
    }
    bookings[ref] = booking
    booking_references.append(ref)

    return jsonify(
        {
            "status": "success",
            "message": "Booking confirmed",
            "reference": ref,
            "booking": booking,
        }
    )


@app.route("/api/checkin", methods=["POST"])
def checkin():
    data = request.get_json(silent=True) or {}
    reference = str(data.get("reference", "")).strip().upper()
    last_name = str(data.get("lastName", "")).strip().lower()

    if not reference or not last_name:
        return jsonify({"status": "error", "message": "Reference and last name are required."}), 400

    booking = bookings.get(reference)
    if not booking:
        return jsonify({"status": "error", "message": "Booking not found."}), 404

    if booking["passenger"]["lastName"].strip().lower() != last_name:
        return jsonify({"status": "error", "message": "Last name does not match this booking."}), 403

    booking["status"] = "Checked-in"
    return jsonify(
        {"status": "success", "message": "Check-in completed", "reference": reference, "booking": booking}
    )


@app.route("/api/mytrips", methods=["GET"])
def my_trips():
    # Most recent first
    trips = [bookings[ref] for ref in reversed(booking_references)]
    return jsonify(trips)


@app.route("/api/status", methods=["GET"])
def status():
    flight_num = request.args.get("flightNum", "").strip().upper() or "DL401"
    requested_date = request.args.get("date", "").strip()

    flight = next((f for f in flights_data if f["flightNumber"] == flight_num), None)
    if not flight:
        # Keep a graceful response for demo tracking of any entered flight number.
        flight_name = f"SkyLine {flight_num}"
        departure = "TBD"
    else:
        flight_name = f"{flight['airline']} {flight['flightNumber']}"
        departure = flight["departs"]

    live_status, gate = _simulate_live_status()
    return jsonify(
        {
            "flight": flight_name,
            "status": live_status,
            "gate": gate,
            "date": requested_date,
            "estimatedDeparture": departure,
            "serverTime": datetime.now().isoformat(timespec="seconds"),
        }
    )


if __name__ == "__main__":
    print("Starting SkyLine Backend Server")
    print("Local:   http://127.0.0.1:8090")
    print("Network: http://<your-ip>:8090")
    app.run(host="0.0.0.0", port=8090, debug=True, use_reloader=False)

