import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export default function SignUpPage() {
  const { setUserId: setUserContext } = useUser();
  const [step, setStep] = useState(1); // 1: Enter details, 2: Verify Email OTP
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [emailOTP, setEmailOTP] = useState("");
  const [otpBoxes, setOtpBoxes] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [userId, setUserId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInitiateSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    // Client-side validation
    if (!name.trim()) {
      setErrorMessage("Name is required");
      setLoading(false);
      return;
    }

    if (phone && phone !== "+91" && phone.trim().length > 3) {
      if (!phone.startsWith("+91") || phone.length !== 13) {
        setErrorMessage("Phone number must be +91 followed by 10 digits");
        setLoading(false);
        return;
      }
    }

    if (!email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/signup/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: (phone && phone !== "+91" && phone.length === 13) ? phone : undefined, email: email.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserId(data.userId);
        setStep(2);
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Signup initiation failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTPs = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!emailOTP) {
      setErrorMessage("Please enter email OTP");
      setLoading(false);
      return;
    }

    if (emailOTP.length !== 6) {
      setErrorMessage("OTP must be 6 digits long");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/auth/signup/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, emailOTP })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserContext(data.user?.id);
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate("/menu");
        }, 1500);
      } else {
        setErrorMessage(data.error || "OTP verification failed. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTPs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/signup/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || undefined, email: email.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserId(data.userId);
        setErrorMessage("OTPs resent successfully!");
        setTimeout(() => setErrorMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "Failed to resend OTPs.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpBox = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpBoxes];
    next[index] = value;
    setOtpBoxes(next);
    setEmailOTP(next.join(""));
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpBoxes[index] && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
    setOtpBoxes(next);
    setEmailOTP(pasted);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value;
    
    // Auto-add +91 if not present
    if (!value.startsWith("+91") && value.length > 0) {
      value = "+91" + value.replace(/^\+?91?/, "");
    }
    
    // Limit to +91 + 10 digits
    if (value.length <= 13) {
      setPhone(value);
    }
  };

  const INPUT = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-colors text-base";

  return (
    <div className="min-h-screen bg-stone-50 flex" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-xl text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#fff4f0" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2.5" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
            </div>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem", color: "#000" }}>Account created!</h3>
            <p className="text-gray-500 text-sm mt-2">Welcome to Wandrr! Redirecting…</p>
            <div className="w-full bg-gray-100 rounded-full h-1 mt-4">
              <div className="h-1 rounded-full w-full" style={{ backgroundColor: "#FF6B35" }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Left — branding panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gray-50 border-r border-gray-100 p-12">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", color: "#000", letterSpacing: "-0.02em" }}>
          Wandrr<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>

        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2.5rem", color: "#000", lineHeight: 1.1, letterSpacing: "-1.5px" }}>
            Your next adventure<br />
            <em style={{ color: "#6F6F6F" }}>starts here.</em>
          </h2>
          <div className="mt-10 space-y-5">
            {[
              { title: "Personalized Itineraries", desc: "Custom travel plans tailored to your preferences" },
              { title: "Travel Buddy Matching",    desc: "Find compatible companions for your adventures" },
              { title: "Exclusive Deals",          desc: "Special travel offers and group discounts" },
              { title: "Travel Communities",       desc: "Join groups and share experiences worldwide" },
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

        <p className="text-gray-400 text-xs">© 2025 Wandrr. All rights reserved.</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2rem", color: "#000", letterSpacing: "-1px" }}>
              {step === 1 ? "Create account" : "Verify your email"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1
                ? "Fill in your details to get started"
                : "Enter the OTP sent to your email address"}
            </p>
            {step === 2 && (
              <div className="mt-3 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm" style={{ color: "#FF6B35" }}>Code sent to {email}</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleInitiateSignUp} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Full Name *</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={INPUT} placeholder="Your full name" required />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="tel" value={phone} onChange={handlePhoneChange} className={INPUT} placeholder="+91XXXXXXXXXX" />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} placeholder="you@example.com" required />
              </div>
              <button type="submit" disabled={loading} className="btn-accent w-full h-11 rounded-xl text-sm font-medium">
                {loading ? "Sending code…" : "Continue →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTPs} className="space-y-6">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-3">6-digit code</label>
                <div className="flex gap-1.5 sm:gap-2 justify-between">
                  {otpBoxes.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => otpRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpBox(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="flex-1 min-w-0 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 transition-all"
                      style={{ fontSize: "16px" }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleResendOTPs} disabled={loading}
                  className="flex-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 h-11 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                  {loading ? "Resending…" : "Resend Code"}
                </button>
                <button type="submit" disabled={loading || emailOTP.length < 6} className="btn-accent flex-1 h-11 rounded-xl text-sm font-medium">
                  {loading ? "Verifying…" : "Create Account →"}
                </button>
              </div>
              <button type="button" onClick={() => { setStep(1); setOtpBoxes(["","","","","",""]); setEmailOTP(""); }}
                className="w-full text-gray-400 hover:text-gray-700 text-sm transition-colors">
                ← Back
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{" "}
              <button onClick={() => navigate("/signin")} className="text-gray-900 font-semibold hover:underline transition-colors">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}