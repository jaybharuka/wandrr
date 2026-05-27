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
        body: JSON.stringify({ identifier: identifier.trim(), pin })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Sign in failed.");
        setLoading(false);
        return;
      }

      setUser(data.user, data.token);
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
              Sign in
            </h1>
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Username or Email *</label>
              <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} className={INPUT} placeholder="username or email" required />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">PIN *</label>
              <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} className={PIN_INPUT} placeholder="••••" required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl text-sm font-medium text-white bg-black dark:bg-white dark:text-black hover:bg-gray-900 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors"
              style={{ backgroundColor: loading ? "#ccc" : undefined }}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2a2a2a] text-center">
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-gray-900 dark:text-[#f5f5f5] font-semibold hover:underline transition-colors">
                Create one
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
