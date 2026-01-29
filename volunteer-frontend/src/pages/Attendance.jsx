import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function Attendance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({}); // email -> profile

  // ✅ NEW: date selection (daily attendance)
  const todayISO = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);

  // ✅ NEW: map for daily attendance: email -> true/false/null
  const [attendanceMap, setAttendanceMap] = useState({});

  // ✅ Load organizer events
  const loadMyEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/organizer/${user.email}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to load events");
    }
  };

  // ✅ Load approved volunteers for selected event
  const loadApprovedVolunteers = async (eventId) => {
    try {
      const res = await fetch(`${API_BASE}/participations/event/${eventId}`);
      const data = await res.json();

      const list = Array.isArray(data) ? data : [];
      const approvedOnly = list.filter((p) => p.status === "APPROVED");

      setRequests(approvedOnly);
    } catch {
      alert("Failed to load volunteers");
    }
  };

  // ✅ Load volunteer profile
  const fetchProfile = async (email) => {
    if (!email || profiles[email]) return;

    try {
      const res = await fetch(`${API_BASE}/users/email/${email}`);
      if (!res.ok) return;

      const data = await res.json();

      setProfiles((prev) => ({
        ...prev,
        [email]: {
          name: data?.name || "Unknown",
          contact: data?.contact || "-",
          profilePicture: data?.profilePicture || null,
        },
      }));
    } catch {}
  };

  // ✅ Load daily attendance list from backend
  const loadDailyAttendance = async (eventId, date) => {
    try {
      if (!eventId || !date) return;

      const res = await fetch(
        `${API_BASE}/participations/attendance/list?eventId=${eventId}&date=${date}`
      );

      if (!res.ok) {
        setAttendanceMap({});
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      const map = {};
      list.forEach((a) => {
        map[a.volunteerEmail] = a.attended; // true/false
      });

      setAttendanceMap(map);
    } catch {
      setAttendanceMap({});
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadApprovedVolunteers(selectedEventId);
      loadDailyAttendance(selectedEventId, selectedDate);
    }
  }, [selectedEventId]);

  useEffect(() => {
    // ✅ date change => reload attendance
    if (selectedEventId) loadDailyAttendance(selectedEventId, selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    // ✅ load profiles
    requests.forEach((r) => fetchProfile(r.volunteerEmail));
  }, [requests]);

  // ✅ Mark attendance daily (API)
  const markAttendance = async (volunteerEmail, attended) => {
    try {
      if (!selectedEventId) return;

      const res = await fetch(
        `${API_BASE}/participations/attendance/mark?eventId=${selectedEventId}&volunteerEmail=${volunteerEmail}&date=${selectedDate}&attended=${attended}`,
        { method: "PUT" }
      );

      if (!res.ok) {
        const msg = await res.text();
        alert(msg || "Failed to mark attendance");
        return;
      }

      // ✅ Update UI instantly
      setAttendanceMap((prev) => ({
        ...prev,
        [volunteerEmail]: attended,
      }));
    } catch {
      alert("Error marking attendance");
    }
  };

  const getAttendanceLabel = (email) => {
    const value = attendanceMap[email];
    if (value === true) return "Present";
    if (value === false) return "Absent";
    return "Not Marked";
  };

  const getAttendanceBadge = (email) => {
    const value = attendanceMap[email];
    if (value === true) return "bg-green-600 text-white";
    if (value === false) return "bg-red-600 text-white";
    return "bg-yellow-500 text-white";
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header Section */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Daily Attendance
                </h2>
                <p className="text-gray-600 mt-1">
                  Mark daily attendance for approved volunteers
                </p>
              </div>
            </div>
          </div>

          {/* Event + Date Selection */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📅</span>
                  <label className="block font-bold text-gray-800 text-lg">
                    Select Event
                  </label>
                </div>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                >
                  <option value="">-- Choose an event --</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.startDate})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">📆</span>
                  <label className="block font-bold text-gray-800 text-lg">
                    Select Date
                  </label>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          {selectedEventId && requests.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Total Volunteers</div>
                  <div className="text-2xl font-bold text-blue-700">{requests.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="text-xs text-green-600 font-semibold mb-1">Present</div>
                  <div className="text-2xl font-bold text-green-700">
                    {Object.values(attendanceMap).filter(v => v === true).length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <div className="text-xs text-red-600 font-semibold mb-1">Absent</div>
                  <div className="text-2xl font-bold text-red-700">
                    {Object.values(attendanceMap).filter(v => v === false).length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
                  <div className="text-xs text-amber-600 font-semibold mb-1">Not Marked</div>
                  <div className="text-2xl font-bold text-amber-700">
                    {requests.length - Object.keys(attendanceMap).length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          {!selectedEventId ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <div className="font-bold text-lg">No Event Selected</div>
                <div className="text-sm text-blue-600">Please select an event to view volunteers</div>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 text-amber-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="font-bold text-lg">No Volunteers Found</div>
                <div className="text-sm text-amber-600">No approved volunteers for this event yet</div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider">Volunteer</th>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider">Contact</th>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider w-96">Attendance</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {requests.map((r) => {
                      const profile = profiles[r.volunteerEmail];

                      return (
                        <tr key={r.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  profile?.profilePicture
                                    ? profile.profilePicture
                                    : `https://ui-avatars.com/api/?name=${profile?.name || "V"}&background=10b981&color=fff`
                                }
                                alt="profile"
                                className="w-12 h-12 rounded-full object-cover border-2 border-green-200 shadow-md"
                              />
                              <div>
                                <div className="font-bold text-gray-800">
                                  {profile?.name || "Loading..."}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {r.volunteerEmail}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-gray-700 font-medium">
                            {profile?.contact || "-"}
                          </td>

                          <td className="px-6 py-4">
                            <span className="px-4 py-2 rounded-full text-xs font-bold shadow-md bg-green-600 text-white">
                              APPROVED
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2 items-center">
                              <button
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                                  attendanceMap[r.volunteerEmail] === true
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50"
                                    : "bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 hover:border-green-300"
                                }`}
                                onClick={() =>
                                  markAttendance(r.volunteerEmail, true)
                                }
                              >
                                ✅ Present
                              </button>

                              <button
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                                  attendanceMap[r.volunteerEmail] === false
                                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50"
                                    : "bg-red-50 text-red-700 border-2 border-red-200 hover:bg-red-100 hover:border-red-300"
                                }`}
                                onClick={() =>
                                  markAttendance(r.volunteerEmail, false)
                                }
                              >
                                ❌ Absent
                              </button>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${getAttendanceBadge(
                                  r.volunteerEmail
                                )}`}
                              >
                                {getAttendanceLabel(r.volunteerEmail)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Results Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <div className="text-sm text-gray-600 text-center">
                  Showing <span className="font-bold text-green-600">{requests.length}</span> approved volunteer(s) for{" "}
                  <span className="font-bold text-gray-800">{selectedDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Attendance;
