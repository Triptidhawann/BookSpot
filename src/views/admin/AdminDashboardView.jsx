import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { getAdminStore, saveAdminStore, resetAdminStore } from '../../data/adminMockData';

const normalizeSeats = (seats) => {
  const uniqueSeats = new Map();

  seats.forEach((seat) => {
    const seatNo = (seat.seatNo || seat.seat_no || '').trim().toUpperCase();
    if (!seatNo) return;

    const normalizedSeat = {
      ...seat,
      seatNo,
      zone: seat.zone || 'Unassigned',
      isBooked: seat.isBooked || seat.is_booked || 'available',
      bookedBy: seat.bookedBy || null
    };
    const existingSeat = uniqueSeats.get(seatNo);

    if (
      !existingSeat ||
      (existingSeat.isBooked === 'available' && normalizedSeat.isBooked !== 'available')
    ) {
      uniqueSeats.set(seatNo, normalizedSeat);
    }
  });

  return Array.from(uniqueSeats.values());
};

const formatBookingTime = (value) => {
  if (!value) return '';

  const rawValue = String(value).trim();
  const timeMatch = rawValue.match(/(?:T|\s|^)(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?/i);
  if (!timeMatch) return rawValue;

  let hours = Number(timeMatch[1]);
  const minutes = Number(timeMatch[2]);
  const meridiem = timeMatch[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return new Date(1970, 0, 1, hours, minutes).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });
};

const normalizeBookings = (bookings, seats) => {
  const seatsByNumber = new Map(
    seats.map((seat) => [seat.seatNo, seat])
  );

  return bookings.map((booking) => {
    const seatNo = booking.seatNo || booking.seat_no || '';
    const rawStartTime = booking.startTime || booking.start_time || '';
    const rawEndTime = booking.endTime || booking.end_time || '';
    const startTime = formatBookingTime(rawStartTime);
    const endTime = formatBookingTime(rawEndTime);
    const start = new Date(`1970-01-01 ${startTime}`);
    const end = new Date(`1970-01-01 ${endTime}`);
    const durationHours =
      booking.durationHours ||
      booking.duration_hours ||
      (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())
        ? 0
        : Math.max(0, (end.getTime() - start.getTime()) / 3600000));

    return {
      ...booking,
      id: booking.id || booking.booking_id,
      seatNo,
      zone: booking.zone || seatsByNumber.get(seatNo)?.zone || 'Unassigned',
      studentId: booking.studentId || booking.student_id,
      studentName: booking.studentName || booking.name || 'Unknown student',
      startTime,
      endTime,
      durationHours,
      date: booking.date || booking.booking_date || booking.created_at?.split('T')[0] || '',
      status: (booking.status || 'CONFIRMED').toUpperCase(),
      notes: booking.notes || ''
    };
  });
};

export default function AdminDashboardView({ onNavigate, adminUser }) {
  // Navigation tabs: 'overview' | 'students' | 'seats' | 'bookings' | 'reports'
  const [activeTab, setActiveTab] = useState('overview');
  const [store, setStore] = useState(() => getAdminStore());

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await axios.get('/api/getStudentsData');
        if (!Array.isArray(response.data)) {
          throw new Error('Students API returned an invalid response.');
        }

        const students = response.data.map((student) => ({
          ...student,
          id: student.id || student.student_id || student.roll_no,
          rollNo: student.rollNo || student.roll_no,
          email: student.email || '',
          department: student.department || 'Not specified',
          semester: student.semester || 'Not specified',
          status: student.status || 'active',
          joinedDate: student.joinedDate || student.joined_date || '',
          totalBookings: student.totalBookings || student.total_bookings || 0,
          avatar: student.avatar || ''
        }));

        setStore((previousStore) => {
          const updatedStore = { ...previousStore, students };
          saveAdminStore(updatedStore);
          return updatedStore;
        });
      } catch (error) {
        console.error('Failed to load students:', error);
      }
    };

    loadStudents();
  }, []);

  useEffect(() => {
    const loadSeats = async () => {
      try {
        const response = await axios.get('/api/getSeatsData');
        if (!Array.isArray(response.data)) {
          throw new Error('Seats API returned an invalid response.');
        }

        const seats = normalizeSeats(response.data);

        setStore((previousStore) => {
          const updatedStore = { ...previousStore, seats };
          saveAdminStore(updatedStore);
          return updatedStore;
        });
      } catch (error) {
        console.error('Failed to load seats:', error);
      }
    };

    loadSeats();
  }, []);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const response = await axios.get('/api/getBookingsData');
        if (!Array.isArray(response.data)) {
          throw new Error('Bookings API returned an invalid response.');
        }

        setStore((previousStore) => {
          const bookings = normalizeBookings(response.data, normalizeSeats(previousStore.seats));
          const updatedStore = { ...previousStore, bookings };
          saveAdminStore(updatedStore);
          return updatedStore;
        });
      } catch (error) {
        console.error('Failed to load bookings:', error);
      }
    };

    loadBookings();
  }, []);


  // Toast feedback
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });

  // Modals state
  const [studentModal, setStudentModal] = useState({ open: false, student: null });
  const [deleteStudentModal, setDeleteStudentModal] = useState({ open: false, student: null });
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({ name: '', rollNo: '', email: '', department: 'Computer Science & Engineering', semester: 'Semester 1' });

  const [addSeatModal, setAddSeatModal] = useState(false);
  const [newSeatForm, setNewSeatForm] = useState({ seatNo: '', zone: 'Window Nook — Pod A', isBooked: 'available' });

  const [editSeatModal, setEditSeatModal] = useState({ open: false, seat: null });
  const [deleteSeatModal, setDeleteSeatModal] = useState({ open: false, seat: null });

  const [cancelBookingModal, setCancelBookingModal] = useState({ open: false, booking: null });
  const [viewBookingModal, setViewBookingModal] = useState({ open: false, booking: null });

  // Filtering & Search
  const [studentSearch, setStudentSearch] = useState('');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');

  const [seatSearch, setSeatSearch] = useState('');
  const [seatZoneFilter, setSeatZoneFilter] = useState('all');
  const [seatStatusFilter, setSeatStatusFilter] = useState('all');

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 4000);
  };

  const updateStore = (updater) => {
    setStore((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      saveAdminStore(updated);
      return updated;
    });
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('bookspot_admin_session');
    onNavigate('admin-login');
  };

  const handleResetData = () => {
    if (window.confirm("Reset all library admin mock data back to factory default?")) {
      const reset = resetAdminStore();
      setStore(reset);
      showToast("Admin data successfully restored to factory defaults.");
    }
  };

  // Calculated Overview Stats
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const totalStudents = store.students.length;
    const totalSeats = store.seats.length;
    const bookedSeats = store.seats.filter((s) => s.isBooked === 'booked').length;
    const availableSeats = store.seats.filter((s) => s.isBooked === 'available').length;
    const maintenanceSeats = store.seats.filter((s) => s.isBooked === 'maintenance').length;
    const activeBookings = store.bookings.filter((b) => b.status === 'CONFIRMED').length;
    const bookingsToday = store.bookings.filter((b) => b.date === today).length;
    const utilizationRate = totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

    return {
      totalStudents,
      totalSeats,
      bookedSeats,
      availableSeats,
      maintenanceSeats,
      activeBookings,
      bookingsToday,
      utilizationRate
    };
  }, [store]);

  // ================= STUDENT ACTIONS =================
  const handleToggleStudentStatus = (studentId) => {
    updateStore((prev) => ({
      ...prev,
      students: prev.students.map((s) => {
        if (s.id === studentId) {
          const nextStatus = s.status === 'active' ? 'deactivated' : 'active';
          showToast(`Student ${s.name} (${s.rollNo}) marked as ${nextStatus}.`);
          return { ...s, status: nextStatus };
        }
        return s;
      })
    }));
  };

  const handleDeleteStudent = () => {
    const student = deleteStudentModal.student;
    if (!student) return;

    // Check if student has active booking
    const hasActiveBooking = store.bookings.some(
      (b) => b.studentId === student.rollNo && b.status === 'CONFIRMED'
    );

    if (hasActiveBooking) {
      alert(`Cannot delete ${student.name} because they currently hold an active seat reservation. Please cancel their reservation first.`);
      setDeleteStudentModal({ open: false, student: null });
      return;
    }

    updateStore((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== student.id)
    }));
    setDeleteStudentModal({ open: false, student: null });
    showToast(`Student record for ${student.name} (${student.rollNo}) has been deleted.`);
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!newStudentForm.name || !newStudentForm.rollNo) {
      alert("Name and Roll Number are required.");
      return;
    }

    // Check duplicate
    if (store.students.some((s) => s.rollNo.toLowerCase() === newStudentForm.rollNo.trim().toLowerCase())) {
      alert("A student with this Roll Number is already registered.");
      return;
    }

    const newStudent = {
      id: `STU-${Date.now().toString().slice(-4)}`,
      rollNo: newStudentForm.rollNo.trim(),
      name: newStudentForm.name.trim(),
      email: newStudentForm.email.trim() || `${newStudentForm.rollNo.toLowerCase()}@central.edu`,
      department: newStudentForm.department,
      semester: newStudentForm.semester,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0],
      totalBookings: 0,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    updateStore((prev) => ({
      ...prev,
      students: [newStudent, ...prev.students]
    }));
    setAddStudentModal(false);
    setNewStudentForm({ name: '', rollNo: '', email: '', department: 'Computer Science & Engineering', semester: 'Semester 1' });
    showToast(`Student ${newStudent.name} registered successfully.`);
  };

  // ================= SEAT ACTIONS =================
  const handleAddSeat = (e) => {
    e.preventDefault();
    const cleanSeatNo = newSeatForm.seatNo.trim().toUpperCase();
    if (!cleanSeatNo) {
      alert("Please enter a seat number.");
      return;
    }

    if (store.seats.some((s) => s.seatNo.toUpperCase() === cleanSeatNo)) {
      alert(`Seat ${cleanSeatNo} already exists in the library floor plan.`);
      return;
    }

    const newSeat = {
      seatNo: cleanSeatNo,
      zone: newSeatForm.zone,
      isBooked: newSeatForm.isBooked,
      bookedBy: null
    };

    updateStore((prev) => ({
      ...prev,
      seats: [...prev.seats, newSeat]
    }));
    setAddSeatModal(false);
    setNewSeatForm({ seatNo: '', zone: 'Window Nook — Pod A', isBooked: 'available' });
    showToast(`Seat ${newSeat.seatNo} added to ${newSeat.zone}.`);
  };

  const handleSaveEditSeat = (e) => {
    e.preventDefault();
    const seat = editSeatModal.seat;
    if (!seat) return;

    updateStore((prev) => ({
      ...prev,
      seats: prev.seats.map((s) => (s.seatNo === seat.seatNo ? seat : s))
    }));
    setEditSeatModal({ open: false, seat: null });
    showToast(`Seat ${seat.seatNo} updated.`);
  };

  const handleDeleteSeat = () => {
    const seat = deleteSeatModal.seat;
    if (!seat) return;

    // RULE: Delete seats only when they have NO active bookings
    const activeBooking = store.bookings.find(
      (b) => b.seatNo === seat.seatNo && b.status === 'CONFIRMED'
    );

    if (activeBooking || seat.isBooked === 'booked') {
      alert(`Cannot delete seat ${seat.seatNo}. It is currently reserved by ${activeBooking ? activeBooking.studentName : 'a student'}. Please cancel the active booking before deleting this seat.`);
      setDeleteSeatModal({ open: false, seat: null });
      return;
    }

    updateStore((prev) => ({
      ...prev,
      seats: prev.seats.filter((s) => s.seatNo !== seat.seatNo)
    }));
    setDeleteSeatModal({ open: false, seat: null });
    showToast(`Seat ${seat.seatNo} removed from floor plan.`);
  };

  // ================= BOOKING ACTIONS =================
  const handleCancelBooking = () => {
    const booking = cancelBookingModal.booking;
    if (!booking) return;

    updateStore((prev) => {
      // 1. Mark booking as CANCELLED
      const updatedBookings = prev.bookings.map((b) =>
        b.id === booking.id ? { ...b, status: 'CANCELLED' } : b
      );

      // 2. Free up the seat
      const updatedSeats = prev.seats.map((s) => {
        if (s.seatNo === booking.seatNo) {
          return {
            ...s,
            isBooked: 'available',
            bookedBy: null
          };
        }
        return s;
      });

      return {
        ...prev,
        bookings: updatedBookings,
        seats: updatedSeats
      };
    });

    setCancelBookingModal({ open: false, booking: null });
    showToast(`Booking ${booking.id} cancelled. Seat ${booking.seatNo} is now AVAILABLE.`, 'info');
  };

  // Filtered queries
  const filteredStudents = useMemo(() => {
    return store.students.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.department.toLowerCase().includes(studentSearch.toLowerCase());
      const matchesStatus =
        studentStatusFilter === 'all' || s.status === studentStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [store.students, studentSearch, studentStatusFilter]);

  const filteredSeats = useMemo(() => {
    return normalizeSeats(store.seats).filter((s) => {
      const matchesSearch = s.seatNo.toLowerCase().includes(seatSearch.toLowerCase());
      const matchesZone = seatZoneFilter === 'all' || s.zone === seatZoneFilter;
      const matchesStatus = seatStatusFilter === 'all' || s.isBooked === seatStatusFilter;
      return matchesSearch && matchesZone && matchesStatus;
    });
  }, [store.seats, seatSearch, seatZoneFilter, seatStatusFilter]);

  const filteredBookings = useMemo(() => {
    return store.bookings.filter((b) => {
      const matchesSearch =
        b.studentName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.studentId.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.seatNo.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.id.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesStatus =
        bookingStatusFilter === 'all' || b.status === bookingStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [store.bookings, bookingSearch, bookingStatusFilter]);

  // Distinct Zones
  const zonesList = [
    'Window Nook — Pod A',
    'Quiet Study — Table B',
    'Collaboration — Cluster C',
    'Silent Research — Pod E',
    'Silent Research — Pod F'
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#f7f2f3',
        color: '#1e1a1d',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Toast Alert */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '24px',
            zIndex: 9999,
            padding: '14px 20px',
            backgroundColor: toast.type === 'error' ? '#ba1a1a' : toast.type === 'info' ? '#1b5e20' : '#8b484f',
            color: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 500,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            {toast.type === 'error' ? 'cancel' : 'check_circle'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#201a1b',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexShrink: 0,
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 100
        }}
      >
        <div>
          {/* Brand header */}
          <div
            style={{
              padding: '24px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#8b484f',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(139, 72, 79, 0.4)'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>admin_panel_settings</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '17px', letterSpacing: '-0.02em', color: '#ffffff' }}>
                BookSpot
              </div>
              <div style={{ fontSize: '11px', color: '#ffb2b9', fontWeight: 600, letterSpacing: '0.05em' }}>
                ADMIN CONSOLE
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: 'dashboard' },
              { id: 'students', label: 'Student Management', icon: 'group', badge: store.students.length },
              { id: 'seats', label: 'Seat Management', icon: 'chair', badge: store.seats.length },
              { id: 'bookings', label: 'Booking Management', icon: 'calendar_month', badge: stats.activeBookings },
              { id: 'reports', label: 'Reports & Analytics', icon: 'query_stats' }
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: isActive ? '#8b484f' : 'transparent',
                    color: isActive ? '#ffffff' : '#d8c1c2',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.15s ease',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                        color: '#ffffff'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Controls */}
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          {/* Reset Mock Data pill */}
          <button
            type="button"
            onClick={handleResetData}
            style={{
              width: '100%',
              marginBottom: '10px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px dashed rgba(255, 255, 255, 0.2)',
              color: '#d8c1c2',
              fontSize: '11px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>restart_alt</span>
            <span>Reset Demo Data</span>
          </button>

          {/* Return to Student Portal */}
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            style={{
              width: '100%',
              marginBottom: '8px',
              padding: '9px 12px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffdadb',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>open_in_new</span>
            <span>View Student Portal</span>
          </button>

          {/* Logout button */}
          <button
            type="button"
            onClick={handleAdminLogout}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              backgroundColor: 'rgba(186, 26, 26, 0.2)',
              border: '1px solid rgba(242, 184, 181, 0.25)',
              color: '#ffb4ab',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            <span>Sign Out Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* Top Navbar */}
        <header
          style={{
            height: '68px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #ebd9db',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '19px', fontWeight: 700, color: '#1e1a1d', letterSpacing: '-0.01em' }}>
              {activeTab === 'overview' && 'Library System Overview'}
              {activeTab === 'students' && 'Registered Students Directory'}
              {activeTab === 'seats' && 'Floor Plan & Seat Inventory'}
              {activeTab === 'bookings' && 'Reservation Log & Allocations'}
              {activeTab === 'reports' && 'Library Utilization & Analytics'}
            </h2>
            <div style={{ fontSize: '12px', color: '#6e6366', marginTop: '2px' }}>
              Central University Library • Main Campus Floor Level 2 • Active Session
            </div>
          </div>

          {/* Admin Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: '#f1dedf',
                color: '#8b484f',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2e7d32' }} />
              <span>Live In-Memory Store</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: '#ffffff',
                border: '1px solid #ebd9db',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#8b484f',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700
                }}
              >
                A
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1a1d', lineHeight: 1.2 }}>
                  {adminUser?.username || 'admin'}
                </div>
                <div style={{ fontSize: '11px', color: '#6e6366' }}>Librarian Admin</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '32px', flex: 1, maxWidth: '1400px', width: '100%', boxSizing: 'border-box' }}>
          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Summary Cards Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                  gap: '18px'
                }}
              >
                {/* 1. Total Registered Students */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '22px 20px',
                    borderRadius: '18px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease'
                  }}
                  onClick={() => setActiveTab('students')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', color: '#6e6366', fontWeight: 600 }}>Total Students</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        backgroundColor: '#ffdadb',
                        color: '#8b484f',
                        fontSize: '20px'
                      }}
                    >
                      school
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e1a1d', marginTop: '14px' }}>
                    {stats.totalStudents}
                  </div>
                  <div style={{ fontSize: '12px', color: '#2e7d32', marginTop: '4px', fontWeight: 500 }}>
                    Active library accounts
                  </div>
                </div>

                {/* 2. Total Library Seats */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '22px 20px',
                    borderRadius: '18px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveTab('seats')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', color: '#6e6366', fontWeight: 600 }}>Total Desks / Seats</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        backgroundColor: '#ede2e5',
                        color: '#534344',
                        fontSize: '20px'
                      }}
                    >
                      chair
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e1a1d', marginTop: '14px' }}>
                    {stats.totalSeats}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6e6366', marginTop: '4px' }}>
                    Across 5 distinct study zones
                  </div>
                </div>

                {/* 3. Currently Booked Seats */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '22px 20px',
                    borderRadius: '18px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveTab('seats');
                    setSeatStatusFilter('booked');
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', color: '#6e6366', fontWeight: 600 }}>Currently Booked</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        backgroundColor: '#e8def8',
                        color: '#4a4458',
                        fontSize: '20px'
                      }}
                    >
                      how_to_reg
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#8b484f', marginTop: '14px' }}>
                    {stats.bookedSeats}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8b484f', marginTop: '4px', fontWeight: 600 }}>
                    {stats.utilizationRate}% floor occupancy
                  </div>
                </div>

                {/* 4. Available Seats */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '22px 20px',
                    borderRadius: '18px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveTab('seats');
                    setSeatStatusFilter('available');
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', color: '#6e6366', fontWeight: 600 }}>Available Seats</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        backgroundColor: '#d7e8cd',
                        color: '#2e7d32',
                        fontSize: '20px'
                      }}
                    >
                      event_available
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#2e7d32', marginTop: '14px' }}>
                    {stats.availableSeats}
                  </div>
                  <div style={{ fontSize: '12px', color: '#2e7d32', marginTop: '4px', fontWeight: 600 }}>
                    Ready for walk-in or booking
                  </div>
                </div>

                {/* 5. Total Active Bookings */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '22px 20px',
                    borderRadius: '18px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setActiveTab('bookings');
                    setBookingStatusFilter('CONFIRMED');
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', color: '#6e6366', fontWeight: 600 }}>Active Bookings</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        backgroundColor: '#ffdadb',
                        color: '#8b484f',
                        fontSize: '20px'
                      }}
                    >
                      timer
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e1a1d', marginTop: '14px' }}>
                    {stats.activeBookings}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6e6366', marginTop: '4px' }}>
                    Live checked-in study sessions
                  </div>
                </div>

                {/* 6. Total Bookings Today */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '22px 20px',
                    borderRadius: '18px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setActiveTab('bookings')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '13px', color: '#6e6366', fontWeight: 600 }}>Bookings Today</span>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        padding: '8px',
                        borderRadius: '10px',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        fontSize: '20px'
                      }}
                    >
                      today
                    </span>
                  </div>
                  <div style={{ fontSize: '32px', fontWeight: 700, color: '#1e1a1d', marginTop: '14px' }}>
                    {stats.bookingsToday}
                  </div>
                  <div style={{ fontSize: '12px', color: '#0369a1', marginTop: '4px', fontWeight: 600 }}>
                    Reservations created today
                  </div>
                </div>
              </div>

              {/* Two Column Section: Zone Occupancy & Recent Bookings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                {/* Zone Breakdown Card */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1e1a1d' }}>
                        Zone Occupancy Breakdown
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6e6366' }}>
                        Live allocation across Level 2 floor sectors
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('seats')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8b484f',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      View All Seats →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {zonesList.map((zone) => {
                      const zoneSeats = store.seats.filter((s) => s.zone === zone);
                      const bookedInZone = zoneSeats.filter((s) => s.isBooked === 'booked').length;
                      const percent = zoneSeats.length > 0 ? Math.round((bookedInZone / zoneSeats.length) * 100) : 0;

                      return (
                        <div key={zone}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, color: '#1e1a1d' }}>{zone}</span>
                            <span style={{ color: '#6e6366', fontWeight: 500 }}>
                              {bookedInZone} / {zoneSeats.length} booked ({percent}%)
                            </span>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: '8px',
                              backgroundColor: '#ebd9db',
                              borderRadius: '999px',
                              overflow: 'hidden'
                            }}
                          >
                            <div
                              style={{
                                width: `${percent}%`,
                                height: '100%',
                                backgroundColor: percent > 75 ? '#ba1a1a' : percent > 40 ? '#8b484f' : '#2e7d32',
                                borderRadius: '999px',
                                transition: 'width 0.4s ease'
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Bookings Feed */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '20px',
                    padding: '24px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#1e1a1d' }}>
                        Live Reservation Stream
                      </h3>
                      <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6e6366' }}>
                        Most recent student seat activities
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('bookings')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#8b484f',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Manage Log →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {store.bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          backgroundColor: '#fcf8f9',
                          border: '1px solid #ebd9db'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '8px',
                              backgroundColor: booking.status === 'CONFIRMED' ? '#d7e8cd' : '#ebd9db',
                              color: booking.status === 'CONFIRMED' ? '#2e7d32' : '#534344',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '13px'
                            }}
                          >
                            {booking.seatNo}
                          </div>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e1a1d' }}>
                              {booking.studentName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6e6366' }}>
                              {booking.studentId} • {booking.startTime} - {booking.endTime}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor:
                              booking.status === 'CONFIRMED'
                                ? '#d7e8cd'
                                : booking.status === 'CANCELLED'
                                ? '#ffdad6'
                                : '#e8def8',
                            color:
                              booking.status === 'CONFIRMED'
                                ? '#1b5e20'
                                : booking.status === 'CANCELLED'
                                ? '#ba1a1a'
                                : '#4a4458'
                          }}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: STUDENT MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'students' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header and Controls */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  border: '1px solid #ebd9db',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                {/* Search & Filter */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', flex: 1 }}>
                  {/* Search input */}
                  <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6e6366',
                        fontSize: '20px'
                      }}
                    >
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search student by name, roll no, department..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 40px',
                        borderRadius: '12px',
                        border: '1px solid #ebd9db',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Status filter */}
                  <select
                    value={studentStatusFilter}
                    onChange={(e) => setStudentStatusFilter(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #ebd9db',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#1e1a1d',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Account Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="deactivated">Deactivated Only</option>
                  </select>
                </div>

                {/* Add Student Button */}
                <button
                  type="button"
                  onClick={() => setAddStudentModal(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#8b484f',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(139, 72, 79, 0.3)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
                  <span>Register New Student</span>
                </button>
              </div>

              {/* Students Table */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #ebd9db',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcf8f9', borderBottom: '1px solid #ebd9db', color: '#6e6366' }}>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Student Profile</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Roll Number</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Department</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Active Booking</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Total Bookings</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#6e6366' }}>
                          No students found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((student) => {
                        const activeBooking = store.bookings.find(
                          (b) => b.studentId === student.rollNo && b.status === 'CONFIRMED'
                        );
                        return (
                          <tr
                            key={student.id}
                            style={{
                              borderBottom: '1px solid #f3e9ea',
                              transition: 'background-color 0.1s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf6f7')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={{ padding: '14px 20px' }}>
                              <div>
                                <div>
                                  <div style={{ fontWeight: 600, color: '#1e1a1d', fontSize: '14px' }}>
                                    {student.name}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#6e6366' }}>{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 600, color: '#8b484f' }}>
                              {student.rollNo}
                            </td>
                            <td style={{ padding: '14px 20px', color: '#1e1a1d' }}>
                              <div>{student.department}</div>
                              <div style={{ fontSize: '11px', color: '#6e6366' }}>{student.semester}</div>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: student.status === 'active' ? '#d7e8cd' : '#ffdad6',
                                  color: student.status === 'active' ? '#1b5e20' : '#ba1a1a'
                                }}
                              >
                                {student.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {activeBooking ? (
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: '8px',
                                    backgroundColor: '#ffdadb',
                                    color: '#8b484f',
                                    fontWeight: 700,
                                    fontSize: '12px'
                                  }}
                                >
                                  Seat {activeBooking.seatNo}
                                </span>
                              ) : (
                                <span style={{ color: '#baa9ab', fontSize: '12px' }}>None</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e1a1d' }}>
                              {student.totalBookings}
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                {/* View details */}
                                <button
                                  type="button"
                                  onClick={() => setStudentModal({ open: true, student })}
                                  style={{
                                    border: '1px solid #ebd9db',
                                    background: '#ffffff',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#8b484f'
                                  }}
                                  title="View full booking history and details"
                                >
                                  Details
                                </button>

                                {/* Toggle deactivate */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleStudentStatus(student.id)}
                                  style={{
                                    border: '1px solid #ebd9db',
                                    background: '#ffffff',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: student.status === 'active' ? '#ba1a1a' : '#2e7d32'
                                  }}
                                  title={student.status === 'active' ? 'Deactivate student' : 'Reactivate student'}
                                >
                                  {student.status === 'active' ? 'Deactivate' : 'Activate'}
                                </button>

                                {/* Delete student */}
                                <button
                                  type="button"
                                  onClick={() => setDeleteStudentModal({ open: true, student })}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: '#ba1a1a',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  title="Delete student account"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: SEAT MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'seats' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Header and Controls */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  border: '1px solid #ebd9db',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                {/* Search & Filters */}
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', flex: 1 }}>
                  {/* Search */}
                  <div style={{ position: 'relative', width: '220px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6e6366',
                        fontSize: '20px'
                      }}
                    >
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search Seat No (e.g. C04)..."
                      value={seatSearch}
                      onChange={(e) => setSeatSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 40px',
                        borderRadius: '12px',
                        border: '1px solid #ebd9db',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Zone Filter */}
                  <select
                    value={seatZoneFilter}
                    onChange={(e) => setSeatZoneFilter(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #ebd9db',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#1e1a1d',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Floor Zones</option>
                    {zonesList.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>

                  {/* Status Filter */}
                  <select
                    value={seatStatusFilter}
                    onChange={(e) => setSeatStatusFilter(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #ebd9db',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#1e1a1d',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Seat Statuses</option>
                    <option value="available">Available Only</option>
                    <option value="booked">Booked / Occupied Only</option>
                    <option value="maintenance">Under Maintenance</option>
                  </select>
                </div>

                {/* Add Seat Button */}
                <button
                  type="button"
                  onClick={() => setAddSeatModal(true)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#8b484f',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 6px rgba(139, 72, 79, 0.3)'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
                  <span>Add New Seat</span>
                </button>
              </div>

              {/* Seats Table */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #ebd9db',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcf8f9', borderBottom: '1px solid #ebd9db', color: '#6e6366' }}>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Seat Number</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Zone / Wing</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Current Status</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Occupied By</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSeats.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6e6366' }}>
                          No seats match the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredSeats.map((seat) => {
                        const activeBooking = store.bookings.find(
                          (b) => b.seatNo === seat.seatNo && b.status === 'CONFIRMED'
                        );
                        return (
                          <tr
                            key={seat.seatNo}
                            style={{
                              borderBottom: '1px solid #f3e9ea',
                              transition: 'background-color 0.1s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf6f7')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <td style={{ padding: '14px 20px' }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '42px',
                                  height: '36px',
                                  borderRadius: '8px',
                                  backgroundColor:
                                    seat.isBooked === 'booked'
                                      ? '#6e6366'
                                      : seat.isBooked === 'maintenance'
                                      ? '#e0e0e0'
                                      : '#ffffff',
                                  color: seat.isBooked === 'booked' ? '#ffffff' : '#1e1a1d',
                                  border: '1.5px solid #d4c8cb',
                                  fontWeight: 700,
                                  fontFamily: 'monospace',
                                  fontSize: '14px'
                                }}
                              >
                                {seat.seatNo}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e1a1d' }}>
                              {seat.zone}
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor:
                                    seat.isBooked === 'booked'
                                      ? '#ebd9db'
                                      : seat.isBooked === 'maintenance'
                                      ? '#fef08a'
                                      : '#d7e8cd',
                                  color:
                                    seat.isBooked === 'booked'
                                      ? '#534344'
                                      : seat.isBooked === 'maintenance'
                                      ? '#854d0e'
                                      : '#1b5e20'
                                }}
                              >
                                {seat.isBooked === 'booked'
                                  ? 'OCCUPIED / BOOKED'
                                  : seat.isBooked === 'maintenance'
                                  ? 'MAINTENANCE'
                                  : 'AVAILABLE'}
                              </span>
                            </td>
                            <td style={{ padding: '14px 20px' }}>
                              {activeBooking ? (
                                <div>
                                  <div style={{ fontWeight: 600, color: '#1e1a1d' }}>{activeBooking.studentName}</div>
                                  <div style={{ fontSize: '11px', color: '#6e6366' }}>
                                    {activeBooking.studentId} • {activeBooking.startTime} - {activeBooking.endTime}
                                  </div>
                                </div>
                              ) : (
                                <span style={{ color: '#baa9ab', fontSize: '12px' }}>Vacant / Unoccupied</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() => setEditSeatModal({ open: true, seat: { ...seat } })}
                                  style={{
                                    border: '1px solid #ebd9db',
                                    background: '#ffffff',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#8b484f'
                                  }}
                                >
                                  Edit
                                </button>

                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() => setDeleteSeatModal({ open: true, seat })}
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '6px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    color: '#ba1a1a',
                                    display: 'flex',
                                    alignItems: 'center'
                                  }}
                                  title="Delete seat (must have no active bookings)"
                                >
                                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: BOOKING MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'bookings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Controls */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  padding: '20px 24px',
                  border: '1px solid #ebd9db',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', flex: 1 }}>
                  {/* Search */}
                  <div style={{ position: 'relative', width: '300px' }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6e6366',
                        fontSize: '20px'
                      }}
                    >
                      search
                    </span>
                    <input
                      type="text"
                      placeholder="Search by seat, student, roll no, or ID..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 40px',
                        borderRadius: '12px',
                        border: '1px solid #ebd9db',
                        fontSize: '13px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={bookingStatusFilter}
                    onChange={(e) => setBookingStatusFilter(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      border: '1px solid #ebd9db',
                      fontSize: '13px',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#1e1a1d',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Reservation Statuses</option>
                    <option value="CONFIRMED">Confirmed / Active Only</option>
                    <option value="COMPLETED">Completed Past Only</option>
                    <option value="CANCELLED">Cancelled Only</option>
                  </select>
                </div>

                <div style={{ fontSize: '13px', color: '#6e6366', fontWeight: 500 }}>
                  Showing <strong style={{ color: '#1e1a1d' }}>{filteredBookings.length}</strong> recorded reservations
                </div>
              </div>

              {/* Bookings Table */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  border: '1px solid #ebd9db',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  overflow: 'hidden'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcf8f9', borderBottom: '1px solid #ebd9db', color: '#6e6366' }}>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Booking ID</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Seat No</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Student</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Date</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Time Window</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Duration</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '16px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#6e6366' }}>
                          No reservations match the specified filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr
                          key={booking.id}
                          style={{
                            borderBottom: '1px solid #f3e9ea',
                            transition: 'background-color 0.1s'
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#faf6f7')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <td style={{ padding: '14px 20px', fontFamily: 'monospace', fontWeight: 600, color: '#8b484f' }}>
                            {booking.id}
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '8px',
                                backgroundColor: '#ffdadb',
                                color: '#8b484f',
                                fontWeight: 700,
                                fontFamily: 'monospace'
                              }}
                            >
                              {booking.seatNo}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <div style={{ fontWeight: 600, color: '#1e1a1d' }}>{booking.studentName}</div>
                            <div style={{ fontSize: '11px', color: '#6e6366' }}>{booking.studentId}</div>
                          </td>
                          <td style={{ padding: '14px 20px', color: '#1e1a1d' }}>
                            {booking.date}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#1e1a1d', fontWeight: 500 }}>
                            {booking.startTime} – {booking.endTime}
                          </td>
                          <td style={{ padding: '14px 20px', color: '#6e6366' }}>
                            {booking.durationHours} hrs
                          </td>
                          <td style={{ padding: '14px 20px' }}>
                            <span
                              style={{
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '11px',
                                fontWeight: 700,
                                backgroundColor:
                                  booking.status === 'CONFIRMED'
                                    ? '#d7e8cd'
                                    : booking.status === 'CANCELLED'
                                    ? '#ffdad6'
                                    : '#e8def8',
                                color:
                                  booking.status === 'CONFIRMED'
                                    ? '#1b5e20'
                                    : booking.status === 'CANCELLED'
                                    ? '#ba1a1a'
                                    : '#4a4458'
                              }}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                              {/* Details button */}
                              <button
                                type="button"
                                onClick={() => setViewBookingModal({ open: true, booking })}
                                style={{
                                  border: '1px solid #ebd9db',
                                  background: '#ffffff',
                                  padding: '6px 10px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#534344'
                                }}
                              >
                                View
                              </button>

                              {/* Cancel action if active */}
                              {booking.status === 'CONFIRMED' ? (
                                <button
                                  type="button"
                                  onClick={() => setCancelBookingModal({ open: true, booking })}
                                  style={{
                                    border: '1px solid rgba(186, 26, 26, 0.3)',
                                    background: 'rgba(186, 26, 26, 0.08)',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '12px',
                                    fontWeight: 600,
                                    color: '#ba1a1a'
                                  }}
                                  title="Cancel this reservation and immediately release the seat"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span style={{ fontSize: '11px', color: '#baa9ab' }}>Closed</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: REPORTS & ANALYTICS */}
          {/* ========================================================= */}
          {activeTab === 'reports' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              {/* Top Analytical Gauges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                {/* Gauge 1: Utilization Rate */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#1e1a1d' }}>
                    Current Seat Utilization Rate
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#6e6366' }}>
                    Proportion of desks currently occupied vs total capacity
                  </p>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                    <span style={{ fontSize: '38px', fontWeight: 800, color: '#8b484f' }}>
                      {stats.utilizationRate}%
                    </span>
                    <span style={{ fontSize: '13px', color: '#6e6366' }}>
                      ({stats.bookedSeats} of {stats.totalSeats} seats booked)
                    </span>
                  </div>

                  <div
                    style={{
                      width: '100%',
                      height: '14px',
                      backgroundColor: '#ebd9db',
                      borderRadius: '999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${stats.utilizationRate}%`,
                        height: '100%',
                        backgroundColor: '#8b484f',
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>

                {/* Gauge 2: Booking Status Ratio */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#1e1a1d' }}>
                    Reservation Lifecycle Breakdown
                  </h3>
                  <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#6e6366' }}>
                    Historical fulfillment & retention rates
                  </p>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
                    {[
                      {
                        label: 'Active Confirmed',
                        count: store.bookings.filter((b) => b.status === 'CONFIRMED').length,
                        color: '#2e7d32'
                      },
                      {
                        label: 'Completed',
                        count: store.bookings.filter((b) => b.status === 'COMPLETED').length,
                        color: '#4a4458'
                      },
                      {
                        label: 'Cancelled',
                        count: store.bookings.filter((b) => b.status === 'CANCELLED').length,
                        color: '#ba1a1a'
                      }
                    ].map((item) => (
                      <div key={item.label} style={{ flex: 1, padding: '12px', borderRadius: '12px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db' }}>
                        <div style={{ fontSize: '24px', fontWeight: 700, color: item.color }}>{item.count}</div>
                        <div style={{ fontSize: '11px', color: '#6e6366', marginTop: '2px', fontWeight: 600 }}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leaderboards: Most Booked Seats & Most Active Students */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
                {/* Most Booked Seats */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#1e1a1d' }}>
                    🔥 Top 5 Most Frequently Booked Desks
                  </h3>
                  <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#6e6366' }}>
                    Ranked by cumulative reservation frequency
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { seatNo: 'C04', zone: 'Collaboration — Cluster C', bookings: 24, percent: 92 },
                      { seatNo: 'A02', zone: 'Window Nook — Pod A', bookings: 19, percent: 78 },
                      { seatNo: 'B05', zone: 'Quiet Study — Table B', bookings: 17, percent: 70 },
                      { seatNo: 'E03', zone: 'Silent Research — Pod E', bookings: 15, percent: 62 },
                      { seatNo: 'F02', zone: 'Silent Research — Pod F', bookings: 12, percent: 50 }
                    ].map((item, idx) => (
                      <div
                        key={item.seatNo}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          backgroundColor: '#fcf8f9',
                          border: '1px solid #ebd9db'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: idx === 0 ? '#8b484f' : '#ebd9db',
                              color: idx === 0 ? '#ffffff' : '#534344',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '11px'
                            }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div style={{ fontWeight: 700, color: '#1e1a1d' }}>Seat {item.seatNo}</div>
                            <div style={{ fontSize: '11px', color: '#6e6366' }}>{item.zone}</div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 700, color: '#8b484f', fontSize: '14px' }}>
                            {item.bookings} bookings
                          </div>
                          <div style={{ fontSize: '11px', color: '#2e7d32', fontWeight: 600 }}>
                            High demand
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Most Active Students */}
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    padding: '24px',
                    borderRadius: '20px',
                    border: '1px solid #ebd9db',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#1e1a1d' }}>
                    🏆 Top Most Active Students
                  </h3>
                  <p style={{ margin: '0 0 20px', fontSize: '12px', color: '#6e6366' }}>
                    Students with highest library seat utilization
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {store.students
                      .slice()
                      .sort((a, b) => b.totalBookings - a.totalBookings)
                      .slice(0, 5)
                      .map((stu) => (
                        <div
                          key={stu.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            backgroundColor: '#fcf8f9',
                            border: '1px solid #ebd9db'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={stu.avatar}
                              alt={stu.name}
                              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ fontWeight: 600, color: '#1e1a1d' }}>{stu.name}</div>
                              <div style={{ fontSize: '11px', color: '#6e6366' }}>
                                {stu.rollNo} • {stu.department}
                              </div>
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 700, color: '#1e1a1d', fontSize: '14px' }}>
                              {stu.totalBookings} visits
                            </div>
                            <span
                              style={{
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: '#d7e8cd',
                                color: '#1b5e20',
                                fontWeight: 700
                              }}
                            >
                              HONOR SCHOLAR
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================= */}

      {/* 1. Student Details Modal */}
      {studentModal.open && studentModal.student && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setStudentModal({ open: false, student: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <img
                src={studentModal.student.avatar}
                alt={studentModal.student.name}
                style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e1a1d' }}>
                  {studentModal.student.name}
                </h3>
                <div style={{ color: '#8b484f', fontWeight: 600, fontSize: '13px', marginTop: '2px' }}>
                  {studentModal.student.rollNo} • {studentModal.student.semester}
                </div>
                <div style={{ color: '#6e6366', fontSize: '12px' }}>
                  {studentModal.student.department}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db' }}>
                <div style={{ fontSize: '11px', color: '#6e6366' }}>Email Address</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1a1d' }}>{studentModal.student.email}</div>
              </div>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db' }}>
                <div style={{ fontSize: '11px', color: '#6e6366' }}>Registered Date</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e1a1d' }}>{studentModal.student.joinedDate}</div>
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 700, color: '#1e1a1d' }}>
              Reservation History ({studentModal.student.name})
            </h4>

            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {store.bookings.filter((b) => b.studentId === studentModal.student.rollNo).length === 0 ? (
                <div style={{ padding: '16px', textAlign: 'center', color: '#6e6366', fontSize: '12px' }}>
                  No reservations on file for this student.
                </div>
              ) : (
                store.bookings
                  .filter((b) => b.studentId === studentModal.student.rollNo)
                  .map((b) => (
                    <div
                      key={b.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#fcf8f9',
                        border: '1px solid #ebd9db',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '12px'
                      }}
                    >
                      <div>
                        <strong>Seat {b.seatNo}</strong> ({b.zone}) • {b.date}
                        <div style={{ color: '#6e6366' }}>{b.startTime} - {b.endTime} ({b.durationHours} hrs)</div>
                      </div>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '999px',
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: b.status === 'CONFIRMED' ? '#d7e8cd' : '#ebd9db',
                          color: b.status === 'CONFIRMED' ? '#1b5e20' : '#534344'
                        }}
                      >
                        {b.status}
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                type="button"
                onClick={() => setStudentModal({ open: false, student: null })}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#8b484f',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Student Modal */}
      {addStudentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setAddStudentModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#1e1a1d' }}>
              Register Student Account
            </h3>

            <form onSubmit={handleAddStudent} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ananya Rao"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-2024-099"
                  value={newStudentForm.rollNo}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, rollNo: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. a.rao@central.edu"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Department
                </label>
                <select
                  value={newStudentForm.department}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, department: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Electrical Engineering">Electrical Engineering</option>
                  <option value="Biotechnology">Biotechnology</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setAddStudentModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #ebd9db', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#8b484f', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Register Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Student Confirmation Dialog */}
      {deleteStudentModal.open && deleteStudentModal.student && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setDeleteStudentModal({ open: false, student: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ba1a1a', marginBottom: '14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>warning</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Delete Student Account</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#534344', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to permanently delete the student account for <strong>{deleteStudentModal.student.name}</strong> (Roll No: <strong>{deleteStudentModal.student.rollNo}</strong>)? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteStudentModal({ open: false, student: null })}
                style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #ebd9db', background: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#ba1a1a', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add Seat Modal */}
      {addSeatModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setAddSeatModal(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#1e1a1d' }}>
              Add Library Seat
            </h3>

            <form onSubmit={handleAddSeat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Seat Number / ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A17, C15, E13..."
                  value={newSeatForm.seatNo}
                  onChange={(e) => setNewSeatForm({ ...newSeatForm, seatNo: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Floor Zone / Wing *
                </label>
                <select
                  value={newSeatForm.zone}
                  onChange={(e) => setNewSeatForm({ ...newSeatForm, zone: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                >
                  {zonesList.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Initial Status
                </label>
                <select
                  value={newSeatForm.isBooked}
                  onChange={(e) => setNewSeatForm({ ...newSeatForm, isBooked: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                >
                  <option value="available">Available (Unoccupied)</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setAddSeatModal(false)}
                  style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #ebd9db', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#8b484f', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Save Seat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Edit Seat Modal */}
      {editSeatModal.open && editSeatModal.seat && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setEditSeatModal({ open: false, seat: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, color: '#1e1a1d' }}>
              Edit Seat {editSeatModal.seat.seatNo}
            </h3>

            <form onSubmit={handleSaveEditSeat} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Zone / Wing
                </label>
                <select
                  value={editSeatModal.seat.zone}
                  onChange={(e) =>
                    setEditSeatModal({
                      ...editSeatModal,
                      seat: { ...editSeatModal.seat, zone: e.target.value }
                    })
                  }
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                >
                  {zonesList.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                  Availability Status
                </label>
                <select
                  value={editSeatModal.seat.isBooked}
                  onChange={(e) =>
                    setEditSeatModal({
                      ...editSeatModal,
                      seat: { ...editSeatModal.seat, isBooked: e.target.value }
                    })
                  }
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #ebd9db', boxSizing: 'border-box', backgroundColor: '#ffffff' }}
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '14px' }}>
                <button
                  type="button"
                  onClick={() => setEditSeatModal({ open: false, seat: null })}
                  style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #ebd9db', background: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#8b484f', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Delete Seat Confirmation Modal */}
      {deleteSeatModal.open && deleteSeatModal.seat && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setDeleteSeatModal({ open: false, seat: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ba1a1a', marginBottom: '14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>warning</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Delete Seat Confirmation</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#534344', lineHeight: 1.5, margin: '0 0 20px' }}>
              Are you sure you want to remove <strong>Seat {deleteSeatModal.seat.seatNo}</strong> ({deleteSeatModal.seat.zone}) from the floor plan?
              {deleteSeatModal.seat.isBooked === 'booked' && (
                <span style={{ display: 'block', color: '#ba1a1a', fontWeight: 700, marginTop: '8px' }}>
                  Warning: This seat is marked as currently booked!
                </span>
              )}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteSeatModal({ open: false, seat: null })}
                style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #ebd9db', background: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSeat}
                style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#ba1a1a', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Cancel Booking Confirmation Dialog */}
      {cancelBookingModal.open && cancelBookingModal.booking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setCancelBookingModal({ open: false, booking: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#ba1a1a', marginBottom: '14px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>event_busy</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Cancel Active Reservation</h3>
            </div>
            <p style={{ fontSize: '13px', color: '#534344', lineHeight: 1.5, margin: '0 0 16px' }}>
              Are you sure you want to cancel reservation <strong>{cancelBookingModal.booking.id}</strong> for <strong>{cancelBookingModal.booking.studentName}</strong> at <strong>Seat {cancelBookingModal.booking.seatNo}</strong>?
            </p>
            <div style={{ padding: '12px', borderRadius: '10px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db', fontSize: '12px', color: '#6e6366', marginBottom: '20px' }}>
              Cancelling will instantly release <strong>Seat {cancelBookingModal.booking.seatNo}</strong> back to <strong>AVAILABLE</strong> status for fellow students on the library floor plan.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setCancelBookingModal({ open: false, booking: null })}
                style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #ebd9db', background: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleCancelBooking}
                style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#ba1a1a', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. View Booking Details Modal */}
      {viewBookingModal.open && viewBookingModal.booking && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setViewBookingModal({ open: false, booking: null })}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '26px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1e1a1d' }}>
                Reservation Details: {viewBookingModal.booking.id}
              </h3>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor:
                    viewBookingModal.booking.status === 'CONFIRMED'
                      ? '#d7e8cd'
                      : viewBookingModal.booking.status === 'CANCELLED'
                      ? '#ffdad6'
                      : '#e8def8',
                  color:
                    viewBookingModal.booking.status === 'CONFIRMED'
                      ? '#1b5e20'
                      : viewBookingModal.booking.status === 'CANCELLED'
                      ? '#ba1a1a'
                      : '#4a4458'
                }}
              >
                {viewBookingModal.booking.status}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db' }}>
                <div style={{ fontSize: '11px', color: '#6e6366' }}>Student Profile</div>
                <div style={{ fontWeight: 600, color: '#1e1a1d' }}>{viewBookingModal.booking.studentName}</div>
                <div style={{ fontSize: '12px', color: '#8b484f', fontWeight: 600 }}>{viewBookingModal.booking.studentId}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db' }}>
                  <div style={{ fontSize: '11px', color: '#6e6366' }}>Reserved Seat</div>
                  <div style={{ fontWeight: 700, color: '#8b484f', fontSize: '16px' }}>Seat {viewBookingModal.booking.seatNo}</div>
                  <div style={{ fontSize: '11px', color: '#6e6366' }}>{viewBookingModal.booking.zone}</div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db' }}>
                  <div style={{ fontSize: '11px', color: '#6e6366' }}>Date & Duration</div>
                  <div style={{ fontWeight: 600, color: '#1e1a1d' }}>{viewBookingModal.booking.date}</div>
                  <div style={{ fontSize: '11px', color: '#6e6366' }}>
                    {viewBookingModal.booking.startTime} - {viewBookingModal.booking.endTime} ({viewBookingModal.booking.durationHours} hrs)
                  </div>
                </div>
              </div>

              {viewBookingModal.booking.notes && (
                <div style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: '#fcf8f9', border: '1px solid #ebd9db' }}>
                  <div style={{ fontSize: '11px', color: '#6e6366' }}>Session Purpose / Notes</div>
                  <div style={{ fontSize: '12px', color: '#1e1a1d', marginTop: '2px' }}>{viewBookingModal.booking.notes}</div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setViewBookingModal({ open: false, booking: null })}
                style={{
                  padding: '10px 20px',
                  borderRadius: '10px',
                  backgroundColor: '#8b484f',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
