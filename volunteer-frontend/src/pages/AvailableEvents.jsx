import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function AvailableEvents() {
  const [events, setEvents] = useState([]);
  const [participationMap, setParticipationMap] = useState({}); // eventId -> status
  const [volunteerCountMap, setVolunteerCountMap] = useState({}); // eventId -> approved count
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // ✅ Modal for event details
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
const isVerified = user?.verificationStatus === "VERIFIED";


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
      const eventList = Array.isArray(data) ? data : [];
      setEvents(eventList);
      
      // ✅ Fetch volunteer counts for each event
      await loadVolunteerCounts(eventList);
      
      setError(null);
    } catch {
      setError("Unable to load events. Please ensure backend is running.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch approved volunteer count for all events
  const loadVolunteerCounts = async (eventList) => {
    try {
      const countMap = {};
      
      // Fetch participations for all events
      const promises = eventList.map(async (event) => {
        try {
          const res = await fetch(`${API_BASE}/participations/event/${event.id}`);
          if (res.ok) {
            const participations = await res.json();
            // Count only APPROVED volunteers
            const approvedCount = (Array.isArray(participations) ? participations : [])
              .filter(p => p.status === "APPROVED").length;
            countMap[event.id] = approvedCount;
          } else {
            countMap[event.id] = 0;
          }
        } catch {
          countMap[event.id] = 0;
        }
      });
      
      await Promise.all(promises);
      setVolunteerCountMap(countMap);
    } catch {
      console.log("Failed to load volunteer counts");
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
      // Also refresh volunteer counts
      if (events.length > 0) {
        loadVolunteerCounts(events);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [events]);

  // ✅ Check if event is full
  const isEventFull = (event) => {
    const approvedCount = volunteerCountMap[event.id] || 0;
    const required = event.requiredVolunteers || 0;
    return required > 0 && approvedCount >= required;
  };

  // ✅ Join event
  const handleJoin = async (eventId) => {
    if (!user?.email) {
      alert("Please login first");
      return;
    }

    if (user.verificationStatus !== "VERIFIED") {
      alert("❌ Your account is not verified yet");
      return;
    }

    if (participationMap[eventId]) {
      alert("✅ You already applied for this event.");
      return;
    }

    // ✅ Check if event is full
    const event = events.find(e => e.id === eventId);
    if (event && isEventFull(event)) {
      alert("❌ This event is already full. No more volunteers can join.");
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
    const approvedCount = volunteerCountMap[event.id] || 0;
    const eventFull = isEventFull(event);

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
                
                {/* ✅ Event Full Badge */}
                {eventFull && (
                  <span className="px-2 py-1 text-xs rounded bg-red-600 text-white font-semibold">
                    🚫 Event Full
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

            {/* ✅ Volunteer Count Progress */}
            <div className={`p-4 rounded-lg border-2 ${eventFull ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700">👥 Volunteers Joined</span>
                <span className={`font-bold ${eventFull ? "text-red-600" : "text-green-600"}`}>
                  {approvedCount} / {event.requiredVolunteers || "∞"}
                </span>
              </div>
              {event.requiredVolunteers > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${eventFull ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min((approvedCount / event.requiredVolunteers) * 100, 100)}%` }}
                  ></div>
                </div>
              )}
              {eventFull && (
                <p className="text-red-600 text-sm mt-2 font-medium">
                  🚫 This event has reached maximum capacity
                </p>
              )}
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
                !isVerified || requestStatus || eventFull
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "!bg-indigo-600 !text-white hover:!bg-indigo-700"
              }`}
              disabled={!isVerified || !!requestStatus || eventFull}
              onClick={() => handleJoin(event.id)}
            >
              {!isVerified 
                ? "⛔ Verification Required" 
                : eventFull 
                ? "🚫 Event Full" 
                : requestStatus 
                ? getRequestText(requestStatus) 
                : "✨ Join Event"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-white">
        <Sidebar
          role="VOLUNTEER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8 bg-linear-to-br from-gray-50 to-gray-100">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🌍</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Available Events
                </h2>
                <p className="text-gray-600 mt-1">
                  Only upcoming and ongoing events are shown
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          {!loading && filteredEvents.length > 0 && (
            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="Search events by title or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === "all" ? "📁 All Categories" : `📌 ${cat}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Events */}
          {loading ? (
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="font-semibold">Loading events...</span>
              </div>
            </div>
          ) : error ? (
            <div className="bg-linear-to-r from-yellow-50 to-amber-50 border border-yellow-300 text-yellow-900 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-linear-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-2xl shadow-md text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold">No upcoming or ongoing events available right now.</p>
              <p className="text-sm text-gray-500 mt-2">Check back later for new opportunities!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => {
                const requestStatus = participationMap[event.id];
                const eventStatus = getEventStatus(event);
                const approvedCount = volunteerCountMap[event.id] || 0;
                const eventFull = isEventFull(event);

                return (
                  <div
                    key={event.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-green-600 transition-colors">{event.title}</h3>

                          <div className="flex flex-wrap gap-2">
                            <span className="text-xs bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium">
                              📁 {event.category}
                            </span>

                            {/* ✅ Event status */}
                            <span
                              className={`px-3 py-1 text-xs rounded-full font-semibold ${getEventStatusBadgeClass(
                                eventStatus
                              )}`}
                            >
                              {getEventStatusText(eventStatus)}
                            </span>
                            
                            {/* ✅ Event Full Badge */}
                            {eventFull && (
                              <span className="px-3 py-1 text-xs rounded-full font-semibold bg-red-600 text-white">
                                🚫 Full
                              </span>
                            )}
                          </div>
                        </div>

                        {/* ✅ Request status */}
                        {requestStatus && (
                          <span className={`${getRequestBadgeClass(requestStatus)} rounded-full font-semibold`}>
                            {getRequestText(requestStatus)}
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
                        {event.description}
                      </p>
                      
                      {/* ✅ Volunteer Count */}
                      <div className={`mb-4 p-3 rounded-lg ${eventFull ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">👥 Volunteers</span>
                          <span className={`font-bold ${eventFull ? "text-red-600" : "text-green-600"}`}>
                            {approvedCount} / {event.requiredVolunteers || "∞"}
                          </span>
                        </div>
                        {event.requiredVolunteers > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${eventFull ? "bg-red-500" : "bg-green-500"}`}
                              style={{ width: `${Math.min((approvedCount / event.requiredVolunteers) * 100, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <button
                          className="w-full px-4 py-3 rounded-xl font-semibold bg-linear-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                          onClick={() => setSelectedEvent(event)}
                        >
                          👀 View Details
                        </button>

                        {requestStatus === "PENDING" && (
                          <button
                            className="w-full px-4 py-3 rounded-xl font-semibold border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white transform hover:scale-105 transition-all duration-300"
                            onClick={() => handleCancelRequest(event.id)}
                          >
                            ❌ Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
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

