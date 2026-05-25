import React, { useState, useRef } from "react";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

export default function SignInPage() {
  const [step, setStep] = useState(1); // 1: Enter phone/email, 2: Verify OTP
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOTP] = useState("");
  const [otpBoxes, setOtpBoxes] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [userId, setUserId] = useState(null);
  const [otpType, setOtpType] = useState(null); // 'phone' or 'email'
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUserId: setUserContext } = useUser();
  const navigate = useNavigate();

  const handleInitiateSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    // Treat '+91' prefix-only as empty (user didn't actually type a number)
    const hasPhone = phone && phone !== "+91" && phone.trim().length > 3;
    const hasEmail = email && email.trim().length > 0;

    // Validate input
    if (!hasPhone && !hasEmail) {
      setErrorMessage("Please enter either your phone number or email address");
      setLoading(false);
      return;
    }

    if (hasPhone && (!phone.startsWith("+91") || phone.length !== 13)) {
      setErrorMessage("Phone number must be in format +91XXXXXXXXXX");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signin/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone || undefined, email: email || undefined }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserId(data.userId);
        setOtpType(data.otpType);
        setStep(2);
        setErrorMessage("");
      } else {
        setErrorMessage(data.error || "Failed to send OTP. Please check your credentials.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    if (!otp) {
      setErrorMessage("Please enter the OTP");
      setLoading(false);
      return;
    }

    if (otp.length !== 6) {
      setErrorMessage("OTP must be 6 digits long");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp, otpType }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserContext(data.userId);
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

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone || undefined, email: email || undefined }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setUserId(data.userId);
        setErrorMessage("OTP resent successfully!");
        setTimeout(() => setErrorMessage(""), 3000);
      } else {
        setErrorMessage(data.error || "Failed to resend OTP.");
      }
    } catch (error) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpBox = (index, value, e) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otpBoxes];
    next[index] = value;
    setOtpBoxes(next);
    const joined = next.join("");
    setOTP(joined);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpBoxes[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array.from({ length: 6 }, (_, i) => pasted[i] || "");
    setOtpBoxes(next);
    setOTP(pasted);
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
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem", color: "#000" }}>Welcome back!</h3>
            <p className="text-gray-500 text-sm mt-2">Redirecting to your dashboard…</p>
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
            Beyond horizons,<br />
            <em style={{ color: "#6F6F6F" }}>the journey awaits.</em>
          </h2>
          <div className="mt-10 space-y-5">
            {[
              { title: "Smart Trip Planning",  desc: "AI-powered recommendations for your perfect getaway" },
              { title: "Travel Companions",    desc: "Connect with like-minded travelers worldwide" },
              { title: "Seamless Booking",     desc: "Flights, hotels, and activities in one place" },
              { title: "Travel Groups",        desc: "Join or create groups for shared adventures" },
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
              {step === 1 ? "Sign in" : "Verify OTP"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {step === 1
                ? "Enter your phone number or email to continue"
                : `Enter the 6-digit code sent to your ${otpType}`}
            </p>
            {step === 2 && (
              <div className="mt-3 px-4 py-2.5 bg-orange-50 border border-orange-200 rounded-xl">
                <p className="text-sm" style={{ color: "#FF6B35" }}>Code sent to {otpType === 'phone' ? phone : email}</p>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{errorMessage}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleInitiateSignIn} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <input type="tel" value={phone} onChange={handlePhoneChange} className={INPUT} placeholder="+91XXXXXXXXXX" />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-gray-400 text-xs">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={INPUT} placeholder="you@example.com" />
              </div>
              <button type="submit" disabled={loading} className="btn-accent w-full h-11 rounded-xl text-sm font-medium">
                {loading ? "Sending code…" : "Send Code →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
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
                      onChange={e => handleOtpBox(i, e.target.value, e)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={i === 0 ? handleOtpPaste : undefined}
                      className="flex-1 min-w-0 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-2 transition-all"
                      style={{ "--tw-ring-color": "#FF6B3540", fontSize: "16px" }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={handleResendOTP} disabled={loading}
                  className="flex-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 h-11 rounded-xl text-sm font-medium disabled:opacity-50 transition-colors">
                  {loading ? "Resending…" : "Resend Code"}
                </button>
                <button type="submit" disabled={loading || otp.length < 6} className="btn-accent flex-1 h-11 rounded-xl text-sm font-medium">
                  {loading ? "Verifying…" : "Sign In →"}
                </button>
              </div>
              <button type="button" onClick={() => { setStep(1); setOtpBoxes(["","","","","",""]); setOTP(""); }}
                className="w-full text-gray-400 hover:text-gray-700 text-sm transition-colors">
                ← Back
              </button>
            </form>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-gray-900 font-semibold hover:underline transition-colors">
                Sign Up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
