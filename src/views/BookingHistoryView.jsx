import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { API_URL, api } from '../utils/api';
import { currentUser } from '../data/mockData';

const formatDate = (value) => {
  if (!value) return '—';
  const datePart = String(value).replace('T', ' ').split(' ')[0];
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) return datePart;
  return new Date(year, month - 1, day).toLocaleDateString();
};

const formatTime = (value) => {
  if (!value) return '—';
  const match = String(value).match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return String(value);
  const date = new Date(1970, 0, 1, Number(match[1]), Number(match[2]));
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
};

export default function BookingHistoryView({ onNavigate, onSignOut, user }) {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const historyUser = { ...currentUser, ...(user || {}) };

  useEffect(() => {
    let isCurrent = true;

    const loadBookingHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await api.get(`${API_URL}/booking-history`);
        if (!Array.isArray(response.data.bookings)) {
          throw new Error('Booking history response is invalid.');
        }
        if (isCurrent) setBookings(response.data.bookings);
      } catch (requestError) {
        if (isCurrent) setError(requestError.response?.data?.msg || requestError.message || 'Unable to load booking history.');
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    loadBookingHistory();
    return () => { isCurrent = false; };
  }, [user?.roll_no]);

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
      <Sidebar
        activeView="booking-history"
        onNavigate={onNavigate}
        onSignOut={onSignOut}
      />
      <div className="main-content-layout" style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header onNavigate={onNavigate} user={historyUser} />
        <main style={{ marginTop: '64px', padding: 'var(--space-lg) var(--gutter-desktop)', flex: 1 }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
              <h1 className="headline-xl" style={{ margin: 0, color: 'var(--on-surface)' }}>Booking History</h1>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                All bookings for {historyUser.roll_no || 'your account'}, newest first.
              </p>
            </div>

            <section style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(216, 193, 194, 0.25)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
              {isLoading ? (
                <p role="status" style={{ padding: '24px', color: 'var(--on-surface-variant)' }}>Loading booking history…</p>
              ) : error ? (
                <p role="alert" style={{ padding: '24px', color: 'var(--error)' }}>{error}</p>
              ) : bookings.length === 0 ? (
                <p style={{ padding: '24px', color: 'var(--on-surface-variant)' }}>No bookings found for this account.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'var(--surface-container-low)', color: 'var(--on-surface-variant)', fontSize: '12px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '14px 16px' }}>Booking</th>
                        <th style={{ padding: '14px 16px' }}>Booked On</th>
                        <th style={{ padding: '14px 16px' }}>Seat</th>
                        <th style={{ padding: '14px 16px' }}>Time</th>
                        <th style={{ padding: '14px 16px' }}>Status</th>
                        <th style={{ padding: '14px 16px' }}>Check-in</th>
                        <th style={{ padding: '14px 16px' }}>Check-out</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.booking_id} style={{ borderTop: '1px solid rgba(216, 193, 194, 0.2)', color: 'var(--on-surface)' }}>
                          <td style={{ padding: '14px 16px' }}>#{booking.booking_id}</td>
                          <td style={{ padding: '14px 16px' }}>{formatDate(booking.created_at || booking.start_time)}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>{booking.seatNo}</td>
                          <td style={{ padding: '14px 16px' }}>{formatTime(booking.start_time)} – {formatTime(booking.end_time)}</td>
                          <td style={{ padding: '14px 16px' }}>{booking.status}</td>
                          <td style={{ padding: '14px 16px' }}>{formatTime(booking.check_in_time)}</td>
                          <td style={{ padding: '14px 16px' }}>{formatTime(booking.check_out_time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
