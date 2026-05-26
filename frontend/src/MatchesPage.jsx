import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import ChatModal from "./ChatModal";
import BottomNav from "./BottomNav";

export default function MatchesPage() {
  const locationObj = useLocation();
  const { userId: contextUserId } = useUser();
  const loggedInUserId = locationObj.state?.loggedInUserId || contextUserId;
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState("connections"); // "connections", "sent", "received"

  // Data states
  const [myConnections, setMyConnections] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactConnection, setContactConnection] = useState(null);
  const [chatConnection, setChatConnection] = useState(null);
  const [myName, setMyName] = useState("");

  useEffect(() => {
    if (!loggedInUserId) return;
    fetch(`/api/users/${loggedInUserId}`)
      .then(r => r.json())
      .then(d => setMyName(d.name || "Me"))
      .catch(() => setMyName("Me"));
  }, [loggedInUserId]);

  // Tab handlers
  const handleConnectionsTab = () => {
    setActiveTab("connections");
    loadMyConnections();
  };

  const handleSentTab = () => {
    setActiveTab("sent");
    loadSentRequests();
  };

  const handleReceivedTab = () => {
    setActiveTab("received");
    loadReceivedRequests();
  };

  // Load functions
  const loadMyConnections = async () => {
    try {
      const response = await fetch(`/api/connection-requests/connections/${loggedInUserId}`);
      if (response.ok) {
        const data = await response.json();
        setMyConnections(data);
      } else {
        setMyConnections([]);
      }
    } catch (error) {
      setMyConnections([]);
    }
  };

  const loadSentRequests = async () => {
    try {
      const response = await fetch(`/api/connection-requests/sent/${loggedInUserId}`);
      if (response.ok) {
        const data = await response.json();
        setSentRequests(data);
      } else {
        setSentRequests([]);
      }
    } catch (error) {
      setSentRequests([]);
    }
  };

  const loadReceivedRequests = async () => {
    try {
      const response = await fetch(`/api/connection-requests/received/${loggedInUserId}`);
      if (response.ok) {
        const data = await response.json();
        setReceivedRequests(data);
      } else {
        setReceivedRequests([]);
      }
    } catch (error) {
      setReceivedRequests([]);
    }
  };

  // Action functions
  const acceptRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/connection-requests/${requestId}/accept`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('✅ Connection request accepted!');
        loadReceivedRequests(); // Refresh received requests
        loadMyConnections(); // Refresh connections
      } else {
        alert('Error accepting request');
      }
    } catch {
      alert('Failed to accept request');
    }
  };

  const declineRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/connection-requests/${requestId}/decline`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert('❌ Connection request declined');
        loadReceivedRequests();
      } else {
        alert('Error declining request');
      }
    } catch {
      alert('Failed to decline request');
    }
  };

  const cancelRequest = async (requestId) => {
    try {
      const response = await fetch(`/api/connection-requests/${requestId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('🗑️ Connection request canceled');
        loadSentRequests();
      } else {
        alert('Error canceling request');
      }
    } catch {
      alert('Failed to cancel request');
    }
  };

  useEffect(() => {
    if (loggedInUserId) {
      loadMyConnections();
      setLoading(false);
    }
  }, [loggedInUserId]);

  const PERSON_CARD = "bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] rounded-xl p-5";

  function Avatar({ name, size = "w-10 h-10" }) {
    const colors = [
      "bg-rose-100 text-rose-700", "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700", "bg-amber-100 text-amber-700",
      "bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
    ];
    const color = name ? colors[name.charCodeAt(0) % colors.length] : colors[0];
    const ini = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
    return (
      <div className={`${size} rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${color}`}>
        {ini}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#1e1e1e] pb-20 sm:pb-0" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

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
            Travel Connections
          </h1>
          <p className="text-gray-500 dark:text-[#a3a3a3] text-sm mt-2">Manage your travel network</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap bg-gray-100 dark:bg-[#2a2a2a] rounded-xl p-1 gap-1 justify-center">
            {[
              { key: "connections", label: "My Connections", fn: handleConnectionsTab },
              { key: "sent",        label: "Requests Sent",  fn: handleSentTab },
              { key: "received",    label: "Received",       fn: handleReceivedTab },
            ].map(t => (
              <button key={t.key} onClick={t.fn}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.key
                    ? "bg-white dark:bg-[#1e1e1e] text-gray-900 dark:text-[#f5f5f5] shadow-sm dark:shadow-none"
                    : "text-gray-500 dark:text-[#a3a3a3] hover:text-gray-700 dark:hover:text-[#d4d4d4]"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Connections */}
        {activeTab === "connections" && (
          <div>
            {myConnections.length === 0 ? (
              <div className="text-center border border-dashed border-gray-200 dark:border-[#333333] rounded-xl py-16 px-8">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-[#737373]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                <p className="text-gray-700 dark:text-[#d4d4d4] font-medium mb-1">No connections yet</p>
                <p className="text-gray-400 dark:text-[#737373] text-sm">Accept a request or send one to a fellow traveller to start connecting.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myConnections.map((c, i) => (
                  <div key={i} className={PERSON_CARD + " flex items-start gap-4"}>
                    <Avatar name={c.connection_name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 dark:text-[#f5f5f5] font-semibold">{c.connection_name}</p>
                      <p className="text-gray-400 dark:text-[#737373] text-xs mb-2">{c.connection_email}</p>
                      {/* Destination chip */}
                      {c.travelling_from && c.travelling_to && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#fff4f0', color: '#FF6B35' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                          {c.travelling_from} → {c.travelling_to}
                        </span>
                      )}
                      {c.travel_date && (
                        <p className="text-gray-400 dark:text-[#737373] text-xs mt-1.5">{new Date(c.travel_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button onClick={() => setChatConnection(c)}
                        className="text-sm text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                        style={{ backgroundColor: '#FF6B35' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                        Chat
                      </button>
                      <button onClick={() => setContactConnection(c)}
                        className="text-sm bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] hover:border-gray-400 dark:hover:border-[#555555] text-gray-600 dark:text-[#d4d4d4] px-4 py-2 rounded-lg transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sent */}
        {activeTab === "sent" && (
          <div>
            {sentRequests.length === 0 ? (
              <div className="text-center border border-dashed border-gray-200 dark:border-[#333333] rounded-xl py-16 px-8">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-[#737373]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                <p className="text-gray-700 dark:text-[#d4d4d4] font-medium mb-1">No requests sent</p>
                <p className="text-gray-400 dark:text-[#737373] text-sm">Find a traveller on the Solo Travellers page and send a connection request.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sentRequests.map((r, i) => (
                  <div key={i} className={PERSON_CARD + " flex justify-between items-start"}>
                    <div>
                      <p className="text-gray-900 dark:text-[#f5f5f5] font-semibold">{r.to_user_name}</p>
                      <p className="text-gray-500 dark:text-[#a3a3a3] text-sm">{r.to_user_email}</p>
                      {r.travelling_from && r.travelling_to && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mt-1.5" style={{ backgroundColor: '#fff4f0', color: '#FF6B35' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                          {r.travelling_from} → {r.travelling_to}
                        </span>
                      )}
                      <p className="text-gray-400 dark:text-[#737373] text-xs mt-1">Sent {new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">{r.status}</span>
                      <button onClick={() => cancelRequest(r.id)}
                        className="text-xs text-red-600 border border-red-200 hover:border-red-400 px-3 py-1 rounded-lg transition-colors">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Received */}
        {activeTab === "received" && (
          <div>
            {receivedRequests.length === 0 ? (
              <div className="text-center border border-dashed border-gray-200 dark:border-[#333333] rounded-xl py-16 px-8">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-[#737373]"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                <p className="text-gray-700 dark:text-[#d4d4d4] font-medium mb-1">No requests received</p>
                <p className="text-gray-400 dark:text-[#737373] text-sm">Share your travel plans so others can find and connect with you.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {receivedRequests.map((r, i) => (
                  <div key={i} className={PERSON_CARD + " flex justify-between items-start"}>
                    <div>
                      <p className="text-gray-900 dark:text-[#f5f5f5] font-semibold">{r.from_user_name}</p>
                      <p className="text-gray-500 dark:text-[#a3a3a3] text-sm">{r.from_user_email}</p>
                      {r.travelling_from && r.travelling_to && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mt-1.5" style={{ backgroundColor: '#fff4f0', color: '#FF6B35' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                          {r.travelling_from} → {r.travelling_to}
                        </span>
                      )}
                      <p className="text-gray-400 dark:text-[#737373] text-xs mt-1">Received {new Date(r.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                      {r.message && (
                        <p className="text-sm text-gray-600 dark:text-[#d4d4d4] mt-2 px-3 py-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-lg italic">"{r.message}"</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <button onClick={() => acceptRequest(r.id)} className="btn-accent text-sm px-4 py-2 rounded-lg">Accept</button>
                      <button onClick={() => declineRequest(r.id)}
                        className="text-sm bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#333333] hover:border-red-300 text-gray-600 dark:text-[#d4d4d4] hover:text-red-600 px-4 py-2 rounded-lg transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Modal */}
      {chatConnection && (
        <ChatModal
          myUserId={loggedInUserId}
          myName={myName}
          connection={chatConnection}
          onClose={() => setChatConnection(null)}
        />
      )}

      <BottomNav />

      {/* Contact Modal */}
      {contactConnection && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setContactConnection(null)}>
          <div className="bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-[#2a2a2a] rounded-t-2xl sm:rounded-2xl p-5 sm:p-7 max-w-md w-full shadow-xl dark:shadow-none" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-gray-900 dark:text-[#f5f5f5]" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.4rem" }}>Contact Details</h2>
              <button onClick={() => setContactConnection(null)} className="text-gray-400 dark:text-[#737373] hover:text-gray-900 dark:hover:text-[#f5f5f5] text-xl leading-none">✕</button>
            </div>

            <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4 mb-4">
              <p className="text-gray-400 dark:text-[#737373] text-xs mb-1">Connection</p>
              <p className="text-gray-900 dark:text-[#f5f5f5] font-semibold">{contactConnection.connection_name}</p>
            </div>

            <div className="flex items-center justify-center gap-6 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4 mb-4">
              <div className="text-center">
                <p className="text-gray-400 dark:text-[#737373] text-xs uppercase tracking-widest mb-1">From</p>
                <p className="text-gray-900 dark:text-[#f5f5f5] font-semibold">{contactConnection.travelling_from}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              <div className="text-center">
                <p className="text-gray-400 dark:text-[#737373] text-xs uppercase tracking-widest mb-1">To</p>
                <p className="text-gray-900 dark:text-[#f5f5f5] font-semibold">{contactConnection.travelling_to}</p>
              </div>
            </div>

            <div className="space-y-3">
              {contactConnection.connection_email && (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4">
                  <div>
                    <p className="text-gray-400 dark:text-[#737373] text-xs mb-0.5">Email</p>
                    <p className="text-gray-900 dark:text-[#f5f5f5] text-sm font-medium break-all">{contactConnection.connection_email}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(contactConnection.connection_email)}
                    className="ml-3 text-xs text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-[#f5f5f5] border border-gray-200 dark:border-[#333333] hover:border-gray-400 dark:hover:border-[#555555] px-3 py-1.5 rounded-lg shrink-0 transition-colors">
                    Copy
                  </button>
                </div>
              )}
              {contactConnection.connection_phone ? (
                <div className="flex items-center justify-between bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-4">
                  <div>
                    <p className="text-gray-400 dark:text-[#737373] text-xs mb-0.5">📱 Phone</p>
                    <p className="text-gray-900 dark:text-[#f5f5f5] text-sm font-medium">{contactConnection.connection_phone}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(contactConnection.connection_phone)}
                    className="ml-3 text-xs text-gray-500 dark:text-[#a3a3a3] hover:text-gray-900 dark:hover:text-[#f5f5f5] border border-gray-200 dark:border-[#333333] hover:border-gray-400 dark:hover:border-[#555555] px-3 py-1.5 rounded-lg shrink-0 transition-colors">
                    Copy
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-3 text-center">
                  <p className="text-gray-400 dark:text-[#737373] text-sm">No phone number on their profile</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
