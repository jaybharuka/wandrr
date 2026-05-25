import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import BottomNav from "./BottomNav";

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { userId: currentUserId } = useUser();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("upcoming");
  
  // Booking states
  const [flightBookings, setFlightBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, success) => {
    setToast({ message, success });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadAllBookings();
  }, [currentUserId]);

  const loadAllBookings = async () => {
    setLoading(true);
    setError("");
    try {
      // Load flight bookings
      const flightRes = await fetch(`/api/bookings?userId=${currentUserId}`);
      const flightData = await flightRes.json();
      // Load hotel bookings
      const hotelRes = await fetch(`/api/hotelBookings?userId=${currentUserId}`);
      const hotelData = await hotelRes.json();
      // Handle different response formats
      setFlightBookings(flightData.bookings || flightData || []);
      setHotelBookings(hotelData.bookings || hotelData || []);
    } catch (err) {
      setError("Failed to load bookings. Please try again.");
      setFlightBookings([]);
      setHotelBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelFlightBooking = async (bookingId) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Flight booking cancelled.", true);
        loadAllBookings();
      } else {
        showToast("Failed to cancel flight booking.", false);
      }
    } catch (err) {
      showToast("Error cancelling flight booking.", false);
    }
  };

  const handleCancelHotelBooking = async (bookingId) => {
    try {
      const res = await fetch(`/api/hotelBookings/${bookingId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Hotel booking cancelled.", true);
        loadAllBookings();
      } else {
        showToast("Failed to cancel hotel booking.", false);
      }
    } catch (err) {
      showToast("Error cancelling hotel booking.", false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Extract travel date from booking details string
  const extractTravelDate = (booking) => {
    try {
      if (booking.type === 'flight') {
        const parts = (booking.flight_details || "").split(' | ');
        const d = new Date(parts[2]?.trim());
        if (!isNaN(d)) return d;
      } else {
        const parts = (booking.hotel_name || "").split(' | ');
        const d = new Date(parts[1]?.trim().split(' to ')[0]);
        if (!isNaN(d)) return d;
      }
    } catch {}
    return new Date(booking.booking_date || booking.created_at);
  };

  // Get all bookings combined with type indicator
  const getAllBookings = () => {
    const allBookings = [
      ...flightBookings.map(booking => ({ ...booking, type: 'flight' })),
      ...hotelBookings.map(booking => ({ ...booking, type: 'hotel' }))
    ];
    return allBookings.sort((a, b) => {
      const dateA = new Date(a.created_at || a.booking_date);
      const dateB = new Date(b.created_at || b.booking_date);
      return dateB - dateA;
    });
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getUpcomingBookings = () =>
    getAllBookings().filter(b => extractTravelDate(b) >= today && (b.status === 'active' || !b.status));

  const getPastBookings = () =>
    getAllBookings().filter(b => extractTravelDate(b) < today || b.status === 'cancelled');

  const getDaysUntil = (booking) => {
    const travelDate = extractTravelDate(booking);
    const diff = Math.round((travelDate - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) return null;
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `in ${diff} day${diff !== 1 ? 's' : ''}`;
  };

  const parseFlightRoute = (details) => {
    if (!details) return null;
    const m = details.match(/([A-Z]{3})\s*[\-→]\s*([A-Z]{3})/i);
    if (m) return { from: m[1].toUpperCase(), to: m[2].toUpperCase() };
    return null;
  };

  const renderBookingCard = (booking) => {
    const isFlightBooking = booking.type === 'flight';
    const cancelHandler = isFlightBooking ? handleCancelFlightBooking : handleCancelHotelBooking;
    const travelDate = extractTravelDate(booking);
    const isPast = travelDate < today || booking.status === 'cancelled';
    const countdown = getDaysUntil(booking);
    const flightRoute = isFlightBooking ? parseFlightRoute(booking.flight_details) : null;

    return (
      <div key={`${booking.type}-${booking.booking_id}`}
        className={`bg-white border border-gray-200 rounded-xl p-6 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 ${
          isPast ? 'opacity-60' : ''
        }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isPast ? '#f3f4f6' : '#fff4f0' }}>
              {isFlightBooking
                ? <svg viewBox="0 0 24 24" fill="none" stroke={isPast ? '#9ca3af' : '#FF6B35'} strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                : <svg viewBox="0 0 24 24" fill="none" stroke={isPast ? '#9ca3af' : '#FF6B35'} strokeWidth="1.8" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
              }
            </div>
            <div>
              <h3 className="text-gray-900 font-semibold text-sm">
                {isFlightBooking ? 'Flight' : 'Hotel'}
              </h3>
              <p className="text-gray-400 text-xs">#{booking.booking_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {countdown && !isPast && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#fff4f0', color: '#FF6B35' }}>{countdown}</span>
            )}
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              booking.status === 'cancelled'
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {booking.status || 'Active'}
            </span>
          </div>
        </div>

        {/* Flight route visualization */}
        {isFlightBooking && flightRoute && (
          <div className="flex items-center justify-center gap-3 bg-gray-50 rounded-xl px-6 py-4 mb-4">
            <div className="text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">From</p>
              <p className="text-gray-900 font-bold text-lg font-mono">{flightRoute.from}</p>
            </div>
            <div className="flex-1 flex items-center gap-1 text-gray-300">
              <div className="h-px flex-1 bg-gray-200" />
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" className="w-5 h-5 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">To</p>
              <p className="text-gray-900 font-bold text-lg font-mono">{flightRoute.to}</p>
            </div>
          </div>
        )}

        <div className="space-y-1 mb-4 text-sm">
          <p className="text-gray-700"><span className="text-gray-500">Destination: </span>{booking.destination}</p>
          {isFlightBooking
            ? <p className="text-gray-700"><span className="text-gray-500">Details: </span>{booking.flight_details}</p>
            : <p className="text-gray-700"><span className="text-gray-500">Hotel: </span>{booking.hotel_name}</p>}
          <p className="text-gray-700"><span className="text-gray-500">Travel Date: </span>{travelDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>

        {(booking.status === 'active' || !booking.status) && (
          <button onClick={() => cancelHandler(booking.booking_id)}
            className="text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-1.5 rounded-lg transition-colors">
            Cancel
          </button>
        )}
      </div>
    );
  };

  const EMPTY_SVG = {
    upcoming: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
    past: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    flights: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>,
    hotels: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>,
  };

  const renderBookingsList = (bookingsList, emptyMessage) => (
    <div>
      {bookingsList.length === 0 ? (
        <div className="text-center border border-dashed border-gray-200 rounded-xl py-16 px-8">
          <div className="mb-4">{EMPTY_SVG[activeTab] || EMPTY_SVG.upcoming}</div>
          <p className="text-gray-700 font-medium mb-1">{emptyMessage.split(".")[0]}</p>
          <p className="text-gray-400 text-sm mb-5">{emptyMessage.split(".").slice(1).join(".").trim() || "Check back later or plan a new trip!"}</p>
          <button onClick={() => navigate("/plan-bookings")} className="btn-accent px-5 py-2.5 rounded-xl text-sm font-medium">
            Plan a Trip
          </button>
        </div>
      ) : (
        <div className="grid gap-4">{bookingsList.map(renderBookingCard)}</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading your bookings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          toast.success ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {toast.message}
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
            My Bookings
          </h1>
          <p className="text-gray-500 text-sm mt-2">Your flight and hotel booking history</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1 flex-wrap justify-center">
            {[
              { key: "upcoming", label: `Upcoming (${getUpcomingBookings().length})` },
              { key: "past",     label: `Past (${getPastBookings().length})` },
              { key: "flights",  label: `Flights (${flightBookings.length})` },
              { key: "hotels",   label: `Hotels (${hotelBookings.length})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[300px]">
          {activeTab === "upcoming" && renderBookingsList(getUpcomingBookings(), "No upcoming bookings. Time to plan your next adventure!")}
          {activeTab === "past" && renderBookingsList(getPastBookings(), "No past bookings yet.")}
          {activeTab === "flights" && renderBookingsList(flightBookings.map(b => ({ ...b, type: 'flight' })), "No flight bookings yet.")}
          {activeTab === "hotels" && renderBookingsList(hotelBookings.map(b => ({ ...b, type: 'hotel' })), "No hotel bookings yet.")}
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <button onClick={() => navigate("/plan-bookings")}
            className="btn-accent h-11 px-8 rounded-xl text-sm font-medium w-full sm:w-auto">
            Plan New Booking
          </button>
          <button onClick={() => navigate(-1)}
            className="bg-white border border-gray-200 hover:border-gray-400 text-gray-700 h-11 px-8 rounded-xl text-sm font-medium transition-colors w-full sm:w-auto">
            Back to Menu
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default MyBookingsPage;