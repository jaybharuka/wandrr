import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

const VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

const FADE_DURATION = 0.5;

const NAV_LINKS = [
  { label: "Home",     color: "#000000", href: "#" },
  { label: "Discover", color: "#6F6F6F", href: "#" },
  { label: "Groups",   color: "#6F6F6F", href: "#" },
  { label: "AI Agent", color: "#6F6F6F", href: "#" },
  { label: "Connect",  color: "#6F6F6F", href: "#" },
];

const AVATARS = [
  { initials: "R", bg: "#fce7f3", color: "#9d174d" },
  { initials: "A", bg: "#fef3c7", color: "#92400e" },
  { initials: "S", bg: "#dbeafe", color: "#1e40af" },
  { initials: "T", bg: "#ccfbf1", color: "#115e59" },
  { initials: "M", bg: "#ede9fe", color: "#5b21b6" },
];

export default function LandingPage() {
  const navigate  = useNavigate();
  const { userId } = useUser();
  const videoRef  = useRef(null);
  const rafRef    = useRef(null);

  // Already signed in → skip landing
  useEffect(() => {
    if (userId) navigate("/menu", { replace: true });
  }, [userId, navigate]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tick = () => {
      const { currentTime, duration } = video;
      if (duration && duration > 0) {
        if (currentTime < FADE_DURATION) {
          video.style.opacity = currentTime / FADE_DURATION;
        } else if (currentTime > duration - FADE_DURATION) {
          video.style.opacity = Math.max(0, (duration - currentTime) / FADE_DURATION);
        } else {
          video.style.opacity = 1;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    const handleEnded = () => {
      video.style.opacity = 0;
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
      }, 100);
    };

    video.addEventListener("ended", handleEnded);
    video.play().catch(() => {});
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: "#FFFFFF", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Video Background Layer ── */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          muted
          playsInline
          preload="auto"
          className="absolute w-full object-cover"
          style={{
            top: "300px",
            left: 0,
            right: 0,
            bottom: 0,
            height: "calc(100% - 300px)",
            opacity: 0,
            transition: "none",
          }}
        />
        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 22%, rgba(255,255,255,0.88) 36%, rgba(255,255,255,0.4) 50%, transparent 63%, transparent 78%, #FFFFFF 94%, #FFFFFF 100%)",
          }}
        />
      </div>

      {/* ── Navigation Bar ── */}
      <nav className="relative z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <span
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: "1.875rem",
              letterSpacing: "-0.02em",
              color: "#000000",
              lineHeight: 1,
            }}
          >
            Wandrr<sup style={{ fontSize: "0.55em", verticalAlign: "super" }}>®</sup>
          </span>

          {/* Nav links */}
          <ul className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-sm transition-colors hover:opacity-70"
                  style={{ color: link.color, textDecoration: "none" }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* CTA — hidden on mobile */}
          <button
            onClick={() => navigate("/signin")}
            className="hidden sm:block text-sm transition-transform hover:scale-[1.03] active:scale-95"
            style={{
              backgroundColor: "#000000",
              color: "#FFFFFF",
              borderRadius: "9999px",
              padding: "0.625rem 1.5rem",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            Begin Journey
          </button>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section
        className="relative z-10 flex flex-col items-center justify-center text-center px-6 pb-40"
        style={{ paddingTop: "calc(8rem - 75px)" }}
      >
        {/* Headline */}
        <h1
          className="animate-fade-rise max-w-5xl font-normal"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            letterSpacing: "-2.46px",
            color: "#000000",
          }}
        >
          <span style={{ fontSize: "clamp(2.75rem, 8vw, 6rem)", lineHeight: 0.95, display: "block" }}>
            Beyond horizons,{" "}
            <br className="hidden sm:block" />
            we craft
          </span>
          <em
            style={{
              fontSize: "clamp(1.25rem, 3.5vw, 2.25rem)",
              color: "#6F6F6F",
              fontStyle: "italic",
              display: "block",
              marginTop: "0.75rem",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
            }}
          >
            the journey of a lifetime.
          </em>
        </h1>

        {/* Description */}
        <p
          className="animate-fade-rise-delay mt-8 max-w-2xl leading-relaxed"
          style={{
            fontSize: "clamp(1rem, 2vw, 1.125rem)",
            color: "#6F6F6F",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Find your travel tribe, discover solo companions, and let AI design
          your perfect itinerary. Built for wanderers, dreamers, and fearless
          explorers.
        </p>

        {/* Hero CTA */}
        <button
          onClick={() => navigate("/signin")}
          className="animate-fade-rise-delay-2 mt-12 transition-transform hover:scale-[1.03] active:scale-95"
          style={{
            backgroundColor: "#000000",
            color: "#FFFFFF",
            borderRadius: "9999px",
            padding: "1.25rem 3.5rem",
            fontSize: "1rem",
            border: "none",
            cursor: "pointer",
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Begin Journey
        </button>

        {/* Social proof */}
        <div className="animate-fade-rise-delay-2 mt-8 flex items-center gap-0">
          {AVATARS.map((a, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white"
              style={{
                backgroundColor: a.bg,
                color: a.color,
                marginLeft: i === 0 ? 0 : "-8px",
                zIndex: AVATARS.length - i,
                position: "relative",
              }}
            >
              {a.initials}
            </div>
          ))}
          <span
            className="ml-4 text-sm"
            style={{ color: "#6F6F6F", fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            50+ destinations&nbsp;&middot;&nbsp;AI trip planning&nbsp;&middot;&nbsp;Smart matching
          </span>
        </div>

        {/* Feature pills */}
        <div className="animate-fade-rise-delay-2 mt-5 flex items-center gap-2 flex-wrap justify-center">
          {["Find Companions", "Book Travel", "AI Itineraries"].map((pill, i, arr) => (
            <React.Fragment key={pill}>
              <span
                className="text-sm px-4 py-1.5 rounded-full border border-gray-200"
                style={{
                  color: "#6F6F6F",
                  backgroundColor: "rgba(255,255,255,0.85)",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {pill}
              </span>
              {i < arr.length - 1 && (
                <span style={{ color: "#d1d5db", fontSize: "0.875rem" }}>&middot;</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </section>
    </div>
  );
}
