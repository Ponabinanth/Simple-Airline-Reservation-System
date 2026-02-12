

class FlightReservationSystem {
    constructor() {
        // State Management
        this.state = {
            flights: [],
            currentFlight: null,
            filters: {
                sortBy: 'price', // price, duration
            }
        };

        // DOM Elements
        this.elements = {
            heroSection: document.getElementById('hero-section'),
            resultsSection: document.getElementById('results-section'),
            bookingSection: document.getElementById('booking-section'),
            confirmationSection: document.getElementById('confirmation-section'),

            searchForm: document.getElementById('flight-search-form'),
            bookingForm: document.getElementById('booking-form'),
            flightList: document.getElementById('flight-list'),

            inputs: {
                origin: document.getElementById('origin'),
                destination: document.getElementById('destination'),
                passengers: document.getElementById('passengers'),
                date: document.getElementById('departure-date')
            },

            buttons: {
                swap: document.getElementById('swap-locations'),
                backToSearch: document.getElementById('back-to-search'),
                backToResults: document.getElementById('back-to-results'),
                filterChips: document.querySelectorAll('.filter-chip')
            },

            display: {
                totalPrice: document.getElementById('total-price-display'),
                summaryTotal: document.getElementById('summary-total'),
                selectedFlightSummary: document.getElementById('selected-flight-summary'),
                bookingRef: document.getElementById('booking-ref'),
                confirmEmail: document.getElementById('confirm-email')
            }
        };

        this.init();
    }

    async init() {
        await this.loadFlights();
        this.bindEvents();
        this.setDefaultDate();
        console.log('Flight System Initialized');
    }

    async loadFlights() {
        try {
            // Initial fetch to populate state, though real search happens on form submit
            const response = await fetch('/api/flights');
            if (!response.ok) throw new Error('Failed to load flights');
            this.state.flights = await response.json();
            console.log('Flights loaded:', this.state.flights);
        } catch (error) {
            console.error('Error loading flights:', error);
            // Fallback to empty or error state if needed
            this.state.flights = [];
        }
    }

    bindEvents() {
        // Search
        this.elements.searchForm.addEventListener('submit', (e) => this.handleSearch(e));

        // Navigation
        this.elements.buttons.swap.addEventListener('click', () => this.handleSwapLocations());
        this.elements.buttons.backToSearch.addEventListener('click', () => this.switchView('hero'));
        this.elements.buttons.backToResults.addEventListener('click', () => this.switchView('results'));

        // Booking
        this.elements.bookingForm.addEventListener('submit', (e) => this.handleBookingSubmit(e));

        // Filters
        this.elements.buttons.filterChips.forEach(chip => {
            chip.addEventListener('click', (e) => this.handleFilterClick(e));
        });

        // Global Event Delegation for dynamic elements
        this.elements.flightList.addEventListener('click', (e) => {
            if (e.target.closest('.select-flight-btn')) {
                const id = parseInt(e.target.closest('.select-flight-btn').dataset.id);
                this.handleFlightSelect(id);
            }
        });

        // Navbar & Sign In Logic
        const signInBtn = document.querySelector('.btn-text'); // Sign In button
        const joinBtn = document.querySelector('.btn.btn-primary'); // Join Club
        const navLinks = document.querySelectorAll('.nav-links a');
        const modal = document.getElementById('signin-modal');
        const closeModal = document.querySelector('.close-modal');
        const signInForm = document.getElementById('signin-form');

        // Open Modal
        signInBtn.addEventListener('click', () => {
            if (signInBtn.textContent === 'Sign In') {
                modal.classList.remove('hidden');
            }
        });

        // Close Modal
        closeModal.addEventListener('click', () => modal.classList.add('hidden'));
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.add('hidden');
        });

        // Handle Sign In Submit
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = signInForm.querySelector('input[type="email"]').value;
            const name = email.split('@')[0]; // Simple mock name extraction

            signInBtn.textContent = `Hello, ${name}`;
            modal.classList.add('hidden');
            this.showToast(`Welcome back, ${name}!`);
        });

        // Placeholder Links
        [joinBtn, ...navLinks].forEach(link => {
            link.addEventListener('click', (e) => {
                // If it's the "Book" link, go to home
                if (link.textContent.trim() === 'Book' || link.classList.contains('active')) {
                    this.switchView('hero');
                } else {
                    e.preventDefault();
                    this.showToast('Feature Coming Soon!');
                }
            });
        });
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        this.elements.inputs.date.value = today;
    }

    /* --- Logic Handlers --- */

    async handleSearch(e) {
        e.preventDefault();
        const { origin, destination, date } = this.elements.inputs;

        console.log(`Searching flights from ${origin.value} to ${destination.value}`);

        // Fetch flights based on criteria
        try {
            const params = new URLSearchParams({
                origin: origin.value,
                destination: destination.value,
                date: date.value
            });

            const response = await fetch(`/api/flights?${params}`);
            if (response.ok) {
                this.state.flights = await response.json();
                this.renderFlights();
                this.switchView('results');
            } else {
                console.error('Search failed');
                alert('Could not search flights. Please try again.');
            }
        } catch (error) {
            console.error('Search error:', error);
            alert('An error occurred while searching.');
        }
    }

    handleSwapLocations() {
        const { origin, destination } = this.elements.inputs;
        [origin.value, destination.value] = [destination.value, origin.value];
    }

    handleFlightSelect(id) {
        this.state.currentFlight = this.state.flights.find(f => f.id === id);

        if (this.state.currentFlight) {
            this.updateBookingSummary();
            this.switchView('booking');
        }
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        const btn = this.elements.bookingForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        // Loading State
        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processing...';
        btn.disabled = true;

        // Collect form data
        const bookingData = {
            flightId: this.state.currentFlight.id,
            passenger: {
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                passport: document.getElementById('passport').value
            }
        };

        try {
            const response = await fetch('/api/book', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });

            if (response.ok) {
                const result = await response.json();

                this.elements.display.bookingRef.textContent = '#' + result.reference;
                this.elements.display.confirmEmail.textContent = bookingData.passenger.email;

                this.switchView('confirmation');
            } else {
                throw new Error('Booking failed');
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert('Booking failed. Please try again.');
        } finally {
            // Reset button
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    updateBookingSummary() {
        const flight = this.state.currentFlight;
        const basePrice = flight.price;
        const taxes = 85;
        const total = basePrice + taxes;

        this.elements.display.selectedFlightSummary.innerHTML = `
            <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                <h4 style="color: var(--primary-color); font-size: 1.1rem; margin-bottom: 8px;">${flight.airline}</h4>
                <div style="display: flex; justify-content: space-between; align-items: center; color: var(--text-dark);">
                    <span style="font-weight: 600;">${flight.departs}</span>
                    <div style="flex:1; margin: 0 12px; border-bottom: 1px dashed var(--text-light); position: relative; top: -4px;"></div>
                    <span style="font-weight: 600;">${flight.arrives}</span>
                </div>
                <div style="text-align: center; font-size: 0.85rem; color: var(--text-light); margin-top: 4px;">${flight.duration}</div>
            </div>
        `;

        this.elements.display.summaryTotal.textContent = `$${total.toFixed(2)}`;
        this.elements.display.totalPrice.textContent = `$${total.toFixed(2)}`;
    }

    /* --- View Management --- */

    renderFlights() {
        this.elements.flightList.innerHTML = '';

        const { origin, destination } = this.elements.inputs;

        this.state.flights.forEach(flight => {
            const card = document.createElement('div');
            card.className = 'flight-card';
            // Added animation class via JS or keep CSS handling it
            card.innerHTML = `
                <div class="airline-info">
                    <div class="airline-logo">${flight.logo}</div>
                    <div>
                        <strong>${flight.airline}</strong>
                        <div class="duration">${flight.type}</div>
                    </div>
                </div>
                <div class="flight-route">
                    <div class="route-point">
                        <div class="time">${flight.departs}</div>
                        <div class="city">${origin.value.split('(')[0]}</div>
                    </div>
                    <div class="route-line">
                        <i class="ri-plane-fill" style="color: var(--accent-color);"></i>
                        <span class="duration">${flight.duration}</span>
                    </div>
                    <div class="route-point">
                        <div class="time">${flight.arrives}</div>
                        <div class="city">${destination.value.split('(')[0]}</div>
                    </div>
                </div>
                <div class="flight-price">
                    $${flight.price}
                    <div style="font-size: 0.8rem; font-weight: normal; color: var(--text-light);">per person</div>
                </div>
                <div>
                    <button class="btn btn-primary select-flight-btn" data-id="${flight.id}">Select</button>
                </div>
            `;
            this.elements.flightList.appendChild(card);
        });
    }

    switchView(viewName) {
        // Hide all
        this.elements.heroSection.classList.add('hidden');
        this.elements.resultsSection.classList.add('hidden');
        this.elements.bookingSection.classList.add('hidden');
        this.elements.confirmationSection.classList.add('hidden');

        // Show specific
        switch (viewName) {
            case 'hero':
                this.elements.heroSection.classList.remove('hidden');
                break;
            case 'results':
                this.elements.resultsSection.classList.remove('hidden');
                // this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' }); // Optional: might jump too much
                window.scrollTo(0, 0);
                break;
            case 'booking':
                this.elements.bookingSection.classList.remove('hidden');
                window.scrollTo(0, 0);
                break;
            case 'confirmation':
                this.elements.confirmationSection.classList.remove('hidden');
                window.scrollTo(0, 0);
                break;
        }
    }

    handleFilterClick(e) {
        this.elements.buttons.filterChips.forEach(c => c.classList.remove('active'));
        e.target.classList.add('active');
        // Logic for sorting flights could go here
    }
}

// Initialize System
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FlightReservationSystem();
});
