# Airline Reservation System (Skyline X)

Skyline X is a modern, full-stack travel services application offering flights, hotels, trains, homestays, and holiday bookings.

## Tech Stack
- **Backend**: Python, FastAPI
- **Frontend**: HTML5, CSS3, JavaScript
- **Testing**: Pytest

## Setup and Installation

### Backend Setup
1. Ensure Python 3.8+ is installed.
2. Install the requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the development server:
   ```bash
   uvicorn server:app --reload
   ```
   The backend API will be available at `http://127.0.0.1:8000`.

### Frontend Setup
1. Simply open the `index.html` file in your preferred web browser.

## API Documentation
Once the backend is running, you can access the automatic API documentation at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Testing
To run the automated tests, simply execute:
```bash
pytest
```
