import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateTripPage from './pages/CreateTripPage';
import ItineraryBuilderPage from './pages/ItineraryBuilderPage';
import ItineraryViewPage from './pages/ItineraryViewPage';
import CitySearchPage from './pages/CitySearchPage';
import ActivitySearchPage from './pages/ActivitySearchPage';
import BudgetPage from './pages/BudgetPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';
import MyTripsPage from './pages/MyTripsPage';
import SharedTripPage from './pages/SharedTripPage';
import CommunityPage from './pages/CommunityPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/shared/:slug" element={<SharedTripPage />} />
      <Route path="/trips/public/:slug" element={<SharedTripPage />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-trips"
        element={
          <ProtectedRoute>
            <MyTripsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-trip"
        element={
          <ProtectedRoute>
            <CreateTripPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId/build"
        element={
          <ProtectedRoute>
            <ItineraryBuilderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId/itinerary"
        element={
          <ProtectedRoute>
            <ItineraryViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId/itinerary-view"
        element={
          <ProtectedRoute>
            <ItineraryViewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <CommunityPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trip/:tripId/budget"
        element={
          <ProtectedRoute>
            <BudgetPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cities"
        element={
          <ProtectedRoute>
            <CitySearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <ActivitySearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              style: {
                background: '#10B981',
              },
            },
            error: {
              duration: 4000,
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;