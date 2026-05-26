import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import BottomNav from "./BottomNav";

export default function TravelGroupsPage({ selectedLocation: initialLocation }) {
  const navigate = useNavigate();
  const { userId } = useUser();

  const [activeTab, setActiveTab] = useState("my-groups"); // "my-groups" | "create" | "join" | "discover"
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || "Delhi");

  // My groups state
  const [myGroups, setMyGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Create group form state
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Join group state
  const [joinCode, setJoinCode] = useState("");
  const [joining, setJoining] = useState(false);

  // Discover state
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [loadingDiscover, setLoadingDiscover] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  // Max members for create form
  const [maxMembers, setMaxMembers] = useState(20);

  // Inline confirmation state { groupId, groupName, action: 'leave'|'delete' }
  const [confirmAction, setConfirmAction] = useState(null);
  const [joinedIds, setJoinedIds] = useState(new Set());

  const locations = [
    "Delhi", "Mumbai", "Bangalore", "Chennai", "Hyderabad",
    "Kolkata", "Pune", "Jaipur", "Ahmedabad", "Goa", "Ladakh", "Manali",
    "Varanasi", "Agra", "Rishikesh", "Darjeeling", "Kochi", "Mysore"
  ];

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadMyGroups = async () => {
    if (!userId) return;
    setLoadingGroups(true);
    try {
      const res = await fetch(`/api/groups/user/${userId}`);
      const data = await res.json();
      setMyGroups(data.groups || []);
    } catch {
      setMyGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const loadDiscoverGroups = async () => {
    setLoadingDiscover(true);
    try {
      const res = await fetch(`/api/groups/destination/${encodeURIComponent(selectedLocation)}`);
      const data = await res.json();
      setDiscoverGroups(data.groups || []);
    } catch {
      setDiscoverGroups([]);
    } finally {
      setLoadingDiscover(false);
    }
  };

  useEffect(() => { loadMyGroups(); }, [userId]);

  useEffect(() => {
    if (activeTab === "discover") loadDiscoverGroups();
  }, [activeTab, selectedLocation]);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || !selectedLocation) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, name: groupName, destination: selectedLocation, description: groupDesc, isPrivate, maxMembers }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Group "${groupName}" created! Code: ${data.group.joinCode}`);
        setGroupName(""); setGroupDesc(""); setIsPrivate(false);
        setActiveTab("my-groups");
        loadMyGroups();
      } else {
        showToast(data.error || "Failed to create group.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, joinCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        setJoinCode("");
        setActiveTab("my-groups");
        loadMyGroups();
      } else {
        showToast(data.error || "Failed to join group.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setJoining(false);
    }
  };

  const handleLeaveGroup = async (groupId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/leave`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Left group successfully.");
        loadMyGroups();
      } else {
        showToast(data.error || "Failed to leave group.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setConfirmAction(null);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Group deleted.");
        loadMyGroups();
      } else {
        showToast(data.error || "Failed to delete group.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setConfirmAction(null);
    }
  };

  const confirmAndExecute = () => {
    if (!confirmAction) return;
    if (confirmAction.action === "leave") handleLeaveGroup(confirmAction.groupId);
    else handleDeleteGroup(confirmAction.groupId);
  };

  const handleJoinPublicGroup = async (code) => {
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, joinCode: code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message);
        loadMyGroups();
        loadDiscoverGroups();
      } else {
        showToast(data.error || "Failed to join group.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    }
  };

  const DEST_COLORS = [
    "from-orange-400 to-rose-400",
    "from-blue-400 to-indigo-500",
    "from-emerald-400 to-teal-500",
    "from-violet-400 to-purple-500",
    "from-amber-400 to-orange-500",
    "from-sky-400 to-blue-500",
  ];
  const destColor = (name) => DEST_COLORS[(name?.charCodeAt(0) ?? 0) % DEST_COLORS.length];

  const StackedAvatars = ({ count, max = 4 }) => {
    const shown = Math.min(count, max);
    const BG = ["bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700", "bg-rose-100 text-rose-700", "bg-green-100 text-green-700"];
    return (
      <div className="flex items-center">
        {Array.from({ length: shown }).map((_, i) => (
          <div key={i} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold ${BG[i % BG.length]}`}
            style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: shown - i }}>
            {String.fromCharCode(65 + i)}
          </div>
        ))}
        {count > max && <span className="ml-2 text-xs text-gray-400 dark:text-[#737373]">+{count - max}</span>}
      </div>
    );
  };

  const tabClass = (tab) =>
    `px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
      activeTab === tab ? "bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-[#f5f5f5] shadow-sm dark:shadow-none" : "text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-[#d4d4d4]"
    }`;

  const INPUT_CLS = "w-full px-4 py-3 bg-white dark:bg-[#2a2a2a] border border-gray-300 dark:border-[#333333] rounded-xl text-gray-900 dark:text-[#f5f5f5] placeholder-gray-400 dark:placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-colors text-base";

  if (!userId) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0f0f0f] flex items-center justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="text-center border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-10 max-w-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.8" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
          </div>
          <h2 className="text-gray-900 dark:text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem" }}>Sign in required</h2>
          <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mt-2 mb-6">You need to be signed in to view or create travel groups.</p>
          <button onClick={() => navigate("/signin")} className="btn-accent py-3 px-8 rounded-xl text-sm font-medium">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f0f0f] pb-20 sm:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Confirm modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-2xl p-7 max-w-sm w-full mx-4 shadow-xl dark:shadow-none">
            <p className="text-gray-900 dark:text-[#f5f5f5] font-semibold mb-2">
              {confirmAction.action === "delete" ? "Delete Group?" : "Leave Group?"}
            </p>
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mb-6">
              {confirmAction.action === "delete"
                ? `"${confirmAction.groupName}" and all members will be permanently removed.`
                : `You will no longer be a member of "${confirmAction.groupName}".`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)}
                className="flex-1 bg-white dark:bg-[#2a2a2a] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-400 dark:hover:border-[#333333] text-gray-700 dark:text-[#d4d4d4] py-2.5 rounded-xl text-sm font-medium transition-colors">
                Cancel
              </button>
              <button onClick={confirmAndExecute}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors text-white ${
                  confirmAction.action === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-gray-700 hover:bg-gray-800"
                }`}>
                {confirmAction.action === "delete" ? "Delete" : "Leave"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg border ${
          toast.type === "error" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400" : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <nav className="border-b border-gray-100 dark:border-[#2a2a2a] px-4 sm:px-10 py-4 sm:py-5 flex items-center justify-between">
        <span className="text-gray-900 dark:text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.75rem", letterSpacing: "-0.02em" }}>
          Wandrr<sup style={{ fontSize: "0.5em", verticalAlign: "super" }}>®</sup>
        </span>
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-[#f5f5f5] transition-colors">← Back</button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-gray-900 dark:text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-1.5px", lineHeight: 1 }}>
            Travel Groups
          </h1>
          <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mt-2">Create, join, and discover group adventures</p>
        </div>

        {/* Destination selector */}
        <div className="flex items-center gap-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-5 py-3 mb-6">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-400 dark:text-[#737373] shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)}
            className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border-0 text-gray-900 dark:text-[#f5f5f5] text-sm font-medium focus:outline-none cursor-pointer">
            {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap bg-gray-100 dark:bg-[#2a2a2a] rounded-xl p-1 gap-1 mb-6">
          <button className={tabClass("my-groups")} onClick={() => setActiveTab("my-groups")}>My Groups ({myGroups.length})</button>
          <button className={tabClass("create")} onClick={() => setActiveTab("create")}>Create</button>
          <button className={tabClass("join")} onClick={() => setActiveTab("join")}>Join by Code</button>
          <button className={tabClass("discover")} onClick={() => setActiveTab("discover")}>Discover</button>
        </div>

        {/* MY GROUPS */}
        {activeTab === "my-groups" && (
          <div>
            {loadingGroups ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 dark:border-[#f5f5f5] border-t-transparent mx-auto mb-3"></div>
                <p className="text-gray-400 dark:text-[#737373] text-sm">Loading your groups…</p>
              </div>
            ) : myGroups.length === 0 ? (
              <div className="text-center border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-10">
                <p className="text-gray-500 dark:text-[#a3a3a3] text-sm">You haven't joined any groups yet. Create one or discover public groups!</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {myGroups.map((g) => (
                  <div key={g.id} className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none transition-all duration-200">
                    {/* Destination banner */}
                    <div className={`h-16 bg-gradient-to-r ${destColor(g.destination)} flex items-end px-5 pb-3`}>
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        <span className="text-white text-sm font-semibold">{g.destination}</span>
                        {String(g.created_by) === String(userId) && (
                          <span className="ml-auto text-xs px-2 py-0.5 bg-white/30 text-white rounded-full">Owner</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${g.is_private ? "bg-white/20 text-white" : "bg-white/30 text-white"}`}>
                          {g.is_private ? "Private" : "Public"}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                    <h3 className="text-gray-900 dark:text-[#f5f5f5] font-semibold mb-1">{g.name}</h3>
                    {g.description && <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mb-3">{g.description}</p>}
                    <div className="flex items-center justify-between mb-3">
                      <StackedAvatars count={g.member_count} />
                      <span className="text-xs text-gray-400 dark:text-[#737373]">{g.member_count}/{g.max_members} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-3 py-2">
                        <span className="text-gray-400 dark:text-[#737373] text-xs">Code: </span>
                        <span className="text-gray-900 dark:text-[#f5f5f5] font-mono font-semibold text-sm">{g.join_code}</span>
                      </div>
                      <button onClick={() => { navigator.clipboard.writeText(g.join_code); showToast("Code copied!"); }}
                        className="text-xs text-gray-600 dark:text-[#d4d4d4] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-400 dark:hover:border-[#333333] px-3 py-2 rounded-lg transition-colors">
                        Copy
                      </button>
                      {String(g.created_by) === String(userId) ? (
                        <button onClick={() => setConfirmAction({ groupId: g.id, groupName: g.name, action: "delete" })}
                          className="text-xs text-red-600 border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg transition-colors">
                          Delete
                        </button>
                      ) : (
                        <button onClick={() => setConfirmAction({ groupId: g.id, groupName: g.name, action: "leave" })}
                          className="text-xs text-gray-600 dark:text-[#d4d4d4] border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-400 dark:hover:border-[#333333] px-3 py-2 rounded-lg transition-colors">
                          Leave
                        </button>
                      )}
                    </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CREATE GROUP */}
        {activeTab === "create" && (
          <form onSubmit={handleCreateGroup} className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 max-w-lg mx-auto space-y-4">
            <h2 className="text-gray-900 dark:text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem" }}>Create a Travel Group</h2>
            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Group Name *</label>
              <input type="text" value={groupName} onChange={e => setGroupName(e.target.value)}
                placeholder="e.g. Goa Beach Crew 2025" className={INPUT_CLS} required />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-1">Destination</label>
              <p className="text-gray-900 dark:text-[#f5f5f5] font-medium text-sm">{selectedLocation}</p>
              <p className="text-gray-400 dark:text-[#737373] text-xs">Change via the selector above.</p>
            </div>
            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Description</label>
              <textarea value={groupDesc} onChange={e => setGroupDesc(e.target.value)}
                placeholder="What's this group about?" rows={3}
                className={INPUT_CLS + " resize-none"} />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-[#d4d4d4] text-sm font-medium mb-2">Max Members</label>
              <select value={maxMembers} onChange={e => setMaxMembers(Number(e.target.value))} className={INPUT_CLS}>
                {[5,10,15,20,30,50].map(n => <option key={n} value={n}>{n} members</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="isPrivate" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)}
                className="w-4 h-4 accent-gray-900" />
              <label htmlFor="isPrivate" className="text-gray-700 dark:text-[#d4d4d4] text-sm">Private (only joinable by code)</label>
            </div>
            <button type="submit" disabled={creating} className="btn-accent w-full py-3 rounded-xl text-sm font-medium">
              {creating ? "Creating…" : "Create Group"}
            </button>
          </form>
        )}

        {/* JOIN BY CODE */}
        {activeTab === "join" && (
          <form onSubmit={handleJoinGroup} className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-6 max-w-md mx-auto space-y-4">
            <h2 className="text-gray-900 dark:text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem" }}>Join by Code</h2>
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm">Enter the 8-character join code shared by a group member.</p>
            <input type="text" value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="A1B2C3D4" maxLength={8}
              className={INPUT_CLS + " font-mono text-lg tracking-widest uppercase text-center"} required />
            <button type="submit" disabled={joining} className="btn-accent w-full py-3 rounded-xl text-sm font-medium">
              {joining ? "Joining…" : "Join Group"}
            </button>
          </form>
        )}

        {/* DISCOVER */}
        {activeTab === "discover" && (
          <div>
            <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mb-5">Public groups headed to <span className="text-gray-900 dark:text-[#f5f5f5] font-semibold">{selectedLocation}</span></p>
            {loadingDiscover ? (
              <div className="text-center py-12 text-gray-400 dark:text-[#737373] text-sm">Loading groups…</div>
            ) : discoverGroups.length === 0 ? (
              <div className="text-center border border-gray-200 dark:border-[#2a2a2a] rounded-xl p-10">
                <p className="text-gray-400 dark:text-[#737373] text-sm">No public groups for {selectedLocation} yet. Be the first to create one!</p>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                {discoverGroups.map((g) => {
                  const isJoined = joinedIds.has(g.id);
                  return (
                  <div key={g.id} className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-none transition-all duration-200">
                    {/* Destination banner */}
                    <div className={`h-16 bg-gradient-to-r ${destColor(g.destination)} flex items-end px-5 pb-3`}>
                      <div className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        <span className="text-white text-sm font-semibold">{g.destination}</span>
                      </div>
                    </div>
                    <div className="p-5">
                    <h3 className="text-gray-900 dark:text-[#f5f5f5] font-semibold mb-1">{g.name}</h3>
                    {g.description && <p className="text-gray-400 dark:text-[#737373] text-sm mb-3">{g.description}</p>}
                    <div className="flex items-center justify-between mb-4">
                      <StackedAvatars count={g.member_count} />
                      <span className="text-xs text-gray-400 dark:text-[#737373]">{g.member_count}/{g.max_members}</span>
                    </div>
                    <button
                      onClick={() => { if (!isJoined) { handleJoinPublicGroup(g.join_code); setJoinedIds(s => new Set([...s, g.id])); } }}
                      disabled={isJoined}
                      className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isJoined
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'btn-accent'
                      }`}>
                      {isJoined ? 'Joined' : 'Join Group'}
                    </button>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
