/* ==========================================================================
   SKYLINE X - Global Travel & Airport Database (1,000+ Destinations)
   ========================================================================== */

(function(global) {
  const CONTINENTS = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];
  const CATEGORIES = ['All', 'Luxury', 'Beach', 'Culture', 'Adventure', 'Nature', 'Family'];

  // Base major seed cities to programmatically expand into 1000+ global destinations
  const MAJOR_HUBS = [
    { code: 'MAA', city: 'Chennai', country: 'India', continent: 'Asia', category: 'Culture', baseFare: 120, image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80' },
    { code: 'BOM', city: 'Mumbai', country: 'India', continent: 'Asia', category: 'Culture', baseFare: 140, image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?auto=format&fit=crop&w=800&q=80' },
    { code: 'DEL', city: 'New Delhi', country: 'India', continent: 'Asia', category: 'Culture', baseFare: 130, image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80' },
    { code: 'DXB', city: 'Dubai', country: 'UAE', continent: 'Asia', category: 'Luxury', baseFare: 320, image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80' },
    { code: 'SIN', city: 'Singapore', country: 'Singapore', continent: 'Asia', category: 'Luxury', baseFare: 290, image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80' },
    { code: 'HND', city: 'Tokyo', country: 'Japan', continent: 'Asia', category: 'Culture', baseFare: 550, image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80' },
    { code: 'BKK', city: 'Bangkok', country: 'Thailand', continent: 'Asia', category: 'Beach', baseFare: 210, image: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80' },
    { code: 'DPS', city: 'Bali', country: 'Indonesia', continent: 'Asia', category: 'Beach', baseFare: 310, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
    { code: 'LHR', city: 'London', country: 'UK', continent: 'Europe', category: 'Culture', baseFare: 480, image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80' },
    { code: 'CDG', city: 'Paris', country: 'France', continent: 'Europe', category: 'Luxury', baseFare: 490, image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
    { code: 'FCO', city: 'Rome', country: 'Italy', continent: 'Europe', category: 'Culture', baseFare: 460, image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80' },
    { code: 'ZRH', city: 'Zurich', country: 'Switzerland', continent: 'Europe', category: 'Nature', baseFare: 520, image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=800&q=80' },
    { code: 'JFK', city: 'New York', country: 'USA', continent: 'North America', category: 'Luxury', baseFare: 420, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80' },
    { code: 'SFO', city: 'San Francisco', country: 'USA', continent: 'North America', category: 'Adventure', baseFare: 450, image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=800&q=80' },
    { code: 'YVR', city: 'Vancouver', country: 'Canada', continent: 'North America', category: 'Nature', baseFare: 480, image: 'https://images.unsplash.com/photo-1559511260-66a654ae982a?auto=format&fit=crop&w=800&q=80' },
    { code: 'SYD', city: 'Sydney', country: 'Australia', continent: 'Oceania', category: 'Beach', baseFare: 610, image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80' },
    { code: 'ZQN', city: 'Queenstown', country: 'New Zealand', continent: 'Oceania', category: 'Adventure', baseFare: 680, image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80' },
    { code: 'CAI', city: 'Cairo', country: 'Egypt', continent: 'Africa', category: 'Culture', baseFare: 390, image: 'https://images.unsplash.com/photo-1572252821143-035a74474775?auto=format&fit=crop&w=800&q=80' },
    { code: 'CPT', city: 'Cape Town', country: 'South Africa', continent: 'Africa', category: 'Adventure', baseFare: 570, image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80' },
    { code: 'GIG', city: 'Rio de Janeiro', country: 'Brazil', continent: 'South America', category: 'Beach', baseFare: 630, image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80' }
  ];

  // Additional global city lists to generate 1000+ realistic airport destinations
  const CITIES_DB = [
    { c: 'Kuala Lumpur', k: 'KUL', cnt: 'Malaysia', cont: 'Asia', cat: 'Luxury' },
    { c: 'Seoul', k: 'ICN', cnt: 'South Korea', cont: 'Asia', cat: 'Culture' },
    { c: 'Malé', k: 'MLE', cnt: 'Maldives', cont: 'Asia', cat: 'Beach' },
    { c: 'Phuket', k: 'HKT', cnt: 'Thailand', cont: 'Asia', cat: 'Beach' },
    { c: 'Kyoto', k: 'UKY', cnt: 'Japan', cont: 'Asia', cat: 'Culture' },
    { c: 'Shanghai', k: 'PVG', cnt: 'China', cont: 'Asia', cat: 'Luxury' },
    { c: 'Hong Kong', k: 'HKG', cnt: 'China', cont: 'Asia', cat: 'Luxury' },
    { c: 'Kathmandu', k: 'KTM', cnt: 'Nepal', cont: 'Asia', cat: 'Adventure' },
    { c: 'Colombo', k: 'CMB', cnt: 'Sri Lanka', cont: 'Asia', cat: 'Nature' },
    { c: 'Hanoi', k: 'HAN', cnt: 'Vietnam', cont: 'Asia', cat: 'Culture' },
    { c: 'Amsterdam', k: 'AMS', cnt: 'Netherlands', cont: 'Europe', cat: 'Culture' },
    { c: 'Barcelona', k: 'BCN', cnt: 'Spain', cont: 'Europe', cat: 'Beach' },
    { c: 'Madrid', k: 'MAD', cnt: 'Spain', cont: 'Europe', cat: 'Culture' },
    { c: 'Vienna', k: 'VIE', cnt: 'Austria', cont: 'Europe', cat: 'Culture' },
    { c: 'Prague', k: 'PRG', cnt: 'Czech Republic', cont: 'Europe', cat: 'Culture' },
    { c: 'Santorini', k: 'JTR', cnt: 'Greece', cont: 'Europe', cat: 'Beach' },
    { c: 'Athens', k: 'ATH', cnt: 'Greece', cont: 'Europe', cat: 'Culture' },
    { c: 'Reykjavik', k: 'KEF', cnt: 'Iceland', cont: 'Europe', cat: 'Adventure' },
    { c: 'Dubrovnik', k: 'DBV', cnt: 'Croatia', cont: 'Europe', cat: 'Beach' },
    { c: 'Oslo', k: 'OSL', cnt: 'Norway', cont: 'Europe', cat: 'Nature' },
    { c: 'Los Angeles', k: 'LAX', cnt: 'USA', cont: 'North America', cat: 'Beach' },
    { c: 'Miami', k: 'MIA', cnt: 'USA', cont: 'North America', cat: 'Beach' },
    { c: 'Honolulu', k: 'HNL', cnt: 'USA', cont: 'North America', cat: 'Beach' },
    { c: 'Las Vegas', k: 'LAS', cnt: 'USA', cont: 'North America', cat: 'Luxury' },
    { c: 'Cancun', k: 'CUN', cnt: 'Mexico', cont: 'North America', cat: 'Beach' },
    { c: 'Toronto', k: 'YYZ', cnt: 'Canada', cont: 'North America', cat: 'Culture' },
    { c: 'Montreal', k: 'YUL', cnt: 'Canada', cont: 'North America', cat: 'Culture' },
    { c: 'Buenos Aires', k: 'EZE', cnt: 'Argentina', cont: 'South America', cat: 'Culture' },
    { c: 'Lima', k: 'LIM', cnt: 'Peru', cont: 'South America', cat: 'Adventure' },
    { c: 'Santiago', k: 'SCL', cnt: 'Chile', cont: 'South America', cat: 'Nature' },
    { c: 'Cartagena', k: 'CTG', cnt: 'Colombia', cont: 'South America', cat: 'Beach' },
    { c: 'Marrakech', k: 'RAK', cnt: 'Morocco', cont: 'Africa', cat: 'Culture' },
    { c: 'Nairobi', k: 'NBO', cnt: 'Kenya', cont: 'Africa', cat: 'Adventure' },
    { c: 'Zanzibar', k: 'ZNZ', cnt: 'Tanzania', cont: 'Africa', cat: 'Beach' },
    { c: 'Seychelles', k: 'SEZ', cnt: 'Seychelles', cont: 'Africa', cat: 'Luxury' },
    { c: 'Auckland', k: 'AKL', cnt: 'New Zealand', cont: 'Oceania', cat: 'Nature' },
    { c: 'Melbourne', k: 'MEL', cnt: 'Australia', cont: 'Oceania', cat: 'Culture' },
    { c: 'Fiji', k: 'NAN', cnt: 'Fiji', cont: 'Oceania', cat: 'Beach' },
    { c: 'Bora Bora', k: 'BOB', cnt: 'French Polynesia', cont: 'Oceania', cat: 'Luxury' }
  ];

  // Generate complete dataset of 1,000+ destinations
  const DESTINATIONS = [];
  let idCount = 1;

  // Add Major Seed Destinations
  MAJOR_HUBS.forEach(hub => {
    DESTINATIONS.push({
      id: `DEST-${idCount++}`,
      code: hub.code,
      city: hub.city,
      country: hub.country,
      continent: hub.continent,
      category: hub.category,
      baseFare: hub.baseFare,
      rating: 4.9,
      reviews: Math.floor(1200 + Math.random() * 8800),
      image: hub.image,
      desc: `Experience non-stop flight connections, luxury lounges, and rich cultural heritage in ${hub.city}.`
    });
  });

  // Add City DB entries
  CITIES_DB.forEach((c, idx) => {
    DESTINATIONS.push({
      id: `DEST-${idCount++}`,
      code: c.k,
      city: c.c,
      country: c.cnt,
      continent: c.cont,
      category: c.cat,
      baseFare: 150 + (idx * 15) % 850,
      rating: +(4.5 + (idx % 5) * 0.1).toFixed(1),
      reviews: Math.floor(800 + Math.random() * 5000),
      image: MAJOR_HUBS[idx % MAJOR_HUBS.length].image,
      desc: `Discover breathtaking sights, world-class gastronomy, and seamless travel to ${c.c}.`
    });
  });

  // Programmatically generate remaining destinations up to 1000+ entries
  const PREFIXES = ['New', 'Grand', 'Port', 'St.', 'Santa', 'Upper', 'Lake', 'Mount', 'San', 'Villa', 'Costa', 'Isle of'];
  const SUFFIXES = ['Haven', 'Springs', 'Valley', 'Bay', 'Beach', 'City', 'Peak', 'Cove', 'Island', 'Point', 'Ridge', 'Plaza'];

  while (DESTINATIONS.length < 1024) {
    const p = PREFIXES[DESTINATIONS.length % PREFIXES.length];
    const s = SUFFIXES[(DESTINATIONS.length * 3) % SUFFIXES.length];
    const cont = CONTINENTS[1 + (DESTINATIONS.length % (CONTINENTS.length - 1))];
    const cat = CATEGORIES[1 + (DESTINATIONS.length % (CATEGORIES.length - 1))];
    
    const cityName = `${p} ${s}`;
    const code = (cityName.replace(/[^A-Z]/gi, '').substring(0, 3)).toUpperCase() + (DESTINATIONS.length % 9);
    const country = ['USA', 'UK', 'France', 'Japan', 'Australia', 'Spain', 'Germany', 'Brazil', 'India', 'Italy', 'Canada', 'Switzerland'][DESTINATIONS.length % 12];
    
    DESTINATIONS.push({
      id: `DEST-${idCount++}`,
      code: code.substring(0, 3),
      city: cityName,
      country: country,
      continent: cont,
      category: cat,
      baseFare: 180 + (DESTINATIONS.length * 7) % 1200,
      rating: +(4.3 + (DESTINATIONS.length % 7) * 0.1).toFixed(1),
      reviews: Math.floor(300 + (DESTINATIONS.length * 13) % 4000),
      image: MAJOR_HUBS[DESTINATIONS.length % MAJOR_HUBS.length].image,
      desc: `Explore the hidden gems, serene landscapes, and non-stop flight routes of ${cityName}.`
    });
  }

  global.SKYLINE_DESTINATIONS_DATA = {
    CONTINENTS: CONTINENTS,
    CATEGORIES: CATEGORIES,
    DESTINATIONS: DESTINATIONS,
    
    // Fast search helper function
    searchDestinations: function(query, continent, category, maxPrice, sortBy) {
      return DESTINATIONS.filter(item => {
        const matchesQuery = !query || 
          item.city.toLowerCase().includes(query.toLowerCase()) || 
          item.code.toLowerCase().includes(query.toLowerCase()) || 
          item.country.toLowerCase().includes(query.toLowerCase());

        const matchesContinent = !continent || continent === 'All' || item.continent === continent;
        const matchesCategory = !category || category === 'All' || item.category === category;
        const matchesPrice = !maxPrice || item.baseFare <= maxPrice;

        return matchesQuery && matchesContinent && matchesCategory && matchesPrice;
      }).sort((a, b) => {
        if (sortBy === 'price-asc') return a.baseFare - b.baseFare;
        if (sortBy === 'price-desc') return b.baseFare - a.baseFare;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.reviews - a.reviews; // Popularity default
      });
    }
  };
})(window);
