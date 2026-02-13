class FlightReservationSystem {
    constructor() {
        this.state = {
            flights: [],
            currentFlight: null,
            sortBy: "price",
            lastStatusQuery: null,
            statusRefreshTimer: null,
        };

        this.elements = {
            heroSection: document.getElementById("hero-section"),
            resultsSection: document.getElementById("results-section"),
            bookingSection: document.getElementById("booking-section"),
            confirmationSection: document.getElementById("confirmation-section"),
            checkinSection: document.getElementById("checkin-section"),
            statusSection: document.getElementById("status-section"),
            mytripsSection: document.getElementById("mytrips-section"),

            searchForm: document.getElementById("flight-search-form"),
            bookingForm: document.getElementById("booking-form"),
            checkinForm: document.getElementById("checkin-form"),
            statusForm: document.getElementById("status-form"),
            joinForm: document.getElementById("join-form"),
            signInForm: document.getElementById("signin-form"),

            flightList: document.getElementById("flight-list"),
            mytripsList: document.getElementById("mytrips-list"),

            inputs: {
                origin: document.getElementById("origin"),
                destination: document.getElementById("destination"),
                date: document.getElementById("departure-date"),
                statusDate: document.getElementById("status-date"),
            },

            buttons: {
                swap: document.getElementById("swap-locations"),
                backToSearch: document.getElementById("back-to-search"),
                backToResults: document.getElementById("back-to-results"),
                viewBookedTrips: document.getElementById("view-booked-trips"),
                filterChips: document.querySelectorAll(".filter-chip"),
                navSignIn: document.getElementById("nav-signin"),
                navJoin: document.getElementById("nav-join"),
                closeSignIn: document.getElementById("close-signin"),
                closeJoin: document.getElementById("close-join"),
            },

            modals: {
                signIn: document.getElementById("signin-modal"),
                join: document.getElementById("join-modal"),
            },

            display: {
                totalPrice: document.getElementById("total-price-display"),
                summaryTotal: document.getElementById("summary-total"),
                selectedFlightSummary: document.getElementById("selected-flight-summary"),
                bookingRef: document.getElementById("booking-ref"),
                confirmEmail: document.getElementById("confirm-email"),
                checkinResult: document.getElementById("checkin-result"),
                statusResult: document.getElementById("status-result"),
                toast: document.getElementById("toast"),
            },
        };

        this.init();
    }

    async init() {
        this.bindEvents();
        this.setDefaultDate();
        await this.loadFlights();
        console.log("Flight System Initialized");
    }

    bindEvents() {
        this.elements.searchForm?.addEventListener("submit", (e) => this.handleSearch(e));
        this.elements.bookingForm?.addEventListener("submit", (e) => this.handleBookingSubmit(e));
        this.elements.checkinForm?.addEventListener("submit", (e) => this.handleCheckin(e));
        this.elements.statusForm?.addEventListener("submit", (e) => this.handleStatusSearch(e));
        this.elements.joinForm?.addEventListener("submit", (e) => this.handleJoinClub(e));

        this.elements.buttons.swap?.addEventListener("click", () => this.handleSwapLocations());
        this.elements.buttons.backToSearch?.addEventListener("click", () => this.switchView("hero"));
        this.elements.buttons.backToResults?.addEventListener("click", () => this.switchView("results"));
        this.elements.buttons.viewBookedTrips?.addEventListener("click", () => {
            this.switchView("mytrips");
            this.loadMyTrips();
        });

        this.elements.buttons.filterChips.forEach((chip) => {
            chip.addEventListener("click", (e) => this.handleFilterClick(e));
        });

        this.elements.flightList?.addEventListener("click", (e) => {
            const button = e.target.closest(".select-flight-btn");
            if (!button) return;
            const id = Number(button.dataset.id);
            this.handleFlightSelect(id);
        });

        const navLinks = document.querySelectorAll(".nav-links a");
        navLinks.forEach((link) => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                navLinks.forEach((n) => n.classList.remove("active"));
                link.classList.add("active");

                const text = link.textContent.trim();
                if (text === "Book") this.switchView("hero");
                if (text === "Check-in") this.switchView("checkin");
                if (text === "My Trips") {
                    this.switchView("mytrips");
                    this.loadMyTrips();
                }
                if (text === "Status") this.switchView("status");
            });
        });

        this.elements.buttons.navSignIn?.addEventListener("click", () => {
            if (this.elements.buttons.navSignIn.textContent.includes("Sign In")) {
                this.elements.modals.signIn?.classList.remove("hidden");
            }
        });
        this.elements.buttons.navJoin?.addEventListener("click", () => {
            this.elements.modals.join?.classList.remove("hidden");
        });
        this.elements.buttons.closeSignIn?.addEventListener("click", () => {
            this.elements.modals.signIn?.classList.add("hidden");
        });
        this.elements.buttons.closeJoin?.addEventListener("click", () => {
            this.elements.modals.join?.classList.add("hidden");
        });

        window.addEventListener("click", (e) => {
            if (e.target === this.elements.modals.signIn) this.elements.modals.signIn.classList.add("hidden");
            if (e.target === this.elements.modals.join) this.elements.modals.join.classList.add("hidden");
        });

        this.elements.signInForm?.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = this.elements.signInForm.querySelector('input[type="email"]').value;
            const name = (email.split("@")[0] || "Traveler").trim();
            if (this.elements.buttons.navSignIn) {
                this.elements.buttons.navSignIn.innerHTML = `<i class="ri-user-line"></i> ${name}`;
            }
            this.elements.modals.signIn?.classList.add("hidden");
            this.showToast(`Welcome back, ${name}!`);
        });
    }

    async apiGet(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
    }

    async loadFlights() {
        try {
            const payload = await this.apiGet("/api/flights");
            this.state.flights = Array.isArray(payload) ? payload : payload.flights || [];
        } catch (error) {
            console.error("Error loading flights:", error);
            this.state.flights = [];
        }
    }

    setDefaultDate() {
        const today = new Date().toISOString().split("T")[0];
        if (this.elements.inputs.date) this.elements.inputs.date.value = today;
        if (this.elements.inputs.statusDate) this.elements.inputs.statusDate.value = today;
    }

    showToast(message) {
        const toast = this.elements.display.toast;
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
    }

    async handleSearch(e) {
        e.preventDefault();
        const params = new URLSearchParams({
            origin: this.elements.inputs.origin?.value || "",
            destination: this.elements.inputs.destination?.value || "",
            date: this.elements.inputs.date?.value || "",
        });

        try {
            const payload = await this.apiGet(`/api/flights?${params.toString()}`);
            this.state.flights = Array.isArray(payload) ? payload : payload.flights || [];
            this.renderFlights();
            this.switchView("results");
        } catch (error) {
            console.error("Search error:", error);
            alert("Could not search flights. Please try again.");
        }
    }

    async handleBookingSubmit(e) {
        e.preventDefault();
        if (!this.state.currentFlight) {
            alert("Please select a flight first.");
            return;
        }

        const submitButton = this.elements.bookingForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Processing...';
        submitButton.disabled = true;

        const bookingData = {
            flightId: this.state.currentFlight.id,
            passenger: {
                firstName: document.getElementById("first-name")?.value || "",
                lastName: document.getElementById("last-name")?.value || "",
                email: document.getElementById("email")?.value || "",
                phone: document.getElementById("phone")?.value || "",
                passport: document.getElementById("passport")?.value || "",
            },
        };

        try {
            const response = await fetch("/api/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(bookingData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || "Booking failed");

            this.elements.display.bookingRef.textContent = `#${result.reference}`;
            this.elements.display.confirmEmail.textContent = bookingData.passenger.email;
            this.switchView("confirmation");
        } catch (error) {
            console.error("Booking error:", error);
            alert(error.message || "Booking failed. Please try again.");
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    async handleCheckin(e) {
        e.preventDefault();
        const resultDiv = this.elements.display.checkinResult;
        if (!resultDiv) return;

        const pnr = (document.getElementById("checkin-pnr")?.value || "").trim();
        const lastName = (document.getElementById("checkin-lastname")?.value || "").trim();

        try {
            const response = await fetch("/api/checkin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reference: pnr, lastName }),
            });
            const data = await response.json();

            resultDiv.classList.remove("hidden");
            if (response.ok && data.status === "success") {
                resultDiv.style.background = "#f0fdf4";
                resultDiv.style.borderColor = "#bbf7d0";
                resultDiv.style.color = "#166534";
                resultDiv.innerHTML = `<strong>Success:</strong> ${data.message} for ${data.booking.passenger.firstName} ${data.booking.passenger.lastName}.`;
            } else {
                resultDiv.style.background = "#fef2f2";
                resultDiv.style.borderColor = "#fecaca";
                resultDiv.style.color = "#991b1b";
                resultDiv.innerHTML = `<strong>Error:</strong> ${data.message || "Unable to check in."}`;
            }
        } catch (error) {
            console.error("Check-in error:", error);
            alert("Check-in failed.");
        }
    }

    async fetchAndRenderStatus() {
        if (!this.state.lastStatusQuery) return;
        const resultDiv = this.elements.display.statusResult;
        if (!resultDiv) return;

        const { flightNum, date } = this.state.lastStatusQuery;
        const params = new URLSearchParams({ flightNum });
        if (date) params.set("date", date);

        const data = await this.apiGet(`/api/status?${params.toString()}`);
        resultDiv.classList.remove("hidden");

        let color = "#22c55e";
        if (data.status === "Delayed") color = "#ef4444";
        if (data.status === "Boarding") color = "#eab308";

        resultDiv.innerHTML = `
            <div class="flight-card">
                <div style="flex: 2;">
                    <h3>${data.flight}</h3>
                    <div style="color: var(--text-light);">Est. ${data.estimatedDeparture}</div>
                    <div style="font-size: 0.85rem; color: var(--text-light);">Updated: ${data.serverTime}</div>
                </div>
                <div>
                     <span style="background: ${color}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 0.9rem; font-weight: 600;">${data.status}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.9rem; color: var(--text-light);">Gate</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${data.gate}</div>
                </div>
            </div>
        `;
    }

    startStatusAutoRefresh() {
        this.stopStatusAutoRefresh();
        this.state.statusRefreshTimer = window.setInterval(() => {
            this.fetchAndRenderStatus().catch((err) => console.error("Live status refresh failed:", err));
        }, 15000);
    }

    stopStatusAutoRefresh() {
        if (this.state.statusRefreshTimer) {
            clearInterval(this.state.statusRefreshTimer);
            this.state.statusRefreshTimer = null;
        }
    }

    async handleStatusSearch(e) {
        e.preventDefault();
        const flightNum = (document.getElementById("status-flight-num")?.value || "").trim().toUpperCase();
        const date = this.elements.inputs.statusDate?.value || "";
        if (!flightNum) return;

        this.state.lastStatusQuery = { flightNum, date };
        try {
            await this.fetchAndRenderStatus();
            this.startStatusAutoRefresh();
        } catch (error) {
            console.error("Status search error:", error);
            alert("Could not load status.");
        }
    }

    async loadMyTrips() {
        const list = this.elements.mytripsList;
        if (!list) return;
        list.innerHTML = '<div style="text-align:center; padding: 20px;">Loading...</div>';

        try {
            const trips = await this.apiGet("/api/mytrips");
            if (!Array.isArray(trips) || trips.length === 0) {
                list.innerHTML = `
                    <div style="text-align: center; padding: 40px; background: white; border-radius: 16px;">
                        <i class="ri-ticket-line" style="font-size: 3rem; color: var(--text-light); margin-bottom: 16px; display: block;"></i>
                        <h3 style="color: var(--primary-color);">No trips found</h3>
                        <p style="color: var(--text-light);">You haven't booked any flights yet.</p>
                        <button class="btn btn-primary" style="margin-top: 16px;" onclick="window.app.switchView('hero')">Book a Flight</button>
                    </div>
                `;
                return;
            }

            list.innerHTML = "";
            trips.forEach((trip) => {
                const f = trip.flightDetails;
                const card = document.createElement("div");
                card.className = "flight-card";
                card.innerHTML = `
                    <div class="airline-info">
                        <div class="airline-logo">${f.logo}</div>
                        <div>
                            <strong>${f.airline} ${f.flightNumber}</strong>
                            <div class="duration">Ref: ${trip.reference}</div>
                        </div>
                    </div>
                    <div class="flight-route">
                        <div class="route-point"><div class="time">${f.departs}</div></div>
                        <div class="route-line">
                            <i class="ri-plane-fill" style="color: var(--accent-color);"></i>
                            <div class="duration">${f.duration}</div>
                        </div>
                        <div class="route-point"><div class="time">${f.arrives}</div></div>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #16a34a; font-weight: 600;">${trip.status}</div>
                        <div style="font-size: 0.9rem;">${trip.passenger.firstName} ${trip.passenger.lastName}</div>
                    </div>
                `;
                list.appendChild(card);
            });
        } catch (error) {
            console.error("My trips error:", error);
            list.innerHTML = "Error loading trips.";
        }
    }

    async handleJoinClub(e) {
        e.preventDefault();
        const button = this.elements.joinForm?.querySelector("button");
        if (!button) return;
        const originalText = button.textContent;
        button.textContent = "Joining...";
        button.disabled = true;

        try {
            await new Promise((resolve) => setTimeout(resolve, 700));
            this.elements.modals.join?.classList.add("hidden");
            this.elements.joinForm?.reset();
            this.showToast("Welcome to the Club! You are now a member.");
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }

    handleSwapLocations() {
        const origin = this.elements.inputs.origin;
        const destination = this.elements.inputs.destination;
        if (!origin || !destination) return;
        [origin.value, destination.value] = [destination.value, origin.value];
    }

    handleFlightSelect(id) {
        this.state.currentFlight = this.state.flights.find((flight) => flight.id === id) || null;
        if (!this.state.currentFlight) return;
        this.updateBookingSummary();
        this.switchView("booking");
    }

    updateBookingSummary() {
        const flight = this.state.currentFlight;
        if (!flight) return;
        const taxes = 85;
        const total = flight.price + taxes;

        if (this.elements.display.selectedFlightSummary) {
            this.elements.display.selectedFlightSummary.innerHTML = `
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
                    <h4 style="color: var(--primary-color); font-size: 1.1rem; margin-bottom: 8px;">${flight.airline} ${flight.flightNumber}</h4>
                    <div style="display: flex; justify-content: space-between; align-items: center; color: var(--text-dark);">
                        <span style="font-weight: 600;">${flight.departs}</span>
                        <div style="flex:1; margin: 0 12px; border-bottom: 1px dashed var(--text-light); position: relative; top: -4px;"></div>
                        <span style="font-weight: 600;">${flight.arrives}</span>
                    </div>
                    <div style="text-align: center; font-size: 0.85rem; color: var(--text-light); margin-top: 4px;">${flight.duration}</div>
                </div>
            `;
        }

        if (this.elements.display.summaryTotal) this.elements.display.summaryTotal.textContent = `$${total.toFixed(2)}`;
        if (this.elements.display.totalPrice) this.elements.display.totalPrice.textContent = `$${total.toFixed(2)}`;
    }

    sortFlights() {
        const sortBy = this.state.sortBy;
        if (sortBy === "price") this.state.flights.sort((a, b) => a.price - b.price);
        if (sortBy === "duration") this.state.flights.sort((a, b) => this.durationToMinutes(a.duration) - this.durationToMinutes(b.duration));
        if (sortBy === "nonstop") this.state.flights.sort((a, b) => Number(a.type !== "Non-stop") - Number(b.type !== "Non-stop"));
    }

    durationToMinutes(durationText) {
        const match = /(\d+)h\s*(\d+)m/.exec(durationText || "");
        if (!match) return Number.MAX_SAFE_INTEGER;
        return Number(match[1]) * 60 + Number(match[2]);
    }

    renderFlights() {
        if (!this.elements.flightList) return;
        this.sortFlights();
        this.elements.flightList.innerHTML = "";

        const origin = this.elements.inputs.origin?.value || "Origin";
        const destination = this.elements.inputs.destination?.value || "Destination";

        if (this.state.flights.length === 0) {
            this.elements.flightList.innerHTML = `
                <div style="text-align: center; padding: 40px; background: white; border-radius: 16px;">
                    <h3 style="color: var(--primary-color);">No flights found</h3>
                    <p style="color: var(--text-light);">Try changing your route or date.</p>
                </div>
            `;
            return;
        }

        this.state.flights.forEach((flight) => {
            const card = document.createElement("div");
            card.className = "flight-card";
            card.innerHTML = `
                <div class="airline-info">
                    <div class="airline-logo">${flight.logo}</div>
                    <div>
                        <strong>${flight.airline}</strong>
                        <div class="duration">${flight.flightNumber} | ${flight.type}</div>
                    </div>
                </div>
                <div class="flight-route">
                    <div class="route-point">
                        <div class="time">${flight.departs}</div>
                        <div class="city">${origin.split("(")[0]}</div>
                    </div>
                    <div class="route-line">
                        <i class="ri-plane-fill" style="color: var(--accent-color);"></i>
                        <span class="duration">${flight.duration}</span>
                    </div>
                    <div class="route-point">
                        <div class="time">${flight.arrives}</div>
                        <div class="city">${destination.split("(")[0]}</div>
                    </div>
                </div>
                <div class="flight-price">
                    $${flight.price}
                    <div style="font-size: 0.8rem; font-weight: normal; color: var(--text-light);">per person</div>
                </div>
                <div><button class="btn btn-primary select-flight-btn" data-id="${flight.id}">Select</button></div>
            `;
            this.elements.flightList.appendChild(card);
        });
    }

    switchView(viewName) {
        this.stopStatusAutoRefresh();

        this.elements.heroSection?.classList.add("hidden");
        this.elements.resultsSection?.classList.add("hidden");
        this.elements.bookingSection?.classList.add("hidden");
        this.elements.confirmationSection?.classList.add("hidden");
        this.elements.checkinSection?.classList.add("hidden");
        this.elements.statusSection?.classList.add("hidden");
        this.elements.mytripsSection?.classList.add("hidden");

        if (viewName === "hero") this.elements.heroSection?.classList.remove("hidden");
        if (viewName === "results") this.elements.resultsSection?.classList.remove("hidden");
        if (viewName === "booking") this.elements.bookingSection?.classList.remove("hidden");
        if (viewName === "confirmation") this.elements.confirmationSection?.classList.remove("hidden");
        if (viewName === "checkin") this.elements.checkinSection?.classList.remove("hidden");
        if (viewName === "status") this.elements.statusSection?.classList.remove("hidden");
        if (viewName === "mytrips") this.elements.mytripsSection?.classList.remove("hidden");
        if (viewName === "status" && this.state.lastStatusQuery) this.startStatusAutoRefresh();
    }

    handleFilterClick(e) {
        const chip = e.target.closest(".filter-chip");
        if (!chip) return;
        this.elements.buttons.filterChips.forEach((button) => button.classList.remove("active"));
        chip.classList.add("active");

        const label = chip.textContent.trim().toLowerCase();
        if (label.includes("best")) this.state.sortBy = "price";
        if (label.includes("fast")) this.state.sortBy = "duration";
        if (label.includes("non")) this.state.sortBy = "nonstop";
        this.renderFlights();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.app = new FlightReservationSystem();
});

