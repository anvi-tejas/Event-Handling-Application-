import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function AvailableEvents() {
  const [events, setEvents] = useState([]);
  const [participationMap, setParticipationMap] = useState({}); // eventId -> status
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ✅ Modal for event details
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Normalize date (remove time issue)
  const normalizeDate = (dateStr) => {
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  // ✅ Event status based on date
  const getEventStatus = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = normalizeDate(event.startDate);
    const end = normalizeDate(event.endDate);

    if (today >= start && today <= end) return "ONGOING";
    if (today < start) return "UPCOMING";
    return "EXPIRED";
  };

  // ✅ Badge UI for event status
  const getEventStatusBadgeClass = (status) => {
    if (status === "ONGOING") return "bg-green-600 text-white";
    if (status === "UPCOMING") return "bg-blue-600 text-white";
    return "bg-gray-600 text-white";
  };

  const getEventStatusText = (status) => {
    if (status === "ONGOING") return "🟢 Ongoing";
    if (status === "UPCOMING") return "🟦 Upcoming";
    return "⚫ Expired";
  };

  // ✅ Fetch events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/events/all`);
      if (!res.ok) throw new Error("Failed to fetch events");

      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
      setError(null);
    } catch {
      setError("Unable to load events. Please ensure backend is running.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Participation status
  const loadParticipationStatus = async () => {
    try {
      if (!user?.email) return;

      const pRes = await fetch(`${API_BASE}/participations/volunteer/${user.email}`);
      if (!pRes.ok) return;

      const pData = await pRes.json();
      const map = {};

      (Array.isArray(pData) ? pData : []).forEach((p) => {
        map[p.eventId] = p.status || "PENDING";
      });

      setParticipationMap(map);
    } catch {}
  };

  useEffect(() => {
    loadEvents();
    loadParticipationStatus();
  }, []);

  // ✅ Auto refresh participation status every 3 sec
  useEffect(() => {
    const interval = setInterval(() => {
      loadParticipationStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // ✅ Join event
  const handleJoin = async (eventId) => {
    if (!user?.email) {
      alert("Please login first");
      return;
    }

    if (participationMap[eventId]) {
      alert("✅ You already applied for this event.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/participations/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId,
          volunteerEmail: user.email,
        }),
      });

      const message = await response.text();
      alert(message);

      // ✅ Instant UI update
      setParticipationMap((prev) => ({
        ...prev,
        [eventId]: "PENDING",
      }));

      // ✅ Close modal after join
      setSelectedEvent(null);
    } catch {
      alert("Failed to join event");
    }
  };

  // ✅ Cancel request
  const handleCancelRequest = async (eventId) => {
    if (!user?.email) return;

    const confirm = window.confirm("Cancel your request for this event?");
    if (!confirm) return;

    try {
      const res = await fetch(
        `${API_BASE}/participations/cancel/${eventId}/${user.email}`,
        { method: "DELETE" }
      );

      const msg = await res.text();
      alert(msg);

      // ✅ Remove from map
      setParticipationMap((prev) => {
        const updated = { ...prev };
        delete updated[eventId];
        return updated;
      });
    } catch {
      alert("Failed to cancel request");
    }
  };

  // ✅ Filter expired events out + search + category
  const filteredEvents = events
    .filter((event) => getEventStatus(event) !== "EXPIRED")
    .filter((event) => {
      const title = (event.title || "").toLowerCase();
      const desc = (event.description || "").toLowerCase();

      const matchesSearch =
        title.includes(searchTerm.toLowerCase()) ||
        desc.includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" || event.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });

  const categories = [
    "all",
    ...new Set(filteredEvents.map((e) => e.category).filter(Boolean)),
  ];

  // ✅ Request Badge
  const getRequestBadgeClass = (status) => {
    if (status === "APPROVED") return "px-2 py-1 text-xs rounded bg-green-600 text-white";
    if (status === "REJECTED") return "px-2 py-1 text-xs rounded bg-red-600 text-white";
    return "px-2 py-1 text-xs rounded bg-yellow-500 text-white";
  };

  const getRequestText = (status) => {
    if (status === "APPROVED") return "✅ Approved";
    if (status === "REJECTED") return "❌ Rejected";
    if (status === "PENDING") return "⏳ Pending";
    return "";
  };

  // ✅ Modal UI
  const EventDetailsModal = ({ event }) => {
    if (!event) return null;

    const requestStatus = participationMap[event.id];
    const eventStatus = getEventStatus(event);

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-3">
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{event.title}</h3>

              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="text-sm text-gray-500">{event.category}</span>

                <span
                  className={`px-2 py-1 text-xs rounded ${getEventStatusBadgeClass(eventStatus)}`}
                >
                  {getEventStatusText(eventStatus)}
                </span>

                {requestStatus && (
                  <span className={getRequestBadgeClass(requestStatus)}>
                    {getRequestText(requestStatus)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedEvent(null)}
              className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
            >
              ✖
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <p className="text-gray-700">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <b>📅 Start:</b> {event.startDate} <br />
                <b>📅 End:</b> {event.endDate}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <b>⏰ Time:</b> {event.startTime} - {event.endTime} <br />
                <b>👥 Required Volunteers:</b> {event.requiredVolunteers}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <b>📍 Location:</b> {event.locationName} <br />
                {event.city}, {event.area}
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <b>🧠 Skills:</b> {event.skills || "Not required"} <br />
                <b>🎯 Min Age:</b> {event.minAge || "No limit"} <br />
                <b>⚧ Gender:</b> {event.genderPreference || "Any"}
              </div>
            </div>

            {event.registrationDeadline && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-lg text-sm">
                ⏳ <b>Registration Deadline:</b> {event.registrationDeadline}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t flex flex-wrap gap-2 justify-end">
            {requestStatus === "PENDING" && (
              <button
                className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"
                onClick={() => handleCancelRequest(event.id)}
              >
                ❌ Cancel Request
              </button>
            )}

            <button
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                requestStatus
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "!bg-indigo-600 !text-white hover:!bg-indigo-700"
              }`}
              disabled={!!requestStatus}
              onClick={() => handleJoin(event.id)}
            >
              {requestStatus ? getRequestText(requestStatus) : "✨ Join Event"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          role="VOLUNTEER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="grow p-4">
          <div className="mb-4">
            <h2 className="text-2xl font-bold">🌍 Available Events</h2>
            <p className="text-gray-500">
              Only upcoming and ongoing events are shown.
            </p>
          </div>

          {/* Filters */}
          {!loading && filteredEvents.length > 0 && (
            <div className="bg-white shadow rounded-xl p-4 mb-4">
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="🔍 Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                <select
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === "all" ? "All Categories" : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Events */}
          {loading ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              Loading events...
            </div>
          ) : error ? (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
              ⚠️ {error}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
              No upcoming or ongoing events available right now.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => {
                const requestStatus = participationMap[event.id];
                const eventStatus = getEventStatus(event);

                return (
                  <div
                    key={event.id}
                    className="bg-white rounded-2xl shadow p-4 border border-gray-100 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div>
                        <h3 className="font-bold text-lg">{event.title}</h3>

                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {event.category}
                          </span>

                          {/* ✅ Event status */}
                          <span
                            className={`px-2 py-1 text-xs rounded ${getEventStatusBadgeClass(
                              eventStatus
                            )}`}
                          >
                            {getEventStatusText(eventStatus)}
                          </span>
                        </div>
                      </div>

                      {/* ✅ Request status */}
                      {requestStatus && (
                        <span className={getRequestBadgeClass(requestStatus)}>
                          {getRequestText(requestStatus)}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {event.description}
                    </p>

                    {/* ✅ FIX: Button text always visible */}
                    <button
                      className="w-full px-4 py-2 rounded-lg font-semibold !bg-indigo-600 !text-white hover:!bg-indigo-700 transition"
                      onClick={() => setSelectedEvent(event)}
                    >
                      👀 View Details
                    </button>

                    {requestStatus === "PENDING" && (
                      <button
                        className="w-full mt-2 px-4 py-2 rounded-lg font-semibold border border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition"
                        onClick={() => handleCancelRequest(event.id)}
                      >
                        ❌ Cancel Request
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal */}
      {selectedEvent && <EventDetailsModal event={selectedEvent} />}
    </>
  );
}

export default AvailableEvents;
