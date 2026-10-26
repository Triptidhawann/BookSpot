import React, { useState } from 'react';

export default function BookingModal({
  isOpen,
  seat,
  onClose,
  onConfirm,
  isSubmitting = false
}) {
  const [duration, setDuration] = useState(3);

  if (!isOpen || !seat) return null;

  const durationOptions = [1, 2, 3, 4, 6, 12];

  const calculateEndTime = (hrs) => {
    const baseHour = 10;
    const baseMinute = 30;
    const totalMinutes = baseHour * 60 + baseMinute + hrs * 60;
    let endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    const ampm = endHour >= 12 ? 'PM' : 'AM';
    if (endHour > 12) endHour -= 12;
    const minuteStr = endMinute < 10 ? '0' + endMinute : endMinute;
    return `${endHour}:${minuteStr} ${ampm}`;
  };

  const handleConfirm = () => {
    onConfirm({
      seatNo: seat.seatNo,
      zone: seat.zone,
      duration,
      startTime: "10:30 AM",
      endTime: calculateEndTime(duration)
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(51, 47, 50, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 48px rgba(48, 41, 43, 0.16)',
          maxWidth: '470px',
          width: '100%',
          overflow: 'hidden',
          padding: '24px',
          position: 'relative',
          animation: 'modalPop 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Armchair Icon */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                backgroundColor: '#ffdadb',
                color: '#8b484f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>weekend</span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3
                  style={{
                    color: '#8b484f',
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2
                  }}
                >
                  Seat {seat.seatNo}
                </h3>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(63, 100, 74, 0.12)',
                    color: '#3f644a',
                    fontWeight: 600,
                    fontSize: '11px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#3f644a'
                    }}
                  />
                  Available Now
                </span>
              </div>
              <p
                style={{
                  color: '#534344',
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  fontWeight: 400
                }}
              >
                {seat.zone} • Study Desk
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'transparent',
              color: '#777174',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf1f5')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {/* Select Duration */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 700, color: '#1e1a1d', fontSize: '14px' }}>
              Select Duration
            </span>
            <span style={{ color: '#a85f66', fontWeight: 500, fontSize: '12px' }}>
              Daily limit: 12h max
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
            {durationOptions.map((hrs) => {
              const isActive = duration === hrs;
              return (
                <button
                  key={hrs}
                  type="button"
                  onClick={() => setDuration(hrs)}
                  style={{
                    padding: '10px 0',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '13px',
                    backgroundColor: isActive ? '#8b484f' : '#f8f2f4',
                    color: isActive ? '#ffffff' : '#1e1a1d',
                    boxShadow: isActive ? '0 2px 6px rgba(139, 72, 79, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#efe6e9';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#f8f2f4';
                  }}
                >
                  {hrs}h
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Time / Release Time Pink Card */}
        <div
          style={{
            marginTop: '18px',
            backgroundColor: '#fff0f2',
            padding: '14px 18px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div
              style={{
                textTransform: 'uppercase',
                color: '#8b484f',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.06em'
              }}
            >
              START TIME
            </div>
            <div
              style={{
                color: '#1e1a1d',
                fontWeight: 800,
                fontSize: '20px',
                marginTop: '2px',
                lineHeight: 1.2
              }}
            >
              10:30 AM
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span
              style={{
                color: '#7a5558',
                padding: '3px 12px',
                borderRadius: '9999px',
                backgroundColor: '#ffd9dc',
                fontWeight: 600,
                fontSize: '11px'
              }}
            >
              {duration} hrs duration
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#b08b8e',
                marginTop: '4px',
                fontSize: '14px'
              }}
            >
              →
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                textTransform: 'uppercase',
                color: '#8b484f',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.06em'
              }}
            >
              RELEASE TIME
            </div>
            <div
              style={{
                color: '#1e1a1d',
                fontWeight: 800,
                fontSize: '20px',
                marginTop: '2px',
                lineHeight: 1.2
              }}
            >
              {calculateEndTime(duration)}
            </div>
          </div>
        </div>

        {/* Checklist container */}
        <div
          style={{
            marginTop: '16px',
            backgroundColor: '#faf2f5',
            padding: '12px 16px',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#534344', fontSize: '13px', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#3f644a', flexShrink: 0 }}>
              check_circle
            </span>
            <span>Requires check-in within 15 minutes of session start</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#534344', fontSize: '13px', fontWeight: 500 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#3f644a', flexShrink: 0 }}>
              check_circle
            </span>
            <span>Complimentary Campus High-Speed Wi-Fi included</span>
          </div>
        </div>

        {/* Bottom CTA buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            style={{
              flex: 1,
              padding: '14px 20px',
              borderRadius: '14px',
              fontSize: '14.5px',
              fontWeight: 700,
              backgroundColor: '#8b484f',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(139, 72, 79, 0.25)',
              transition: 'background-color 0.15s ease, transform 0.1s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#a85f66')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#8b484f')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>how_to_reg</span>
            <span>{isSubmitting ? 'Saving reservation...' : 'Confirm Reservation'} for {seat.seatNo}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '14px 20px',
              borderRadius: '14px',
              border: 'none',
              backgroundColor: '#f4ecef',
              color: '#1e1a1d',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#efe6e9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f4ecef')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
