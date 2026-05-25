import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import BottomNav from "./BottomNav";

export default function TinderLikePage() {
  const locationObj = useLocation();
  const navigate = useNavigate();
  const { userId: contextUserId } = useUser();
  const { loggedInUserId: stateUserId } = locationObj.state || {};
  const loggedInUserId = stateUserId || contextUserId;
  const [activeTab, setActiveTab] = useState("explore"); // "create", "explore", or "myposts"
  
  // Form state for Create Post
  const [userName, setUserName] = useState(""); // Will be fetched from user data
  const [userId, setUserId] = useState(""); // Will be fetched from user data
  const [userDataLoading, setUserDataLoading] = useState(true);
  const [userDataError, setUserDataError] = useState("");
  
  const [myPosts, setMyPosts] = useState([]);
  const [explorePosts, setExplorePosts] = useState([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardAction, setCardAction] = useState(null); // 'like' | 'pass'
  const [contactPost, setContactPost] = useState(null);
  const [travellingFrom, setTravellingFrom] = useState("");
  const [travellingTo, setTravellingTo] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);

  // List of popular Indian cities
  const cities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
    "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
    "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubballi-Dharwad"
  ];

  // Filter cities based on search
  const filteredFromCities = cities.filter(city => 
    city.toLowerCase().includes(fromSearch.toLowerCase())
  );
  
  const filteredToCities = cities.filter(city => 
    city.toLowerCase().includes(toSearch.toLowerCase())
  );

  // Load explore posts on initial mount (default tab)
  useEffect(() => {
    if (loggedInUserId) loadExplorePosts();
  }, [loggedInUserId]);

  // Fetch user data when component loads
  useEffect(() => {
    if (!loggedInUserId) {
      setUserDataLoading(false);
      return;
    }
    
    async function fetchUserData() {
      try {
        setUserDataLoading(true);
        setUserDataError("");
        
        // Direct database query to get user name
        const response = await fetch(`/api/users/${loggedInUserId}`);
        
        if (response.ok) {
          const userData = await response.json();
          setUserName(userData.name || "User");
          setUserId(userData.id || loggedInUserId);
        } else {
          setUserName("User");
          setUserId(loggedInUserId);
        }
      } catch (err) {
        setUserName("User");
        setUserId(loggedInUserId);
      } finally {
        setUserDataLoading(false);
      }
    }
    
    fetchUserData();
  }, [loggedInUserId]);

  // Handler for Create Post tab
  const handleCreatePost = () => {
    setActiveTab("create");
  };

  // Handler for Explore Travellers tab
  const handleExploreTravellers = () => {
    setActiveTab("explore");
    loadExplorePosts();
  };

  // Function to load posts from other users
  const loadExplorePosts = async () => {
    try {
      const url = `/api/travel-posts?excludeUserId=${loggedInUserId}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle both array and object responses
        if (Array.isArray(data)) {
          setExplorePosts(data);
        } else if (data.posts && Array.isArray(data.posts)) {
          setExplorePosts(data.posts);
        } else {
          setExplorePosts([]);
        }
      } else {
        setExplorePosts([]);
      }
    } catch (error) {
      setExplorePosts([]);
    }
  };

  // Function to send connection request
  const sendConnectionRequest = async (post) => {
    try {
      const response = await fetch('/api/connection-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: loggedInUserId,
          toUserId: post.user_id,
          postId: post.id,
          message: `I'd like to connect regarding your travel from ${post.travelling_from} to ${post.travelling_to}`
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('🎉 Connection request sent successfully!');
        setExplorePosts(explorePosts.filter(p => p.id !== post.id));
      } else {
        alert('Error sending connection request: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Network error: Failed to send connection request. Please check if the server is running.');
    }
  };

  // Handler for My Posts tab
  const handleMyPosts = () => {
    setActiveTab("myposts");
    loadMyPosts();
  };

  // Simple function to load posts
  const loadMyPosts = async () => {
    if (!loggedInUserId) return;
    
    try {
      const url = `/api/travel-posts?userId=${loggedInUserId}`;
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setMyPosts(data);
        } else if (data.posts && Array.isArray(data.posts)) {
          setMyPosts(data.posts);
        } else {
          setMyPosts([]);
        }
      }
    } catch (error) {
      setMyPosts([]);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Delete this travel post?')) return;
    try {
      const res = await fetch(`/api/travel-posts/${postId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: loggedInUserId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMyPosts(prev => prev.filter(p => p.id !== postId));
      } else {
        alert(data.error || 'Failed to delete post.');
      }
    } catch {
      alert('Network error. Please try again.');
    }
  };

  // Form handlers
  const handleFromCitySelect = (city) => {
    setTravellingFrom(city);
    setFromSearch(city);
    setShowFromDropdown(false);
  };

  const handleToCitySelect = (city) => {
    setTravellingTo(city);
    setToSearch(city);
    setShowToDropdown(false);
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!userId || !userName || !travellingFrom || !travellingTo || !travelDate) {
      alert("Please fill in all fields!");
      return;
    }

    if (travellingFrom === travellingTo) {
      alert("Departure and destination cities cannot be the same!");
      return;
    }

    try {
      const response = await fetch(`/api/travel-posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: parseInt(userId),
          userName,
          travellingFrom,
          travellingTo,
          travelDate,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("🎉 Travel post created successfully!");
        // Clear form
        setTravellingFrom("");
        setTravellingTo("");
        setTravelDate("");
        setFromSearch("");
        setToSearch("");
        // Switch to my posts tab and load posts
        setActiveTab("myposts");
        loadMyPosts();
      } else {
        alert("Error creating post: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      alert("Failed to create post. Please try again.");
    }
  };

  const INPUT_CLS = "w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-colors text-base";

  function Avatar({ name, size = "w-10 h-10", textSize = "text-sm" }) {
    const COLORS = [
      "bg-rose-100 text-rose-700", "bg-blue-100 text-blue-700",
      "bg-green-100 text-green-700", "bg-amber-100 text-amber-700",
      "bg-purple-100 text-purple-700", "bg-teal-100 text-teal-700",
    ];
    const color = name ? COLORS[name.charCodeAt(0) % COLORS.length] : COLORS[0];
    const ini = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";
    return (
      <div className={`${size} rounded-full flex items-center justify-center font-semibold shrink-0 ${textSize} ${color}`}>
        {ini}
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
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">← Back</button>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(2rem, 5vw, 3rem)", color: "#000", letterSpacing: "-1.5px", lineHeight: 1 }}>
            Solo Travellers
          </h1>
          <p className="text-gray-500 text-sm mt-2">Connect with fellow travellers on the same route</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex flex-wrap bg-gray-100 rounded-xl p-1 gap-1 justify-center">
            {[
              { key: "create",  label: "Create Post",       fn: handleCreatePost },
              { key: "explore", label: "Explore Travellers", fn: handleExploreTravellers },
              { key: "myposts", label: "My Posts",           fn: handleMyPosts },
            ].map(t => (
              <button key={t.key} onClick={t.fn}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CREATE */}
        {activeTab === "create" && (
          <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-8 max-w-2xl mx-auto">
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.5rem", color: "#000" }} className="mb-1">Create Travel Post</h2>
            <p className="text-gray-500 text-sm mb-6">Share your travel plans and find companions!</p>

            <form onSubmit={handleSubmitPost} className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">User ID</label>
                <input type="text" value={userDataLoading ? "Loading…" : userId} readOnly
                  className={INPUT_CLS + " bg-gray-50 cursor-not-allowed opacity-75"} />
                <p className="text-gray-400 text-xs mt-1">Your unique user ID (cannot be changed)</p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Name</label>
                <input type="text" value={userDataLoading ? "Loading…" : userName} readOnly
                  className={INPUT_CLS + " bg-gray-50 cursor-not-allowed opacity-75"} />
                <p className="text-gray-400 text-xs mt-1">
                  {userDataError ? <span className="text-red-500">{userDataError}</span> : "Name from your profile (cannot be changed)"}
                </p>
              </div>

              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2">Travelling From</label>
                <input type="text" value={fromSearch}
                  onChange={e => { setFromSearch(e.target.value); setShowFromDropdown(true); }}
                  onFocus={() => setShowFromDropdown(true)}
                  className={INPUT_CLS} placeholder="Search departure city…" required />
                {showFromDropdown && filteredFromCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {filteredFromCities.slice(0, 10).map((city, i) => (
                      <button key={i} type="button" onClick={() => handleFromCitySelect(city)}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors">
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-gray-700 text-sm font-medium mb-2">Travelling To</label>
                <input type="text" value={toSearch}
                  onChange={e => { setToSearch(e.target.value); setShowToDropdown(true); }}
                  onFocus={() => setShowToDropdown(true)}
                  className={INPUT_CLS} placeholder="Search destination city…" required />
                {showToDropdown && filteredToCities.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                    {filteredToCities.slice(0, 10).map((city, i) => (
                      <button key={i} type="button" onClick={() => handleToCitySelect(city)}
                        className="w-full text-left px-4 py-2.5 text-gray-700 hover:bg-gray-50 text-sm first:rounded-t-xl last:rounded-b-xl transition-colors">
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Travel Date</label>
                <input type="date" value={travelDate} onChange={e => setTravelDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]} className={INPUT_CLS} required />
              </div>

              <button type="submit" className="btn-accent w-full h-11 rounded-xl text-sm font-medium">
                Create Post
              </button>
            </form>
          </div>
        )}

        {/* EXPLORE — stacked card deck */}
        {activeTab === "explore" && (
          <div className="max-w-md mx-auto">
            {(!Array.isArray(explorePosts) || explorePosts.length === 0) ? (
              <div className="text-center border border-dashed border-gray-200 rounded-xl py-16 px-8">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253" /></svg>
                <p className="text-gray-700 font-medium mb-1">No travel posts yet</p>
                <p className="text-gray-400 text-sm mb-5">Be the first to post your travel plans!</p>
                <button onClick={loadExplorePosts} className="text-sm bg-white border border-gray-200 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors">Refresh</button>
              </div>
            ) : cardIndex >= explorePosts.length ? (
              <div className="text-center border border-dashed border-gray-200 rounded-xl py-16 px-8">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-gray-700 font-medium mb-1">You've seen everyone!</p>
                <p className="text-gray-400 text-sm mb-5">Check back later for new travellers.</p>
                <button onClick={() => { setCardIndex(0); loadExplorePosts(); }} className="btn-accent px-5 py-2.5 rounded-xl text-sm font-medium">Start Over</button>
              </div>
            ) : (
              <div>
                {/* Progress */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-400 text-xs">{cardIndex + 1} / {explorePosts.length}</p>
                  <button onClick={loadExplorePosts} className="text-xs text-gray-400 hover:text-gray-700 border border-gray-200 hover:border-gray-300 px-3 py-1 rounded-lg transition-colors">Refresh</button>
                </div>

                {/* Stacked cards */}
                <div className="relative" style={{ height: "420px" }}>
                  {/* Ghost card 2 (back) */}
                  {cardIndex + 2 < explorePosts.length && (
                    <div className="absolute inset-x-4 top-4 bottom-0 bg-gray-100 border border-gray-200 rounded-2xl" style={{ transform: "scale(0.92)", transformOrigin: "top center", zIndex: 1 }} />
                  )}
                  {/* Ghost card 1 (middle) */}
                  {cardIndex + 1 < explorePosts.length && (
                    <div className="absolute inset-x-2 top-2 bottom-0 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm" style={{ transform: "scale(0.96)", transformOrigin: "top center", zIndex: 2 }} />
                  )}
                  {/* Active card */}
                  {(() => {
                    const post = explorePosts[cardIndex];
                    return (
                      <div
                        className="absolute inset-0 bg-white border border-gray-200 rounded-2xl shadow-md flex flex-col overflow-hidden transition-all duration-300"
                        style={{ zIndex: 3 }}
                      >
                        {/* LIKE / PASS overlay labels on button hover are handled by the buttons */}
                        {/* Hero — city names */}
                        <div className="flex-1 flex flex-col items-center justify-center px-8 pt-8 pb-4">
                          <div className="flex items-center gap-3 mb-6">
                            <Avatar name={post.user_name} size="w-11 h-11" />
                            <div>
                              <p className="text-gray-900 font-semibold">{post.user_name}</p>
                              <p className="text-gray-400 text-xs">Looking for companions</p>
                            </div>
                          </div>

                          {/* Hero route */}
                          <div className="w-full text-center mb-5">
                            <div className="flex items-center justify-center gap-4">
                              <div className="text-center">
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">From</p>
                                <p className="font-semibold text-gray-900" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.6rem", lineHeight: 1.1 }}>{post.travelling_from}</p>
                              </div>
                              <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="1.8" className="w-6 h-6 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12h12m0 0l-4-4m4 4l-4 4" /></svg>
                              <div className="text-center">
                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">To</p>
                                <p className="font-semibold text-gray-900" style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.6rem", lineHeight: 1.1 }}>{post.travelling_to}</p>
                              </div>
                            </div>
                          </div>

                          {/* Date pill */}
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5" style={{ backgroundColor: "#fff4f0", color: "#FF6B35" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                            {new Date(post.travel_date).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="px-4 pb-4 sm:px-6 sm:pb-6 flex gap-3">
                          <button
                            onClick={() => setCardIndex(i => i + 1)}
                            className="group flex-1 flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-500 py-3 rounded-xl text-sm font-semibold transition-all"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            Pass
                          </button>
                          <button
                            onClick={() => setContactPost(post)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-gray-400 text-gray-600 py-3 rounded-xl text-sm font-medium transition-all"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                            Message
                          </button>
                          <button
                            onClick={() => { sendConnectionRequest(post); setCardIndex(i => i + 1); }}
                            className="group flex-1 flex items-center justify-center gap-2 border-2 text-white py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
                            style={{ backgroundColor: "#FF6B35", borderColor: "#FF6B35" }}
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>
                            Connect
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* MY POSTS */}
        {activeTab === "myposts" && (
          <div>
            {(!Array.isArray(myPosts) || myPosts.length === 0) ? (
              <div className="text-center border border-dashed border-gray-200 rounded-xl py-16 px-8">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-12 h-12 mx-auto mb-4 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                <p className="text-gray-700 font-medium mb-1">No posts yet</p>
                <p className="text-gray-400 text-sm mb-5">Create your first travel post to find companions on your journey.</p>
                <button onClick={() => handleCreatePost()} className="btn-accent px-5 h-11 rounded-xl text-sm font-medium">
                  Create Post
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-w-3xl mx-auto">
                <p className="text-gray-500 text-sm">{myPosts.length} post{myPosts.length !== 1 ? "s" : ""}</p>
                {myPosts.map(post => (
                  <div key={post.id} className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-gray-900 font-semibold text-sm">{post.user_name}</p>
                        <p className="text-gray-400 text-xs">Post #{post.id}</p>
                      </div>
                      <p className="text-gray-400 text-xs">{new Date(post.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-3">
                      <div className="flex items-center justify-center gap-5">
                        <div className="text-center">
                          <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">From</p>
                          <p className="text-gray-900 font-medium text-sm">{post.travelling_from}</p>
                        </div>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                        <div className="text-center">
                          <p className="text-gray-400 text-xs uppercase tracking-widest mb-0.5">To</p>
                          <p className="text-gray-900 font-medium text-sm">{post.travelling_to}</p>
                        </div>
                      </div>
                      <div className="text-center mt-2">
                        <p className="text-gray-500 text-xs">{new Date(post.travel_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => deletePost(post.id)}
                      className="w-full text-red-600 border border-red-200 hover:border-red-400 h-10 rounded-lg text-sm transition-colors">
                      Delete Post
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />

      {/* Contact Modal */}
      {contactPost && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={() => setContactPost(null)}>
          <div className="bg-white border border-gray-200 rounded-t-2xl sm:rounded-2xl p-5 sm:p-7 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "1.4rem", color: "#000" }}>Contact Traveller</h2>
              <button onClick={() => setContactPost(null)} className="text-gray-400 hover:text-gray-900 text-xl leading-none">✕</button>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
              <p className="text-gray-400 text-xs mb-1">Traveller</p>
              <p className="text-gray-900 font-semibold">{contactPost.user_name}</p>
            </div>

            <div className="flex items-center justify-center gap-6 bg-gray-50 border border-gray-100 rounded-xl p-4 mb-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">From</p>
                <p className="text-gray-900 font-semibold">{contactPost.travelling_from}</p>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
              <div className="text-center">
                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">To</p>
                <p className="text-gray-900 font-semibold">{contactPost.travelling_to}</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {contactPost.user_email && (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">📧 Email</p>
                    <p className="text-gray-900 text-sm font-medium break-all">{contactPost.user_email}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(contactPost.user_email)}
                    className="ml-3 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg shrink-0 transition-colors">
                    Copy
                  </button>
                </div>
              )}
              {contactPost.user_phone ? (
                <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">📱 Phone</p>
                    <p className="text-gray-900 text-sm font-medium">{contactPost.user_phone}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(contactPost.user_phone)}
                    className="ml-3 text-xs text-gray-500 hover:text-gray-900 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg shrink-0 transition-colors">
                    Copy
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
                  <p className="text-gray-400 text-sm">No phone number added by this traveller</p>
                </div>
              )}
            </div>

            <button onClick={() => { sendConnectionRequest(contactPost); setContactPost(null); }}
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl text-sm font-medium transition-colors">
              ❤️ Send Connection Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
