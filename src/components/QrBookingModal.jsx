import React from 'react';

export default function QrBookingModal({ booking, qrCode, onClose }) {
  if (!booking) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(51, 47, 50, 0.45)',
        backdropFilter: 'blur(3px)'
      }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Booking check-in QR"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          borderRadius: '20px',
          backgroundColor: '#fff',
          boxShadow: '0 20px 48px rgba(48, 41, 43, 0.16)',
          padding: '24px',
          textAlign: 'center'
        }}
      >
        <h2 style={{ margin: '0 0 6px', color: 'var(--primary)' }}>Your Check-In QR</h2>
        <p className="body-sm" style={{ margin: '0 0 16px', color: 'var(--on-surface-variant)' }}>
          Seat {booking.seatNo} · Scan this code at the library entrance
        </p>
        {qrCode && (
          <img
            src={qrCode}
            alt={`QR code for Seat ${booking.seatNo}`}
            style={{ width: '260px', maxWidth: '100%', aspectRatio: '1', borderRadius: '12px' }}
          />
        )}
        <p className="body-sm" style={{ margin: '14px 0 18px', color: 'var(--on-surface-variant)' }}>
          Check-in is valid until 15 minutes after the session start time.
        </p>
        <button type="button" className="btn-primary" onClick={onClose} style={{ width: '100%' }}>
          Done
        </button>
      </div>
    </div>
  );
}
