import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage";
import MainMenu from "./mainmenu";
import TinderLikePage from "./TinderLikePage";
import TravelGroupsPage from "./TravelGroupsPage";
import MatchesPage from "./MatchesPage";
import PlanBookingsPage from "./PlanBookingsPage";
import MyBookingsPage from "./MyBookingsPage";
import SignInPage from "./SignInPage";
import SignUpPage from "./SignUpPage";
import AIPage from "./AIPage";
import ProfilePage from "./ProfilePage";
import { UserProvider } from "./UserContext";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/menu" element={<MainMenu />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/tinder" element={<TinderLikePage />} />
          <Route path="/travel-groups" element={<TravelGroupsPageWrapper />} />
          <Route path="/matches" element={<MatchesPage />} />
          <Route path="/ai-agent" element={<AIPage />} />
          <Route path="/plan-bookings" element={<PlanBookingsPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

// Wrapper to pass selectedLocation from route state
function TravelGroupsPageWrapper() {
  const location = useLocation();
  const selectedLocation = location.state?.selectedLocation || "Delhi";
  return <TravelGroupsPage selectedLocation={selectedLocation} />;
}

export default App;
