// Mock data mirroring the BookSpot Stitch Project

export const currentUser = {
  name: "Misha Patel",
  role: "Undergraduate",
  email: "m.patel@central.edu",
  rollNo: "CS-2024-048",
  semester: "Fall Semester 2024",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
};

export const campusStatus = {
  libraryName: "Main Campus Central Library",
  hours: "8:00 AM – 10:00 PM",
  activeLevel: "Level 2: Main Study Hall",
  syncSeconds: 12,
  totalSeats: 112,
  availableSeats: 68,
  occupiedSeats: 36,
  heldSeats: 8,
  silentIndex: "92%"
};

export const activeBooking = {
  id: "BK-88219",
  seatId: "C04",
  zoneName: "C",
  zoneLocation: "Level 2 • North Wing • Collab Table",
  status: "Checked-in",
  startTime: "10:30 AM",
  endTime: "1:30 PM",
  durationHours: 3,
  timeLeft: "1h 45m left",
  notes: "Reserved for group project prep and analytical review. Direct access to high-lumen skylights."
};

export const upcomingBookings = [
  {
    id: "BK-88301",
    date: "Tomorrow",
    time: "2:00 PM – 6:00 PM",
    seatId: "E03",
    zoneName: "E",
    status: "Confirmed"
  },
  {
    id: "BK-88342",
    date: "Friday, Oct 25",
    time: "9:00 AM – 1:00 PM",
    seatId: "A02",
    zoneName: "A",
    status: "Confirmed"
  }
];

export const studyHistory = [
  {
    id: "HIST-1",
    date: "Yesterday",
    dateSub: "Oct 23",
    seatId: "Seat B12",
    zone: "B",
    duration: "4.0 hrs",
    timeWindow: "1:00 PM – 5:00 PM",
    outcome: "Completed"
  },
  {
    id: "HIST-2",
    date: "Monday",
    dateSub: "Oct 21",
    seatId: "Seat D05",
    zone: "E",
    duration: "2.5 hrs",
    timeWindow: "3:30 PM – 6:00 PM",
    outcome: "Completed"
  },
  {
    id: "HIST-3",
    date: "Saturday",
    dateSub: "Oct 19",
    seatId: "Study Room 4",
    zone: "C",
    duration: "3.0 hrs",
    timeWindow: "10:00 AM – 1:00 PM",
    outcome: "Completed"
  }
];

// Initial seat matrix matching the exact blueprint layout in Stitch
export const initialSeats = [
  // Pod A: Window Nook (L-shape Upper Left)
  { id: "A01", zone: "A", status: "available" },
  { id: "A02", zone: "A", status: "available" },
  { id: "A03", zone: "A", status: "occupied" },
  { id: "A04", zone: "A", status: "available" },
  { id: "A05", zone: "A", status: "available" },
  { id: "A06", zone: "A", status: "available" },
  { id: "A07", zone: "A", status: "occupied" },
  { id: "A08", zone: "A", status: "available" },
  { id: "A09", zone: "A", status: "available" },
  { id: "A10", zone: "A", status: "held" },
  { id: "A11", zone: "A", status: "available" },
  { id: "A12", zone: "A", status: "available" },
  { id: "A13", zone: "A", status: "available" },
  { id: "A14", zone: "A", status: "occupied" },
  { id: "A15", zone: "A", status: "occupied" },
  { id: "A16", zone: "A", status: "available" },

  // Block B: Quiet Study Rectilinear (32 seats)
  { id: "B01", zone: "B", status: "available" },
  { id: "B02", zone: "B", status: "available" },
  { id: "B03", zone: "B", status: "occupied" },
  { id: "B04", zone: "B", status: "available" },
  { id: "B05", zone: "B", status: "occupied" },
  { id: "B06", zone: "B", status: "available" },
  { id: "B07", zone: "B", status: "available" },
  { id: "B08", zone: "B", status: "maintenance" },
  { id: "B09", zone: "B", status: "available" },
  { id: "B10", zone: "B", status: "available" },
  { id: "B11", zone: "B", status: "occupied" },
  { id: "B12", zone: "B", status: "occupied" },
  { id: "B13", zone: "B", status: "available" },
  { id: "B14", zone: "B", status: "available" },
  { id: "B15", zone: "B", status: "available" },
  { id: "B16", zone: "B", status: "available" },
  { id: "B17", zone: "B", status: "available" },
  { id: "B18", zone: "B", status: "occupied" },
  { id: "B19", zone: "B", status: "available" },
  { id: "B20", zone: "B", status: "available" },
  { id: "B21", zone: "B", status: "held" },
  { id: "B22", zone: "B", status: "available" },
  { id: "B23", zone: "B", status: "available" },
  { id: "B24", zone: "B", status: "occupied" },
  { id: "B25", zone: "B", status: "available" },
  { id: "B26", zone: "B", status: "available" },
  { id: "B27", zone: "B", status: "available" },
  { id: "B28", zone: "B", status: "occupied" },
  { id: "B29", zone: "B", status: "available" },
  { id: "B30", zone: "B", status: "available" },
  { id: "B31", zone: "B", status: "occupied" },
  { id: "B32", zone: "B", status: "available" },

  // Block C: Center Active Collaboration Cluster (C01 - C14)
  { id: "C01", zone: "C", status: "available" },
  { id: "C02", zone: "C", status: "occupied" },
  { id: "C03", zone: "C", status: "available" },
  { id: "C04", zone: "C", status: "selected" }, // Default active selection
  { id: "C05", zone: "C", status: "available" },
  { id: "C06", zone: "C", status: "occupied" },
  { id: "C07", zone: "C", status: "available" },
  { id: "C08", zone: "C", status: "available" },
  { id: "C09", zone: "C", status: "available" },
  { id: "C10", zone: "C", status: "occupied" },
  { id: "C11", zone: "C", status: "held" },
  { id: "C12", zone: "C", status: "available" },
  { id: "C13", zone: "C", status: "available" },
  { id: "C14", zone: "C", status: "occupied" },

  // Pod E: Lower-Right Vertical 1 (Silent Research Carrel 1)
  { id: "E01", zone: "E", status: "available" },
  { id: "E02", zone: "E", status: "available" },
  { id: "E03", zone: "E", status: "occupied" },
  { id: "E04", zone: "E", status: "available" },
  { id: "E05", zone: "E", status: "available" },
  { id: "E06", zone: "E", status: "occupied" },
  { id: "E07", zone: "E", status: "available" },
  { id: "E08", zone: "E", status: "occupied" },
  { id: "E09", zone: "E", status: "available" },
  { id: "E10", zone: "E", status: "available" },
  { id: "E11", zone: "E", status: "held" },
  { id: "E12", zone: "E", status: "available" },

  // Pod F: Lower-Right Vertical 2 (Silent Research Carrel 2)
  { id: "F01", zone: "F", status: "available" },
  { id: "F02", zone: "F", status: "occupied" },
  { id: "F03", zone: "F", status: "available" },
  { id: "F04", zone: "F", status: "available" },
  { id: "F05", zone: "F", status: "occupied" },
  { id: "F06", zone: "F", status: "available" },
  { id: "F07", zone: "F", status: "available" },
  { id: "F08", zone: "F", status: "available" },
  { id: "F09", zone: "F", status: "occupied" },
  { id: "F10", zone: "F", status: "available" },
  { id: "F11", zone: "F", status: "available" },
  { id: "F12", zone: "F", status: "available" }
];
