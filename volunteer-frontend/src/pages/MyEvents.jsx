import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const eventsContainerRef = useRef(null);

  // ✅ Filters
  const [filter, setFilter] = useState("ALL"); // ALL / UPCOMING / LIVE / PENDING / COMPLETED
  const [pendingEventIds, setPendingEventIds] = useState(new Set());

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch Organizer Events
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/organizer/${user.email}`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      alert("Failed to fetch events");
    }
  };

  // ✅ Find which events have pending requests
  const loadPendingRequests = async (eventsList) => {
    try {
      const ids = eventsList.map((e) => e.id);
      const pendingSet = new Set();

      await Promise.all(
        ids.map(async (id) => {
          try {
            const res = await fetch(`${API_BASE}/participations/event/${id}`);
            if (!res.ok) return;

            const data = await res.json();
            const list = Array.isArray(data) ? data : [];
            const hasPending = list.some((p) => p.status === "PENDING");

            if (hasPending) pendingSet.add(id);
          } catch {
            // ignore
          }
        })
      );

      setPendingEventIds(pendingSet);
    } catch {
      setPendingEventIds(new Set());
    }
  };

  useEffect(() => {
    if (user?.email) fetchEvents();
  }, []);

  // ✅ When events change, load pending request status
  useEffect(() => {
    if (events.length > 0) loadPendingRequests(events);
  }, [events]);

  // ✅ Animate rows
  useEffect(() => {
    if (eventsContainerRef.current && events.length > 0) {
      const ctx = gsap.context(() => {
        gsap.from(eventsContainerRef.current.querySelectorAll("tbody tr"), {
          duration: 0.5,
          opacity: 0,
          y: 20,
          stagger: 0.08,
          ease: "power2.out",
        });
      }, eventsContainerRef);

      return () => ctx.revert();
    }
  }, [events]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this event?");
    if (!confirm) return;

    try {
      await fetch(`${API_BASE}/events/delete/${id}`, {
        method: "DELETE",
      });
      fetchEvents();
    } catch {
      alert("Failed to delete event");
    }
  };

  // ✅ Event Date Status
  const getEventStatus = (event) => {
    const today = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (today < start) return "UPCOMING";
    if (today >= start && today <= end) return "LIVE";
    if (today > end) return "COMPLETED";
    return "UPCOMING";
  };

  // ✅ Badge styling
  const statusBadge = (status, isPending) => {
    if (isPending) return "bg-yellow-500 text-white"; // pending requests exist
    if (status === "LIVE") return "bg-green-600 text-white";
    if (status === "COMPLETED") return "bg-gray-800 text-white";
    return "bg-blue-600 text-white"; // upcoming
  };

  // ✅ Badge text (shows both conditions)
  const statusText = (status, isPending) => {
    let main = "";
    if (status === "LIVE") main = "🟢 Live";
    else if (status === "COMPLETED") main = "✅ Completed";
    else main = "📅 Yet to Start";

    if (isPending) return `${main} + ⏳ Pending`;
    return main;
  };

  // ✅ Apply filter
  const filteredEvents = events.filter((event) => {
    const status = getEventStatus(event);
    const isPending = pendingEventIds.has(event.id);

    if (filter === "ALL") return true;
    if (filter === "PENDING") return isPending;
    if (filter === "UPCOMING") return status === "UPCOMING";
    if (filter === "LIVE") return status === "LIVE";
    if (filter === "COMPLETED") return status === "COMPLETED";

    return true;
  });

  const filterBtn = (key) =>
    `px-5 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-bold transform hover:scale-105 ${
      filter === key
        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/50"
        : "bg-white hover:bg-gray-50 text-gray-800 border-gray-200 hover:border-indigo-300"
    }`;

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8" ref={eventsContainerRef}>
          {/* Header Section */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">📋</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Events
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage all your created events
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Filters */}
          {events.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🔍</span>
                <h3 className="font-bold text-gray-800 text-lg">Filter Events</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className={filterBtn("ALL")} onClick={() => setFilter("ALL")}>
                  📊 All
                </button>
                <button
                  className={filterBtn("UPCOMING")}
                  onClick={() => setFilter("UPCOMING")}
                >
                  📅 Yet to Start
                </button>
                <button className={filterBtn("LIVE")} onClick={() => setFilter("LIVE")}>
                  🟢 Live
                </button>
                <button
                  className={filterBtn("PENDING")}
                  onClick={() => setFilter("PENDING")}
                >
                  ⏳ Pending
                </button>
                <button
                  className={filterBtn("COMPLETED")}
                  onClick={() => setFilter("COMPLETED")}
                >
                  ✅ Completed
                </button>
              </div>
            </div>
          )}

          {/* ✅ Empty state */}
          {events.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="text-7xl mb-4 animate-bounce">📅</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Created Yet</h3>
              <p className="text-gray-600 mt-2 mb-6 max-w-md mx-auto">
                Start creating events to bring volunteers together and make a difference!
              </p>
              <button
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-200"
                onClick={() => navigate("/create-event")}
              >
                ➕ Create Your First Event
              </button>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <div className="font-bold text-lg">No Events Found</div>
                <div className="text-sm text-blue-600">No events match the selected filter</div>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6 flex justify-between items-center bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  <span>All Events</span>
                </h3>
                <span className="text-sm text-gray-600 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-xl font-bold border border-indigo-200">
                  {filteredEvents.length} Event{filteredEvents.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event);
                  const isPending = pendingEventIds.has(event.id);

                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105 hover:-translate-y-1"
                    >
                      {/* Card Header */}
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white">
                        <h3 className="font-bold text-xl mb-2 line-clamp-1">{event.title}</h3>
                        <p className="text-sm opacity-95 flex items-center gap-1">
                          <span>📍</span>
                          <span className="truncate">{event.locationName}, {event.city}</span>
                        </p>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        {/* Category */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold text-blue-700 flex items-center gap-1">
                            <span>🏷️</span>
                            <span>{event.category}</span>
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-2 rounded-lg border border-purple-200">
                          <span className="font-semibold text-purple-700">📅 Start:</span>
                          <span className="text-gray-800 font-medium">{event.startDate}</span>
                        </div>

                        {/* Volunteers */}
                        <div className="flex items-center gap-2 text-sm bg-gradient-to-r from-green-50 to-green-100 px-3 py-2 rounded-lg border border-green-200">
                          <span className="font-semibold text-green-700">👥 Volunteers:</span>
                          <span className="text-gray-800 font-medium">{event.requiredVolunteers}</span>
                        </div>

                        {/* Status Badge */}
                        <div className="pt-2">
                          <span
                            className={`inline-block px-4 py-2 rounded-xl text-xs font-bold shadow-md ${statusBadge(
                              status,
                              isPending
                            )}`}
                          >
                            {statusText(status, isPending)}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer - Action Buttons */}
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex gap-2">
                        <button
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 text-sm font-bold transform hover:scale-105"
                          onClick={() => navigate(`/requests/${event.id}`)}
                        >
                          👥 Volunteers
                        </button>

                        <button
                          className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:shadow-red-500/50 transition-all duration-200 text-sm font-bold transform hover:scale-105"
                          onClick={() => handleDelete(event.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MyEvents;
