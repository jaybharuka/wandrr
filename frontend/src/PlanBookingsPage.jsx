import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "./UserContext";

const DESTINATIONS = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata",
  "Pune", "Jaipur", "Ahmedabad", "Goa", "Ladakh", "Manali",
  "Varanasi", "Agra", "Rishikesh", "Darjeeling", "Kochi", "Mysore"
];

const AIRLINE_FILTER_OPTIONS = ["IndiGo", "Air India", "SpiceJet", "Vistara", "Emirates", "Singapore Airlines", "Qatar Airways"];

const today = new Date().toISOString().split("T")[0];

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function nightsBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

function StarRating({ stars }) {
  return (
    <span className="text-yellow-400 text-sm">
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
}

const PlanBookingsPage = () => {
  const locationObj = useLocation();
  const { destination, selectedDestination } = locationObj.state || {};
  const { userId: currentUserId } = useUser();
  const navigate = useNavigate();

  // Tab
  const [activeTab, setActiveTab] = useState("flights");

  // Flight search fields
  const [fromCity, setFromCity] = useState("Mumbai");
  const [toCity, setToCity] = useState(destination || selectedDestination || "Delhi");
  const [travelDate, setTravelDate] = useState(todayPlus(3));
  const [passengers, setPassengers] = useState(1);
  const [airlineFilter, setAirlineFilter] = useState("");
  const [flights, setFlights] = useState([]);
  const [loadingFlights, setLoadingFlights] = useState(false);
  const [flightError, setFlightError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [bookingFlight, setBookingFlight] = useState(null);

  // Hotel search fields
  const [checkIn, setCheckIn] = useState(todayPlus(3));
  const [checkOut, setCheckOut] = useState(todayPlus(5));
  const [guests, setGuests] = useState(1);
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [hotelError, setHotelError] = useState("");
  const [bookingHotel, setBookingHotel] = useState(null);

  // Feedback
  const [toast, setToast] = useState(null); // { message, success }

  const showToast = (message, success) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch hotels from DB whenever destination changes
  useEffect(() => {
    if (!toCity) return;
    setLoadingHotels(true);
    setHotelError("");
    setHotels([]);
    fetch(`/api/hotels?city=${encodeURIComponent(toCity)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.hotels && data.hotels.length > 0) {
          setHotels(data.hotels.map((h) => ({
            id: h.id,
            name: h.name,
            stars: h.stars,
            pricePerNight: h.price_per_night,
            description: h.description,
            amenities: h.amenities,
          })));
        } else {
          setHotelError(`No hotels found for ${toCity} in the database.`);
        }
      })
      .catch(() => setHotelError("Failed to load hotels. Please try again."))
      .finally(() => setLoadingHotels(false));
  }, [toCity]);

  const searchFlights = async () => {
    if (!fromCity || !toCity || !travelDate) return;
    setLoadingFlights(true);
    setFlightError("");
    setFlights([]);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/flights/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: fromCity, to: toCity, date: travelDate, passengers }),
      });
      const data = await res.json();
      if (res.ok) {
        setFlights(data.flights || []);
        if ((data.flights || []).length === 0) setFlightError("No flights found for this route and date.");
      } else {
        setFlightError(data.error || "Flight search failed.");
      }
    } catch {
      setFlightError("Network error. Please check your connection.");
    } finally {
      setLoadingFlights(false);
    }
  };

  const filteredFlights = airlineFilter
    ? flights.filter((f) => f.airline.toLowerCase().includes(airlineFilter.toLowerCase()))
    : flights;

  const handleBookFlight = async (flight) => {
    if (!currentUserId) { showToast("Please sign in to book.", false); return; }
    setBookingFlight(flight.flight_no);
    const totalFare = (flight.fare * passengers).toFixed(2);
    const details = `${flight.airline} ${flight.flight_no} | ${fromCity} → ${toCity} | ${travelDate} | Dep: ${flight.dep} Arr: ${flight.arr} (${flight.duration}, ${flight.stops}) | ${flight.currency} ${totalFare}`;
    try {
      const res = await fetch(`/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          destination: toCity,
          flight_details: details,
          booking_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        }),
      });
      const data = await res.json();
      if (res.ok) showToast(`✈️ ${flight.airline} ${flight.flight_no} booked for ${passengers} pax!`, true);
      else showToast(data.error || "Booking failed. Please try again.", false);
    } catch {
      showToast("Network error. Please check your connection.", false);
    } finally {
      setBookingFlight(null);
    }
  };

  const formatFare = (fare, currency) => {
    if (currency === "INR") return `₹${fare.toLocaleString("en-IN")}`;
    return `${currency} ${fare.toLocaleString()}`;
  };

  const handleBookHotel = async (hotel) => {
    if (!currentUserId) { showToast("Please sign in to book.", false); return; }
    const nights = nightsBetween(checkIn, checkOut);
    if (nights < 1) { showToast("Check-out must be after check-in.", false); return; }
    setBookingHotel(hotel.name);
    try {
      const res = await fetch(`/api/hotelBookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          destination: toCity,
          hotel_name: `${hotel.name} | ${checkIn} to ${checkOut} (${nights} nights, ${guests} guest${guests > 1 ? "s" : ""}) | ₹${hotel.pricePerNight * nights * guests}`,
          booking_date: new Date().toISOString().slice(0, 19).replace("T", " "),
        }),
      });
      const data = await res.json();
      if (res.ok) showToast(`🏨 ${hotel.name} booked for ${nights} night${nights > 1 ? "s" : ""}!`, true);
      else showToast(data.error || "Booking failed. Please try again.", false);
    } catch {
      showToast("Network error. Please check your connection.", false);
    } finally {
      setBookingHotel(null);
    }
  };

  const nights = nightsBetween(checkIn, checkOut);

  const SEL = "w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors";
  const LBL = "text-gray-500 text-xs font-medium uppercase tracking-wider mb-1.5 block";

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border flex items-center gap-2 ${
          toast.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          <span>{toast.success ? "✓" : "✕"}</span>
          <p>{toast.message}</p>
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", color: "#000", letterSpacing: "-0.02em" }}>
          Wandrr<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back</button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3rem)", color: "#000", letterSpacing: "-1.5px", lineHeight: 1 }}>
            Plan Your Trip
          </h1>
          <p className="text-gray-500 text-sm mt-2">Search and book flights & hotels</p>
        </div>

        {/* Tabs — animated underline style */}
        <div className="flex justify-center mb-8">
          <div className="flex border-b border-gray-200 gap-1">
            {[
              { id: "flights", label: "Flights" },
              { id: "hotels",  label: "Hotels" },
              { id: "taxi",    label: "Taxi" },
              { id: "rent",    label: "Rent" },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 sm:px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id ? "text-gray-900" : "text-gray-400 hover:text-gray-700"
                }`}>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full" style={{ backgroundColor: "#FF6B35" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── FLIGHTS ── */}
        {activeTab === "flights" && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 font-semibold text-sm mb-5">Search Flights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className={LBL}>From</label>
                  <select value={fromCity} onChange={e => { setFromCity(e.target.value); setHasSearched(false); setFlights([]); }} className={SEL}>
                    {DESTINATIONS.filter(d => d !== toCity).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LBL}>To</label>
                  <select value={toCity} onChange={e => { setToCity(e.target.value); setHasSearched(false); setFlights([]); }} className={SEL}>
                    {DESTINATIONS.filter(d => d !== fromCity).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LBL}>Date</label>
                  <input type="date" value={travelDate} min={today}
                    onChange={e => { setTravelDate(e.target.value); setHasSearched(false); setFlights([]); }} className={SEL} />
                </div>
                <div>
                  <label className={LBL}>Passengers</label>
                  <select value={passengers} onChange={e => { setPassengers(Number(e.target.value)); setHasSearched(false); setFlights([]); }} className={SEL}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? "passenger" : "passengers"}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className={LBL}>Filter by Airline (optional)</label>
                  <select value={airlineFilter} onChange={e => setAirlineFilter(e.target.value)} className={SEL}>
                    <option value="">All Airlines</option>
                    {AIRLINE_FILTER_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <button onClick={searchFlights} disabled={loadingFlights} className="btn-accent disabled:opacity-50 h-11 px-8 rounded-xl text-sm font-medium">
                  {loadingFlights ? "Searching…" : "Search Flights"}
                </button>
              </div>
            </div>

            {loadingFlights && (
              <div className="text-center py-14">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Searching live flights via Duffel…</p>
              </div>
            )}
            {!loadingFlights && flightError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <p className="text-red-600 text-sm">{flightError}</p>
              </div>
            )}
            {!loadingFlights && !flightError && !hasSearched && (
              <div className="text-center py-14 text-gray-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-gray-200"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                <p className="text-sm">Set your route and hit <span className="text-gray-900 font-semibold">Search</span> to find live flights.</p>
              </div>
            )}
            {!loadingFlights && !flightError && filteredFlights.length > 0 && (
              <>
                <div className="flex items-center justify-between px-1">
                  <p className="text-gray-700 text-sm font-medium">{fromCity} → {toCity} · {travelDate} · {passengers} pax</p>
                  <p className="text-gray-400 text-xs">{filteredFlights.length}{filteredFlights.length < flights.length ? ` of ${flights.length}` : ""} flights</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFlights.map((flight, i) => {
                    const initials = flight.airline.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
                    return (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">{initials}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-semibold text-sm truncate">{flight.airline}</p>
                          <p className="text-gray-400 text-xs">{flight.flight_no}</p>
                        </div>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          flight.stops === "Non-stop" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                        }`}>{flight.stops}</span>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                          <p className="text-gray-900 font-bold text-2xl">{flight.dep}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{fromCity}</p>
                        </div>
                        <div className="flex-1 flex flex-col items-center px-2">
                          <p className="text-gray-400 text-xs mb-1">{flight.duration}</p>
                          <div className="w-full flex items-center gap-1">
                            <div className="h-px flex-1 bg-gray-200" />
                            <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" className="w-4 h-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                            <div className="h-px flex-1 bg-gray-200" />
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-900 font-bold text-2xl">{flight.arr}</p>
                          <p className="text-gray-400 text-xs mt-0.5">{toCity}</p>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-lg" style={{ color: '#FF6B35' }}>{formatFare(flight.fare * passengers, flight.currency)}</p>
                          {passengers > 1 && <p className="text-gray-400 text-xs">{formatFare(flight.fare, flight.currency)} × {passengers}</p>}
                        </div>
                        <button onClick={() => handleBookFlight(flight)} disabled={bookingFlight === flight.flight_no} className="btn-accent disabled:opacity-50 py-2 px-5 rounded-lg text-sm font-medium">
                          {bookingFlight === flight.flight_no ? "Booking…" : "Book"}
                        </button>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── HOTELS ── */}
        {activeTab === "hotels" && (
          <div className="space-y-5">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-gray-900 font-semibold text-sm mb-5">Search Hotels</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className={LBL}>Destination</label>
                  <select value={toCity} onChange={e => setToCity(e.target.value)} className={SEL}>
                    {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LBL}>Check-in</label>
                  <input type="date" value={checkIn} min={today}
                    onChange={e => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        const d = new Date(e.target.value);
                        d.setDate(d.getDate() + 1);
                        setCheckOut(d.toISOString().split("T")[0]);
                      }
                    }} className={SEL} />
                </div>
                <div>
                  <label className={LBL}>Check-out</label>
                  <input type="date" value={checkOut} min={checkIn} onChange={e => setCheckOut(e.target.value)} className={SEL} />
                </div>
                <div>
                  <label className={LBL}>Guests</label>
                  <select value={guests} onChange={e => setGuests(Number(e.target.value))} className={SEL}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? "guest" : "guests"}</option>)}
                  </select>
                </div>
              </div>
              {nights > 0 && <p className="text-gray-400 text-xs mt-3">{nights} night{nights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}</p>}
            </div>

            {loadingHotels && (
              <div className="text-center py-14">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-400 text-sm">Loading hotels for {toCity}…</p>
              </div>
            )}
            {!loadingHotels && hotelError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <p className="text-red-600 text-sm">{hotelError}</p>
              </div>
            )}
            {!loadingHotels && !hotelError && (
              nights < 1 ? (
                <div className="text-center py-10 text-gray-400 text-sm">Set valid check-in and check-out dates to see hotels.</div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {hotels.map(hotel => {
                    const total = hotel.pricePerNight * nights * guests;
                    return (
                      <div key={hotel.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col hover:shadow-sm transition-all">
                        <div className="mb-2">
                          <h3 className="text-gray-900 font-semibold text-sm leading-tight mb-1">{hotel.name}</h3>
                          <StarRating stars={hotel.stars} />
                        </div>
                        {hotel.description && <p className="text-gray-400 text-xs mb-3 line-clamp-2">{hotel.description}</p>}
                        {hotel.amenities && <p className="text-gray-400 text-xs mb-3">{hotel.amenities.split(",").slice(0,3).map(a => a.trim()).join(" · ")}</p>}
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-3 text-xs space-y-1">
                          <div className="flex justify-between text-gray-600"><span>Check-in</span><span className="font-medium">{checkIn}</span></div>
                          <div className="flex justify-between text-gray-600"><span>Check-out</span><span className="font-medium">{checkOut}</span></div>
                          <div className="text-gray-400">₹{hotel.pricePerNight.toLocaleString("en-IN")} × {nights}n × {guests}g</div>
                        </div>
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <p className="text-gray-900 font-bold">₹{total.toLocaleString("en-IN")}</p>
                            <p className="text-gray-400 text-xs">total incl. taxes</p>
                          </div>
                          <button onClick={() => handleBookHotel(hotel)} disabled={bookingHotel === hotel.name} className="btn-accent disabled:opacity-50 py-2 px-4 rounded-lg text-sm font-medium">
                            {bookingHotel === hotel.name ? "Booking…" : "Book"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>
        )}

        {/* ── TAXI ── */}
        {activeTab === "taxi" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem", color: "#000" }}>Taxi Booking</h3>
              <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4 mb-5">
                <p className="text-amber-700 font-medium text-sm mb-1">Coming Soon</p>
                <p className="text-gray-500 text-xs">Quick and reliable rides around {toCity} are on the way!</p>
              </div>
              <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl text-sm border border-gray-200 cursor-not-allowed">Coming Soon</button>
            </div>
          </div>
        )}

        {/* ── RENT ── */}
        {activeTab === "rent" && (
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem", color: "#000" }}>Vehicle Rental</h3>
              <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4 mb-5">
                <p className="text-green-700 font-medium text-sm mb-1">Coming Soon</p>
                <p className="text-gray-500 text-xs">Self-drive rentals — explore {toCity} at your own pace!</p>
              </div>
              <button disabled className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl text-sm border border-gray-200 cursor-not-allowed">Coming Soon</button>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-center gap-3">
          <button onClick={() => navigate("/my-bookings")} className="btn-accent py-3 px-8 rounded-xl text-sm font-medium">
            My Bookings
          </button>
          <button onClick={() => navigate(-1)}
            className="bg-white border border-gray-200 hover:border-gray-400 text-gray-700 py-3 px-8 rounded-xl text-sm font-medium transition-colors">
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanBookingsPage;