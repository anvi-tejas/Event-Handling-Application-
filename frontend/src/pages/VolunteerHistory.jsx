import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function VolunteerHistory() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(true);
  const [participations, setParticipations] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [feedbackForm, setFeedbackForm] = useState({});

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // ✅ Load events
  const loadEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/all`);
      if (!res.ok) return;

      const data = await res.json();
      const map = {};
      (Array.isArray(data) ? data : []).forEach((e) => {
        map[e.id] = e;
      });

      setEventsMap(map);
    } catch {}
  };

  // ✅ Load volunteer participations
  const loadMyParticipations = async () => {
    try {
      setLoading(true);
      if (!user?.email) return;

      const res = await fetch(
        `${API_BASE}/participations/volunteer/${user.email}`
      );
      if (!res.ok) return;

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

  // ✅ Check if event is completed
  const isCompletedEvent = (event) => {
    if (!event?.endDate) return false;
    return new Date() > new Date(event.endDate);
  };

  // ✅ Submit feedback
  const submitFeedback = async (id) => {
    const data = feedbackForm[id];
    if (!data?.rating) {
      alert("Please select a rating");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/participations/feedback/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rating: data.rating,
            feedback: data.feedback || "",
          }),
        }
      );

      if (!res.ok) throw new Error();
      alert("✅ Feedback submitted successfully");
      loadMyParticipations();
    } catch {
      alert("❌ Failed to submit feedback");
    }
  };

  // ✅ Badges
  const badge = (status) =>
    status === "APPROVED"
      ? "bg-green-600 text-white"
      : status === "REJECTED"
      ? "bg-red-600 text-white"
      : "bg-yellow-500 text-white";

  const attendanceBadge = (attended) =>
    attended === true
      ? "bg-green-600 text-white"
      : attended === false
      ? "bg-red-600 text-white"
      : "bg-gray-300 text-gray-700";

  const attendanceText = (attended) =>
    attended === true ? "Present" : attended === false ? "Absent" : "Not Marked";

  // ✅ Filter completed events
  const completedHistory = participations
    .filter((p) => isCompletedEvent(eventsMap[p.eventId]))
    .filter((p) => {
      const ev = eventsMap[p.eventId];
      const q = search.toLowerCase();
      const matchesSearch =
        (ev?.title || "").toLowerCase().includes(q) ||
        (ev?.category || "").toLowerCase().includes(q);

      return filter === "ALL" ? matchesSearch : matchesSearch && p.status === filter;
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
              <div className="p-3 bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🕒</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Volunteer History
                </h2>
                <p className="text-gray-600 mt-1">
                  Completed events & feedback
                </p>
              </div>
            </div>
          </div>

          {/* Search + Filter */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px]">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                  <input
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    placeholder="Search by title or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="min-w-[180px]">
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="ALL">📂 All Status</option>
                  <option value="APPROVED">✅ Approved</option>
                  <option value="REJECTED">❌ Rejected</option>
                  <option value="PENDING">⏳ Pending</option>
                </select>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-600"></div>
                <span className="font-semibold">Loading history...</span>
              </div>
            </div>
          ) : completedHistory.length === 0 ? (
            <div className="bg-linear-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-2xl shadow-md text-center">
              <div className="text-6xl mb-4">📜</div>
              <p className="text-lg font-semibold">No completed events</p>
              <p className="text-sm text-gray-500 mt-2">Your event history will appear here once events are completed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedHistory.map((p) => {
                const ev = eventsMap[p.eventId];
                return (
                  <div
                    key={p.id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-amber-200 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-xl text-gray-800 group-hover:text-amber-600 transition-colors">{ev?.title}</h3>
                        <span className={`px-3 py-1 text-xs rounded-full font-semibold ${badge(p.status)}`}>
                          {p.status}
                        </span>
                      </div>

                      <span className="text-xs bg-linear-to-r from-gray-100 to-gray-200 text-gray-700 px-3 py-1 rounded-full font-medium inline-block mb-3">
                        📁 {ev?.category}
                      </span>

                      <div className="bg-linear-to-r from-gray-50 to-slate-50 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-semibold text-gray-700">Attendance</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${attendanceBadge(p.attended)}`}>
                            {attendanceText(p.attended)}
                          </span>
                        </div>
                      </div>

                      {/* ⭐ Feedback Section */}
                      {p.status === "APPROVED" && p.rating == null && (
                        <div className="border-t border-gray-200 pt-4 space-y-3">
                          <p className="text-sm font-semibold text-gray-700 mb-2">📝 Share Your Feedback</p>
                          <select
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all bg-white"
                            value={feedbackForm[p.id]?.rating || ""}
                            onChange={(e) =>
                              setFeedbackForm((prev) => ({
                                ...prev,
                                [p.id]: {
                                  ...prev[p.id],
                                  rating: Number(e.target.value),
                                },
                              }))
                            }
                          >
                            <option value="">Select Rating</option>
                            <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                            <option value="4">⭐⭐⭐⭐ Good</option>
                            <option value="3">⭐⭐⭐ Average</option>
                            <option value="2">⭐⭐ Poor</option>
                            <option value="1">⭐ Very Bad</option>
                          </select>

                          <textarea
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                            placeholder="Write your feedback (optional)..."
                            value={feedbackForm[p.id]?.feedback || ""}
                            onChange={(e) =>
                              setFeedbackForm((prev) => ({
                                ...prev,
                                [p.id]: {
                                  ...prev[p.id],
                                  feedback: e.target.value,
                                },
                              }))
                            }
                          />

                          <button
                            className="w-full px-4 py-3 rounded-xl font-semibold bg-linear-to-r from-amber-500 to-orange-600 text-white hover:shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300"
                            onClick={() => submitFeedback(p.id)}
                          >
                            ✅ Submit Feedback
                          </button>
                        </div>
                      )}

                      {/* ✅ Show submitted feedback */}
                      {p.rating && (
                        <div className="mt-4 bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl">⭐</span>
                            <span className="font-semibold text-green-700">Rating: {p.rating}/5</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-xl">📝</span>
                            <p className="text-sm text-gray-700 leading-relaxed">{p.feedback || "No feedback provided"}</p>
                          </div>
                        </div>
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

export default VolunteerHistory;

