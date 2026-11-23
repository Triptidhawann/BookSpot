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
  hours: "24 hrs open",
  activeLevel: "",
  syncSeconds: 12,
  totalSeats: 112,
  availableSeats: 68,
  occupiedSeats: 36,
  heldSeats: 8,
  silentIndex: "92%"
};

export const activeBooking = {
      "booking_id": "",
      "seatNo": "",
      "student_id": "",
      "name": "",
      "start_time": "",
      "end_time": "",
      "status": "",
      "created_at": "",
      "cancelled_at": null
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

export const studyHistory = [];

