import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value.toLowerCase().replace(/\s/g, ''));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!name.trim() || !username.trim() || !email.trim() || !pin.trim()) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("PIN must be exactly 4 digits.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), email: email.trim(), pin })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

      setUser(data.user);
      navigate("/menu");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const INPUT = "w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#333333] rounded-xl text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-[#333333] focus:border-gray-400 dark:focus:border-[#737373] transition-colors text-base";
  const PIN_INPUT = INPUT + " tracking-widest";

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-[#0f0f0f] flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-[#2a2a2a] p-12">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", letterSpacing: "-0.02em" }} className="text-gray-900 dark:text-[#f5f5f5]">
          WANDRR<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>

        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2.5rem", lineHeight: 1.1, letterSpacing: "-1.5px" }} className="text-gray-900 dark:text-[#f5f5f5]">
            Your next adventure<br />
            <em style={{ color: "#6F6F6F" }}>starts here.</em>
          </h2>
          <div className="mt-10 space-y-5">
            {[
              { title: "Personalized Itineraries", desc: "Custom travel plans tailored to your preferences" },
              { title: "Travel Buddy Matching", desc: "Find compatible companions for your adventures" },
              { title: "Exclusive Deals", desc: "Special travel offers and group discounts" },
              { title: "Travel Communities", desc: "Join groups and share experiences worldwide" },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-gray-300 dark:text-[#737373] mt-0.5">—</span>
                <div>
                  <p className="text-gray-900 dark:text-[#f5f5f5] font-medium text-sm">{f.title}</p>
                  <p className="text-gray-500 dark:text-[#a3a3a3] text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-400 dark:text-[#737373] text-xs">© 2025 WANDRR. All rights reserved.</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2rem", letterSpacing: "-1px" }} className="text-gray-900 dark:text-[#f5f5f5]">
              Create account
            </h1>
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mt-1">Join WANDRR and start your journey</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Full Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Your full name" required />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Username *</label>
              <input type="text" value={username} onChange={handleUsernameChange} className={INPUT} placeholder="username (no spaces)" required />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Email Address *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} placeholder="you@example.com" required />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">PIN *</label>
              <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className={PIN_INPUT} placeholder="••••" required />
              <p className="text-gray-400 dark:text-[#737373] text-xs mt-1">4 digits</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: loading ? "#ccc" : undefined }}
            >
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2a2a2a] text-center">
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm">
              Already have an account?{" "}
              <button onClick={() => navigate("/signin")} className="text-gray-900 dark:text-[#f5f5f5] font-semibold hover:underline transition-colors">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
