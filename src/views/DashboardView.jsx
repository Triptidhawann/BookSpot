import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ActiveBookingCard from '../components/ActiveBookingCard';
import Toast from '../components/Toast';
import { API_URL, api } from '../utils/api';
import {
  currentUser,
  campusStatus
} from '../data/mockData';
// const date = new Date(Date.now());

const maxStreakFromDates = (dates) => {
  const activityDates = Array.isArray(dates) ? dates : [];
  const ordinals = [...new Set(activityDates.map((date) => String(date).slice(0, 10)))]
    .map((date) => Date.parse(`${date}T00:00:00Z`) / 86400000)
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
  let longest = 0;
  let current = 0;
  let previous = null;
  for (const ordinal of ordinals) {
    current = previous !== null && ordinal === previous + 1 ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = ordinal;
  }
  return longest;
};

const formatBookingTime = (value) => {
  if (!value) return '';

  const rawValue = String(value).trim();
  const timeMatch = rawValue.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (!timeMatch) return rawValue;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return new Date(1970, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
};

const normalizeStudentBooking = (booking) => ({
  ...booking,
  seatNo: booking.seatNo || booking.seat_no,
  startTime: formatBookingTime(booking.startTime || booking.start_time),
  endTime: formatBookingTime(booking.endTime || booking.end_time),
  durationHours: booking.durationHours || booking.duration_hours || booking.duration,
  checkInTime: booking.checkInTime || booking.check_in_time,
  checkOutTime: booking.checkOutTime || booking.check_out_time,
  tokenExpiresAt: booking.tokenExpiresAt || booking.token_expires_at,
  notes: booking.notes || ''
});

export default function DashboardView({ onNavigate, onSignOut, user }) {
  const userIdentifier = user?.roll_no || user?.rollNo || '';
  const actualEmail = user?.email || (String(userIdentifier).includes('@') ? userIdentifier : '');
  const dashboardUser = {
    ...currentUser,
    ...(user || {}),
    name: user?.name || 'Student',
    email: actualEmail,
    rollNo: userIdentifier,
    role: 'Student',
    semester: 'BookSpot Student'
  };
  const [activeBooking, setActiveBooking] = useState(null);
  const [seatSummary, setSeatSummary] = useState({ total: 0, booked: 0 });
  const [isSeatSummaryLoading, setIsSeatSummaryLoading] = useState(true);
  const [maxStreak, setMaxStreak] = useState(0);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState({ show: false, title: '', subtitle: '' });
  const availableSeats = Math.max(0, seatSummary.total - seatSummary.booked);
  const occupancyPercent = seatSummary.total ? Math.round((seatSummary.booked / seatSummary.total) * 100) : 0;
  const capacityLabel = !seatSummary.total
    ? 'Capacity unavailable'
    : availableSeats === 0
      ? 'Library is full'
      : availableSeats <= Math.ceil(seatSummary.total * 0.2)
        ? 'Limited availability'
        : 'Plenty of room';

  useEffect(() => {
    const getBookedSeat = async () => {
      if (!userIdentifier) {
        return;
      }
      if (!localStorage.getItem('token')) {
        setActiveBooking(null);
        return;
      }
      try {
        const response = await api.get(`${API_URL}/getBookedSeat`);
        const booking = response.data.bookings?.find((item) =>
          ['CONFIRMED', 'CHECKED_IN'].includes(String(item.status).toUpperCase()) && !item.check_out_time
        );
        setActiveBooking(
          booking ? normalizeStudentBooking(booking) : null
        );

      } catch (error) {
        console.error('Failed to load booked seat:', error.response?.data || error.message);
      }
    };

    getBookedSeat();
  }, [userIdentifier]);

  useEffect(() => {
    let isCurrent = true;
    const loadSeatSummary = async () => {
      try {
        const { data } = await api.get(`${API_URL}/getSeatsData`);
        if (!isCurrent || !Array.isArray(data)) return;
        const booked = data.filter((seat) => String(seat.isBooked || '').trim().toLowerCase() === 'booked').length;
        setSeatSummary({ total: data.length, booked });
      } catch (error) {
        if (isCurrent) console.error('Failed to load library capacity:', error.response?.data || error.message);
      } finally {
        if (isCurrent) setIsSeatSummaryLoading(false);
      }
    };

    loadSeatSummary();
    const interval = window.setInterval(loadSeatSummary, 30_000);
    return () => {
      isCurrent = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isCurrent = true;
    api.get(`${API_URL}/study-statistics`)
      .then(({ data }) => {
        if (isCurrent) setMaxStreak(maxStreakFromDates(data?.statistics?.activity_dates || []));
      })
      .catch((error) => {
        if (isCurrent) console.error('Failed to load study streak:', error.response?.data || error.message);
      });
    return () => { isCurrent = false; };
  }, [userIdentifier]);
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

  const handleCancelBooking = async () => {
    if (!activeBooking?.booking_id && !activeBooking?.bookingId) return;

    try {
      await api.post(`${API_URL}/cancelBooking`, {
        bookingId: activeBooking.booking_id || activeBooking.bookingId
      });
      setActiveBooking(null);
      showToast('Booking Released', `Seat ${activeBooking.seatNo} has been made available.`);
    } catch (error) {
      showToast('Unable to cancel', error.response?.data?.msg || error.message);
    }
  };

  const handleCheckOut = async () => {
    const bookingId = activeBooking?.booking_id || activeBooking?.bookingId;
    if (!bookingId) return;

    try {
      const response = await api.post(`${API_URL}/check-out`, { bookingId });
      setActiveBooking((previous) => ({
        ...previous,
        checkOutTime: response.data.checkOutTime,
        status: 'COMPLETED'
      }));
      showToast('Check-out successful', `Seat ${activeBooking.seatNo} has been released.`);
    } catch (error) {
      showToast('Check-out unavailable', error.response?.data?.msg || error.message);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
      {/* Sidebar navigation */}
      <Sidebar
        activeView="dashboard"
        onNavigate={onNavigate}
        onSignOut={onSignOut}
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
                  Heyy, {dashboardUser.name.split(' ')[0]}!
                </h1>
                <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '4px' }}>
                  Chitkara University Library • Academic Year 2026–27
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
                   Library Hours
                  </div>
                  <div className="label-sm" style={{ color: 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--tertiary)' }}>schedule</span>
                    <span>: {campusStatus.hours}</span>
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
                <span><strong style={{ color: 'var(--on-surface)' }}>{String(dashboardUser.rollNo).includes('@') ? 'Account ID:' : 'Campus ID:'}</strong> {dashboardUser.rollNo}</span>
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
                      {isSeatSummaryLoading ? '…' : availableSeats}
                    </span>
                    <span className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                      / {isSeatSummaryLoading ? '—' : seatSummary.total} seats open
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
                      {capacityLabel}
                    </span>
                  </div>
                </div>

                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--surface-container-high)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${isSeatSummaryLoading ? 0 : occupancyPercent}%`, height: '100%', backgroundColor: occupancyPercent >= 80 ? 'var(--primary)' : 'var(--tertiary)', borderRadius: '9999px', transition: 'width 0.25s ease' }} />
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
                  <div className="headline-xl" style={{ fontSize: '35px', lineHeight: 1.05, fontWeight: 700, color: 'var(--primary)' }}>
                    {activeBooking ? `Seat ${activeBooking.seatNo}` : 'No Active Booking'}
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
                  {activeBooking ? 'Enjoy your spot' : 'Browse seats to reserve a spot'}
                </div>
              </div>

              {/* Stat 3: Longest Study Streak */}
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
                    Best Study Streak
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
                    <span className="material-symbols-outlined" style={{ fontSize: '17px', color: maxStreak > 0 ? '#ed861b' : 'var(--on-surface-variant)' }}>local_fire_department</span>
                  </span>
                </div>

                <div style={{ margin: '10px 0' }}>
                  <div className="headline-xl" style={{ fontSize: '35px', lineHeight: 1.05, fontWeight: 700, color: 'var(--on-surface)' }}>
                    {maxStreak} {maxStreak === 1 ? 'Day' : 'Days'}
                  </div>
                  <div className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: '8px', fontWeight: 500 }}>
                    Longest consecutive study streak
                  </div>
                </div>

                <div
                  onClick={() => onNavigate('profile')}
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
                  <span>View study progress</span>
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
                onCheckOut={handleCheckOut}
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
