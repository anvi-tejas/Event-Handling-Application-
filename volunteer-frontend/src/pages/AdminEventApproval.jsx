import { useEffect, useState } from "react";
import api, { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminEventApproval() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const loadPendingEvents = async () => {
    try {
      setLoading(true);
      // Fetch all events and filter pending ones
      const res = await fetch(`${API_BASE}/events/all`);
      const data = await res.json();
      const pending = (Array.isArray(data) ? data : []).filter(e => !e.status || e.status === "PENDING");
      setEvents(pending);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingEvents();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      setActionLoading(id);
      await api.put(`/events/admin/update-status/${id}?status=${status}`);
      setEvents(events.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to update event status");
    } finally {
      setActionLoading(null);
    }
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

        <div className="flex-1 p-4 md:p-8 bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl shadow-amber-500/30">
                <span className="text-4xl">⏳</span>
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                  Event Approval
                </h1>
                <p className="text-gray-600 text-lg">
                  Review pending event submissions
                </p>
              </div>
            </div>
          </div>

          {/* Stats Banner */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                  <span className="text-3xl">📝</span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">Pending for Review</p>
                  <p className="text-3xl font-black text-amber-600">{events.length}</p>
                </div>
              </div>
              <button
                onClick={loadPendingEvents}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-amber-500/40 transform hover:scale-105 transition-all duration-300"
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="bg-white border-2 border-amber-200 text-amber-800 px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold text-lg">Loading pending events...</span>
              </div>
            </div>
          ) : events.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-200">
              <div className="inline-block p-6 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mb-4">
                <span className="text-6xl">🎉</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up!</h3>
              <p className="text-gray-600">No pending events to review</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map(e => (
                <div
                  key={e.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-lg">📅</span>
                        <span className="text-white/90 text-sm font-medium">{e.category || "Event"}</span>
                      </div>
                      <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-bold animate-pulse">
                        ⏳ PENDING
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">{e.title}</h3>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-lg">👤</span>
                        <div>
                          <p className="text-xs text-gray-500">Organizer</p>
                          <p className="text-sm font-medium text-gray-800">{e.organizerEmail}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-lg">📍</span>
                        <div>
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-sm font-medium text-gray-800">{e.city || "Not specified"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <span className="text-lg">📆</span>
                        <div>
                          <p className="text-xs text-gray-500">Event Dates</p>
                          <p className="text-sm font-medium text-gray-800">{e.startDate} → {e.endDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminEventApproval;
