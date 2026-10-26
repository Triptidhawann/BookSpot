import React, { useState } from 'react';

export default function SeatNode({
  seat,
  isSelected,
  isMyBooking = false,
  onSelect,
  size = 'md', // 'sm' | 'md'
  showLabel = true
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const isBookedByOther = seat.isBooked === 'booked';
  const isAvailable = seat.isBooked === 'available';

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(seat, isBookedByOther, isMyBooking);
  };

  // Dimensions: Strict square boxes with comfortable padding inside
  // md: 42px (Pod A, Block C, Pod E, Pod F)
  // sm: 36px (Block B 32-seat rectilinear table)
  const boxDim = size === 'sm' ? 36 : 42;
  const fontSize = size === 'sm' ? '12px' : '13px';

  // State-driven styling matching requirements:
  // 1. If booked by user -> Green (#2e7d32)
  // 2. If booked by others -> Grey (#d8d0d3), and when clicked turns darker grey (#6e6366)
  // 3. If available -> White (#ffffff), darker on hover (#ede2e5), dusty rose (#8b484f) when selected
  let backgroundColor = '#ffffff';
  let color = '#1e1a1d';
  let border = '1.5px solid #d4c8cb';
  let boxShadow = '0 1px 3px rgba(48, 41, 43, 0.05)';
  let cursor = 'pointer';
  let fontWeight = 600;

  if (isMyBooking) {
    // Green when reserved / booked by current user
    backgroundColor = '#2e7d32';
    color = '#ffffff';
    border = '1.5px solid #1b5e20';
    boxShadow = isSelected
      ? '0 0 0 3px rgba(46, 125, 50, 0.45), 0 2px 8px rgba(46, 125, 50, 0.3)'
      : '0 2px 6px rgba(46, 125, 50, 0.28)';
    fontWeight = 700;
  } else if (isBookedByOther) {
    // Grey when booked by others; turns darker grey on click/selection or hover
    if (isSelected) {
      // Darker grey on click / selection
      backgroundColor = '#6e6366';
      color = '#ffffff';
      border = '1.5px solid #4a4043';
      boxShadow = '0 0 0 3px rgba(110, 99, 102, 0.35)';
      fontWeight = 700;
    } else if (isHovered || isPressed) {
      backgroundColor = isPressed ? '#8c8083' : '#b8adb0';
      color = '#1e1a1d';
      border = '1.5px solid #998e91';
      boxShadow = '0 1px 4px rgba(0, 0, 0, 0.12)';
      fontWeight = 600;
    } else {
      backgroundColor = '#d8d0d3';
      color = '#534344';
      border = '1.5px solid #b8adb0';
      boxShadow = 'none';
      fontWeight = 500;
    }
  } else if (isSelected) {
    // Dusty rose selected highlight for available seat
    backgroundColor = '#8b484f';
    color = '#ffffff';
    border = '1.5px solid #632d33';
    boxShadow = '0 0 0 3px rgba(139, 72, 79, 0.35)';
    fontWeight = 700;
  } else if (isAvailable) {
    // Available unbooked: white/light, darker on hover/press
    if (isHovered || isPressed) {
      backgroundColor = '#ede2e5';
      border = '1.5px solid #8b484f';
      color = '#8b484f';
      boxShadow = '0 2px 6px rgba(139, 72, 79, 0.15)';
    } else {
      backgroundColor = '#ffffff';
      border = '1.5px solid #d4c8cb';
      color = '#1e1a1d';
    }
  }

  const tooltipText = isMyBooking
    ? `Seat ${seat.seatNo} (Booked by You • Green)`
    : isSelected && isBookedByOther
    ? `Seat ${seat.seatNo} (Booked by Another Student • Darker Grey)`
    : isBookedByOther
    ? `Seat ${seat.seatNo} (Booked • Grey)`
    : isSelected
    ? `Seat ${seat.seatNo} (Selected for Booking)`
    : `Seat ${seat.seatNo} (Available — Click to Reserve)`;

  return (
    <button
      type="button"
      title={tooltipText}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className="seat-square-box"
      style={{
        width: `${boxDim}px`,
        height: `${boxDim}px`,
        minWidth: `${boxDim}px`,
        minHeight: `${boxDim}px`,
        maxWidth: `${boxDim}px`,
        maxHeight: `${boxDim}px`,
        aspectRatio: '1 / 1',
        flexShrink: 0,
        flexGrow: 0,
        boxSizing: 'border-box',
        borderRadius: '9px',
        padding: '2px',
        margin: 0,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        fontSize,
        fontFamily: 'inherit',
        fontWeight,
        backgroundColor,
        color,
        border,
        boxShadow,
        cursor,
        outline: 'none',
        userSelect: 'none',
        transition: 'all 0.15s ease',
        transform: isSelected
          ? 'scale(1.06)'
          : isHovered
          ? 'scale(1.04)'
          : 'scale(1)'
      }}
    >
      {isMyBooking ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px', fontWeight: 800 }}>check</span>
          <span>{seat.seatNo.replace(/^[A-Z]/, '')}</span>
        </span>
      ) : (
        showLabel ? seat.seatNo.replace(/^[A-Z]/, '') : ''
      )}
    </button>
  );
}
