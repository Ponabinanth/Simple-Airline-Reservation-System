from flask import Flask, jsonify, request, send_from_directory
import random
import datetime
import time

app = Flask(__name__, static_folder='.')

# Mock Database
flights_data = [
    {
        "id": 1,
        "airline": "Delta",
        "logo": "D",
        "departs": "08:00 AM",
        "arrives": "11:00 AM",
        "duration": "3h 00m",
        "price": 345,
        "type": "Non-stop"
    },
    {
        "id": 2,
        "airline": "United",
        "logo": "U",
        "departs": "10:30 AM",
        "arrives": "02:45 PM",
        "duration": "4h 15m",
        "price": 290,
        "type": "1 Stop"
    },
    {
        "id": 3,
        "airline": "British Airways",
        "logo": "BA",
        "departs": "06:00 PM",
        "arrives": "06:00 AM",
        "duration": "7h 00m",
        "price": 850,
        "type": "Non-stop"
    },
    {
        "id": 4,
        "airline": "Emirates",
        "logo": "E",
        "departs": "09:15 PM",
        "arrives": "11:30 AM",
        "duration": "14h 15m",
        "price": 1200,
        "type": "Non-stop"
    },
    {
        "id": 5,
        "airline": "Lufthansa",
        "logo": "L",
        "departs": "04:20 PM",
        "arrives": "07:50 AM",
        "duration": "9h 30m",
        "price": 940,
        "type": "1 Stop"
    }
]

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

@app.route('/api/flights', methods=['GET'])
def get_flights():
    # Simulate processing delay
    time.sleep(1.5)
    
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date = request.args.get('date')
    
    # In a real app, we would filter by these parameters against a database
    # For now, we return the mock data for demonstration
    return jsonify(flights_data)

@app.route('/api/book', methods=['POST'])
def book_flight():
    # Simulate processing delay
    time.sleep(2)
    
    data = request.json
    
    # Create a booking reference
    ref = f"SKY{random.randint(1000, 9999)}"
    
    # Mock processing
    response = {
        "status": "success",
        "message": "Booking confirmed",
        "reference": ref,
        "details": data
    }
    
    return jsonify(response)

if __name__ == '__main__':
    print("Starting SkyLine Backend Server on http://localhost:8090")
    app.run(port=8090, debug=True, use_reloader=False)
