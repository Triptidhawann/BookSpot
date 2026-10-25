import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import FloorPlanMap from '../components/FloorPlanMap';
import FloatingBookingBar from '../components/FloatingBookingBar';
import BookingModal from '../components/BookingModal';
import Toast from '../components/Toast';
import { initialSeats, campusStatus } from '../data/mockData';

export default function FloorPlanView({ onNavigate, onBookingConfirmed, initialSelectedSeat }) {
  const [seats, setSeats] = useState(initialSeats);
  const [myBookedSeatIds, setMyBookedSeatIds] = useState(['C04']);
  const [selectedSeat, setSelectedSeat] = useState(
    initialSelectedSeat || initialSeats.find((s) => s.id === 'C04') || null
  );
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedSeat);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState({
    show: false,
    title: '',
    subtitle: ''
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectSeat = (seat, isBookedByOther, isMyBooking) => {
    if (isMyBooking) {
      setSelectedSeat(seat);
      setToastData({
        show: true,
        title: `Your Active Reservation: ${seat.id} (Green)`,
        subtitle: `This seat is reserved by you. Check-in is active and confirmed.`
      });
      setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 4000);
      return;
    }

    if (isBookedByOther) {
      setSelectedSeat(seat);
      setToastData({
        show: true,
        title: `Seat ${seat.id} is Booked (Grey)`,
        subtitle: `Occupied by another student. Turned darker grey on click. Please select an available white seat.`
      });
      setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 4000);
      return;
    }

    // Available seat: highlight and OPEN POPUP IMMEDIATELY
    setSeats((prev) =>
      prev.map((s) => {
        if (s.id === seat.id) {
          return { ...s, status: 'selected' };
        }
        if (s.status === 'selected') {
          return { ...s, status: 'available' };
        }
        return s;
      })
    );
    setSelectedSeat(seat);
    setIsModalOpen(true);
  };

  const handleClearSelection = () => {
    setSeats((prev) =>
      prev.map((s) => (s.status === 'selected' ? { ...s, status: 'available' } : s))
    );
    setSelectedSeat(null);
  };

  const handleOpenModal = () => {
    if (selectedSeat && !myBookedSeatIds.includes(selectedSeat.id)) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmReservation = (bookingDetails) => {
    setIsModalOpen(false);
    // Add to current user's booked seats -> turns GREEN!
    setMyBookedSeatIds((prev) => [...prev, bookingDetails.seatId]);

    setSeats((prev) =>
      prev.map((s) => (s.id === bookingDetails.seatId ? { ...s, status: 'available' } : s))
    );

    setToastData({
      show: true,
      title: `Seat ${bookingDetails.seatId} Reserved (Turned Green!)`,
      subtitle: `Booked for ${bookingDetails.duration} hours at ${bookingDetails.zone}. Check-in confirmed.`
    });

    if (onBookingConfirmed) {
      onBookingConfirmed(bookingDetails);
    }

    setTimeout(() => {
      setToastData((prev) => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) return;
    const match = seats.find((s) => s.id.toLowerCase() === query.trim().toLowerCase());
    if (match && match.status === 'available') {
      handleSelectSeat(match);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: 'var(--surface)' }}>
      {/* Sidebar navigation */}
      <Sidebar
        activeView="book-a-seat"
        onNavigate={onNavigate}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="main-content-layout" style={{ flex: 1, marginLeft: '260px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onNavigate={onNavigate}
        />

        {/* Content Body */}
        <main style={{ marginTop: '64px', padding: 'var(--space-lg) var(--gutter-desktop)', flex: 1 }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            
            {/* Top Stats & Breadcrumbs */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-md)'
              }}
            >
              <div>
                <h1 className="headline-lg" style={{ color: 'var(--on-surface)', letterSpacing: '-0.02em', fontWeight: 700 }}>
                  Find Your Seat
                </h1>
                <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                  Choose an ergonomic spot that matches your study pace. Click any sage seat to select.
                </p>
              </div>

              {/* Real-time Capacity Badges */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--surface-container-lowest)',
                  padding: '6px',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-default)',
                    backgroundColor: 'var(--surface-container-low)',
                    color: 'var(--on-surface)',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--outline)' }} />
                  <span style={{ color: 'var(--on-surface-variant)' }}>Total:</span>
                  <span style={{ fontWeight: 600 }}>{campusStatus.totalSeats}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-default)',
                    backgroundColor: 'rgba(63, 100, 74, 0.12)',
                    color: 'var(--tertiary)',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--tertiary)' }} />
                  <span style={{ fontWeight: 500 }}>Available:</span>
                  <span style={{ fontWeight: 700 }}>{campusStatus.availableSeats}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-default)',
                    backgroundColor: 'var(--surface-container-high)',
                    color: 'var(--on-surface-variant)',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--outline)' }} />
                  <span style={{ fontWeight: 500 }}>Occupied:</span>
                  <span style={{ fontWeight: 600 }}>{campusStatus.occupiedSeats}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-default)',
                    backgroundColor: 'rgba(255, 206, 210, 0.4)',
                    color: 'var(--secondary)',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--secondary)' }} />
                  <span style={{ fontWeight: 500 }}>Held / Cleaning:</span>
                  <span style={{ fontWeight: 600 }}>{campusStatus.heldSeats}</span>
                </div>
              </div>
            </div>

            {/* The Blueprint Floor Map */}
            <FloorPlanMap
              seats={seats}
              selectedSeat={selectedSeat}
              myBookedSeatIds={myBookedSeatIds}
              onSelectSeat={handleSelectSeat}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        </main>
      </div>

      {/* Floating Action Pill Bar */}
      <FloatingBookingBar
        selectedSeat={selectedSeat}
        onCompleteBooking={handleOpenModal}
        onClear={handleClearSelection}
      />

      {/* Booking Configuration Modal */}
      <BookingModal
        isOpen={isModalOpen}
        seat={selectedSeat}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmReservation}
      />

      {/* Toast Notification */}
      <Toast
        show={toastData.show}
        title={toastData.title}
        subtitle={toastData.subtitle}
        onClose={() => setToastData((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
}
