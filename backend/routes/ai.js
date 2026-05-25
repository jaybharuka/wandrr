const express = require('express');
const router = express.Router();

const STYLE_DESC = {
  culture:    'cultural experiences — historical sites, temples, museums, heritage walks',
  adventure:  'adventure & outdoor activities — trekking, sports, nature, thrilling experiences',
  food:       'food & local life — street food, local restaurants, markets, culinary experiences',
  relaxation: 'relaxation & wellness — spas, peaceful walks, yoga, slow travel',
};

const BUDGET_DESC = {
  budget:   'budget travel (hostels/guesthouses ~₹800–2,000/night, street food, public transport)',
  midrange: 'mid-range travel (3-star hotels ~₹4,000–8,000/night, casual restaurants, taxis)',
  luxury:   'luxury travel (5-star hotels ~₹15,000+/night, fine dining, private transfers)',
};

// POST /api/ai/itinerary
router.post('/itinerary', async (req, res) => {
  const { city, days, style, budget } = req.body;

  if (!city || !days || !style || !budget) {
    return res.status(400).json({ error: 'city, days, style, and budget are required.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'AI service not configured.' });
  }

  const prompt = `You are an expert travel planner for India. Create a detailed travel itinerary.

Destination: ${city}, India
Duration: ${days} day(s)
Travel Style: ${STYLE_DESC[style] || style}
Budget Tier: ${BUDGET_DESC[budget] || budget}

Respond ONLY with a valid JSON object — no markdown, no code fences, no extra text:
{
  "overview": "2–3 sentence description of ${city} as a travel destination",
  "itinerary": [
    {"day": 1, "morning": "specific activity with place name", "afternoon": "specific activity with place name", "evening": "specific activity with place name"}
  ],
  "stay": "specific hotel/guesthouse recommendation with approx INR price per night",
  "food": "2–3 must-try dishes or restaurants in ${city} with approximate meal cost in INR",
  "tips": ["specific local insider tip 1", "specific local insider tip 2", "specific local insider tip 3"]
}

Generate exactly ${days} day objects in the itinerary array. All activities must be real, specific to ${city}.`;

  const callGemini = () => fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    }
  );

  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  try {
    let response = await callGemini();

    // Single retry on 503 (model overloaded — transient)
    if (response.status === 503) {
      console.log('Gemini 503 — retrying in 3s…');
      await sleep(3000);
      response = await callGemini();
    }

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error('Gemini API error:', errData);
      return res.status(response.status).json({ error: 'Gemini API returned an error.', details: errData });
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences if Gemini wraps the JSON anyway
    const cleaned = rawText
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, itinerary: parsed });
    } catch {
      return res.json({ success: true, raw: rawText });
    }
  } catch (err) {
    console.error('Gemini fetch error:', err.message);
    return res.status(503).json({ error: 'Could not reach Gemini API.' });
  }
});

module.exports = router;
