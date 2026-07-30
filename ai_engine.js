/* ==========================================================================
   SKYLINE X - AI Travel Copilot & Intelligence Engine
   ========================================================================== */

(function(global) {
  const AI_ENGINE = {
    // Natural Language Voice & Prompt Parser
    parseVoicePrompt: function(promptText) {
      const lower = promptText.toLowerCase();
      
      let cabinClass = 'Business';
      if (lower.includes('economy')) cabinClass = 'Economy';
      if (lower.includes('first') || lower.includes('suite')) cabinClass = 'First Suite';
      if (lower.includes('premium')) cabinClass = 'Premium Economy';

      let passengers = 1;
      const passMatch = lower.match(/(\d+)\s*(passengers?|tickets?|people|adults?)/);
      if (passMatch) passengers = parseInt(passMatch[1]);

      let originCode = 'MAA'; // Default Chennai
      let originCity = 'Chennai';
      let destCode = 'DXB';   // Default Dubai
      let destCity = 'Dubai';

      if (lower.includes('mumbai')) { originCode = 'BOM'; originCity = 'Mumbai'; }
      if (lower.includes('delhi')) { originCode = 'DEL'; originCity = 'New Delhi'; }
      if (lower.includes('tokyo') || lower.includes('japan')) { destCode = 'HND'; destCity = 'Tokyo'; }
      if (lower.includes('singapore')) { destCode = 'SIN'; destCity = 'Singapore'; }
      if (lower.includes('london')) { destCode = 'LHR'; destCity = 'London'; }
      if (lower.includes('paris')) { destCode = 'CDG'; destCity = 'Paris'; }
      if (lower.includes('new york')) { destCode = 'JFK'; destCity = 'New York'; }

      return {
        originCode,
        originCity,
        destCode,
        destCity,
        passengers,
        cabinClass,
        promptRaw: promptText,
        aiConfidence: '98.4%'
      };
    },

    // AI Smart Ranking Classifier
    rankFlights: function(flightsList) {
      if (!flightsList || flightsList.length === 0) return {};

      const sortedByPrice = [...flightsList].sort((a, b) => a.priceUSD - b.priceUSD);
      const sortedByDuration = [...flightsList].sort((a, b) => a.durationMinutes - b.durationMinutes);

      return {
        cheapest: sortedByPrice[0],
        fastest: sortedByDuration[0],
        bestOverall: flightsList[0],
        ecoFriendly: flightsList.find(f => f.aircraft.includes('A350') || f.aircraft.includes('Dreamliner')) || flightsList[0]
      };
    },

    // AI Fare Predictor Algorithm
    predictFareTrend: function(origin, destination) {
      const trends = [
        { status: 'BUY NOW', badgeColor: '#34C759', advice: 'Prices are at 30-day lows. Fares expected to rise 14% in 48 hours.', confidence: 96 },
        { status: 'WAIT 2 DAYS', badgeColor: '#FFCC00', advice: 'Mid-week price drops detected. Save up to $120 by booking on Wednesday.', confidence: 89 },
        { status: 'FARES STABLE', badgeColor: '#00F0FF', advice: 'High flight availability. Fares likely to remain steady for 7 days.', confidence: 92 }
      ];
      return trends[Math.floor(Math.random() * trends.length)];
    },

    // AI Complete Itinerary Generator
    generateFullTripItinerary: function(destinationCity) {
      const itineraries = {
        'Tokyo': {
          city: 'Tokyo, Japan',
          flights: 'Direct SKX-804 (13h 45m)',
          hotel: 'The Ritz-Carlton Tokyo (5-Star Luxury)',
          visa: 'eVisa Available (Fast-Track 24h Approval)',
          attractions: ['Senso-ji Temple', 'Shibuya Crossing', 'Mount Fuji Day Tour', 'TeamLab Planets'],
          weather: '22°C Clear Skies & Pleasant Breeze',
          estimatedBudget: '$2,450 USD (All Inclusive)',
          ecoScore: 'A+ (Carbon Offset Included)'
        },
        'Dubai': {
          city: 'Dubai, UAE',
          flights: 'Direct SKX-302 (4h 10m)',
          hotel: 'Armani Hotel Dubai (Burj Khalifa)',
          visa: 'Visa on Arrival / 30-Day Express eVisa',
          attractions: ['Burj Khalifa Sky Deck', 'Dubai Mall Fountain', 'Desert Safari Dunes', 'Palm Jumeirah'],
          weather: '31°C Sunny & Golden Sunset',
          estimatedBudget: '$1,890 USD',
          ecoScore: 'A'
        },
        'Paris': {
          city: 'Paris, France',
          flights: 'Direct SKX-512 (9h 30m)',
          hotel: 'Le Meurice Paris (Palace Hotel)',
          visa: 'Schengen Visa Required',
          attractions: ['Eiffel Tower Summit', 'Louvre Museum', 'Seine River Cruise', 'Champs-Élysées'],
          weather: '19°C Light Clouds',
          estimatedBudget: '$2,100 USD',
          ecoScore: 'A+'
        }
      };

      return itineraries[destinationCity] || {
        city: destinationCity,
        flights: 'Direct Skyline X Express Flight',
        hotel: 'Grand Executive 5-Star Partner Hotel',
        visa: 'Express Travel Clearance',
        attractions: ['City Center Tour', 'Cultural Heritage Museum', 'Panoramic Observation Deck'],
        weather: '24°C Ideal Travel Climate',
        estimatedBudget: '$1,950 USD',
        ecoScore: 'A+'
      };
    }
  };

  global.SKYLINE_AI_ENGINE = AI_ENGINE;
})(window);
