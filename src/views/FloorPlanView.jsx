import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import FloorPlanMap from '../components/FloorPlanMap';
import FloatingBookingBar from '../components/FloatingBookingBar';
import BookingModal from '../components/BookingModal';
import Toast from '../components/Toast';
import { campusStatus } from '../data/mockData';


export default function FloorPlanView({ onNavigate, onBookingConfirmed, initialSelectedSeat }) {
  const [seats, setSeats] = useState([]);
  const [myBookedSeatIds, setMyBookedSeatIds] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(initialSelectedSeat || null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(!!initialSelectedSeat);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastData, setToastData] = useState({
    show: false,
    title: '',
    subtitle: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    const loadSeats = async () => {
      try {
          const response = await axios.get('/api/getSeatsData');
          setSeats(response.data);
      } catch (error) {
          console.error('Failed to load seats:', error);
      }
    };

    loadSeats();
  },[])

  const handleSelectSeat = (seat, isBookedByOther, isMyBooking) => {
    console.log(seat.seatNo);
    if (isMyBooking) {
      setSelectedSeat(seat);
      setToastData({
        show: true,
        title: `Your Active Reservation: ${seat.seatNo} (Green)`,
        subtitle: `This seat is reserved by you. Check-in is active and confirmed.`
      });
      setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 4000);
      return;
    }

    if (isBookedByOther) {
      setSelectedSeat(seat);
      setToastData({
        show: true,
        title: `Seat ${seat.seatNo} is Booked (Grey)`,
        subtitle: `Occupied by another student. Turned darker grey on click. Please select an available white seat.`
      });
      setTimeout(() => setToastData((prev) => ({ ...prev, show: false })), 4000);
      return;
    }

   // Available seat: highlight and OPEN POPUP IMMEDIATELY
    setSelectedSeat(seat);
    setIsModalOpen(true);
  };

  const handleClearSelection = () => {
    setSelectedSeat(null);
  };

  const handleOpenModal = () => {
    if (selectedSeat && !myBookedSeatIds.includes(selectedSeat.seatNo)) {
      setIsModalOpen(true);
    }
  };

  const handleConfirmReservation = async (bookingDetails) => {
    const savedUser = localStorage.getItem('bookspot_user');
    const user = savedUser ? JSON.parse(savedUser) : null;

    if (!user?.roll_no || !user?.name) {
      setToastData({
        show: true,
        title: 'Sign in required',
        subtitle: 'Please sign in before reserving a seat.'
      });
      return;
    }

    setIsBooking(true);
    try {
      const response = await axios.post('http://localhost:2007/bookSeat', {
        seatNo: bookingDetails.seatNo,
        zone: bookingDetails.zone,
        roll: user.roll_no,
        name: user.name,
        duration: bookingDetails.duration,
        startTime: bookingDetails.startTime,
        endTime: bookingDetails.endTime,
        status: 'CONFIRMED'
      });

      if (!response.data.status) {
        throw new Error(response.data.msg || 'Unable to reserve seat');
      }

      setIsModalOpen(false);
      setMyBookedSeatIds((prev) => [...new Set([...prev, bookingDetails.seatNo])]);
      setSeats((prev) =>
        prev.map((s) => (s.seatNo === bookingDetails.seatNo ? { ...s, isBooked: 'booked' } : s))
      );
      setToastData({
        show: true,
        title: `Seat ${bookingDetails.seatNo} Reserved`,
        subtitle: `Booked for ${bookingDetails.duration} hours in Zone ${bookingDetails.zone}.`
      });

      onBookingConfirmed?.(bookingDetails);
      setTimeout(() => {
        setToastData((prev) => ({ ...prev, show: false }));
      }, 5000);
    } catch (error) {
      setToastData({
        show: true,
        title: 'Booking failed',
        subtitle: error.response?.data?.msg || error.message || 'Unable to reserve this seat.'
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) return;
    const match = seats.find((s) => s.seatNo.toLowerCase() === query.trim().toLowerCase());
    if (match && match.isBooked === 'available') {
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
        isSubmitting={isBooking}
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
