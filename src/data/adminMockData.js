// Mock data and localStorage persistence engine for BookSpot Admin Portal
// Pure frontend - no database attached

export const initialAdminStudents = [
  {
    id: "STU-1001",
    rollNo: "CS-2024-048",
    name: "Misha Patel",
    email: "m.patel@central.edu",
    department: "Computer Science & Engineering",
    semester: "Semester 4",
    status: "active",
    joinedDate: "2024-08-15",
    totalBookings: 14,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "STU-1002",
    rollNo: "CS-2024-012",
    name: "Aarav Sharma",
    email: "a.sharma@central.edu",
    department: "Computer Science & Engineering",
    semester: "Semester 4",
    status: "active",
    joinedDate: "2024-08-18",
    totalBookings: 19,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "STU-1003",
    rollNo: "EC-2024-091",
    name: "Priya Nair",
    email: "p.nair@central.edu",
    department: "Electronics & Communication",
    semester: "Semester 3",
    status: "active",
    joinedDate: "2024-09-01",
    totalBookings: 11,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "STU-1004",
    rollNo: "ME-2023-033",
    name: "Rohan Verma",
    email: "r.verma@central.edu",
    department: "Mechanical Engineering",
    semester: "Semester 6",
    status: "active",
    joinedDate: "2023-01-20",
    totalBookings: 8,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "STU-1005",
    rollNo: "IT-2024-104",
    name: "Ananya Sen",
    email: "a.sen@central.edu",
    department: "Information Technology",
    semester: "Semester 3",
    status: "active",
    joinedDate: "2024-09-05",
    totalBookings: 23,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "STU-1006",
    rollNo: "EE-2023-055",
    name: "Devansh Gupta",
    email: "d.gupta@central.edu",
    department: "Electrical Engineering",
    semester: "Semester 5",
    status: "active",
    joinedDate: "2023-08-10",
    totalBookings: 6,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "STU-1007",
    rollNo: "BT-2024-022",
    name: "Sneha Kulkarni",
    email: "s.kulkarni@central.edu",
    department: "Biotechnology",
    semester: "Semester 3",
    status: "deactivated",
    joinedDate: "2024-08-22",
    totalBookings: 3,
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: "STU-1008",
    rollNo: "CS-2023-077",
    name: "Kabir Mehta",
    email: "k.mehta@central.edu",
    department: "Computer Science & Engineering",
    semester: "Semester 5",
    status: "active",
    joinedDate: "2023-02-14",
    totalBookings: 16,
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80"
  }
];

export const initialAdminBookings = [
  {
    id: "BK-9041",
    seatNo: "C04",
    zone: "Collaboration — Cluster C",
    studentId: "CS-2024-048",
    studentName: "Misha Patel",
    startTime: "10:30 AM",
    endTime: "01:30 PM",
    durationHours: 3,
    date: new Date().toISOString().split('T')[0],
    status: "CONFIRMED",
    notes: "Group project presentation review with team members."
  },
  {
    id: "BK-9042",
    seatNo: "A03",
    zone: "Window Nook — Pod A",
    studentId: "CS-2024-012",
    studentName: "Aarav Sharma",
    startTime: "09:00 AM",
    endTime: "01:00 PM",
    durationHours: 4,
    date: new Date().toISOString().split('T')[0],
    status: "CONFIRMED",
    notes: "Self study and algorithm practice."
  },
  {
    id: "BK-9043",
    seatNo: "B05",
    zone: "Quiet Study — Table B",
    studentId: "EC-2024-091",
    studentName: "Priya Nair",
    startTime: "11:00 AM",
    endTime: "02:00 PM",
    durationHours: 3,
    date: new Date().toISOString().split('T')[0],
    status: "CONFIRMED",
    notes: "Signal processing problem sets."
  },
  {
    id: "BK-9044",
    seatNo: "E03",
    zone: "Silent Research — Pod E",
    studentId: "IT-2024-104",
    studentName: "Ananya Sen",
    startTime: "08:30 AM",
    endTime: "12:30 PM",
    durationHours: 4,
    date: new Date().toISOString().split('T')[0],
    status: "CONFIRMED",
    notes: "Database management lab preparation."
  },
  {
    id: "BK-9045",
    seatNo: "F02",
    zone: "Silent Research — Pod F",
    studentId: "CS-2023-077",
    studentName: "Kabir Mehta",
    startTime: "01:00 PM",
    endTime: "05:00 PM",
    durationHours: 4,
    date: new Date().toISOString().split('T')[0],
    status: "CONFIRMED",
    notes: "Research paper reading on distributed systems."
  },
  {
    id: "BK-8980",
    seatNo: "B12",
    zone: "Quiet Study — Table B",
    studentId: "CS-2024-048",
    studentName: "Misha Patel",
    startTime: "01:00 PM",
    endTime: "05:00 PM",
    durationHours: 4,
    date: "2026-10-28",
    status: "COMPLETED",
    notes: "Completed standard quiet session."
  },
  {
    id: "BK-8981",
    seatNo: "A07",
    zone: "Window Nook — Pod A",
    studentId: "ME-2023-033",
    studentName: "Rohan Verma",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    durationHours: 3,
    date: "2026-10-28",
    status: "COMPLETED",
    notes: "Thermodynamics test revision."
  },
  {
    id: "BK-8982",
    seatNo: "C10",
    zone: "Collaboration — Cluster C",
    studentId: "EE-2023-055",
    studentName: "Devansh Gupta",
    startTime: "02:00 PM",
    endTime: "04:00 PM",
    durationHours: 2,
    date: "2026-10-27",
    status: "COMPLETED",
    notes: "Circuit board design collaboration."
  },
  {
    id: "BK-8983",
    seatNo: "E08",
    zone: "Silent Research — Pod E",
    studentId: "BT-2024-022",
    studentName: "Sneha Kulkarni",
    startTime: "09:30 AM",
    endTime: "11:30 AM",
    durationHours: 2,
    date: "2026-10-26",
    status: "CANCELLED",
    notes: "Cancelled by student due to class clash."
  },
  {
    id: "BK-8984",
    seatNo: "B24",
    zone: "Quiet Study — Table B",
    studentId: "IT-2024-104",
    studentName: "Ananya Sen",
    startTime: "03:00 PM",
    endTime: "07:00 PM",
    durationHours: 4,
    date: "2026-10-26",
    status: "COMPLETED",
    notes: "Web dev capstone milestone sprint."
  },
  {
    id: "BK-8985",
    seatNo: "A15",
    zone: "Window Nook — Pod A",
    studentId: "CS-2024-012",
    studentName: "Aarav Sharma",
    startTime: "11:00 AM",
    endTime: "03:00 PM",
    durationHours: 4,
    date: "2026-10-25",
    status: "COMPLETED",
    notes: "Machine learning model training review."
  },
  {
    id: "BK-8986",
    seatNo: "C02",
    zone: "Collaboration — Cluster C",
    studentId: "CS-2024-048",
    studentName: "Misha Patel",
    startTime: "04:00 PM",
    endTime: "06:00 PM",
    durationHours: 2,
    date: "2026-10-24",
    status: "CANCELLED",
    notes: "Cancelled by librarian on student request."
  }
];

// Helper to generate full initial seats matrix matching blueprint layout
export function generateInitialSeats() {
  const seats = [];

  // Pod A: A01 to A16 (Window Nook)
  for (let i = 1; i <= 16; i++) {
    const seatNo = `A${i < 10 ? '0' + i : i}`;
    const bookedMatch = initialAdminBookings.find(b => b.seatNo === seatNo && b.status === "CONFIRMED");
    seats.push({
      seatNo,
      zone: "Window Nook — Pod A",
      isBooked: bookedMatch ? "booked" : (i === 7 || i === 14 || i === 15 ? "booked" : "available"),
      bookedBy: bookedMatch ? { studentId: bookedMatch.studentId, studentName: bookedMatch.studentName, bookingId: bookedMatch.id } : null
    });
  }

  // Block B: B01 to B32 (Quiet Study)
  for (let i = 1; i <= 32; i++) {
    const seatNo = `B${i < 10 ? '0' + i : i}`;
    const bookedMatch = initialAdminBookings.find(b => b.seatNo === seatNo && b.status === "CONFIRMED");
    const isSpecialBooked = [3, 5, 11, 12, 18, 24, 28, 31].includes(i);
    seats.push({
      seatNo,
      zone: "Quiet Study — Table B",
      isBooked: bookedMatch ? "booked" : (isSpecialBooked ? "booked" : (i === 8 ? "maintenance" : "available")),
      bookedBy: bookedMatch ? { studentId: bookedMatch.studentId, studentName: bookedMatch.studentName, bookingId: bookedMatch.id } : null
    });
  }

  // Block C: C01 to C14 (Collaboration Cluster)
  for (let i = 1; i <= 14; i++) {
    const seatNo = `C${i < 10 ? '0' + i : i}`;
    const bookedMatch = initialAdminBookings.find(b => b.seatNo === seatNo && b.status === "CONFIRMED");
    const isSpecialBooked = [2, 4, 6, 10, 14].includes(i);
    seats.push({
      seatNo,
      zone: "Collaboration — Cluster C",
      isBooked: bookedMatch ? "booked" : (isSpecialBooked ? "booked" : "available"),
      bookedBy: bookedMatch ? { studentId: bookedMatch.studentId, studentName: bookedMatch.studentName, bookingId: bookedMatch.id } : null
    });
  }

  // Pod E: E01 to E12 (Silent Research Carrel 1)
  for (let i = 1; i <= 12; i++) {
    const seatNo = `E${i < 10 ? '0' + i : i}`;
    const bookedMatch = initialAdminBookings.find(b => b.seatNo === seatNo && b.status === "CONFIRMED");
    const isSpecialBooked = [3, 6, 8].includes(i);
    seats.push({
      seatNo,
      zone: "Silent Research — Pod E",
      isBooked: bookedMatch ? "booked" : (isSpecialBooked ? "booked" : "available"),
      bookedBy: bookedMatch ? { studentId: bookedMatch.studentId, studentName: bookedMatch.studentName, bookingId: bookedMatch.id } : null
    });
  }

  // Pod F: F01 to F12 (Silent Research Carrel 2)
  for (let i = 1; i <= 12; i++) {
    const seatNo = `F${i < 10 ? '0' + i : i}`;
    const bookedMatch = initialAdminBookings.find(b => b.seatNo === seatNo && b.status === "CONFIRMED");
    const isSpecialBooked = [2, 5, 9].includes(i);
    seats.push({
      seatNo,
      zone: "Silent Research — Pod F",
      isBooked: bookedMatch ? "booked" : (isSpecialBooked ? "booked" : "available"),
      bookedBy: bookedMatch ? { studentId: bookedMatch.studentId, studentName: bookedMatch.studentName, bookingId: bookedMatch.id } : null
    });
  }

  return seats;
}

const STORAGE_KEY = 'bookspot_admin_data_v1';

// Load stored data or initialize with rich mock data
export function getAdminStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.students && parsed.seats && parsed.bookings) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Could not read admin store from localStorage, using initial data.", err);
  }

  const initial = {
    students: initialAdminStudents,
    bookings: initialAdminBookings,
    seats: generateInitialSeats()
  };
  saveAdminStore(initial);
  return initial;
}

// Persist data into localStorage
export function saveAdminStore(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save admin store to localStorage:", err);
  }
}

// Reset data to defaults
export function resetAdminStore() {
  const initial = {
    students: initialAdminStudents,
    bookings: initialAdminBookings,
    seats: generateInitialSeats()
  };
  saveAdminStore(initial);
  return initial;
}
