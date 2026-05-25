import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import BottomNav from "./BottomNav";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!userId) { navigate("/signin"); return; }
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
      } else {
        setError("Failed to load profile.");
      }
    } catch {
      setError("Network error loading profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name cannot be empty."); return; }
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Profile updated successfully!");
        setEditMode(false);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setError(data.error || "Failed to update profile.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setError("");
    fetchProfile();
  };

  const INPUT = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-colors text-base";
  const DISPLAY = "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700";

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-900 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 sm:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <nav className="border-b border-gray-100 px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", color: "#000", letterSpacing: "-0.02em" }}>
          Wandrr<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Back
        </button>
      </nav>

      <div className="flex items-start justify-center px-4 py-8">
        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-5 sm:p-10 w-full max-w-lg">

          {/* Header */}
          <div className="text-center mb-8">
            {(() => {
              const COLORS = [
                "bg-rose-100 text-rose-700", "bg-blue-100 text-blue-700",
                "bg-green-100 text-green-700", "bg-amber-100 text-amber-700",
                "bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
              ];
              const color = name ? COLORS[name.charCodeAt(0) % COLORS.length] : "bg-gray-100 text-gray-500";
              const ini = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
              return (
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-semibold ${color}`}>
                  {ini}
                </div>
              );
            })()}
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2rem", color: "#000", letterSpacing: "-0.02em" }}>
              {name || "My Profile"}
            </h1>
            <p className="text-gray-400 text-sm mt-1">User #{userId}</p>
          </div>

          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-center">
              <p className="text-green-700 text-sm font-medium">{successMsg}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
              {editMode
                ? <input type="text" value={name} onChange={e => setName(e.target.value)} className={INPUT} required />
                : <div className={DISPLAY}>{name}</div>}
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
              <div className={DISPLAY + " cursor-not-allowed text-gray-400"}>{email}</div>
              <p className="text-gray-400 text-xs mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">Phone <span className="text-gray-400 font-normal">(optional)</span></label>
              {editMode
                ? <input type="text" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" className={INPUT} />
                : <div className={DISPLAY}>{phone || <span className="text-gray-400">Not added</span>}</div>}
            </div>

            <div className="flex gap-3 pt-2">
              {editMode ? (
                <>
                  <button type="submit" disabled={saving} className="flex-1 btn-accent h-11 rounded-xl text-sm font-medium disabled:opacity-40">
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button type="button" onClick={handleCancel}
                    className="flex-1 bg-white border border-gray-200 hover:border-gray-400 text-gray-700 h-11 rounded-xl text-sm font-medium transition-colors">
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setEditMode(true)} className="flex-1 btn-accent h-11 rounded-xl text-sm font-medium">
                  Edit Profile
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
