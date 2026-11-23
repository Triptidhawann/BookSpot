import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { currentUser } from '../data/mockData';
import { API_URL, api } from '../utils/api';
import './Header.css';

const readNotifications = (storageKey) => {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

const formatNotificationTime = (value) => new Date(value).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const calculateStreak = (activityDates) => {
  const now = new Date(Date.now() + 330 * 60 * 1000);
  const activeDates = new Set(activityDates);
  const today = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`;
  const dateOrdinal = (date) => Date.UTC(...date.split('-').map(Number).map((value, index) => index === 1 ? value - 1 : value)) / 86400000;
  let cursor = dateOrdinal(today);
  if (!activeDates.has(today)) cursor -= 1;
  let streak = 0;
  while (activeDates.has(new Date(cursor * 86400000).toISOString().slice(0, 10))) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
};

export default function Header({
  onOpenMobileSidebar,
  searchQuery,
  onSearchChange,
  onNavigate,
  user = currentUser
}) {
  const rollNo = user?.roll_no || user?.rollNo;
  const storageKey = useMemo(() => `bookspot_notifications_${rollNo || 'guest'}`, [rollNo]);
  const [notifications, setNotifications] = useState(() => readNotifications(storageKey));
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [checkoutInProgress, setCheckoutInProgress] = useState(null);
  const [streakDays, setStreakDays] = useState(0);
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const saveNotifications = useCallback((nextNotifications) => {
    const recent = nextNotifications.slice(0, 20);
    localStorage.setItem(storageKey, JSON.stringify(recent));
    setNotifications(recent);
  }, [storageKey]);

  const addNotification = useCallback((notification) => {
    const existing = readNotifications(storageKey);
    if (existing.some((item) => item.id === notification.id)) return;
    saveNotifications([{ ...notification, read: false, createdAt: Date.now() }, ...existing]);
  }, [saveNotifications, storageKey]);

  useEffect(() => {
    setNotifications(readNotifications(storageKey));
    setIsNotificationOpen(false);
  }, [storageKey]);

  useEffect(() => {
    let isCurrent = true;
    if (!rollNo || !localStorage.getItem('token')) {
      setStreakDays(0);
      return () => { isCurrent = false; };
    }

    api.get(`${API_URL}/study-statistics`)
      .then(({ data }) => {
        if (!isCurrent) return;
        const dates = Array.isArray(data?.statistics?.activity_dates)
          ? data.statistics.activity_dates.map((date) => String(date).slice(0, 10))
          : [];
        setStreakDays(calculateStreak(dates));
      })
      .catch(() => {
        if (isCurrent) setStreakDays(0);
      });

    return () => { isCurrent = false; };
  }, [rollNo]);

  useEffect(() => {
    if (!rollNo || !localStorage.getItem('token')) return undefined;
    let isCurrent = true;

    const checkBookingDeadline = async () => {
      try {
        const { data } = await api.get(`${API_URL}/booking-reminders`);
        if (!isCurrent || !Array.isArray(data?.reminders)) return;

        for (const booking of data.reminders) {
          const bookingId = booking.booking_id;
          if (booking.reminder_type === 'ending-soon') {
            addNotification({
              id: `${bookingId}:ending-soon`,
              type: 'ending-soon',
              title: '10 minutes left',
              message: `Your booking for seat ${booking.seatNo} ends within 10 minutes.`,
              bookingId
            });
          } else if (booking.reminder_type === 'time-ended') {
            addNotification({
              id: `${bookingId}:time-ended`,
              type: 'time-ended',
              title: 'Booking time is over',
              message: `Your booking for seat ${booking.seatNo} has ended. Please check out.`,
              bookingId,
              action: 'checkout'
            });
          }
        }
      } catch (error) {
        if (isCurrent) console.error('Unable to check booking reminders:', error.response?.data || error.message);
      }
    };

    checkBookingDeadline();
    const timer = window.setInterval(checkBookingDeadline, 30_000);
    return () => {
      isCurrent = false;
      window.clearInterval(timer);
    };
  }, [addNotification, rollNo]);

  const toggleNotifications = () => {
    const opening = !isNotificationOpen;
    setIsNotificationOpen(opening);
    if (opening) {
      saveNotifications(notifications.map((notification) => ({ ...notification, read: true })));
    }
  };

  const handleNotificationAction = async (notification) => {
    if (notification.action !== 'checkout' || !notification.bookingId) return;
    setCheckoutInProgress(notification.id);
    try {
      await api.post(`${API_URL}/check-out`, { bookingId: notification.bookingId });
      saveNotifications(notifications.map((item) => item.id === notification.id
        ? { ...item, action: null, message: `You checked out from seat booking ${notification.bookingId}.`, read: true }
        : item));
    } catch (error) {
      saveNotifications([{ ...notification, message: error.response?.data?.msg || 'Could not check out. Please try again from your dashboard.', read: true }, ...notifications.filter((item) => item.id !== notification.id)]);
    } finally {
      setCheckoutInProgress(null);
    }
  };

  return (
    <header
      className="dashboard-header"
      style={{
        position: 'fixed',
        top: 0,
        left: '260px',
        right: 0,
        height: '64px',
        backgroundColor: 'rgba(255, 247, 249, 0.85)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 1px 8px rgba(48, 41, 43, 0.04)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--gutter-desktop)',
        borderBottom: '1px solid rgba(216, 193, 194, 0.25)',
        transition: 'left 0.25s ease'
      }}
    >
      {/* Left Search & Mobile Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="mobile-sidebar-toggle"
          style={{
            display: 'none',
            border: 'none',
            background: 'transparent',
            color: 'var(--on-surface)',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: 'var(--radius-default)'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>menu</span>
        </button>

        {/* Search Input */}
     
      </div>

      {/* Right controls: Campus Badge, Notification, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <span
          className="desktop-only label-sm"
          style={{
            backgroundColor: 'var(--surface-container-low)',
            padding: '4px var(--space-md)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--on-surface-variant)',
            fontWeight: 500
          }}
        >
          Chitkara University Library
        </span>

        {/* Notifications */}
        <div className="header-notifications">
        <div
          className={`header-streak ${streakDays > 0 ? 'active' : ''}`}
          role="img"
          aria-label={`${streakDays} day${streakDays === 1 ? '' : 's'} study streak`}
          title={`${streakDays} day${streakDays === 1 ? '' : 's'} study streak`}
        >
          <span className="material-symbols-outlined">local_fire_department</span>
          <strong>{streakDays}</strong>
        </div>
        <button
          type="button"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          aria-expanded={isNotificationOpen}
          aria-haspopup="dialog"
          style={{
            position: 'relative',
            padding: '6px',
            color: 'var(--on-surface-variant)',
            background: 'transparent',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={toggleNotifications}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
          {unreadCount > 0 && <span className="notification-unread-dot" aria-hidden="true" />}
        </button>
        {isNotificationOpen && (
          <section className="notification-popover" role="dialog" aria-label="Recent notifications">
            <div className="notification-popover-heading">
              <strong>Notifications</strong>
              <span>{notifications.length} recent</span>
            </div>
            {notifications.length === 0 ? (
              <p className="notification-empty">You’re all caught up.</p>
            ) : (
              <div className="notification-list">
                {notifications.map((notification) => (
                  <article className={`notification-item ${notification.type || ''}`} key={notification.id}>
                    <span className="material-symbols-outlined notification-item-icon">
                      {notification.type === 'time-ended' ? 'priority_high' : 'schedule'}
                    </span>
                    <div className="notification-item-content">
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <time dateTime={new Date(notification.createdAt).toISOString()}>{formatNotificationTime(notification.createdAt)}</time>
                      {notification.action === 'checkout' && (
                        <button
                          type="button"
                          className="notification-checkout-button"
                          onClick={() => handleNotificationAction(notification)}
                          disabled={checkoutInProgress === notification.id}
                        >
                          {checkoutInProgress === notification.id ? 'Checking out…' : 'Check out now'}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        </div>

        {/* User profile */}
        <div
          onClick={() => onNavigate && onNavigate('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '8px',
            cursor: 'pointer'
          }}
        >
          <div className="desktop-only" style={{ textAlign: 'right' }}>
            <div className="label-lg" style={{ fontWeight: 600, color: 'var(--on-surface)', lineHeight: 1.2 }}>
              {user.name}
            </div>
            <div className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>
              {user.role}
            </div>
          </div>
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 1px 3px rgba(48, 41, 43, 0.08)',
              border: '1.5px solid var(--surface-container-high)'
            }}
          />
        </div>
      </div>
    </header>
  );
}
