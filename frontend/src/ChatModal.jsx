import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function avatarColor(name) {
  const colors = [
    "bg-rose-100 text-rose-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-teal-100 text-teal-700",
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function buildRoomId(uid1, uid2) {
  const a = Math.min(Number(uid1), Number(uid2));
  const b = Math.max(Number(uid1), Number(uid2));
  return `chat_${a}_${b}`;
}

export default function ChatModal({ myUserId, myName, connection, onClose }) {
  const roomId = buildRoomId(myUserId, connection.connection_user_id);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Load history + connect socket
  useEffect(() => {
    let active = true;

    // Fetch history
    fetch(`/api/messages/${encodeURIComponent(roomId)}`)
      .then(r => r.json())
      .then(data => {
        if (active) {
          setMessages(data.messages || []);
          setLoading(false);
        }
      })
      .catch(() => { if (active) setLoading(false); });

    // Socket
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.emit("join_room", roomId);
    socket.on("receive_message", (msg) => {
      setMessages(prev => {
        const seen = prev.some(m => m.id === msg.id);
        return seen ? prev : [...prev, msg];
      });
    });

    return () => {
      active = false;
      socket.disconnect();
    };
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit("send_message", {
      roomId,
      senderId: myUserId,
      senderName: myName,
      content: text,
    });
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const otherInitials = initials(connection.connection_name);
  const otherColor = avatarColor(connection.connection_name);
  const myInitials = initials(myName);
  const myColor = avatarColor(myName);

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl flex flex-col shadow-2xl border border-gray-200"
        style={{ height: "min(90vh, 620px)", maxHeight: "90dvh", fontFamily: "'Inter', system-ui, sans-serif" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${otherColor}`}>
            {otherInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold text-sm truncate">{connection.connection_name}</p>
            {connection.travelling_from && connection.travelling_to && (
              <p className="text-gray-400 text-xs truncate flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                {connection.travelling_from} → {connection.travelling_to}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 text-xl leading-none shrink-0 ml-2"
          >
            ✕
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loading && (
            <div className="flex justify-center pt-10">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-gray-700"></div>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-3 ${otherColor}`}>
                {otherInitials}
              </div>
              <p className="text-gray-700 font-medium text-sm">{connection.connection_name}</p>
              <p className="text-gray-400 text-xs mt-1">Send a message to start the conversation!</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isMe = String(msg.sender_id) === String(myUserId);
            const showAvatar = i === 0 || messages[i - 1]?.sender_id !== msg.sender_id;
            const time = new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

            return (
              <div key={msg.id ?? i} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div className="shrink-0 w-7">
                  {showAvatar && (
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${isMe ? myColor : otherColor}`}>
                      {isMe ? myInitials : otherInitials}
                    </div>
                  )}
                </div>
                {/* Bubble */}
                <div className={`max-w-[72%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words ${isMe ? "text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}
                    style={isMe ? { backgroundColor: '#FF6B35' } : {}}>
                    {msg.content}
                  </div>
                  <p className="text-gray-400 text-[10px] px-1">{time}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex items-end gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${myColor}`}>
            {myInitials}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a message…"
            rows={1}
            className="flex-1 resize-none bg-gray-100 rounded-xl px-4 py-2.5 text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            style={{ maxHeight: "100px", overflowY: "auto", fontSize: "16px" }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="disabled:opacity-30 text-white w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-opacity"
            style={{ backgroundColor: '#FF6B35' }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
