import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function VolunteerMyEvents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState([]);
  const [eventsMap, setEventsMap] = useState({}); // eventId -> event
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL"); // ALL/PENDING/APPROVED/REJECTED

  // ✅ Load All events (for event info)
  const loadEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/all`);
      if (!res.ok) return;

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      const map = {};
      list.forEach((ev) => {
        map[ev.id] = ev;
      });

      setEventsMap(map);
    } catch {}
  };

  // ✅ Load participations of logged-in volunteer
  const loadMyParticipations = async () => {
    try {
      setLoading(true);

      if (!user?.email) {
        setParticipations([]);
        return;
      }

      const res = await fetch(`${API_BASE}/participations/volunteer/${user.email}`);
      if (!res.ok) {
        setParticipations([]);
        return;
      }

      const data = await res.json();
      setParticipations(Array.isArray(data) ? data : []);
    } catch {
      setParticipations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    loadMyParticipations();
  }, []);

  // ✅ Cancel only PENDING
  const handleCancel = async (eventId) => {
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

      // ✅ refresh
      loadMyParticipations();
    } catch {
      alert("Failed to cancel request");
    }
  };

  // ✅ Badge colors
  const badge = (status) => {
    if (status === "APPROVED") return "bg-green-600 text-white";
    if (status === "REJECTED") return "bg-red-600 text-white";
    return "bg-yellow-500 text-white";
  };

  // ✅ Filter + Search
  const filteredList = participations.filter((p) => {
    const ev = eventsMap[p.eventId];
    const title = (ev?.title || "").toLowerCase();
    const cat = (ev?.category || "").toLowerCase();

    const q = search.toLowerCase();

    const matchesSearch = title.includes(q) || cat.includes(q);

    const matchesFilter =
      filter === "ALL" ? true : (p.status || "PENDING") === filter;

    return matchesSearch && matchesFilter;
  });

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
            <h2 className="text-2xl font-bold">📌 My Events</h2>
            <p className="text-gray-500">
              Track your join requests and approval status.
            </p>
          </div>

          {/* ✅ Search + Filter */}
          <div className="bg-white shadow rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="🔍 Search by title or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <button
                onClick={loadMyParticipations}
                className="px-4 py-2 rounded-lg bg-black text-white font-semibold hover:opacity-90 transition"
              >
                🔄 Refresh
              </button>
            </div>
          </div>

          {/* ✅ Content */}
          {loading ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
              Loading your events...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-lg">
              No events found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredList.map((p) => {
                const ev = eventsMap[p.eventId];
                const status = p.status || "PENDING";

                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl shadow p-4 border border-gray-100 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">
                          {ev?.title || `Event ID: ${p.eventId}`}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {ev?.category || "Category"}
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${badge(status)}`}>
                        {status}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {ev?.description || "Event details not found."}
                    </p>

                    <div className="text-sm text-gray-500 space-y-1">
                      <div>
                        📅 <b>Start:</b> {ev?.startDate || "-"}
                      </div>
                      <div>
                        📍 <b>Location:</b> {ev?.locationName || "-"}, {ev?.city || "-"}
                      </div>
                    </div>

                    {/* ✅ Cancel Only Pending */}
                    {status === "PENDING" ? (
                      <button
                        className="w-full mt-4 px-4 py-2 rounded-lg font-semibold border border-red-500 text-red-600 hover:bg-red-600 hover:text-white transition"
                        onClick={() => handleCancel(p.eventId)}
                      >
                        ❌ Cancel Request
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full mt-4 px-4 py-2 rounded-lg font-semibold bg-gray-200 text-gray-500 cursor-not-allowed"
                      >
                        {status === "APPROVED"
                          ? "✅ You are approved"
                          : "❌ Request rejected"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default VolunteerMyEvents;
