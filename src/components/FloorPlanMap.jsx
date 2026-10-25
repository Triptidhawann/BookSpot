import React, { useState } from 'react';
import SeatNode from './SeatNode';

export default function FloorPlanMap({
  seats,
  selectedSeat,
  myBookedSeatIds = ['C04'],
  onSelectSeat,
  activeFilter = 'all',
  onFilterChange
}) {
  const [zoomLevel, setZoomLevel] = useState(1.0);

  const filterOptions = [
    { id: 'all', label: 'All Floor Zones' },
    { id: 'A', label: 'Pod A (Window Nook)' },
    { id: 'B', label: 'Block B (Quiet Study)' },
    { id: 'C', label: 'Block C (Collab)' },
    { id: 'EF', label: 'Pods E & F (Silent Carrels)' },
  ];

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.75), 1.6));
  };

  const getZoneOpacity = (blockId) => {
    if (activeFilter === 'all') return 1;
    if (activeFilter === 'EF' && (blockId === 'E' || blockId === 'F')) return 1;
    if (activeFilter === blockId) return 1;
    return 0.35;
  };

  const podASeats = seats.filter((s) => s.id.startsWith('A'));
  const blockBSeats = seats.filter((s) => s.id.startsWith('B'));
  const blockCSeats = seats.filter((s) => s.id.startsWith('C'));
  const podESeats = seats.filter((s) => s.id.startsWith('E'));
  const podFSeats = seats.filter((s) => s.id.startsWith('F'));

  return (
    <div
      style={{
        backgroundColor: 'var(--surface-container-lowest)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-md) var(--space-lg)',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Top Header & Legend */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: 'var(--space-md)',
          paddingBottom: 'var(--space-sm)',
          borderBottom: '1px solid rgba(216, 193, 194, 0.25)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '24px' }}>
            architecture
          </span>
          <div>
            <div className="headline-sm" style={{ color: 'var(--on-surface)', fontWeight: 700 }}>
              Level 2 Blueprint Plan
            </div>
            <div className="label-sm" style={{ color: 'var(--on-surface-variant)', fontSize: '11px' }}>
              Ref: BLD-02-E • Strict Square Desks • Click any seat for immediate reservation
            </div>
          </div>
        </div>

        {/* Legend Indicators */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px' }}>
          {/* Green: Booked by You */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="label-sm">
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                backgroundColor: '#2e7d32',
                color: '#ffffff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 800,
                boxShadow: '0 1px 4px rgba(46, 125, 50, 0.3)'
              }}
            >
              ✓
            </span>
            <span style={{ color: '#2e7d32', fontWeight: 700 }}>Booked by You (Green)</span>
          </div>

          {/* Dusty Rose: Selected */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="label-sm">
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                backgroundColor: 'var(--primary)',
                color: 'var(--on-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              ✓
            </span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Selected Seat</span>
          </div>

          {/* Grey: Booked by Others (Darker on click) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="label-sm">
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                backgroundColor: '#d8d0d3',
                border: '1.5px solid #b8adb0',
                color: '#534344',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              ✕
            </span>
            <span style={{ color: 'var(--on-surface-variant)' }}>Booked (Grey / Darker Grey on click)</span>
          </div>

          {/* Available: Light */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="label-sm">
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                backgroundColor: '#ffffff',
                border: '1.5px solid #d4c8cb',
                color: '#1e1a1d',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 600
              }}
            >
              ○
            </span>
            <span style={{ color: 'var(--on-surface-variant)' }}>Available (White / Darker on hover)</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            title="Zoom In"
            onClick={() => handleZoom(0.15)}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--outline-variant)',
              backgroundColor: 'var(--surface-container-low)',
              cursor: 'pointer',
              color: 'var(--on-surface)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>zoom_in</span>
          </button>
          <button
            type="button"
            title="Zoom Out"
            onClick={() => handleZoom(-0.15)}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--outline-variant)',
              backgroundColor: 'var(--surface-container-low)',
              cursor: 'pointer',
              color: 'var(--on-surface)'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>zoom_out</span>
          </button>
          <button
            type="button"
            title="Reset Zoom"
            onClick={() => setZoomLevel(1.0)}
            style={{
              padding: '5px 10px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--outline-variant)',
              backgroundColor: 'var(--surface-container-low)',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--on-surface)'
            }}
          >
            {Math.round(zoomLevel * 100)}%
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      {onFilterChange && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: 'var(--space-md)'
          }}
        >
          {filterOptions.map((f) => {
            const isCurrent = activeFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onFilterChange(f.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: isCurrent ? 600 : 500,
                  cursor: 'pointer',
                  backgroundColor: isCurrent ? 'var(--primary)' : 'var(--surface-container-low)',
                  color: isCurrent ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                  boxShadow: isCurrent ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Scrollable Architectural Viewport */}
      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '10px 0',
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '1220px',
            minWidth: '1220px',
            height: '620px',
            backgroundColor: 'rgba(250, 241, 245, 0.45)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid rgba(216, 193, 194, 0.35)',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease',
            padding: '24px'
          }}
        >
          {/* Subtle guide grid background */}
          <div
            className="blueprint-grid"
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: 'var(--radius-lg)'
            }}
          />

          {/* Compass Rose */}
          <div
            style={{
              position: 'absolute',
              top: '16px',
              right: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              opacity: 0.4,
              pointerEvents: 'none'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
              navigation
            </span>
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: 'var(--on-surface)' }}>
              N
            </span>
          </div>

          {/* ======================================================== */}
          {/* 1. ORIGINAL FIXED ARCHITECTURAL STATIONS (EXACT MATCH TO DESIGN) */}
          {/* ======================================================== */}

          {/* Main Entrance: Bottom Center-Left (Exact sketch placement) */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '240px',
              width: '180px',
              height: '48px',
              borderRadius: 'var(--radius-default)',
              backgroundColor: 'var(--surface-container-high)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-xs)',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--on-surface)' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--primary)' }}>door_front</span>
              <span>Main Entrance</span>
            </div>
            {/* Door swing arcs */}
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                left: '20px',
                width: '24px',
                height: '10px',
                borderTop: '2px dashed var(--outline-variant)',
                borderRight: '2px dashed var(--outline-variant)',
                borderTopRightRadius: '24px',
                opacity: 0.6
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '-10px',
                right: '20px',
                width: '24px',
                height: '10px',
                borderTop: '2px dashed var(--outline-variant)',
                borderLeft: '2px dashed var(--outline-variant)',
                borderTopLeftRadius: '24px',
                opacity: 0.6
              }}
            />
          </div>

          {/* Reception Desk: Lower-Left Corner (Exact sketch placement) */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '24px',
              width: '170px',
              height: '125px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(255, 206, 210, 0.45)',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
              border: '1px solid rgba(216, 193, 194, 0.35)',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="label-sm" style={{ fontWeight: 600, color: 'var(--on-secondary-container)' }}>
                Reception
              </span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--secondary)' }}>
                room_service
              </span>
            </div>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px',
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--on-surface-variant)',
                fontWeight: 600
              }}
            >
              Check-in Desk
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--secondary)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
              <span>Staffed 8am–10pm</span>
            </div>
          </div>

          {/* Librarian Desk: Upper-Right Tall Station (Exact sketch placement) */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              right: '28px',
              width: '105px',
              height: '245px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(255, 178, 184, 0.3)',
              padding: '14px 10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-xs)',
              border: '1px solid rgba(216, 193, 194, 0.35)',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '4px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(139, 72, 79, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>local_library</span>
              </div>
              <span className="label-sm" style={{ fontWeight: 700, color: 'var(--on-primary-fixed-variant)', lineHeight: 1.2 }}>
                Librarian<br />Desk
              </span>
            </div>
            <div
              style={{
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 'var(--radius-sm)',
                padding: '4px',
                textAlign: 'center',
                fontSize: '10px',
                color: 'var(--primary)',
                fontWeight: 600
              }}
            >
              Help Point
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '9px', color: 'var(--on-surface-variant)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
              <span>Active</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 2. SEATING PODS (ALL STRICT SQUARE BOXES WITH AMPLE PADDING) */}
          {/* ======================================================== */}

          {/* POD A: Upper-Left Window Nook (16 seats strictly square boxes) */}
          {/* Fix: Square boxes only (A06 to A11 are NOT wide horizontal bars) */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              width: '270px',
              height: '310px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-container-lowest)',
              boxShadow: 'var(--shadow-sm)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1.5px solid rgba(216, 193, 194, 0.4)',
              opacity: getZoneOpacity('A'),
              transition: 'opacity 0.2s ease',
              zIndex: 10
            }}
          >
            {/* Top Row: A01 to A05 (5 strict square boxes) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {podASeats.slice(0, 5).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>

            {/* Middle Section: Left column (A06, A07, A08) and Right column (A09, A10, A11) */}
            {/* STRICT INDIVIDUAL SQUARE BOXES — NEVER HORIZONTAL BARS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '150px', position: 'relative', zIndex: 2 }}>
              {/* Left Column of 3 square seats */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '8px' }}>
                {podASeats.slice(5, 8).map((s) => (
                  <SeatNode
                    key={s.id}
                    seat={s}
                    isSelected={selectedSeat?.id === s.id}
                    isMyBooking={myBookedSeatIds.includes(s.id)}
                    onSelect={onSelectSeat}
                    size="md"
                  />
                ))}
              </div>

              {/* Center Pod Name / Window Nook label */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                  padding: '8px'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(139, 72, 79, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '4px'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>
                    wb_sunny
                  </span>
                </div>
                <span className="headline-sm" style={{ fontWeight: 800, color: 'var(--on-surface)', fontSize: '15px' }}>
                  POD A
                </span>
                <span
                  className="label-sm"
                  style={{
                    fontSize: '10px',
                    color: 'var(--primary)',
                    backgroundColor: 'rgba(139, 72, 79, 0.08)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    marginTop: '2px'
                  }}
                >
                  Window Nook
                </span>
              </div>

              {/* Right Column of 3 square seats */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%', gap: '8px' }}>
                {podASeats.slice(8, 11).map((s) => (
                  <SeatNode
                    key={s.id}
                    seat={s}
                    isSelected={selectedSeat?.id === s.id}
                    isMyBooking={myBookedSeatIds.includes(s.id)}
                    onSelect={onSelectSeat}
                    size="md"
                  />
                ))}
              </div>
            </div>

            {/* Bottom Row: A12 to A16 (5 strict square boxes) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {podASeats.slice(11, 16).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* BLOCK B: Upper Central Long Horizontal Table (Quiet Study - 32 seats) */}
          <div
            style={{
              position: 'absolute',
              top: '24px',
              left: '320px',
              width: '740px',
              height: '150px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-container-lowest)',
              boxShadow: 'var(--shadow-sm)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1.5px solid rgba(216, 193, 194, 0.4)',
              opacity: getZoneOpacity('B'),
              transition: 'opacity 0.2s ease',
              zIndex: 10
            }}
          >
            {/* Top row (B01 to B16) - 16 square boxes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {blockBSeats.slice(0, 16).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="sm"
                />
              ))}
            </div>

            {/* Central Divider with Label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pointerEvents: 'none',
                opacity: 0.6,
                margin: '2px 0',
                padding: '0 8px'
              }}
            >
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(216, 193, 194, 0.4)' }} />
              <span className="label-sm" style={{ fontWeight: 800, letterSpacing: '0.1em', color: 'var(--on-surface-variant)', fontSize: '10px', padding: '0 12px' }}>
                BLOCK B — QUIET STUDY RECTILINEAR (32 SEATS)
              </span>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(216, 193, 194, 0.4)' }} />
            </div>

            {/* Bottom row (B17 to B32) - 16 square boxes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {blockBSeats.slice(16, 32).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* BLOCK C: Active Collaboration Cluster (14 seats) */}
          <div
            style={{
              position: 'absolute',
              top: '195px',
              left: '320px',
              width: '400px',
              height: '170px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-container-lowest)',
              boxShadow: 'var(--shadow-sm)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1.5px solid rgba(139, 72, 79, 0.25)',
              opacity: getZoneOpacity('C'),
              transition: 'opacity 0.2s ease',
              zIndex: 10
            }}
          >
            {/* Top Row: C01 to C07 (7 square boxes) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', position: 'relative', zIndex: 2 }}>
              {blockCSeats.slice(0, 7).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pointerEvents: 'none',
                opacity: 0.6,
                margin: '2px 0'
              }}
            >
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(139, 72, 79, 0.2)' }} />
              <span className="label-sm" style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '11px', padding: '0 12px' }}>
                BLOCK C — COLLABORATION (14 SEATS)
              </span>
              <div style={{ height: '1px', flex: 1, backgroundColor: 'rgba(139, 72, 79, 0.2)' }} />
            </div>

            {/* Bottom Row: C08 to C14 (7 square boxes) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', position: 'relative', zIndex: 2 }}>
              {blockCSeats.slice(7, 14).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. RIGHT TWO SECTIONS (POD E & POD F) BACK IN BOTTOM-RIGHT CORNER */}
          {/* ======================================================== */}

          {/* POD E: Lower-Right Vertical 1 (Silent Research Carrel 1, next to corner) */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '215px',
              width: '165px',
              height: '300px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-container-lowest)',
              boxShadow: 'var(--shadow-sm)',
              padding: '18px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              border: '1.5px solid rgba(216, 193, 194, 0.4)',
              opacity: getZoneOpacity('E'),
              transition: 'opacity 0.2s ease',
              zIndex: 10
            }}
          >
            {/* Col 1: E01 to E06 (6 square boxes) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {podESeats.slice(0, 6).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                opacity: 0.35
              }}
            >
              <span
                className="label-sm"
                style={{
                  fontWeight: 900,
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  color: 'var(--on-surface)',
                  fontSize: '11px',
                  letterSpacing: '0.08em'
                }}
              >
                POD E (SILENT)
              </span>
            </div>

            {/* Col 2: E07 to E12 (6 square boxes) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {podESeats.slice(6, 12).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>
          </div>

          {/* POD F: Lower-Right Vertical 2 (Silent Research Carrel 2, far bottom-right corner) */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '28px',
              width: '165px',
              height: '300px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--surface-container-lowest)',
              boxShadow: 'var(--shadow-sm)',
              padding: '18px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              border: '1.5px solid rgba(216, 193, 194, 0.4)',
              opacity: getZoneOpacity('F'),
              transition: 'opacity 0.2s ease',
              zIndex: 10
            }}
          >
            {/* Col 1: F01 to F06 (6 square boxes) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {podFSeats.slice(0, 6).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                opacity: 0.35
              }}
            >
              <span
                className="label-sm"
                style={{
                  fontWeight: 900,
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  color: 'var(--on-surface)',
                  fontSize: '11px',
                  letterSpacing: '0.08em'
                }}
              >
                POD F (SILENT)
              </span>
            </div>

            {/* Col 2: F07 to F12 (6 square boxes) */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '6px', position: 'relative', zIndex: 2 }}>
              {podFSeats.slice(6, 12).map((s) => (
                <SeatNode
                  key={s.id}
                  seat={s}
                  isSelected={selectedSeat?.id === s.id}
                  isMyBooking={myBookedSeatIds.includes(s.id)}
                  onSelect={onSelectSeat}
                  size="md"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Blueprint Guidance Strip */}
      <div
        style={{
          marginTop: 'var(--space-sm)',
          paddingTop: 'var(--space-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--on-surface-variant)',
          fontSize: '12px',
          borderTop: '1px solid rgba(216, 193, 194, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--tertiary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>
            <span>All desk units equipped with dual USB-C & AC power outlets</span>
          </span>
          <span className="desktop-only" style={{ color: 'var(--outline-variant)' }}>•</span>
          <span className="desktop-only">Square box desks • Tap or click any open desk to book</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }}
            className="animate-pulse-slow"
          />
          <span>Live Synchronized: Just now</span>
        </div>
      </div>
    </div>
  );
}
