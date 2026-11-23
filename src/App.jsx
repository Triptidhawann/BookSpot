import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import LandingView from './views/LandingView';
import FloorPlanView from './views/FloorPlanView';
import DashboardView from './views/DashboardView';
import BookingHistoryView from './views/BookingHistoryView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import AdminLoginView from './views/admin/AdminLoginView';
import AdminDashboardView from './views/admin/AdminDashboardView';
import CheckInView from './views/CheckInView';
import ProfileView from './views/ProfileView';
import { API_URL, api, setStudentToken } from './utils/api';
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
  'admin-login': '/admin',
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

function applyLocalProfile(user) {
  const savedProfile = readSavedUser('bookspot_profile');
  return savedProfile?.roll_no === user?.roll_no ? { ...user, ...savedProfile } : user;
}

function getTokenExpiry(token) {
  try {
    const encodedPayload = token.split('.')[1];
    if (!encodedPayload) return null;
    const base64Payload = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=')));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSeatFromLanding, setSelectedSeatFromLanding] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [adminUser, setAdminUser] = useState(() => (
    localStorage.getItem('bookspot_admin_token') ? readSavedUser('bookspot_admin_session') : null
  ));

  const handleNavigate = (view) => {
    navigate(viewPaths[view] || '/');
  };

  const handleSignOut = () => {
    setStudentToken(null);
    localStorage.removeItem('bookspot_user');
    setLoggedInUser(null);
    setAuthLoading(false);
    navigate('/');
  };

  const handleAuthenticated = (user) => {
    setLoggedInUser(applyLocalProfile(user));
    setAuthLoading(false);
  };

  const handleSelectSeatAndBook = (seat) => {
    setSelectedSeatFromLanding(seat);
    navigate(viewPaths['book-a-seat']);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    let isCurrent = true;
    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.removeItem('bookspot_user');
      setAuthLoading(false);
      return () => { isCurrent = false; };
    }

    api.get(`${API_URL}/session`)
      .then(({ data }) => {
        if (!isCurrent) return;
        if (!data.status || !data.user) throw new Error('Invalid session response');
        const profile = applyLocalProfile(data.user);
        localStorage.setItem('bookspot_user', JSON.stringify(profile));
        setLoggedInUser(profile);
      })
      .catch((error) => {
        if (!isCurrent) return;
        if (error.response?.status === 401 || error.response?.status === 403) {
          setStudentToken(null);
          localStorage.removeItem('bookspot_user');
          setLoggedInUser(null);
        } else {
          setLoggedInUser(readSavedUser('bookspot_user'));
        }
      })
      .finally(() => {
        if (isCurrent) setAuthLoading(false);
      });

    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    if (!loggedInUser) return undefined;

    const token = localStorage.getItem('token');
    const expiresAt = token ? getTokenExpiry(token) : null;
    const clearExpiredSession = () => {
      setStudentToken(null);
      localStorage.removeItem('bookspot_user');
      setLoggedInUser(null);
      setAuthLoading(false);
    };

    if (!expiresAt || expiresAt <= Date.now()) {
      clearExpiredSession();
      return undefined;
    }

    const timeoutId = window.setTimeout(clearExpiredSession, expiresAt - Date.now());
    return () => window.clearTimeout(timeoutId);
  }, [loggedInUser]);

  const dashboardPage = authLoading
    ? <div role="status" style={{ padding: '24px' }}>Checking your session…</div>
    : loggedInUser
      ? <DashboardView onNavigate={handleNavigate} onSignOut={handleSignOut} user={loggedInUser} />
      : <Navigate to="/signin" replace />;
  const bookingHistoryPage = authLoading
    ? <div role="status" style={{ padding: '24px' }}>Checking your session…</div>
    : loggedInUser
      ? <BookingHistoryView onNavigate={handleNavigate} onSignOut={handleSignOut} user={loggedInUser} />
      : <Navigate to="/signin" replace />;
  const profilePage = authLoading
    ? <div role="status" style={{ padding: '24px' }}>Checking your session…</div>
    : loggedInUser
      ? <ProfileView onNavigate={handleNavigate} onSignOut={handleSignOut} onProfileUpdated={setLoggedInUser} user={loggedInUser} />
      : <Navigate to="/signin" replace />;

  return (
    <div className="bookspot-app" style={{ minHeight: '100vh', width: '100%' }}>
      <Routes>
        <Route path="/" element={<LandingView onNavigate={handleNavigate} onSelectSeatAndBook={handleSelectSeatAndBook} user={loggedInUser} authLoading={authLoading} onSignOut={handleSignOut} />} />
        <Route path="/book-a-seat" element={<FloorPlanView onNavigate={handleNavigate} onSignOut={handleSignOut} initialSelectedSeat={selectedSeatFromLanding} />} />
        <Route path="/signin" element={<SignInView onNavigate={handleNavigate} onAuthenticated={handleAuthenticated} />} />
        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="/signup" element={<SignUpView onNavigate={handleNavigate} />} />
        <Route path="/dashboard" element={dashboardPage} />
        <Route path="/my-bookings" element={dashboardPage} />
        <Route path="/booking-history" element={bookingHistoryPage} />
        <Route path="/profile" element={profilePage} />
        <Route path="/admin" element={<AdminLoginView onNavigate={handleNavigate} onAdminAuthenticated={setAdminUser} />} />
        <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin/dashboard"
          element={adminUser
            ? <AdminDashboardView onNavigate={handleNavigate} adminUser={adminUser} onAdminAuthenticated={setAdminUser} />
            : <Navigate to="/admin" replace />}
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
