import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUsernameChange = (e) => {
    const value = e.target.value.toLowerCase().replace(/\s/g, '');
    setUsername(value);
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith("+91") && value.length > 0) {
      value = "+91" + value.replace(/^\+?91?/, "");
    }
    if (value.length <= 13) {
      setPhone(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate
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

    if (!phone.startsWith("+91") || phone.length !== 13) {
      setError("Phone must be +91 followed by 10 digits.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          phone,
          pin
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed.");
        setLoading(false);
        return;
      }

      // Store user in context and navigate
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const INPUT = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-colors text-base";
  const PIN_INPUT = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-colors text-base tracking-widest";

  return (
    <div className="min-h-screen bg-stone-50 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gray-50 border-r border-gray-100 p-12">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", color: "#000", letterSpacing: "-0.02em" }}>
          YAATRA<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>

        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2.5rem", color: "#000", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
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
                <span className="text-gray-300 mt-0.5">—</span>
                <div>
                  <p className="text-gray-900 font-medium text-sm">{f.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-400 text-xs">© 2025 YAATRA. All rights reserved.</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2rem", color: "#000", letterSpacing: "-1px" }}>
              Create account
            </h1>
            <p className="text-gray-500 text-sm mt-1">Join YAATRA and start your journey</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className={INPUT}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Username *</label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className={INPUT}
                placeholder="username (no spaces)"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={INPUT}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                className={INPUT}
                placeholder="+91XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">PIN *</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
                className={PIN_INPUT}
                placeholder="••••"
                required
              />
              <p className="text-gray-400 text-xs mt-1">4 digits</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-medium text-white bg-black hover:bg-gray-900 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: loading ? "#ccc" : "#000" }}
            >
              {loading ? "Creating account…" : "Create Account →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/signin")}
                className="text-gray-900 font-semibold hover:underline transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
