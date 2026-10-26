import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ActiveBookingCard from '../components/ActiveBookingCard';
import Toast from '../components/Toast';
import {
  currentUser,
  campusStatus,
  activeBooking as initialActiveBooking,
  upcomingBookings as initialUpcoming,
  studyHistory
} from '../data/mockData';

export default function DashboardView({ onNavigate, user }) {
  const dashboardUser = {
    ...currentUser,
    ...(user || {}),
    rollNo: user?.roll_no || currentUser.rollNo,
    role: user ? 'Student' : currentUser.role,
    semester: user ? 'BookSpot Student' : currentUser.semester
  };
  const [activeBooking, setActiveBooking] = useState(initialActiveBooking);
  const [upcoming, setUpcoming] = useState(initialUpcoming);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState({ show: false, title: '', subtitle: '' });

  const showToast = (title, subtitle) => {
    setToastData({ show: true, title, subtitle });
    setTimeout(() => {
      setToastData((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleExtendTime = () => {
    if (!activeBooking) return;
    setActiveBooking((prev) => ({
      ...prev,
      durationHours: prev.durationHours + 1,
      endTime: '2:30 PM',
      timeLeft: '2h 45m left'
    }));
    showToast('Reservation Extended', 'Added +1 hour to your session at Seat C04.');
  };

  const handleCancelBooking = () => {
    setActiveBooking(null);
    showToast('Booking Released', 'Seat C04 has been made available to fellow students.');
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
      {/* Sidebar navigation */}
      <Sidebar
        activeView="dashboard"
        onNavigate={onNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main layout */}
      <div className="main-content-layout" style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigate={onNavigate}
          user={dashboardUser}
        />

        {/* Content Body */}
        <main style={{ marginTop: '64px', padding: 'var(--space-lg) var(--gutter-desktop)', flex: 1 }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            
            {/* Top Greeting & Real-time Context */}
            <section style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    className="label-sm"
                    style={{
                      padding: '2px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--secondary-container)',
                      color: 'var(--on-secondary-container)',
                      fontWeight: 600
                    }}
                  >
                    {dashboardUser.semester}
                  </span>
                  <span style={{ color: 'var(--on-surface-variant)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
                    Live Campus Sync
                  </span>
                </div>

                <h1 className="headline-xl" style={{ color: 'var(--on-surface)', letterSpacing: '-0.02em', fontWeight: 700 }}>
                  Good morning, {dashboardUser.name.split(' ')[0]}!
                </h1>
                <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  Central University Library • Main Campus • Academic Year 2024–25
                </p>
              </div>

              {/* Date & Hours Card */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  border: '1px solid rgba(216, 193, 194, 0.25)'
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-default)',
                    backgroundColor: 'var(--surface-container-high)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>calendar_today</span>
                </div>
                <div>
                  <div className="headline-sm" style={{ color: 'var(--on-surface)', fontWeight: 600, fontSize: '15px' }}>
                    Thursday, Oct 24, 2024
                  </div>
                  <div className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--tertiary)' }}>schedule</span>
                    <span>Library Hours: {campusStatus.hours}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Logged-in student details */}
            <section
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-md)',
                padding: 'var(--space-md) var(--space-lg)',
                backgroundColor: 'var(--surface-container-lowest)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid rgba(216, 193, 194, 0.25)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--secondary-container)',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: '16px'
                  }}
                >
                  {dashboardUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ color: 'var(--on-surface)', fontWeight: 700 }}>
                    {dashboardUser.name}
                  </div>
                  <div style={{ color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                    {dashboardUser.role}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', color: 'var(--on-surface-variant)', fontSize: '12px' }}>
                <span><strong style={{ color: 'var(--on-surface)' }}>Campus ID:</strong> {dashboardUser.rollNo}</span>
                {dashboardUser.email && (
                  <span><strong style={{ color: 'var(--on-surface)' }}>Email:</strong> {dashboardUser.email}</span>
                )}
              </div>
            </section>

            {/* 3-Column Bento Stat Cards */}
            <section
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px'
              }}
            >
              {/* Stat 1: Live Library Capacity */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(216, 193, 194, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Live Library Capacity
                  </span>
                  <span
                    style={{
                      padding: '5px',
                      backgroundColor: 'var(--surface-container-low)',
                      color: 'var(--on-surface-variant)',
                      borderRadius: 'var(--radius-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>domain</span>
                  </span>
                </div>

                <div style={{ margin: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span className="headline-xl" style={{ fontSize: '42px', lineHeight: 1.05, fontWeight: 700, color: 'var(--on-surface)' }}>
                      {campusStatus.availableSeats}
                    </span>
                    <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                      / {campusStatus.totalSeats} seats open
                    </span>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span
                      className="label-sm"
                      style={{
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'var(--tertiary-fixed)',
                        color: 'var(--on-tertiary-fixed)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 600
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
                      Plenty of room
                    </span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-container-high)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: '60%', height: '100%', backgroundColor: 'var(--tertiary)', borderRadius: '9999px' }} />
                </div>
              </div>

              {/* Stat 2: Active Booking */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(216, 193, 194, 0.25)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Your Active Booking
                  </span>
                  <span
                    style={{
                      padding: '5px',
                      backgroundColor: 'var(--secondary-container)',
                      color: 'var(--primary)',
                      borderRadius: 'var(--radius-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>chair_alt</span>
                  </span>
                </div>

                <div style={{ margin: '10px 0' }}>
                  <div className="headline-xl" style={{ fontSize: '42px', lineHeight: 1.05, fontWeight: 700, color: 'var(--primary)' }}>
                    {activeBooking ? `Seat ${activeBooking.seatId}` : 'No Active Booking'}
                  </div>
                  {activeBooking && (
                    <div style={{ marginTop: '8px' }}>
                      <span
                        className="label-sm"
                        style={{
                          padding: '3px 9px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--primary-fixed)',
                          color: 'var(--on-primary-fixed-variant)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontWeight: 600
                        }}
                      >
                        <span
                          style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}
                          className="animate-pulse-slow"
                        />
                        Active Now • {activeBooking.timeLeft}
                      </span>
                    </div>
                  )}
                </div>

                <div className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  {activeBooking ? 'North Wing • Collab Table' : 'Browse seats to reserve a spot'}
                </div>
              </div>

              {/* Stat 3: Upcoming Reserved */}
              <div
                style={{
                  backgroundColor: 'var(--surface-container-lowest)',
                  padding: '18px 20px',
                  borderRadius: '18px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(216, 193, 194, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="label-md" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Upcoming Reserved
                  </span>
                  <span
                    style={{
                      padding: '5px',
                      backgroundColor: 'var(--surface-container-low)',
                      color: 'var(--on-surface-variant)',
                      borderRadius: 'var(--radius-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>event_upcoming</span>
                  </span>
                </div>

                <div style={{ margin: '10px 0' }}>
                  <div className="headline-xl" style={{ fontSize: '42px', lineHeight: 1.05, fontWeight: 700, color: 'var(--on-surface)' }}>
                    {upcoming.length} Scheduled
                  </div>
                  <div className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '8px', fontWeight: 500 }}>
                    Tomorrow, 2:00 PM • Desk E03
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('my-bookings')}
                  style={{
                    color: 'var(--primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer'
                  }}
                >
                  <span>Review itinerary</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </div>
              </div>
            </section>

            {/* Featured Active Booking Spotlight */}
            {activeBooking && (
              <ActiveBookingCard
                booking={activeBooking}
                onExtendTime={handleExtendTime}
                onViewOnMap={() => onNavigate('book-a-seat')}
                onCancelBooking={handleCancelBooking}
              />
            )}

            {/* Quick Action Callout Banner */}
            <section
              style={{
                borderRadius: 'var(--radius-xl)',
                background: 'linear-gradient(135deg, var(--primary-container) 0%, var(--primary) 60%, var(--secondary) 100%)',
                color: 'var(--on-primary)',
                padding: 'var(--space-lg) var(--space-xl)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-lg)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '580px' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    fontSize: '11px',
                    fontWeight: 600,
                    marginBottom: '8px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sensors</span>
                  <span>Real-time occupancy heat map</span>
                </div>
                <h3 className="headline-lg" style={{ color: '#ffffff', letterSpacing: '-0.01em', fontWeight: 700 }}>
                  Need a new study spot?
                </h3>
                <p className="body-md" style={{ color: 'rgba(255, 255, 255, 0.9)', marginTop: '4px' }}>
                  Explore the live interactive library floor plan to find open carrels and window desks.
                </p>
              </div>

              <div style={{ position: 'relative', zIndex: 1 }}>
                <button
                  type="button"
                  onClick={() => onNavigate('book-a-seat')}
                  style={{
                    backgroundColor: 'var(--surface-container-lowest)',
                    color: 'var(--primary)',
                    border: 'none',
                    borderRadius: 'var(--radius-lg)',
                    padding: '12px 24px',
                    fontFamily: 'inherit',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-md)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <span>Open Interactive Map</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_forward</span>
                </button>
              </div>
            </section>

            {/* Two-Column Section: Upcoming Bookings & Recent History */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: 'var(--space-lg)'
              }}
            >
              {/* Upcoming Bookings Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>
                      calendar_month
                    </span>
                    <h3 className="headline-sm" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>
                      Upcoming Bookings
                    </h3>
                  </div>
                  <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>
                    {upcoming.length} Reservations
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {upcoming.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        backgroundColor: 'var(--surface-container-lowest)',
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-lg)',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid rgba(216, 193, 194, 0.25)'
                      }}
                    >
                      <div>
                        <span className="label-sm" style={{ color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
                          {item.date}
                        </span>
                        <div className="headline-sm" style={{ color: 'var(--on-surface)', fontWeight: 600, marginTop: '2px' }}>
                          {item.zoneName}
                        </div>
                        <div className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                          {item.time}
                        </div>
                      </div>

                      <span
                        className="label-sm"
                        style={{
                          backgroundColor: 'var(--surface-container-low)',
                          padding: '4px 10px',
                          borderRadius: 'var(--radius-full)',
                          color: 'var(--on-surface)',
                          fontWeight: 500
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}

                  {/* Weekend prep card */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-container-low)',
                      padding: 'var(--space-md)',
                      borderRadius: 'var(--radius-lg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--secondary-container)',
                          color: 'var(--on-secondary-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
                      </div>
                      <div>
                        <div className="label-lg" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>
                          Weekend Prep?
                        </div>
                        <div className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                          Saturday silent pod slots just opened.
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onNavigate('book-a-seat')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-default)',
                        border: 'none',
                        backgroundColor: 'var(--surface-container-lowest)',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '12px',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-xs)'
                      }}
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Study History Table Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>
                      history_edu
                    </span>
                    <h3 className="headline-sm" style={{ color: 'var(--on-surface)', fontWeight: 600 }}>
                      Recent Study History
                    </h3>
                  </div>
                  <span
                    onClick={() => onNavigate('booking-history')}
                    style={{ color: 'var(--primary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <span>View full log</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: 'var(--surface-container-lowest)',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-sm)',
                    overflow: 'hidden',
                    border: '1px solid rgba(216, 193, 194, 0.25)'
                  }}
                >
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', fontSize: '11px', textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 16px' }}>Date</th>
                          <th style={{ padding: '10px 16px' }}>Seat / Zone</th>
                          <th style={{ padding: '10px 16px' }}>Duration</th>
                          <th style={{ padding: '10px 16px' }}>Outcome</th>
                          <th style={{ padding: '10px 16px', textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studyHistory.map((row) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid rgba(216, 193, 194, 0.15)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{row.date}</div>
                              <div style={{ color: 'var(--on-surface-variant)', fontSize: '11px' }}>{row.dateSub}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{row.seatId}</div>
                              <div style={{ color: 'var(--on-surface-variant)', fontSize: '11px' }}>{row.zone}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{row.duration}</div>
                              <div style={{ color: 'var(--on-surface-variant)', fontSize: '11px' }}>{row.timeWindow}</div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span
                                className="label-sm"
                                style={{
                                  backgroundColor: 'var(--tertiary-fixed)',
                                  color: 'var(--on-tertiary-fixed)',
                                  padding: '3px 8px',
                                  borderRadius: 'var(--radius-full)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontWeight: 600
                                }}
                              >
                                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
                                {row.outcome}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                type="button"
                                title="Re-book desk"
                                onClick={() => onNavigate('book-a-seat')}
                                style={{
                                  border: 'none',
                                  background: 'transparent',
                                  color: 'var(--on-surface-variant)',
                                  cursor: 'pointer',
                                  padding: '4px'
                                }}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>replay</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary bar */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-container-low)',
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      color: 'var(--on-surface-variant)',
                      fontSize: '12px'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--tertiary)' }}>verified</span>
                      <span>Avg. check-in punctuality: 98%</span>
                    </span>
                    <span>Total 12 sessions logged this semester</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Toast Alert */}
      <Toast
        show={toastData.show}
        title={toastData.title}
        subtitle={toastData.subtitle}
        onClose={() => setToastData((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
