import React from 'react';

export default function FloatingBookingBar({
  selectedSeat,
  onCompleteBooking,
  onClear
}) {
  if (!selectedSeat) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        pointerEvents: 'auto',
        maxWidth: '90vw'
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(216, 193, 194, 0.4)',
          padding: '10px 20px',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          color: 'var(--on-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-fixed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chair</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="label-sm" style={{ fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                Seat {selectedSeat.id}
              </span>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
              <span className="body-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 500 }}>
                {selectedSeat.zone?.split('—')[0].trim() || 'Level 2 Desk'}
              </span>
            </div>
            <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontSize: '11px' }}>
              Ready to reserve • 3 hrs duration
            </span>
          </div>
        </div>

        <div style={{ width: '1px', height: '28px', backgroundColor: 'rgba(216, 193, 194, 0.4)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onCompleteBooking}
            style={{
              borderRadius: 'var(--radius-full)',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>how_to_reg</span>
            Complete Booking
          </button>

          <button
            type="button"
            onClick={onClear}
            title="Clear selection"
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--on-surface-variant)',
              padding: '8px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-container)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>
      </div>
    </div>
  );
}
