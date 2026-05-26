import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { UserProvider } from "./UserContext";

// Lazy-load all pages for code splitting
const LandingPage      = lazy(() => import("./LandingPage"));
const MainMenu         = lazy(() => import("./mainmenu"));
const TinderLikePage   = lazy(() => import("./TinderLikePage"));
const TravelGroupsPage = lazy(() => import("./TravelGroupsPage"));
const MatchesPage      = lazy(() => import("./MatchesPage"));
const PlanBookingsPage = lazy(() => import("./PlanBookingsPage"));
const MyBookingsPage   = lazy(() => import("./MyBookingsPage"));
const SignInPage       = lazy(() => import("./SignInPage"));
const SignUpPage       = lazy(() => import("./SignUpPage"));
const AIPage           = lazy(() => import("./AIPage"));
const ProfilePage      = lazy(() => import("./ProfilePage"));

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Page crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
          <div className="text-center max-w-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 text-sm mb-6">This page ran into an error. Try going back.</p>
            <button
              onClick={() => { this.setState({ hasError: false }); window.history.back(); }}
              className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-900"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function TravelGroupsPageWrapper() {
  const location = useLocation();
  const selectedLocation = location.state?.selectedLocation || "Delhi";
  return <TravelGroupsPage selectedLocation={selectedLocation} />;
}

function App() {
  return (
    <UserProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route path="/"              element={<LandingPage />} />
              <Route path="/menu"          element={<MainMenu />} />
              <Route path="/signin"        element={<SignInPage />} />
              <Route path="/signup"        element={<SignUpPage />} />
              <Route path="/tinder"        element={<TinderLikePage />} />
              <Route path="/travel-groups" element={<TravelGroupsPageWrapper />} />
              <Route path="/matches"       element={<MatchesPage />} />
              <Route path="/ai-agent"      element={<AIPage />} />
              <Route path="/plan-bookings" element={<PlanBookingsPage />} />
              <Route path="/my-bookings"   element={<MyBookingsPage />} />
              <Route path="/profile"       element={<ProfilePage />} />
              {/* Catch-all: redirect unknown URLs to home */}
              <Route path="*"              element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Router>
    </UserProvider>
  );
}

export default App;
