import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DESTINATIONS, STYLES, BUDGETS, generateItinerary } from "./itineraryData";

export default function AIPage() {
  const navigate = useNavigate();
  const [city, setCity]       = useState("Delhi");
  const [days, setDays]       = useState(3);
  const [style, setStyle]     = useState("culture");
  const [budget, setBudget]   = useState("midrange");
  const [result, setResult]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [apiError, setApiError] = useState(null);

  // Normalize local rule-based output → unified format
  const normalizeLocal = (r) => ({
    city: r.city, days: r.days, style: r.style, budget: r.budget,
    overview: r.description,
    itinerary: r.itinerary.map(({ day, plan }) => ({
      day,
      morning:   plan[0]?.activity ?? "",
      afternoon: plan[1]?.activity ?? "",
      evening:   plan[2]?.activity ?? "",
    })),
    stay: r.stay.stay,
    food: r.stay.food,
    tips: r.tips,
    source: "local",
  });

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setApiError(null);
    try {
      const res = await fetch(`/api/ai/itinerary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, days, style, budget }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.itinerary) {
          setResult({ ...data.itinerary, city, days, style, budget, source: "gemini" });
        } else {
          throw new Error("No structured itinerary returned");
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const code = errData?.details?.error?.code ?? res.status;
        const msg = code === 429
          ? "Gemini rate limit hit — showing local result. Try again in ~60s."
          : code === 503
          ? "Gemini is busy right now — showing local result. Try again in a moment."
          : "Gemini unavailable — showing local result.";
        setApiError(msg);
        setResult(normalizeLocal(generateItinerary(city, days, style, budget)));
      }
    } catch {
      setApiError("Could not reach AI service — showing local result.");
      setResult(normalizeLocal(generateItinerary(city, days, style, budget)));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const lines = [
      `🗺️  Wandrr AI Itinerary — ${result.city} (${result.days} day${result.days > 1 ? "s" : ""})`,
      `Style: ${STYLES.find(s => s.key === result.style)?.label}  |  Budget: ${BUDGETS.find(b => b.key === result.budget)?.label}`,
      `Source: ${result.source === "gemini" ? "Google Gemini AI" : "Wandrr Knowledge Base"}`,
      ``,
      result.overview ?? "",
      ``,
      ...result.itinerary.flatMap(({ day, morning, afternoon, evening }) => [
        `── Day ${day} ──`,
        `  🌅 Morning:   ${morning}`,
        `  ☀️  Afternoon: ${afternoon}`,
        `  🌆 Evening:   ${evening}`,
        ``,
      ]),
      `🏨 Stay: ${result.stay}`,
      `🍽️  Food: ${result.food}`,
      ``,
      `💡 Pro Tips:`,
      ...(result.tips ?? []).map(t => `  • ${t}`),
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CARD = "bg-white border border-gray-200 rounded-2xl p-6 mb-5";
  const SEL_BTN = (active) => `py-2.5 px-4 rounded-xl border text-sm flex items-center justify-center gap-2 transition-all ${
    active ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
  }`;

  const SUGGESTED = [
    { label: "Weekend in Goa",      city: "Goa",     days: 2, style: "beach",    budget: "midrange" },
    { label: "Budget Manali trip",  city: "Manali",  days: 4, style: "adventure",budget: "budget"   },
    { label: "Culture tour Delhi",  city: "Delhi",   days: 3, style: "culture",  budget: "midrange" },
    { label: "Luxury Jaipur escape",city: "Jaipur",  days: 3, style: "luxury",   budget: "luxury"   },
    { label: "Adventure Rishikesh", city: "Rishikesh",days: 2, style: "adventure",budget: "budget"  },
  ];

  const applyChip = (chip) => {
    setCity(chip.city);
    setDays(chip.days);
    setStyle(chip.style);
    setBudget(chip.budget);
  };

  return (
    <div className="h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="border-b border-gray-100 px-10 py-4 flex items-center justify-between shrink-0">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", color: "#000", letterSpacing: "-0.02em" }}>
          Wandrr<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back</button>
      </nav>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">

          {/* Header — only when no result */}
          {!result && !loading && (
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-4" style={{ backgroundColor: "#fff4f0", color: "#FF6B35" }}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>
                Wandrr AI
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3rem)", color: "#000", letterSpacing: "-1.5px", lineHeight: 1 }}>
                Plan your perfect trip
              </h1>
              <p className="text-gray-500 mt-2 text-sm">Pick a destination or try a suggestion below.</p>

              {/* Suggested chips */}
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {SUGGESTED.map(chip => (
                  <button
                    key={chip.label}
                    onClick={() => applyChip(chip)}
                    className="text-xs font-medium px-4 py-2 bg-white border border-gray-200 hover:border-gray-400 hover:-translate-y-0.5 rounded-full text-gray-700 transition-all duration-150"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#fff4f0" }}>
                <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none" style={{ color: "#FF6B35" }}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              </div>
              <p className="text-gray-500 text-sm">Crafting your itinerary…</p>
            </div>
          )}

          {apiError && (
            <div className="mb-5 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-sm flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              <span>{apiError}</span>
            </div>
          )}

          {result && (
            <div className={CARD}>
              {/* Wandrr AI label */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fff4f0" }}>
                  <svg viewBox="0 0 24 24" fill="#FF6B35" className="w-4 h-4"><path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                </div>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Wandrr AI</span>
                {result.source === "gemini" ? (
                  <span className="ml-auto px-2 py-0.5 text-white text-xs font-medium rounded-full" style={{ backgroundColor: "#FF6B35" }}>Gemini</span>
                ) : (
                  <span className="ml-auto px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-500 text-xs font-medium rounded-full">Local</span>
                )}
              </div>

              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.4rem", color: "#000", letterSpacing: "-0.5px" }}>
                    {result.city} — {result.days} Day{result.days > 1 ? "s" : ""} of {STYLES.find(s => s.key === result.style)?.label}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">{result.overview}</p>
                </div>
                <button onClick={handleCopy}
                  className={`ml-4 px-3 py-1.5 rounded-xl text-xs border transition-all flex-shrink-0 flex items-center gap-1.5 ${
                    copied ? "bg-green-50 border-green-200 text-green-700" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}>
                  {copied
                    ? <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>Copied</>  
                    : <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>Copy</> 
                  }
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {result.itinerary.map(({ day, morning, afternoon, evening }) => (
                  <div key={day} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <h3 className="text-gray-900 font-semibold text-sm mb-3">Day {day}</h3>
                    <div className="space-y-2">
                      {[
                        { slot: "Morning",   act: morning },
                        { slot: "Afternoon", act: afternoon },
                        { slot: "Evening",   act: evening }
                      ].map(({slot, act}) => (
                        <div key={slot} className="flex gap-3 items-start">
                          <span className="text-gray-400 text-xs w-20 flex-shrink-0 pt-0.5 uppercase tracking-wide font-medium">{slot}</span>
                          <span className="text-gray-700 text-sm">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
                <h3 className="text-gray-900 font-semibold text-sm mb-3">Budget — {BUDGETS.find(b => b.key === result.budget)?.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="text-sm text-gray-700"><span className="text-gray-500">Stay: </span>{result.stay}</div>
                  <div className="text-sm text-gray-700"><span className="text-gray-500">Food: </span>{result.food}</div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <h3 className="text-gray-900 font-semibold text-sm mb-3">Local Tips</h3>
                <ul className="space-y-1.5">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="text-gray-600 text-sm flex gap-2">
                      <span className="flex-shrink-0 mt-0.5" style={{ color: "#FF6B35" }}>•</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="h-48" />{/* spacer so content clears pinned panel */}
        </div>
      </div>

      {/* ── Pinned input panel ── */}
      <div className="border-t border-gray-100 bg-white shrink-0">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 mb-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-gray-500 text-xs font-medium mb-1">Destination</label>
              <select value={city} onChange={e => setCity(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-3 py-2 text-base focus:outline-none transition-colors" style={{ fontSize: "16px" }}>
                {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="min-w-[100px]">
              <label className="block text-gray-500 text-xs font-medium mb-1">Days — <strong>{days}</strong></label>
              <input type="range" min={1} max={7} value={days} onChange={e => setDays(Number(e.target.value))}
                className="w-full mt-1" style={{ accentColor: "#FF6B35" }} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {STYLES.map(s => (
              <button key={s.key} onClick={() => setStyle(s.key)}
                className={`flex-1 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                  style === s.key ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={style === s.key ? { backgroundColor: "#FF6B35" } : {}}>
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {BUDGETS.map(b => (
              <button key={b.key} onClick={() => setBudget(b.key)}
                className={`flex-1 py-2 px-2 rounded-xl border text-xs font-medium transition-all ${
                  budget === b.key ? "text-white border-transparent" : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
                style={budget === b.key ? { backgroundColor: "#FF6B35" } : {}}>
                {b.label}
              </button>
            ))}
          </div>
          <button onClick={handleGenerate} disabled={loading} className="btn-accent w-full py-3 rounded-xl font-medium text-sm">
            {loading ? "Crafting itinerary…" : "Generate Itinerary"}
          </button>
        </div>
      </div>
    </div>
  );
}