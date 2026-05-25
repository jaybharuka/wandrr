const express = require('express');
const router = express.Router();

const DUFFEL_URL = 'https://api.duffel.com';
const DUFFEL_VERSION = 'v2';

const CITY_TO_IATA = {
  'Delhi':      'DEL',
  'Mumbai':     'BOM',
  'Bangalore':  'BLR',
  'Chennai':    'MAA',
  'Hyderabad':  'HYD',
  'Kolkata':    'CCU',
  'Pune':       'PNQ',
  'Jaipur':     'JAI',
  'Ahmedabad':  'AMD',
  'Goa':        'GOI',
  'Ladakh':     'IXL',
  'Manali':     'KUU',
  'Varanasi':   'VNS',
  'Agra':       'AGR',
  'Rishikesh':  'DED',
  'Darjeeling': 'IXB',
  'Kochi':      'COK',
  'Mysore':     'MYQ',
};

const TO_INR = {
  INR: 1,
  USD: 84,
  GBP: 107,
  EUR: 91,
  AED: 23,
  SGD: 62,
  QAR: 23,
  SAR: 22,
  CAD: 62,
  AUD: 55,
  JPY: 0.56,
};

function toINR(amount, currency) {
  const rate = TO_INR[currency] ?? 84;
  return Math.round(parseFloat(amount) * rate);
}

function duffelHeaders() {
  return {
    'Authorization': `Bearer ${process.env.DUFFEL_API_KEY}`,
    'Duffel-Version': DUFFEL_VERSION,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

function normalizeOffer(offer, fromCity, toCity) {
  const slice = offer.slices[0];
  const firstSeg = slice.segments[0];
  const lastSeg  = slice.segments[slice.segments.length - 1];

  const depDate = new Date(firstSeg.departing_at);
  const arrDate = new Date(lastSeg.arriving_at);
  const durMins = Math.round((arrDate - depDate) / 60000);
  const stops   = slice.segments.length - 1;

  return {
    id:       offer.id,
    flight_no: `${firstSeg.marketing_carrier.iata_code}${firstSeg.marketing_carrier_flight_number}`,
    airline:  firstSeg.marketing_carrier.name,
    dep:      firstSeg.departing_at.slice(11, 16),
    arr:      lastSeg.arriving_at.slice(11, 16),
    duration: `${Math.floor(durMins / 60)}h ${durMins % 60}m`,
    stops:    stops === 0 ? 'Non-stop' : `${stops} stop${stops > 1 ? 's' : ''}`,
    fare:     toINR(offer.total_amount, offer.total_currency),
    currency: 'INR',
    fromCity,
    toCity,
  };
}

// POST /api/flights/search
router.post('/search', async (req, res) => {
  const { from, to, date, passengers = 1 } = req.body;

  if (!from || !to || !date) {
    return res.status(400).json({ error: 'from, to, and date are required.' });
  }

  const originIata = CITY_TO_IATA[from];
  const destIata   = CITY_TO_IATA[to];

  if (!originIata) return res.status(400).json({ error: `No airport found for "${from}".` });
  if (!destIata)   return res.status(400).json({ error: `No airport found for "${to}".` });
  if (originIata === destIata) return res.status(400).json({ error: 'Origin and destination cannot be the same.' });

  const passengerCount = Math.min(Math.max(parseInt(passengers) || 1, 1), 9);
  const passengersList = Array.from({ length: passengerCount }, () => ({ type: 'adult' }));

  try {
    const duffelRes = await fetch(`${DUFFEL_URL}/air/offer_requests`, {
      method: 'POST',
      headers: duffelHeaders(),
      body: JSON.stringify({
        data: {
          slices: [{ origin: originIata, destination: destIata, departure_date: date }],
          passengers: passengersList,
          cabin_class: 'economy',
        },
      }),
    });

    if (!duffelRes.ok) {
      const errBody = await duffelRes.json().catch(() => ({}));
      const msg = errBody.errors?.[0]?.message || `Duffel API returned ${duffelRes.status}`;
      return res.status(duffelRes.status).json({ error: msg });
    }

    const body   = await duffelRes.json();
    const offers = body.data?.offers ?? [];

    const flights = offers
      .slice(0, 12)
      .map((o) => normalizeOffer(o, from, to))
      .sort((a, b) => a.dep.localeCompare(b.dep));

    res.json({ flights, total: offers.length });
  } catch (err) {
    console.error('Duffel fetch error:', err.message);
    res.status(500).json({ error: 'Failed to reach flight search service. Please try again.' });
  }
});

// GET /api/flights/airports  —  return IATA map for frontend city validation
router.get('/airports', (req, res) => {
  res.json({ airports: CITY_TO_IATA });
});

module.exports = router;
