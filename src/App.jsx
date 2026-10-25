import React, { useState } from 'react';
import LandingView from './views/LandingView';
import FloorPlanView from './views/FloorPlanView';
import DashboardView from './views/DashboardView';
import SignInView from './views/SignInView';
import SignUpView from './views/SignUpView';
import './App.css';

export default function App() {
  const [activeView, setActiveView] = useState('landing');
  const [selectedSeatFromLanding, setSelectedSeatFromLanding] = useState(null);

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
        <SignInView onNavigate={handleNavigate} />
      )}

      {activeView === 'signup' && (
        <SignUpView onNavigate={handleNavigate} />
      )}

      {(activeView === 'dashboard' ||
        activeView === 'my-bookings' ||
        activeView === 'booking-history' ||
        activeView === 'profile') && (
        <DashboardView onNavigate={handleNavigate} />
      )}
    </div>
  );
}
