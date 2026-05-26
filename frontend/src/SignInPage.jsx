import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function SignInPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();

  const [identifier, setIdentifier] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!identifier.trim() || !pin.trim()) {
      setError("Username/email and PIN are required.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          pin
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed.");
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
            Welcome back<br />
            <em style={{ color: "#6F6F6F" }}>to your adventures.</em>
          </h2>
          <div className="mt-10 space-y-5">
            {[
              { title: "Smart Trip Planning", desc: "AI-powered recommendations for your perfect getaway" },
              { title: "Travel Companions", desc: "Connect with like-minded travelers worldwide" },
              { title: "Seamless Booking", desc: "Flights, hotels, and activities in one place" },
              { title: "Travel Groups", desc: "Join or create groups for shared adventures" },
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
              Sign in
            </h1>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Username or Email *</label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                className={INPUT}
                placeholder="username or email"
                required
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-medium text-white bg-black hover:bg-gray-900 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: loading ? "#ccc" : "#000" }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-gray-900 font-semibold hover:underline transition-colors"
              >
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
