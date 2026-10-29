import React, { useState } from 'react';
import LandingView from './views/LandingView';
import FloorPlanView from './views/FloorPlanView';
import DashboardView from './views/DashboardView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import AdminLoginView from './views/admin/AdminLoginView';
import AdminDashboardView from './views/admin/AdminDashboardView';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('landing');
  const [selectedSeatFromLanding, setSelectedSeatFromLanding] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('bookspot_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [adminUser, setAdminUser] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem('bookspot_admin_session');
      return savedAdmin ? JSON.parse(savedAdmin) : null;
    } catch {
      return null;
    }
  });

  const handleNavigate = (view) => {
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSeatAndBook = (seat) => {
    setSelectedSeatFromLanding(seat);
    setActiveView('book-a-seat');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bookspot-app" style={{ minHeight: '100vh', width: '100%' }}>
      {activeView === 'landing' && (
        <LandingView
          onNavigate={handleNavigate}
          onSelectSeatAndBook={handleSelectSeatAndBook}
        />
      )}

      {activeView === 'book-a-seat' && (
        <FloorPlanView
          onNavigate={handleNavigate}
          initialSelectedSeat={selectedSeatFromLanding}
        />
      )}

      {(activeView === 'signin' || activeView === 'login') && (
        <SignInView
          onNavigate={handleNavigate}
          onAuthenticated={setLoggedInUser}
        />
      )}

      {activeView === 'signup' && (
        <SignUpView onNavigate={handleNavigate} />
      )}

      {(activeView === 'dashboard' ||
        activeView === 'my-bookings' ||
        activeView === 'booking-history' ||
        activeView === 'profile') && (
        <DashboardView onNavigate={handleNavigate} user={loggedInUser} />
      )}

      {/* Admin Portal Views */}
      {activeView === 'admin-login' && (
        <AdminLoginView
          onNavigate={handleNavigate}
          onAdminAuthenticated={setAdminUser}
        />
      )}

      {activeView === 'admin-dashboard' && (
        adminUser ? (
          <AdminDashboardView
            onNavigate={handleNavigate}
            adminUser={adminUser}
          />
        ) : (
          <AdminLoginView
            onNavigate={handleNavigate}
            onAdminAuthenticated={setAdminUser}
          />
        )
      )}
    </div>
  );
}
