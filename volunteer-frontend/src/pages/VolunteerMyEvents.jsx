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
              <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                <span className="text-3xl">📌</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  My Events
                </h2>
                <p className="text-gray-600 mt-1">
                  Track your join requests and approval status
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Search + Filter */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[250px]">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                    <input
                      type="text"
                      placeholder="Search by title or category..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  onClick={loadMyParticipations}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  🔄 Refresh
                </button>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔍</span>
                <h3 className="font-bold text-gray-800 text-lg">Filter by Status</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setFilter("ALL")}
                  className={`px-5 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-bold transform hover:scale-105 ${
                    filter === "ALL"
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/50"
                      : "!bg-white hover:!bg-indigo-50 !text-gray-900 !border-indigo-300"
                  }`}
                >
                  📂 All
                </button>
                <button
                  onClick={() => setFilter("PENDING")}
                  className={`px-5 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-bold transform hover:scale-105 ${
                    filter === "PENDING"
                      ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-transparent shadow-lg shadow-yellow-500/50"
                      : "!bg-white hover:!bg-yellow-50 !text-gray-900 !border-yellow-300"
                  }`}
                >
                  ⏳ Pending
                </button>
                <button
                  onClick={() => setFilter("APPROVED")}
                  className={`px-5 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-bold transform hover:scale-105 ${
                    filter === "APPROVED"
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white border-transparent shadow-lg shadow-green-500/50"
                      : "!bg-white hover:!bg-green-50 !text-gray-900 !border-green-300"
                  }`}
                >
                  ✅ Approved
                </button>
                <button
                  onClick={() => setFilter("REJECTED")}
                  className={`px-5 py-2.5 rounded-xl border-2 transition-all duration-200 text-sm font-bold transform hover:scale-105 ${
                    filter === "REJECTED"
                      ? "bg-gradient-to-r from-red-500 to-rose-600 text-white border-transparent shadow-lg shadow-red-500/50"
                      : "!bg-white hover:!bg-red-50 !text-gray-900 !border-red-300"
                  }`}
                >
                  ❌ Rejected
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Content */}
          {loading ? (
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="font-semibold">Loading your events...</span>
              </div>
            </div>
          ) : filteredList.length === 0 ? (
            <div className="bg-linear-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-2xl shadow-md text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold">No events found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or join some events!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((p) => {
                const ev = eventsMap[p.eventId];
                const status = p.status || "PENDING";

                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                            {ev?.title || `Event ID: ${p.eventId}`}
                          </h3>
                          <span className="text-xs bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium inline-block">
                            📁 {ev?.category || "Category"}
                          </span>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge(status)}`}>
                          {status}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {ev?.description || "Event details not found."}
                      </p>

                      <div className="bg-linear-to-r from-gray-50 to-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📅</span>
                          <span><b>Start:</b> {ev?.startDate || "-"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">📍</span>
                          <span><b>Location:</b> {ev?.locationName || "-"}, {ev?.city || "-"}</span>
                        </div>
                      </div>

                      {/* ✅ Cancel Only Pending */}
                      {status === "PENDING" ? (
                        <button
                          className="w-full px-4 py-3 rounded-xl font-semibold border-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white transform hover:scale-105 transition-all duration-300"
                          onClick={() => handleCancel(p.eventId)}
                        >
                          ❌ Cancel Request
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full px-4 py-3 rounded-xl font-semibold bg-linear-to-r from-gray-100 to-gray-200 text-gray-500 cursor-not-allowed"
                        >
                          {status === "APPROVED"
                            ? "✅ You are approved"
                            : "❌ Request rejected"}
                        </button>
                      )}
                    </div>
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

