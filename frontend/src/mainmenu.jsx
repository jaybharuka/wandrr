import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import BottomNav from "./BottomNav";
import { Sun, Moon } from "lucide-react";
import {
  Users, Heart, Globe, Sparkles,
  PlaneTakeoff, BookOpen, User, LogOut, Check
} from "lucide-react";

const DESTINATIONS = [
  "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad", "Kolkata",
  "Pune", "Jaipur", "Ahmedabad", "Goa", "Ladakh", "Manali",
  "Varanasi", "Agra", "Rishikesh", "Darjeeling", "Kochi", "Mysore"
];

const ICON_BOX = "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0";

export default function MainMenu() {
  const navigate = useNavigate();
  const { userId, setUserId, darkMode, toggleDarkMode } = useUser();
  const [selectedDestination, setSelectedDestination] = useState("Delhi");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!userId) { navigate("/signin"); return; }
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(d => setUserName(d.name ? d.name.split(" ")[0] : ""))
      .catch(() => {});
  }, [userId, navigate]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const CARD = "group flex items-center gap-4 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#333333] hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none rounded-2xl py-5 px-6 transition-all duration-200 cursor-pointer text-left w-full";

  const LEFT_CARDS = [
    { label: "Solo Travellers", desc: "Find travel companions", Icon: Users,       color: "bg-orange-50 text-orange-500", action: () => navigate("/tinder", { state: { location: selectedDestination, loggedInUserId: userId } }) },
    { label: "Your Matches",    desc: "Connected travellers",  Icon: Heart,        color: "bg-rose-50 text-rose-500",    action: () => navigate("/matches", { state: { loggedInUserId: userId } }) },
    { label: "Travel Groups",   desc: "Join group adventures", Icon: Globe,        color: "bg-blue-50 text-blue-500",    action: () => navigate("/travel-groups", { state: { selectedLocation: selectedDestination } }) },
    { label: "AI Travel Agent", desc: "AI-powered itineraries",Icon: Sparkles,     color: "bg-purple-50 text-purple-500",action: () => navigate("/ai-agent") },
  ];

  const RIGHT_CARDS = [
    { label: "Plan Bookings", desc: "Flights & Hotels",     Icon: PlaneTakeoff, color: "bg-sky-50 text-sky-500",      action: () => navigate("/plan-bookings", { state: { currentUserId: userId, destination: selectedDestination } }) },
    { label: "My Bookings",   desc: "Manage reservations",  Icon: BookOpen,     color: "bg-green-50 text-green-600",  action: () => navigate("/my-bookings") },
    { label: "My Profile",    desc: "View & edit account",  Icon: User,         color: "bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-[#a3a3a3]",   action: () => navigate("/profile") },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pb-20 sm:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Top nav bar ── */}
      <nav className="border-b border-gray-100 dark:border-[#2a2a2a] px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", letterSpacing: "-0.02em" }} className="text-gray-900 dark:text-[#f5f5f5]">
          Wandrr<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>
        <div className="flex items-center gap-3">
          <button onClick={toggleDarkMode} className="text-gray-400 dark:text-[#737373] hover:text-gray-700 dark:hover:text-[#f5f5f5] transition-colors p-2 rounded-full border border-gray-200 dark:border-[#2a2a2a]">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => { setUserId(null); navigate('/signin'); }}
            className="text-sm text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-[#f5f5f5] transition-colors border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-400 dark:hover:border-[#333333] rounded-full px-5 py-2 flex items-center gap-2"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>

      {/* ── Mobile layout (< lg) ── */}
      <div className="lg:hidden px-4 py-8 max-w-2xl mx-auto">
        <div className="text-center mb-6">
          {userName && (
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mb-3 flex items-center justify-center gap-1.5">
              <PlaneTakeoff size={14} className="text-orange-400" />
              {greeting()}, {userName}
            </p>
          )}
          <h1 className="mb-2" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(2.8rem, 12vw, 5rem)", lineHeight: 0.95, letterSpacing: "-2px" }} className="text-gray-900 dark:text-[#f5f5f5]">Wandrr</h1>
          <p className="text-gray-500 dark:text-[#a3a3a3] text-base mb-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}>Your smart travel planner</p>
          <p className="text-gray-400 dark:text-[#737373] text-xs mb-5">Discover · Connect · Explore · Adventure</p>
          <div className="relative inline-block mb-5">
            <select value={selectedDestination} onChange={e => setSelectedDestination(e.target.value)}
              className="appearance-none bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#333333] hover:border-gray-500 dark:hover:border-[#737373] text-gray-900 dark:text-[#f5f5f5] text-base font-medium px-6 py-3 pr-10 rounded-full focus:outline-none cursor-pointer transition-colors" style={{ fontSize: "16px" }}>
              {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-[#737373] text-xs">▼</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...LEFT_CARDS, ...RIGHT_CARDS].map(({ label, desc, Icon, color, action }) => (
            <button key={label} className="flex flex-col items-start gap-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#333333] hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none rounded-2xl p-4 transition-all duration-200 cursor-pointer text-left w-full" onClick={action}>
              <div className={`${ICON_BOX} ${color}`}><Icon size={18} /></div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-sm">{label}</p>
                <p className="text-gray-500 dark:text-[#a3a3a3] text-xs mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
          <button className="flex flex-col items-start gap-2 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:-translate-y-0.5 rounded-2xl p-4 transition-all duration-200 cursor-pointer text-left w-full" onClick={() => { setUserId(null); navigate('/signin'); }}>
            <div className={`${ICON_BOX} bg-red-50 text-red-400`}><LogOut size={18} /></div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-sm">Logout</p>
              <p className="text-gray-500 dark:text-[#a3a3a3] text-xs mt-0.5">Sign out safely</p>
            </div>
          </button>
        </div>
      </div>

      {/* ── Desktop layout (lg+) ── */}
      <div className="hidden lg:flex items-start justify-between max-w-7xl mx-auto px-10 py-12 gap-8">

        {/* ── Left feature cards ── */}
        <div className="flex flex-col gap-3 w-72 flex-shrink-0">
          {LEFT_CARDS.map(({ label, desc, Icon, color, action }) => (
            <button key={label} className={CARD} onClick={action}>
              <div className={`${ICON_BOX} ${color}`}><Icon size={18} /></div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-sm">{label}</p>
                <p className="text-gray-500 dark:text-[#a3a3a3] text-xs mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* ── Center hero ── */}
        <div className="flex flex-col items-center justify-center flex-1 text-center py-8">
          {userName && (
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mb-4 flex items-center gap-1.5">
              <PlaneTakeoff size={14} className="text-orange-400" />
              {greeting()}, {userName}
            </p>
          )}
          <h1 className="mb-3 text-gray-900 dark:text-[#f5f5f5]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(4rem, 9vw, 7.5rem)", lineHeight: 0.95, letterSpacing: "-3px" }}
          >
            Wandrr
          </h1>
          <p className="text-gray-500 dark:text-[#a3a3a3] text-lg tracking-wide mb-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic" }}>
            Your smart travel planner
          </p>
          <p className="text-gray-400 dark:text-[#737373] text-sm mb-10">Discover · Connect · Explore · Adventure</p>

          <div className="mb-6">
            <p className="text-gray-400 dark:text-[#737373] text-xs uppercase tracking-widest mb-3">Where are you heading?</p>
            <div className="relative inline-block">
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="appearance-none bg-white dark:bg-[#1e1e1e] border border-gray-300 dark:border-[#333333] hover:border-gray-500 dark:hover:border-[#737373] text-gray-900 dark:text-[#f5f5f5] text-base font-medium px-6 py-3 pr-10 rounded-full focus:outline-none cursor-pointer transition-colors"
              >
                {DESTINATIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-[#737373] text-xs">▼</span>
            </div>
          </div>

          <div className="flex gap-3 flex-wrap justify-center">
            {["Smart Matching", "Easy Booking", "Travel Groups"].map(f => (
              <span key={f} className="text-xs text-gray-500 dark:text-[#a3a3a3] border border-gray-200 dark:border-[#2a2a2a] rounded-full px-4 py-1.5 flex items-center gap-1.5">
                <Check size={11} className="text-orange-400" />{f}
              </span>
            ))}
          </div>
        </div>

        {/* ── Right feature cards ── */}
        <div className="flex flex-col gap-3 w-72 flex-shrink-0">
          {RIGHT_CARDS.map(({ label, desc, Icon, color, action }) => (
            <button key={label} className={CARD} onClick={action}>
              <div className={`${ICON_BOX} ${color}`}><Icon size={18} /></div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-[#f5f5f5] text-sm">{label}</p>
                <p className="text-gray-500 dark:text-[#a3a3a3] text-xs mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
          <button
            className="group flex items-center gap-4 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:-translate-y-0.5 rounded-2xl py-5 px-6 transition-all duration-200 cursor-pointer text-left w-full"
            onClick={() => { setUserId(null); navigate('/signin'); }}
          >
            <div className={`${ICON_BOX} bg-red-50 text-red-400 group-hover:bg-red-100`}><LogOut size={18} /></div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-[#f5f5f5] group-hover:text-red-600 text-sm">Logout</p>
              <p className="text-gray-500 dark:text-[#a3a3a3] text-xs mt-0.5">Sign out safely</p>
            </div>
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
