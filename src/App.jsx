import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LandingView from './views/LandingView';
import FloorPlanView from './views/FloorPlanView';
import DashboardView from './views/DashboardView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import AdminLoginView from './views/admin/AdminLoginView';
import AdminDashboardView from './views/admin/AdminDashboardView';
import CheckInView from './views/CheckInView';
import './App.css';

const viewPaths = {
  landing: '/',
  'book-a-seat': '/book-a-seat',
  signin: '/signin',
  login: '/signin',
  signup: '/signup',
  dashboard: '/dashboard',
  'my-bookings': '/my-bookings',
  'booking-history': '/booking-history',
  profile: '/profile',
  'admin-login': '/admin/login',
  'admin-dashboard': '/admin/dashboard',
  'check-in': '/check-in'
};

function readSavedUser(key) {
  try {
    const savedUser = localStorage.getItem(key);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSeatFromLanding, setSelectedSeatFromLanding] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(() => readSavedUser('bookspot_user'));
  const [adminUser, setAdminUser] = useState(() => (
    localStorage.getItem('bookspot_admin_token') ? readSavedUser('bookspot_admin_session') : null
  ));

  const handleNavigate = (view) => {
    navigate(viewPaths[view] || '/');
  };

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('bookspot_user');
    setLoggedInUser(null);
    navigate('/');
  };

  const handleSelectSeatAndBook = (seat) => {
    setSelectedSeatFromLanding(seat);
    navigate(viewPaths['book-a-seat']);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <div className="bookspot-app" style={{ minHeight: '100vh', width: '100%' }}>
      <Routes>
        <Route path="/" element={<LandingView onNavigate={handleNavigate} onSelectSeatAndBook={handleSelectSeatAndBook} />} />
        <Route path="/book-a-seat" element={<FloorPlanView onNavigate={handleNavigate} onSignOut={handleSignOut} initialSelectedSeat={selectedSeatFromLanding} />} />
        <Route path="/signin" element={<SignInView onNavigate={handleNavigate} onAuthenticated={setLoggedInUser} />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/signup" element={<SignUpView onNavigate={handleNavigate} />} />
        <Route path="/dashboard" element={<DashboardView onNavigate={handleNavigate} onSignOut={handleSignOut} user={loggedInUser} />} />
        <Route path="/my-bookings" element={<DashboardView onNavigate={handleNavigate} onSignOut={handleSignOut} user={loggedInUser} />} />
        <Route path="/booking-history" element={<DashboardView onNavigate={handleNavigate} onSignOut={handleSignOut} user={loggedInUser} />} />
        <Route path="/profile" element={<DashboardView onNavigate={handleNavigate} onSignOut={handleSignOut} user={loggedInUser} />} />
        <Route path="/admin/login" element={<AdminLoginView onNavigate={handleNavigate} onAdminAuthenticated={setAdminUser} />} />
        <Route
          path="/admin/dashboard"
          element={adminUser
            ? <AdminDashboardView onNavigate={handleNavigate} adminUser={adminUser} onAdminAuthenticated={setAdminUser} />
            : <Navigate to="/admin/login" replace />}
        />
        <Route path="/check-in" element={<CheckInView onNavigate={handleNavigate} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AppRoutes />;
}
