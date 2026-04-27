import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api, { API_BASE } from "../config";

function AdminEvents() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  // ✅ Load all events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/events/all`);
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      console.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // ✅ Update event status (Admin only)
  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await api.put(`/events/admin/update-status/${id}?status=${status}`);
      loadEvents();
    } catch (err) {
      console.error(err);
      alert("Error updating event status");
    } finally {
      setActionLoading(null);
    }
  };

  // ================= FILTER & SEARCH =================
  const filteredEvents = events.filter(e => {
    const matchesFilter = filter === "ALL" || (e.status || "PENDING") === filter;
    const matchesSearch = e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.organizerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    ALL: events.length,
    PENDING: events.filter(e => !e.status || e.status === "PENDING").length,
    APPROVED: events.filter(e => e.status === "APPROVED").length,
    REJECTED: events.filter(e => e.status === "REJECTED").length,
  };

  const statusIcon = (status) => {
    if (status === "APPROVED") return "✅";
    if (status === "REJECTED") return "❌";
    return "⏳";
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          role="ADMIN"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-4 md:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/30">
                <span className="text-4xl">📋</span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Manage Events
                </h2>
                <p className="text-gray-600 text-lg">
                  Review and approve organizer events
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "All Events", value: statusCounts.ALL, filter: "ALL", color: "from-slate-500 to-gray-600", icon: "📊" },
              { label: "Pending", value: statusCounts.PENDING, filter: "PENDING", color: "from-amber-500 to-orange-600", icon: "⏳" },
              { label: "Approved", value: statusCounts.APPROVED, filter: "APPROVED", color: "from-green-500 to-emerald-600", icon: "✅" },
              { label: "Rejected", value: statusCounts.REJECTED, filter: "REJECTED", color: "from-red-500 to-pink-600", icon: "❌" },
            ].map((stat, idx) => (
              <button
                key={idx}
                onClick={() => setFilter(stat.filter)}
                className={`relative overflow-hidden p-4 rounded-2xl transition-all duration-300 ${
                  filter === stat.filter
                    ? `bg-gradient-to-br ${stat.color} text-white shadow-xl transform scale-105`
                    : "bg-white text-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className={`text-xs font-semibold ${filter === stat.filter ? 'text-white/80' : 'text-gray-500'}`}>
                      {stat.label}
                    </p>
                    <p className="text-3xl font-black mt-1">{stat.value}</p>
                  </div>
                  <span className="text-3xl opacity-80">{stat.icon}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, organizer, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-300 text-lg"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="bg-white border-2 border-indigo-200 text-indigo-800 px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold text-lg">Loading events...</span>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-200">
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full mb-4">
                <span className="text-6xl">📭</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Events Found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "No events match the selected filter"}
              </p>
            </div>
          ) : (
            <>
              {/* Event Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((e) => (
                  <div
                    key={e.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-1"
                  >
                    {/* Card Header */}
                    <div className={`p-4 bg-gradient-to-r ${
                      (e.status || "PENDING") === "APPROVED" ? "from-green-500 to-emerald-600" :
                      (e.status || "PENDING") === "REJECTED" ? "from-red-500 to-pink-600" :
                      "from-amber-500 to-orange-600"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-white/80 text-sm font-medium">{e.category || "General"}</span>
                        <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold">
                          {statusIcon(e.status || "PENDING")} {e.status || "PENDING"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">{e.title}</h3>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="text-lg">👤</span>
                          <span className="text-sm truncate">{e.organizerEmail}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <span className="text-lg">📅</span>
                          <span className="text-sm">{e.startDate} → {e.endDate}</span>
                        </div>
                        {e.city && (
                          <div className="flex items-center gap-3 text-gray-600">
                            <span className="text-lg">📍</span>
                            <span className="text-sm">{e.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {(e.status === "PENDING" || !e.status) ? (
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => updateStatus(e.id, "APPROVED")}
                            disabled={actionLoading === e.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg hover:shadow-green-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === e.id ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <span>✅</span>
                                <span>Approve</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => updateStatus(e.id, "REJECTED")}
                            disabled={actionLoading === e.id}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-red-500/40 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading === e.id ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <>
                                <span>❌</span>
                                <span>Reject</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className="pt-4 border-t border-gray-200">
                          <div className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold ${
                            e.status === "APPROVED" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-red-100 text-red-700"
                          }`}>
                            <span>{statusIcon(e.status)}</span>
                            <span>{e.status === "APPROVED" ? "Event Approved" : "Event Rejected"}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Results Summary */}
              <div className="mt-8 text-center">
                <p className="text-gray-500">
                  Showing <span className="font-bold text-indigo-600">{filteredEvents.length}</span> of{" "}
                  <span className="font-bold">{events.length}</span> events
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminEvents;
