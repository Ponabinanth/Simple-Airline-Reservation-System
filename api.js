// api.js - Frontend API Service

const BACKEND_API = 'http://localhost:8000/api';

const api = {
    async fetchWithTimeout(resource, options = {}) {
        const { timeout = 8000 } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);

        return response;
    },

    async post(endpoint, data) {
        try {
            const res = await this.fetchWithTimeout(`${BACKEND_API}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch (err) {
            console.error(`API Error POST ${endpoint}:`, err);
            throw err;
        }
    },

    async get(endpoint) {
        try {
            const res = await this.fetchWithTimeout(`${BACKEND_API}${endpoint}`, {
                method: 'GET'
            });
            return await res.json();
        } catch (err) {
            console.error(`API Error GET ${endpoint}:`, err);
            throw err;
        }
    },
    
    async del(endpoint) {
        try {
            const res = await this.fetchWithTimeout(`${BACKEND_API}${endpoint}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (err) {
            console.error(`API Error DELETE ${endpoint}:`, err);
            throw err;
        }
    },

    bookService(type, name, fare, details) {
        return this.post('/book-service', {
            service_type: type,
            item_name: name,
            total_fare: fare,
            details: details
        });
    },

    getBookings() {
        return this.get('/bookings');
    },
    
    cancelBooking(pnr) {
        return this.del(`/bookings/${pnr}`);
    },

    searchFlights(payload) { return this.post('/search-flights', payload); },
    searchHotels(payload) { return this.post('/search-hotels', payload); },
    searchHomestays(payload) { return this.post('/search-homestays', payload); },
    searchHolidays(payload) { return this.post('/search-holidays', payload); },
    searchTrains(payload) { return this.post('/search-trains', payload); },
    searchBuses(payload) { return this.post('/search-buses', payload); },
    searchCabs(payload) { return this.post('/search-cabs', payload); },
    searchForex(payload) { return this.post('/search-forex', payload); },
    searchInsurance(payload) { return this.post('/search-insurance', payload); },
    bookSeat(payload) { return this.post('/book/seat', payload); }
};

window.api = api;
