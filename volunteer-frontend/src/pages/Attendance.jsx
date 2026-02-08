import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function Attendance() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({}); // email -> profile

  // ✅ NEW: date selection (daily attendance)
  const todayISO = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);

  // ✅ NEW: map for daily attendance: email -> true/false/null
  const [attendanceMap, setAttendanceMap] = useState({});

  // ✅ NEW: View mode - 'mark' or 'history'
  const [viewMode, setViewMode] = useState("mark");

  // ✅ NEW: Attendance history for all dates
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  // ✅ Check if event has ended
  const isEventEnded = () => {
    if (!selectedEvent?.endDate) return false;
    const endDate = new Date(selectedEvent.endDate);
    endDate.setHours(23, 59, 59, 999); // End of the day
    return new Date() > endDate;
  };

  // ✅ Check if selected date is within event range
  const isDateValid = (date) => {
    if (!selectedEvent?.startDate || !selectedEvent?.endDate) return true;
    const selected = new Date(date);
    const start = new Date(selectedEvent.startDate);
    const end = new Date(selectedEvent.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return selected >= start && selected <= end;
  };

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

  // ✅ NEW: Load attendance history for all dates
  const loadAttendanceHistory = async (eventId) => {
    try {
      if (!eventId) return;

      // Try to get history from dedicated endpoint
      const res = await fetch(
        `${API_BASE}/participations/attendance/history?eventId=${eventId}`
      );

      if (res.ok) {
        const data = await res.json();
        setAttendanceHistory(Array.isArray(data) ? data : []);
      } else {
        // Fallback: Try to get all attendance records
        const allRes = await fetch(
          `${API_BASE}/participations/attendance/all?eventId=${eventId}`
        );
        
        if (allRes.ok) {
          const data = await allRes.json();
          setAttendanceHistory(Array.isArray(data) ? data : []);
        } else {
          setAttendanceHistory([]);
        }
      }
    } catch {
      setAttendanceHistory([]);
    }
  };

  useEffect(() => {
    loadMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      const event = events.find(e => e.id === parseInt(selectedEventId) || e.id === selectedEventId);
      setSelectedEvent(event || null);
      loadApprovedVolunteers(selectedEventId);
      loadDailyAttendance(selectedEventId, selectedDate);
      loadAttendanceHistory(selectedEventId);
      
      // Auto-switch to history view if event has ended
      if (event?.endDate) {
        const endDate = new Date(event.endDate);
        endDate.setHours(23, 59, 59, 999);
        if (new Date() > endDate) {
          setViewMode("history");
        }
      }
    } else {
      setSelectedEvent(null);
    }
  }, [selectedEventId, events]);

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

      // Check if event has ended
      if (isEventEnded()) {
        alert("❌ Cannot mark attendance. This event has already ended.");
        return;
      }

      // Check if date is within event range
      if (!isDateValid(selectedDate)) {
        alert("❌ Selected date is outside the event duration.");
        return;
      }

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

      // Reload history
      loadAttendanceHistory(selectedEventId);
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

      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header Section */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <span className="text-3xl">✅</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
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
            {/* Event Status Banner */}
            {selectedEvent && isEventEnded() && (
              <div className="mb-4 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <div>
                  <div className="font-bold text-red-700">Event Has Ended</div>
                  <div className="text-sm text-red-600">
                    This event ended on {selectedEvent.endDate}. Attendance marking is disabled, but you can view the attendance history.
                  </div>
                </div>
              </div>
            )}

            {selectedEvent && !isEventEnded() && (
              <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4 flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <div className="font-bold text-green-700">Event Active</div>
                  <div className="text-sm text-green-600">
                    Event duration: {selectedEvent.startDate} to {selectedEvent.endDate}
                  </div>
                </div>
              </div>
            )}

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
                  {events.map((e) => {
                    const ended = new Date() > new Date(e.endDate);
                    return (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.startDate} - {e.endDate}) {ended ? "🔒 Ended" : ""}
                      </option>
                    );
                  })}
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
                  min={selectedEvent?.startDate || ""}
                  max={selectedEvent?.endDate || ""}
                  disabled={isEventEnded()}
                  className={`w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 ${isEventEnded() ? "opacity-50 cursor-not-allowed" : ""}`}
                />
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          {selectedEventId && (
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-100">
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("mark")}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                    viewMode === "mark"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  📝 Mark Attendance
                </button>
                <button
                  onClick={() => setViewMode("history")}
                  className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all duration-200 ${
                    viewMode === "history"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  📊 View Attendance History
                </button>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          {selectedEventId && requests.length > 0 && viewMode === "mark" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">📊 Attendance for {selectedDate}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Total Volunteers</div>
                  <div className="text-2xl font-bold text-blue-700">{requests.length}</div>
                </div>
                <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="text-xs text-green-600 font-semibold mb-1">Present</div>
                  <div className="text-2xl font-bold text-green-700">
                    {Object.values(attendanceMap).filter(v => v === true).length}
                  </div>
                </div>
                <div className="bg-linear-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
                  <div className="text-xs text-red-600 font-semibold mb-1">Absent</div>
                  <div className="text-2xl font-bold text-red-700">
                    {Object.values(attendanceMap).filter(v => v === false).length}
                  </div>
                </div>
                <div className="bg-linear-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
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
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <div className="font-bold text-lg">No Event Selected</div>
                <div className="text-sm text-blue-600">Please select an event to view volunteers</div>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-linear-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 text-amber-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <div className="font-bold text-lg">No Volunteers Found</div>
                <div className="text-sm text-amber-600">No approved volunteers for this event yet</div>
              </div>
            </div>
          ) : viewMode === "history" ? (
            /* ========== ATTENDANCE HISTORY VIEW ========== */
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4">
                <h3 className="text-xl font-bold">📊 Attendance History</h3>
                <p className="text-blue-100 text-sm">Complete attendance records for this event</p>
              </div>

              {/* Summary by Volunteer */}
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-3 font-bold text-gray-700">Volunteer</th>
                        <th className="text-left px-4 py-3 font-bold text-gray-700">Email</th>
                        <th className="text-center px-4 py-3 font-bold text-green-600">Present Days</th>
                        <th className="text-center px-4 py-3 font-bold text-red-600">Absent Days</th>
                        <th className="text-center px-4 py-3 font-bold text-blue-600">Attendance %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {requests.map((r) => {
                        const profile = profiles[r.volunteerEmail];
                        // Calculate attendance from history
                        const volunteerHistory = attendanceHistory.filter(
                          (h) => h.volunteerEmail === r.volunteerEmail
                        );
                        const presentDays = volunteerHistory.filter((h) => h.attended === true).length;
                        const absentDays = volunteerHistory.filter((h) => h.attended === false).length;
                        const totalMarked = presentDays + absentDays;
                        const percentage = totalMarked > 0 ? Math.round((presentDays / totalMarked) * 100) : 0;

                        return (
                          <tr key={r.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={
                                    profile?.profilePicture ||
                                    `https://ui-avatars.com/api/?name=${profile?.name || "V"}&background=6366f1&color=fff`
                                  }
                                  alt="profile"
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                                <span className="font-medium text-gray-800">
                                  {profile?.name || "Loading..."}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-sm">{r.volunteerEmail}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                                {presentDays}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                                {absentDays}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      percentage >= 75
                                        ? "bg-green-500"
                                        : percentage >= 50
                                        ? "bg-yellow-500"
                                        : "bg-red-500"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="font-bold text-gray-700">{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Daily Breakdown */}
                {attendanceHistory.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold text-gray-800 mb-3">📅 Daily Breakdown</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {[...new Set(attendanceHistory.map((h) => h.date))].sort().map((date) => {
                        const dayRecords = attendanceHistory.filter((h) => h.date === date);
                        const present = dayRecords.filter((h) => h.attended === true).length;
                        const absent = dayRecords.filter((h) => h.attended === false).length;

                        return (
                          <div
                            key={date}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200 text-center"
                          >
                            <div className="text-xs text-gray-500 mb-1">{date}</div>
                            <div className="flex justify-center gap-2 text-sm">
                              <span className="text-green-600 font-bold">✅ {present}</span>
                              <span className="text-red-600 font-bold">❌ {absent}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {attendanceHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl mb-2 block">📭</span>
                    No attendance records found for this event yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========== MARK ATTENDANCE VIEW ========== */
            <div className="overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-linear-to-r from-green-500 to-emerald-600 text-white">
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
                      const eventEnded = isEventEnded();

                      return (
                        <tr key={r.id} className="hover:bg-linear-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200">
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
                              {eventEnded ? (
                                <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-medium">
                                  🔒 Event Ended - View History
                                </span>
                              ) : (
                                <>
                                  <button
                                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 ${
                                      attendanceMap[r.volunteerEmail] === true
                                        ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50"
                                        : "!bg-white hover:!bg-green-50 !text-green-700 !border-2 !border-green-300"
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
                                        : "!bg-white hover:!bg-red-50 !text-red-700 !border-2 !border-red-300"
                                    }`}
                                    onClick={() =>
                                      markAttendance(r.volunteerEmail, false)
                                    }
                                  >
                                    ❌ Absent
                                  </button>
                                </>
                              )}

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
              <div className="bg-linear-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <div className="text-sm text-gray-600 text-center">
                  Showing <span className="font-bold text-green-600">{requests.length}</span> approved volunteer(s) for{" "}
                  <span className="font-bold text-gray-800">{selectedDate}</span>
                  {isEventEnded() && (
                    <span className="ml-2 text-red-500 font-medium">
                      (Event has ended - Attendance marking disabled)
                    </span>
                  )}
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

