/* ==========================================================================
   MakeMyTrip (MMT) Exact Style Interactive JavaScript Engine
   Full Category Support: Flights, Hotels, Homestays, Holidays, Trains, Buses, Cabs, Forex, Insurance
   Connected to Python FastAPI Backend (http://localhost:8000)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const DEST_DATA = window.SKYLINE_DESTINATIONS_DATA;
  const BACKEND_API = 'http://localhost:8000/api';

  // Application State
  let currentOrigin = { code: 'DEL', city: 'Delhi', airport: 'Indira Gandhi Intl Airport' };
  let currentDest = { code: 'BLR', city: 'Bengaluru', airport: 'Kempegowda Intl Airport' };
  let selectedFareType = 'regular';
  let passengers = { adults: 1, children: 0, infants: 0 };
  let cabinClass = 'Economy';
  let selectedFlight = null;
  let selectedSeat = null;
  let currentCurrency = 'INR';

  const currencyRates = { INR: 83.5, USD: 1, EUR: 0.92, AED: 3.67 };
  const currencySymbols = { INR: '₹', USD: '$', EUR: '€', AED: 'AED ' };

  // Toast Notification Helper
  function showToast(msg) {
    const alertBox = document.getElementById('toastAlert');
    const msgBox = document.getElementById('toastMsg');
    if (!alertBox || !msgBox) return;

    msgBox.textContent = msg;
    alertBox.classList.add('show');
    setTimeout(() => alertBox.classList.remove('show'), 3000);
  }

  // Dynamic Category Navigation Tabs Switcher
  const categoryNavTabs = document.getElementById('categoryNavTabs');
  const heroBannerTitle = document.getElementById('heroBannerTitle');
  const heroBannerSub = document.getElementById('heroBannerSub');

  const categoryTitles = {
    flights: { title: 'SKYLINE X — Fly Beyond Expectations', sub: 'Fastest Booking • Lowest Airfares Guaranteed • AI Fare Predictions' },
    hotels: { title: 'Book Luxury Hotels & 5-Star Resorts', sub: 'Instant Discounts • Free Cancellation • Pay at Hotel Available' },
    homestays: { title: 'Luxury Villas, Beach Cottages & Chalets', sub: 'Entire Private Homes • Verified Hosts • Swimming Pool & BBQ' },
    holidays: { title: 'All-Inclusive International & Domestic Packages', sub: 'Flights + Luxury Hotels + Guided Tours + Free Transfers' },
    trains: { title: 'IRCTC Train Ticket Booking & Live PNR Status', sub: 'Zero Payment Gateway Fee • Instant Refund on Cancellation' },
    buses: { title: 'Book Intercity AC Sleeper & Volvo Bus Tickets', sub: 'Top Rated Bus Operators • Live Tracking • Clean & Sanitized' },
    cabs: { title: 'Airport Transfers & Outstation Taxi Booking', sub: 'Clean AC Cars • Expert Drivers • Doorstep Pickup' },
    forex: { title: 'Multi-Currency Forex Card & Currency Exchange', sub: 'Zero Forex Mark-Up • Doorstep Delivery in 48 Hours' },
    insurance: { title: 'Comprehensive International Travel Insurance', sub: 'Zero Deductible Claims • Medical & Baggage Cover' }
  };

  if (categoryNavTabs) {
    categoryNavTabs.querySelectorAll('.mmt-cat-item').forEach(tab => {
      tab.addEventListener('click', () => {
        categoryNavTabs.querySelectorAll('.mmt-cat-item').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const cat = tab.dataset.cat;
        document.querySelectorAll('.category-panel').forEach(p => p.style.display = 'none');
        
        const targetPanel = document.getElementById(`panel-${cat}`);
        if (targetPanel) targetPanel.style.display = 'block';

        if (heroBannerTitle && categoryTitles[cat]) {
          heroBannerTitle.textContent = categoryTitles[cat].title;
          heroBannerSub.textContent = categoryTitles[cat].sub;
        }

        showToast(`✨ Switched to ${cat.toUpperCase()} Search Mode`);
      });
    });
  }

  async function bookService(type, name, fare, details) {
    try {
      const data = await window.api.bookService(type, name, fare, details);
      if (data.status === 'SUCCESS') {
        showToast(`✅ Confirmed! PNR: ${data.booking.pnr}`);
        const modal = document.getElementById('flightResultsModal');
        if (modal) modal.classList.remove('show');
      }
    } catch(err) {
      showToast('❌ Action failed, please try again.');
    }
  }
  window.bookService = bookService;

  // 1. HOTEL SEARCH FORM
  const hotelSearchForm = document.getElementById('hotelSearchForm');
  if (hotelSearchForm) {
    hotelSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${BACKEND_API}/search-hotels`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: 'Goa', checkin_date: '2026-07-26', checkout_date: '2026-07-29', guests: 2, rooms: 1 })
        });
        const data = await res.json();
        renderGenericResults('Goa Luxury Hotels & Resorts', data.hotels.map(h => `
          <div style="background:#FFF; border:1px solid #E0E0E0; border-radius:12px; padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:1.1rem; color:var(--mmt-sky-blue);">${h.name}</strong>
              <small style="display:block; color:#737373;">${h.rating}</small>
            </div>
            <div style="text-align:right;">
              <h3 style="color:#000;">₹${h.price_per_night.toLocaleString()} / Night</h3>
              <button class="btn-mmt-login" style="margin-top:6px;" onclick="bookService('Hotel', '${h.name}', ${h.price_per_night}, {})">BOOK HOTEL</button>
            </div>
          </div>
        `).join(''));
      } catch(err) {
        showToast('🏨 Search failed');
      }
    });
  }

  // 2. HOMESTAYS SEARCH FORM
  const homestaySearchForm = document.getElementById('homestaySearchForm');
  if (homestaySearchForm) {
    homestaySearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${BACKEND_API}/search-homestays`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: 'Manali', checkin_date: '2026-08-01', checkout_date: '2026-08-05', guests: 4 })
        });
        const data = await res.json();
        renderGenericResults('Manali Luxury Villas & Homestays', data.homestays.map(h => `
          <div style="background:#FFF; border:1px solid #E0E0E0; border-radius:12px; padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:1.1rem; color:var(--mmt-sky-blue);">${h.name}</strong>
              <small style="display:block; color:#737373;">${h.type} • ${h.rating}</small>
            </div>
            <div style="text-align:right;">
              <h3 style="color:#000;">₹${h.price_per_night.toLocaleString()} / Night</h3>
              <button class="btn-mmt-login" style="margin-top:6px;" onclick="bookService('Homestay', '${h.name}', ${h.price_per_night}, {})">BOOK HOMESTAY</button>
            </div>
          </div>
        `).join(''));
      } catch(err) {
        showToast('🏡 Search failed');
      }
    });
  }

  // 3. HOLIDAYS SEARCH FORM
  const holidaySearchForm = document.getElementById('holidaySearchForm');
  if (holidaySearchForm) {
    holidaySearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${BACKEND_API}/search-holidays`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: 'Delhi', destination: 'Maldives', month: 'August 2026' })
        });
        const data = await res.json();
        renderGenericResults('Maldives Holiday Packages', data.holidays.map(h => `
          <div style="background:#FFF; border:1px solid #E0E0E0; border-radius:12px; padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:1.1rem; color:var(--mmt-sky-blue);">${h.name}</strong>
              <small style="display:block; color:#737373;">${h.duration} • ${h.inclusions}</small>
            </div>
            <div style="text-align:right;">
              <h3 style="color:#000;">₹${h.price.toLocaleString()}</h3>
              <button class="btn-mmt-login" style="margin-top:6px;" onclick="bookService('Holiday', '${h.name}', ${h.price}, {})">BOOK PACKAGE</button>
            </div>
          </div>
        `).join(''));
      } catch(err) {
        showToast('🏖️ Search failed');
      }
    });
  }

  // 4. TRAINS SEARCH FORM
  const trainSearchForm = document.getElementById('trainSearchForm');
  if (trainSearchForm) {
    trainSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${BACKEND_API}/search-trains`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from_station: 'NDLS', to_station: 'MMCT', travel_date: '2026-07-26', travel_class: '3AC' })
        });
        const data = await res.json();
        renderGenericResults('New Delhi (NDLS) ➔ Mumbai (MMCT) Trains', data.trains.map(t => `
          <div style="background:#FFF; border:1px solid #E0E0E0; border-radius:12px; padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:1.1rem; color:var(--mmt-sky-blue);">${t.train_num} - ${t.name}</strong>
              <small style="display:block; color:#737373;">Dep: ${t.dep} • Arr: ${t.arr} (${t.duration})</small>
            </div>
            <div style="text-align:right;">
              <h3 style="color:#000;">₹${t.fare.toLocaleString()}</h3>
              <button class="btn-mmt-login" style="margin-top:6px;" onclick="bookService('Train', '${t.name}', ${t.fare}, {})">BOOK TRAIN</button>
            </div>
          </div>
        `).join(''));
      } catch(err) {
        showToast('🚆 Search failed');
      }
    });
  }

  // 5. BUSES SEARCH FORM
  const busSearchForm = document.getElementById('busSearchForm');
  if (busSearchForm) {
    busSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${BACKEND_API}/search-buses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ from_city: 'Bangalore', to_city: 'Hyderabad', travel_date: '2026-07-25', bus_type: 'Volvo AC' })
        });
        const data = await res.json();
        renderGenericResults('Bangalore ➔ Hyderabad Buses', data.buses.map(b => `
          <div style="background:#FFF; border:1px solid #E0E0E0; border-radius:12px; padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:1.1rem; color:var(--mmt-sky-blue);">${b.operator}</strong>
              <small style="display:block; color:#737373;">${b.type} • Dep: ${b.dep} • Arr: ${b.arr}</small>
            </div>
            <div style="text-align:right;">
              <h3 style="color:#000;">₹${b.fare.toLocaleString()}</h3>
              <button class="btn-mmt-login" style="margin-top:6px;" onclick="bookService('Bus', '${b.operator}', ${b.fare}, {})">BOOK BUS</button>
            </div>
          </div>
        `).join(''));
      } catch(err) {
        showToast('🚌 Search failed');
      }
    });
  }

  // 6. CABS SEARCH FORM
  const cabSearchForm = document.getElementById('cabSearchForm');
  if (cabSearchForm) {
    cabSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const res = await fetch(`${BACKEND_API}/search-cabs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pickup: 'Delhi Airport', drop: 'Jaipur', pickup_date: '2026-07-26' })
        });
        const data = await res.json();
        renderGenericResults('Delhi Airport ➔ Jaipur Cabs', data.cabs.map(c => `
          <div style="background:#FFF; border:1px solid #E0E0E0; border-radius:12px; padding:16px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <strong style="font-size:1.1rem; color:var(--mmt-sky-blue);">${c.type}</strong>
              <small style="display:block; color:#737373;">${c.capacity} • ETA: ${c.eta}</small>
            </div>
            <div style="text-align:right;">
              <h3 style="color:#000;">₹${c.price.toLocaleString()}</h3>
              <button class="btn-mmt-login" style="margin-top:6px;" onclick="bookService('Cab', '${c.type}', ${c.price}, {})">BOOK CAB</button>
            </div>
          </div>
        `).join(''));
      } catch(err) {
        showToast('🚕 Search failed');
      }
    });
  }

  // 7. FOREX CARD CALCULATOR
  const forexCurrencySelect = document.getElementById('forexCurrencySelect');
  const forexAmountInput = document.getElementById('forexAmountInput');
  const forexTotalINR = document.getElementById('forexTotalINR');
  const forexRateSub = document.getElementById('forexRateSub');
  const forexSearchForm = document.getElementById('forexSearchForm');
  let currentForexData = { curr: 'USD', amt: 1000, total_inr: 83500 };

  async function updateForexCalculation() {
    if (!forexCurrencySelect || !forexAmountInput || !forexTotalINR) return;
    const curr = forexCurrencySelect.value;
    const amt = parseFloat(forexAmountInput.value) || 1000;

    try {
      const res = await fetch(`${BACKEND_API}/forex-rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: curr, amount: amt })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS') {
        currentForexData = { curr: curr, amt: amt, total_inr: data.total_inr };
        forexTotalINR.textContent = `₹${data.total_inr.toLocaleString()}`;
        if (forexRateSub) forexRateSub.textContent = `1 ${curr} = ${data.exchange_rate} INR`;
      }
    } catch(err) {
      const rate = curr === 'USD' ? 83.5 : curr === 'EUR' ? 90.8 : curr === 'AED' ? 22.7 : 83.5;
      currentForexData = { curr: curr, amt: amt, total_inr: (amt * rate) };
      forexTotalINR.textContent = `₹${(amt * rate).toLocaleString()}`;
    }
  }

  if (forexCurrencySelect) forexCurrencySelect.addEventListener('change', updateForexCalculation);
  if (forexAmountInput) forexAmountInput.addEventListener('input', updateForexCalculation);
  if (forexSearchForm) {
    forexSearchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      bookService('Forex', `Forex Card ${currentForexData.amt} ${currentForexData.curr}`, currentForexData.total_inr, { currency: currentForexData.curr, amount: currentForexData.amt });
    });
  }

  // 8. TRAVEL INSURANCE FORM
  const insuranceSearchForm = document.getElementById('insuranceSearchForm');
  if (insuranceSearchForm) {
    insuranceSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const region = document.getElementById('insRegionSelect').value;
      try {
        const res = await fetch(`${BACKEND_API}/insurance-quote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ destination: region, duration_days: 7, travelers_count: 1 })
        });
        const data = await res.json();
        if (data.status === 'SUCCESS') {
          bookService('Insurance', `${region} Travel Insurance`, data.total_premium_inr, { region: region });
        }
      } catch(err) {
        bookService('Insurance', `${region} Travel Insurance`, 840, { region: region });
      }
    });
  }

  // Helper function to render modal search results
  function renderGenericResults(title, htmlContent) {
    const modal = document.getElementById('flightResultsModal');
    document.getElementById('modalRouteHeader').textContent = title;
    document.getElementById('modalRouteSub').textContent = 'Live Availability & Instant Booking';
    const list = document.getElementById('flightResultsList');
    if (list) list.innerHTML = htmlContent;
    if (modal) modal.classList.add('show');
  }

  // Special Fare Chips Toggle
  document.querySelectorAll('.fare-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.fare-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedFareType = chip.dataset.fare;
      
      if (selectedFareType === 'student') showToast('🎓 Student Special Fare: 15% OFF + Extra 10kg Baggage');
      else if (selectedFareType === 'senior') showToast('👴 Senior Citizen Fare: 10% Instant Discount');
      else if (selectedFareType === 'armed') showToast('🎖️ Armed Forces Special Discount Applied');
      else if (selectedFareType === 'doctor') showToast('🩺 Doctor & Nurses Priority Discount Applied');
    });
  });

  // Passengers Box Dropdown Picker
  const passengersBox = document.getElementById('passengersBox');
  const passengerPickerDropdown = document.getElementById('passengerPickerDropdown');
  const applyPassBtn = document.getElementById('applyPassBtn');
  const cntAdults = document.getElementById('cntAdults');
  const cntChildren = document.getElementById('cntChildren');

  if (passengersBox && passengerPickerDropdown) {
    passengersBox.addEventListener('click', (e) => {
      e.stopPropagation();
      passengerPickerDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!passengersBox.contains(e.target) && !passengerPickerDropdown.contains(e.target)) {
        passengerPickerDropdown.classList.remove('show');
      }
    });

    document.querySelectorAll('.cnt-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        const type = btn.dataset.type;

        if (action === 'inc') passengers[type]++;
        if (action === 'dec' && passengers[type] > 0) {
          if (type === 'adults' && passengers[type] <= 1) return;
          passengers[type]--;
        }

        if (cntAdults) cntAdults.textContent = passengers.adults;
        if (cntChildren) cntChildren.textContent = passengers.children;
        updatePassSummary();
      });
    });

    if (applyPassBtn) {
      applyPassBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cabinClass = document.getElementById('cabinSelect').value;
        updatePassSummary();
        passengerPickerDropdown.classList.remove('show');
      });
    }
  }

  function updatePassSummary() {
    const total = passengers.adults + passengers.children + passengers.infants;
    document.getElementById('passCountDisplay').innerHTML = `${total} <span style="font-size:1rem; font-weight:700;">${total > 1 ? 'Travellers' : 'Traveller'}</span>`;
    document.getElementById('cabinClassDisplay').textContent = cabinClass;
  }

  // MMT Airport Autocomplete Setup
  function setupMMTAutocomplete(boxId, dropdownId, isOrigin) {
    const box = document.getElementById(boxId);
    const dropdown = document.getElementById(dropdownId);
    if (!box || !dropdown) return;

    box.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.mmt-auto-dropdown').forEach(d => d.classList.remove('show'));
      renderDropdownItems(dropdown, '', isOrigin);
      dropdown.classList.add('show');
    });

    document.addEventListener('click', (e) => {
      if (!box.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  }

  function renderDropdownItems(dropdown, filterQuery, isOrigin) {
    dropdown.innerHTML = '';
    const items = DEST_DATA.DESTINATIONS.filter(d => 
      !filterQuery || 
      d.city.toLowerCase().includes(filterQuery.toLowerCase()) || 
      d.code.toLowerCase().includes(filterQuery.toLowerCase()) || 
      d.country.toLowerCase().includes(filterQuery.toLowerCase())
    ).slice(0, 8);

    items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'mmt-auto-item';
      div.innerHTML = `
        <div>
          <strong style="color:var(--mmt-sky-blue);">${item.city} (${item.code})</strong>
          <small style="display:block; color:var(--text-gray-muted); font-size:0.75rem;">${item.country} Airport</small>
        </div>
      `;

      div.addEventListener('click', () => {
        if (isOrigin) {
          currentOrigin = { code: item.code, city: item.city, airport: `${item.city} Intl Airport` };
          document.getElementById('fromBigCode').textContent = item.code;
          document.getElementById('fromSubName').textContent = `${item.city}, ${item.country}`;
          document.getElementById('originVal').value = `${item.city} (${item.code})`;
        } else {
          currentDest = { code: item.code, city: item.city, airport: `${item.city} Intl Airport` };
          document.getElementById('toBigCode').textContent = item.code;
          document.getElementById('toSubName').textContent = `${item.city}, ${item.country}`;
          document.getElementById('destVal').value = `${item.city} (${item.code})`;
        }
        dropdown.classList.remove('show');
      });

      dropdown.appendChild(div);
    });
  }

  setupMMTAutocomplete('fromBox', 'fromDropdown', true);
  setupMMTAutocomplete('toBox', 'toDropdown', false);

  // MMT Swap Button
  const mmtSwapBtn = document.getElementById('mmtSwapBtn');
  if (mmtSwapBtn) {
    mmtSwapBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const temp = currentOrigin;
      currentOrigin = currentDest;
      currentDest = temp;

      document.getElementById('fromBigCode').textContent = currentOrigin.code;
      document.getElementById('fromSubName').textContent = `${currentOrigin.city}, ${currentOrigin.airport}`;
      document.getElementById('toBigCode').textContent = currentDest.code;
      document.getElementById('toSubName').textContent = `${currentDest.city}, ${currentDest.airport}`;
      showToast(`🔄 Swapped Route: ${currentOrigin.code} ➔ ${currentDest.code}`);
    });
  }

  // Promo Offer Cards Click Handler
  document.querySelectorAll('.offer-card').forEach(card => {
    card.addEventListener('click', () => {
      const code = card.dataset.code || 'MMTBANK';
      showToast(`🎉 Coupon ${code} Applied! 15% Instant Discount`);
    });
  });

  // Render 1,000+ Destinations Grid
  const destGrid = document.getElementById('destGrid');
  const destSearchExp = document.getElementById('destSearchExp');

  function renderDestinationsGrid(query) {
    if (!destGrid) return;
    destGrid.innerHTML = '';

    const list = DEST_DATA.DESTINATIONS.filter(d => 
      !query || 
      d.city.toLowerCase().includes(query.toLowerCase()) || 
      d.code.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 12);

    list.forEach(item => {
      const card = document.createElement('div');
      card.style.cssText = 'background:#FFF; border:1px solid #E0E0E0; border-radius:12px; padding:16px; box-shadow:0 2px 8px rgba(0,0,0,0.04);';
      const symbol = currencySymbols[currentCurrency];
      const fare = Math.round(item.baseFare * (currentCurrency === 'INR' ? 83.5 : 1));

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:1.1rem; color:var(--mmt-sky-blue);">${item.city} (${item.code})</strong>
          <span style="font-size:0.75rem; background:rgba(5, 103, 225, 0.1); color:var(--mmt-sky-blue); padding:2px 8px; border-radius:10px; font-weight:700;">${item.continent}</span>
        </div>
        <p style="font-size:0.8rem; color:#737373; margin-bottom:12px;">${item.desc}</p>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-weight:800; font-size:1.1rem; color:#000;">${symbol}${fare.toLocaleString()}</span>
          <button class="fare-chip active book-route-btn" data-code="${item.code}" data-city="${item.city}">Book Flight</button>
        </div>
      `;

      card.querySelector('.book-route-btn').addEventListener('click', () => {
        currentDest = { code: item.code, city: item.city, airport: `${item.city} Airport` };
        document.getElementById('toBigCode').textContent = item.code;
        document.getElementById('toSubName').textContent = item.city;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast(`✈️ Route Selected: ${item.city} (${item.code})`);
      });

      destGrid.appendChild(card);
    });
  }

  if (destSearchExp) {
    destSearchExp.addEventListener('input', (e) => {
      renderDestinationsGrid(e.target.value);
    });
  }

  renderDestinationsGrid('');

  // Flight Search Form Submission
  const mmtSearchForm = document.getElementById('mmtSearchForm');
  const flightResultsModal = document.getElementById('flightResultsModal');
  const closeResultsModal = document.getElementById('closeResultsModal');
  const flightResultsList = document.getElementById('flightResultsList');

  if (mmtSearchForm) {
    mmtSearchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await fetchAndRenderFlights();
      if (flightResultsModal) flightResultsModal.classList.add('show');
    });
  }

  if (closeResultsModal && flightResultsModal) {
    closeResultsModal.addEventListener('click', () => flightResultsModal.classList.remove('show'));
  }

  async function fetchAndRenderFlights() {
    document.getElementById('modalRouteHeader').textContent = `${currentOrigin.city} (${currentOrigin.code}) ➔ ${currentDest.city} (${currentDest.code})`;
    document.getElementById('modalRouteSub').textContent = `${cabinClass} • Non-Stop Direct Flights • ${selectedFareType.toUpperCase()} FARE`;

    let flights = [
      { id: 'FL-804', name: 'IndiGo 6E-804', depart: '06:00 AM', arrive: '08:45 AM', duration: '2h 45m', priceUSD: 95 },
      { id: 'FL-912', name: 'Air India AI-912', depart: '11:15 AM', arrive: '02:00 PM', duration: '2h 45m', priceUSD: 110 },
      { id: 'FL-101', name: 'Emirates EK-101', depart: '08:30 PM', arrive: '11:15 PM', duration: '2h 45m', priceUSD: 180 }
    ];

    try {
      const res = await fetch(`${BACKEND_API}/search-flights`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: currentOrigin.code,
          destination: currentDest.code,
          depart_date: '2026-07-24',
          passengers: passengers.adults,
          cabin_class: cabinClass,
          special_fare: selectedFareType
        })
      });
      const data = await res.json();
      if (data.status === 'SUCCESS' && data.flights) {
        flights = data.flights.map(f => ({
          id: f.id,
          name: f.airline,
          depart: f.depart_time,
          arrive: f.arrive_time,
          duration: f.duration,
          priceUSD: f.fare_usd
        }));
      }
    } catch (err) {
      console.log('Using simulated flight search engine fallback');
    }

    if (!flightResultsList) return;
    flightResultsList.innerHTML = '';

    flights.forEach(fl => {
      const symbol = currencySymbols[currentCurrency];
      const fare = Math.round(fl.priceUSD * (currentCurrency === 'INR' ? 83.5 : 1));

      const row = document.createElement('div');
      row.className = 'mmt-flight-row';
      row.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <div class="mmt-airline-logo"><i class="fa-solid fa-plane-up"></i></div>
          <div>
            <strong>${fl.name}</strong>
            <small style="display:block; color:#737373;">Non-Stop Direct</small>
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; text-align:center;">
          <div><h3>${fl.depart}</h3><small>${currentOrigin.code}</small></div>
          <div style="font-size:0.8rem; color:#737373;">${fl.duration}<br>──────✈──────</div>
          <div><h3>${fl.arrive}</h3><small>${currentDest.code}</small></div>
        </div>

        <div style="text-align:right;">
          <h2 style="color:var(--mmt-sky-blue);">${symbol}${fare.toLocaleString()}</h2>
          <button class="btn-mmt-login select-seat-btn" data-id="${fl.id}" style="margin-top:6px; font-size:0.8rem;">
            BOOK NOW <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      `;

      row.querySelector('.select-seat-btn').addEventListener('click', () => {
        selectedFlight = fl;
        openSeatPickerModal(fl);
      });

      flightResultsList.appendChild(row);
    });
  }

  // Seat Picker Modal
  const seatPickerModal = document.getElementById('seatPickerModal');
  const closeSeatModal = document.getElementById('closeSeatModal');
  const seatMapGrid = document.getElementById('seatMapGrid');
  const sumSeatNo = document.getElementById('sumSeatNo');
  const sumFare = document.getElementById('sumFare');
  const confirmPassBtn = document.getElementById('confirmPassBtn');

  function openSeatPickerModal(flight) {
    if (flightResultsModal) flightResultsModal.classList.remove('show');
    selectedSeat = null;
    if (sumSeatNo) sumSeatNo.textContent = 'Select seat...';

    renderSeatGrid();
    if (seatPickerModal) seatPickerModal.classList.add('show');
  }

  if (closeSeatModal && seatPickerModal) closeSeatModal.addEventListener('click', () => seatPickerModal.classList.remove('show'));

  function renderSeatGrid() {
    if (!seatMapGrid) return;
    seatMapGrid.innerHTML = '';

    const cols = ['A', 'B', 'C', 'D'];
    for (let r = 1; r <= 6; r++) {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; gap:10px; align-items:center;';

      cols.forEach(c => {
        const id = `${r}${c}`;
        const btn = document.createElement('button');
        btn.style.cssText = 'width:34px; height:34px; border-radius:6px; background:#FFF; border:1px solid #E0E0E0; font-weight:700; font-size:0.75rem; cursor:pointer;';
        btn.textContent = id;

        btn.addEventListener('click', () => {
          document.querySelectorAll('#seatMapGrid button').forEach(b => b.style.background = '#FFF');
          btn.style.background = '#00F0FF';
          selectedSeat = id;
          if (sumSeatNo) sumSeatNo.textContent = id;
          
          const symbol = currencySymbols[currentCurrency];
          const fare = Math.round((selectedFlight ? selectedFlight.priceUSD : 95) * (currentCurrency === 'INR' ? 83.5 : 1));
          if (sumFare) sumFare.textContent = `${symbol}${fare.toLocaleString()}`;
        });

        row.appendChild(btn);
      });

      seatMapGrid.appendChild(row);
    }
  }

  // Boarding Pass Modal & Backend Ticket Creation
  const boardingPassModal = document.getElementById('boardingPassModal');
  const closePassModal = document.getElementById('closePassModal');

  if (confirmPassBtn) {
    confirmPassBtn.addEventListener('click', async () => {
      if (!selectedSeat) {
        alert('Please pick an available seat on the grid.');
        return;
      }

      if (seatPickerModal) seatPickerModal.classList.remove('show');

      let pnr = `MMT${Math.floor(10000 + Math.random() * 90000)}`;

      try {
        const res = await fetch(`${BACKEND_API}/book-seat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flight_id: selectedFlight ? selectedFlight.id : 'SKX-804',
            passenger_name: 'ALEXANDER VANCE',
            seat_id: selectedSeat,
            origin_code: currentOrigin.code,
            dest_code: currentDest.code,
            cabin_class: cabinClass,
            total_fare: selectedFlight ? selectedFlight.priceUSD : 95
          })
        });
        const data = await res.json();
        if (data.status === 'SUCCESS' && data.booking) {
          pnr = data.booking.pnr;
        }
      } catch (err) {
        console.log('Using client ticket generator fallback');
      }

      document.getElementById('bpFrom').textContent = currentOrigin.code;
      document.getElementById('bpTo').textContent = currentDest.code;
      document.getElementById('bpSeatNo').textContent = selectedSeat;
      document.getElementById('bpPnrDisplay').textContent = `PNR: ${pnr}`;

      if (boardingPassModal) boardingPassModal.classList.add('show');
      showToast(`🎟️ Ticket Reserved! PNR: ${pnr}`);
    });
  }

  if (closePassModal && boardingPassModal) closePassModal.addEventListener('click', () => boardingPassModal.classList.remove('show'));

  // Sign In Modal Handlers
  const authModal = document.getElementById('authModal');
  const openAuthModal = document.getElementById('openAuthModal');
  const closeAuthModal = document.getElementById('closeAuthModal');
  const loginSubmitForm = document.getElementById('loginSubmitForm');

  if (openAuthModal && authModal) {
    openAuthModal.addEventListener('click', () => authModal.classList.add('show'));
  }
  if (closeAuthModal && authModal) {
    closeAuthModal.addEventListener('click', () => authModal.classList.remove('show'));
  }
  if (loginSubmitForm) {
    loginSubmitForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (authModal) authModal.classList.remove('show');
      showToast('👤 Welcome back, Alexander Vance!');
    });
  }

  // Currency Switcher
  const currencySelect = document.getElementById('currencySelect');
  if (currencySelect) {
    currencySelect.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      renderDestinationsGrid('');
      showToast(`💱 Currency Changed to ${currentCurrency}`);
    });
  }
});
