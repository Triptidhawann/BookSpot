import React from 'react';

export default function ActiveBookingCard({
  booking,
  onExtendTime,
  onViewOnMap,
  onCancelBooking
}) {
  if (!booking) return null;

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-md)',
        padding: 'var(--space-lg)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(216, 193, 194, 0.25)'
      }}
    >
      {/* Decorative Rose Ambient Glow */}
      <div
        style={{
          position: 'absolute',
          right: '-80px',
          top: '-80px',
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 206, 210, 0.4)',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {/* Badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <span
            className="label-sm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--tertiary-fixed)',
              color: 'var(--on-tertiary-fixed)',
              fontWeight: 600
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
            Check-in Confirmed
          </span>

          <span
            className="label-sm"
            style={{
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--surface-container)',
              color: 'var(--on-surface)',
              fontWeight: 500
            }}
          >
            Collab Zone 2B
          </span>
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <h2 className="headline-xl" style={{ color: 'var(--on-surface)', fontWeight: 700 }}>
            Seat {booking.seatId}
          </h2>
          <span className="headline-md" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            — Central Collaboration Table
          </span>
        </div>

        {/* Timing */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--on-surface-variant)', fontSize: '14px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>schedule</span>
          <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
            {booking.startTime} – {booking.endTime}
          </span>
          <span>({booking.durationHours} hours total duration)</span>
        </div>

        {/* Description */}
        <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: '680px', lineHeight: 1.6 }}>
          {booking.notes}
        </p>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            marginTop: 'var(--space-sm)',
            paddingTop: 'var(--space-sm)',
            borderTop: '1px solid rgba(216, 193, 194, 0.2)'
          }}
        >
          <button
            type="button"
            className="btn-primary"
            onClick={onExtendTime}
            style={{ padding: '10px 18px', fontSize: '14px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>more_time</span>
            <span>Extend Time (+1 hr)</span>
          </button>

          <button
            type="button"
            className="btn-secondary"
            onClick={onViewOnMap}
            style={{ padding: '10px 18px', fontSize: '14px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>map</span>
            <span>View on Map</span>
          </button>

          <button
            type="button"
            onClick={onCancelBooking}
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'transparent',
              color: 'var(--error)',
              padding: '8px 16px',
              borderRadius: 'var(--radius-default)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--error-container)';
              e.currentTarget.style.color = 'var(--on-error-container)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--error)';
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>cancel</span>
            <span>Cancel Booking</span>
          </button>
        </div>
      </div>
    </div>
  );
}
