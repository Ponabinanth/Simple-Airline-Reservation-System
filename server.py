# ==========================================================================
# SKYLINE X (MakeMyTrip Edition) - Full-Stack Python FastAPI Backend
# ==========================================================================

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import random
import time

app = FastAPI(
    title="SKYLINE X Full Travel Services Backend API",
    description="REST API for Flights, Hotels, Homestays, Holidays, Trains, Buses, Cabs, Forex, and Insurance.",
    version="2.1.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-Memory Database for Bookings
BOOKINGS_DB = {
    "MMT98421": {
        "pnr": "MMT98421",
        "passenger_name": "ALEXANDER VANCE",
        "origin_code": "DEL",
        "origin_city": "Delhi",
        "dest_code": "BLR",
        "dest_city": "Bengaluru",
        "flight_num": "SKX-804",
        "airline": "SKYLINE X Express",
        "depart_time": "06:00 AM",
        "arrive_time": "08:45 AM",
        "seat": "01B",
        "cabin_class": "Economy",
        "fare_inr": 7933,
        "status": "CONFIRMED"
    }
}

# Request Schemas
class FlightSearchRequest(BaseModel):
    origin: str
    destination: str
    depart_date: str
    return_date: str = None
    passengers: int = 1
    cabin_class: str = "Economy"
    special_fare: str = "regular"

class HotelSearchRequest(BaseModel):
    city: str
    checkin_date: str
    checkout_date: str
    guests: int = 2
    rooms: int = 1

class TrainSearchRequest(BaseModel):
    from_station: str
    to_station: str
    travel_date: str
    travel_class: str = "3AC"

class CabSearchRequest(BaseModel):
    pickup: str
    drop: str
    pickup_date: str

class ForexRequest(BaseModel):
    currency: str
    amount: float

class InsuranceRequest(BaseModel):
    destination: str
    duration_days: int = 7
    travelers_count: int = 1

class SeatBookingRequest(BaseModel):
    flight_id: str
    passenger_name: str
    seat_id: str
    origin_code: str
    dest_code: str
    cabin_class: str
    total_fare: float

class HomestaySearchRequest(BaseModel):
    destination: str
    checkin_date: str
    checkout_date: str
    guests: int = 2

class HolidaySearchRequest(BaseModel):
    origin: str
    destination: str
    month: str

class BusSearchRequest(BaseModel):
    from_city: str
    to_city: str
    travel_date: str
    bus_type: str = "Volvo AC"

class GenericBookingRequest(BaseModel):
    service_type: str
    item_name: str
    total_fare: float
    details: dict = {}

# Endpoints

@app.get("/api/health")
def health_check():
    return {"status": "HEALTHY", "system": "SKYLINE X Full Travel Engine v2.1", "timestamp": time.time()}

# 1. Flights Search
@app.post("/api/search-flights")
def search_flights(req: FlightSearchRequest):
    base_price = 4500 if "DEL" in req.origin or "BOM" in req.origin else 8500
    
    discount = 1.0
    if req.special_fare == "student":
        discount = 0.85
    elif req.special_fare in ["senior", "armed", "doctor"]:
        discount = 0.90
        
    if "Business" in req.cabin_class:
        base_price *= 2.5
    elif "First" in req.cabin_class:
        base_price *= 4.0

    flights = [
        {
            "id": "FL-804",
            "flight_num": "SKX-804",
            "airline": "IndiGo 6E-804",
            "depart_time": "06:00 AM",
            "arrive_time": "08:45 AM",
            "duration": "2h 45m",
            "is_direct": True,
            "fare_inr": int(base_price * discount),
            "fare_usd": int((base_price * discount) / 83.5)
        },
        {
            "id": "FL-912",
            "flight_num": "SKX-912",
            "airline": "Air India AI-912",
            "depart_time": "11:15 AM",
            "arrive_time": "02:00 PM",
            "duration": "2h 45m",
            "is_direct": True,
            "fare_inr": int(base_price * 1.12 * discount),
            "fare_usd": int((base_price * 1.12 * discount) / 83.5)
        },
        {
            "id": "FL-101",
            "flight_num": "SKX-101",
            "airline": "Emirates EK-101",
            "depart_time": "08:30 PM",
            "arrive_time": "11:15 PM",
            "duration": "2h 45m",
            "is_direct": True,
            "fare_inr": int(base_price * 1.4 * discount),
            "fare_usd": int((base_price * 1.4 * discount) / 83.5)
        }
    ]

    return {"status": "SUCCESS", "search_query": req, "results_count": len(flights), "flights": flights}

# 2. Hotels Search
@app.post("/api/search-hotels")
def search_hotels(req: HotelSearchRequest):
    hotels = [
        {"name": f"Taj Exotica Resort & Spa ({req.city})", "rating": "5-Star Luxury", "price_per_night": 14500, "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"},
        {"name": f"The Leela Palace ({req.city})", "rating": "5-Star Premium", "price_per_night": 18200, "image": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"},
        {"name": f"Hyatt Regency ({req.city})", "rating": "4.8 Star Business", "price_per_night": 8900, "image": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"}
    ]
    return {"status": "SUCCESS", "city": req.city, "hotels": hotels}

# 3. Trains Search
@app.post("/api/search-trains")
def search_trains(req: TrainSearchRequest):
    trains = [
        {"train_num": "12952", "name": "RAJDHANI EXPRESS", "dep": "16:55", "arr": "08:35 (+1d)", "duration": "15h 40m", "fare": 3250},
        {"train_num": "12954", "name": "AUGUST KRANTI RAJDHANI", "dep": "17:15", "arr": "10:05 (+1d)", "duration": "16h 50m", "fare": 3100},
        {"train_num": "22222", "name": "CSMT VANDE BHARAT", "dep": "06:00", "arr": "14:15", "duration": "8h 15m", "fare": 2450}
    ]
    return {"status": "SUCCESS", "from": req.from_station, "to": req.to_station, "trains": trains}

# 4. Cabs Search
@app.post("/api/search-cabs")
def search_cabs(req: CabSearchRequest):
    cabs = [
        {"type": "Sedan (Dzire / Etios)", "capacity": "4 Passengers", "eta": "5 Mins", "price": 1850},
        {"type": "SUV (Ertiga / Innova)", "capacity": "6 Passengers", "eta": "8 Mins", "price": 2750},
        {"type": "Luxury Sedan (Mercedes E-Class)", "capacity": "4 Passengers", "eta": "12 Mins", "price": 6500}
    ]
    return {"status": "SUCCESS", "pickup": req.pickup, "drop": req.drop, "cabs": cabs}

# 5. Forex Rate Calculator
@app.post("/api/forex-rate")
def calculate_forex(req: ForexRequest):
    rates = {"USD": 83.5, "EUR": 90.8, "GBP": 105.2, "AED": 22.7, "THB": 2.3, "JPY": 0.55}
    rate = rates.get(req.currency.upper(), 83.5)
    total_inr = round(req.amount * rate, 2)
    return {
        "status": "SUCCESS",
        "currency": req.currency.upper(),
        "amount": req.amount,
        "exchange_rate": rate,
        "total_inr": total_inr
    }

# 6. Insurance Quote
@app.post("/api/insurance-quote")
def get_insurance_quote(req: InsuranceRequest):
    premium_per_day = 120
    if "USA" in req.destination or "Canada" in req.destination:
        premium_per_day = 250
    elif "Europe" in req.destination:
        premium_per_day = 180

    total_premium = req.duration_days * req.travelers_count * premium_per_day
    return {
        "status": "SUCCESS",
        "destination": req.destination,
        "duration_days": req.duration_days,
        "travelers": req.travelers_count,
        "medical_cover": "$100,000 USD",
        "baggage_cover": "$1,000 USD",
        "total_premium_inr": total_premium
    }

# 7. Seat Booking
@app.post("/api/book-seat")
def book_seat(req: SeatBookingRequest):
    pnr = f"MMT{random.randint(10000, 99999)}"
    booking = {
        "pnr": pnr,
        "passenger_name": req.passenger_name.upper(),
        "origin_code": req.origin_code,
        "dest_code": req.dest_code,
        "flight_num": req.flight_id,
        "seat": req.seat_id,
        "cabin_class": req.cabin_class,
        "fare_inr": req.total_fare,
        "status": "CONFIRMED",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    BOOKINGS_DB[pnr] = booking
    return {"status": "SUCCESS", "booking": booking}

# 8. Homestays Search
@app.post("/api/search-homestays")
def search_homestays(req: HomestaySearchRequest):
    homestays = [
        {"id": "HS-1", "name": f"Luxury Alpine Chalet ({req.destination})", "type": "Entire Private Villa", "price_per_night": 12500, "rating": "4.9 Superhost"},
        {"id": "HS-2", "name": f"Sunset Beach Cottage ({req.destination})", "type": "Beachfront Cottage", "price_per_night": 8900, "rating": "4.7 Highly Rated"},
        {"id": "HS-3", "name": f"Heritage Forest Retreat ({req.destination})", "type": "Nature Retreat", "price_per_night": 6500, "rating": "4.8 Verified"}
    ]
    return {"status": "SUCCESS", "destination": req.destination, "homestays": homestays}

# 9. Holidays Search
@app.post("/api/search-holidays")
def search_holidays(req: HolidaySearchRequest):
    holidays = [
        {"id": "HOL-1", "name": f"Exotic {req.destination} Getaway", "duration": "5N/6D", "inclusions": "Flights + Hotel + Transfers", "price": 45000},
        {"id": "HOL-2", "name": f"Romantic {req.destination} Honeymoon", "duration": "4N/5D", "inclusions": "Flights + Resort + Spa + Meals", "price": 58000},
        {"id": "HOL-3", "name": f"{req.destination} Adventure Expedition", "duration": "6N/7D", "inclusions": "Hotel + Tours + Activities", "price": 35000}
    ]
    return {"status": "SUCCESS", "origin": req.origin, "destination": req.destination, "holidays": holidays}

# 10. Buses Search
@app.post("/api/search-buses")
def search_buses(req: BusSearchRequest):
    buses = [
        {"id": "BUS-1", "operator": "IntrCity SmartBus", "type": "AC Sleeper (2+1)", "dep": "21:00", "arr": "06:30 (+1d)", "duration": "9h 30m", "fare": 1250},
        {"id": "BUS-2", "operator": "Zingbus", "type": "Volvo Multi-Axle AC", "dep": "22:30", "arr": "07:15 (+1d)", "duration": "8h 45m", "fare": 1450},
        {"id": "BUS-3", "operator": "Orange Tours", "type": "Non-AC Sleeper", "dep": "20:15", "arr": "08:00 (+1d)", "duration": "11h 45m", "fare": 850}
    ]
    return {"status": "SUCCESS", "from_city": req.from_city, "to_city": req.to_city, "buses": buses}

# 11. Generic Booking (Hotels, Homestays, Holidays, Trains, Buses, Cabs, Forex, Insurance)
@app.post("/api/book-service")
def book_service(req: GenericBookingRequest):
    pnr = f"MMT{req.service_type[:3].upper()}{random.randint(1000, 9999)}"
    booking = {
        "pnr": pnr,
        "service_type": req.service_type,
        "item_name": req.item_name,
        "total_fare": req.total_fare,
        "details": req.details,
        "status": "CONFIRMED",
        "created_at": time.strftime("%Y-%m-%d %H:%M:%S")
    }
    BOOKINGS_DB[pnr] = booking
    return {"status": "SUCCESS", "booking": booking}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
