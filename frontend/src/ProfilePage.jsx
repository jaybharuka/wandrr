import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import BottomNav from "./BottomNav";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useUser();

  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editMode, setEditMode] = useState(false);

  if (!user) {
    navigate("/signin");
    return null;
  }

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Name cannot be empty."); return; }
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
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
    setName(user?.name || "");
    setEditMode(false);
    setError("");
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  const INPUT = "w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#333333] rounded-xl text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-[#333333] focus:border-gray-400 transition-colors text-base";
  const DISPLAY = "w-full px-4 py-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl text-gray-700 dark:text-[#d4d4d4]";

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pb-20 sm:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      <nav className="border-b border-gray-100 dark:border-[#2a2a2a] px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", letterSpacing: "-0.02em" }} className="text-gray-900 dark:text-[#f5f5f5]">
          Wandrr<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-[#f5f5f5] transition-colors">
          ← Back
        </button>
      </nav>

      <div className="flex items-start justify-center px-4 py-8">
        <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] shadow-sm dark:shadow-none rounded-2xl p-5 sm:p-10 w-full max-w-lg">

          <div className="text-center mb-8">
            {(() => {
              const COLORS = [
                "bg-rose-100 text-rose-700", "bg-blue-100 text-blue-700",
                "bg-green-100 text-green-700", "bg-amber-100 text-amber-700",
                "bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
              ];
              const color = name ? COLORS[name.charCodeAt(0) % COLORS.length] : "bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-[#a3a3a3]";
              const ini = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
              return (
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-semibold ${color}`}>
                  {ini}
                </div>
              );
            })()}
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "2rem", letterSpacing: "-0.02em" }} className="text-gray-900 dark:text-[#f5f5f5]">
              {name || "My Profile"}
            </h1>
            <p className="text-gray-400 dark:text-[#737373] text-sm mt-1">User #{user.id}</p>
          </div>

          {successMsg && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3 mb-4 text-center">
              <p className="text-green-700 dark:text-green-400 text-sm font-medium">{successMsg}</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-4 text-center">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Name</label>
              {editMode
                ? <input type="text" value={name} onChange={e => setName(e.target.value)} className={INPUT} required />
                : <div className={DISPLAY}>{name}</div>}
            </div>

            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Email</label>
              <div className={DISPLAY + " cursor-not-allowed text-gray-400 dark:text-[#737373]"}>{user.email}</div>
              <p className="text-gray-400 dark:text-[#737373] text-xs mt-1">Email cannot be changed.</p>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Username</label>
              <div className={DISPLAY + " cursor-not-allowed text-gray-400 dark:text-[#737373]"}>{user.username}</div>
            </div>

            <div className="flex gap-3 pt-2">
              {editMode ? (
                <>
                  <button type="submit" disabled={saving} className="flex-1 btn-accent h-11 rounded-xl text-sm font-medium disabled:opacity-40">
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button type="button" onClick={handleCancel}
                    className="flex-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-400 dark:hover:border-[#333333] text-gray-700 dark:text-[#d4d4d4] h-11 rounded-xl text-sm font-medium transition-colors">
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={() => setEditMode(true)} className="flex-1 btn-accent h-11 rounded-xl text-sm font-medium">
                    Edit Profile
                  </button>
                  <button type="button" onClick={handleLogout}
                    className="flex-1 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] hover:border-red-200 text-red-600 h-11 rounded-xl text-sm font-medium transition-colors">
                    Logout
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
