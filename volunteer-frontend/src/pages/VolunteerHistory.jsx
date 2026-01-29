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

      <div className="flex">
        <Sidebar
          role="VOLUNTEER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="grow p-4">
          <h2 className="text-2xl font-bold mb-1">🕒 Volunteer History</h2>
          <p className="text-gray-500 mb-4">
            Completed events & feedback
          </p>

          {/* Search + Filter */}
          <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-3">
            <input
              className="flex-1 px-3 py-2 border rounded"
              placeholder="Search by title or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="px-3 py-2 border rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-blue-600">Loading history...</div>
          ) : completedHistory.length === 0 ? (
            <div className="text-gray-600">No completed events.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedHistory.map((p) => {
                const ev = eventsMap[p.eventId];
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-xl shadow p-4"
                  >
                    <div className="flex justify-between mb-2">
                      <h3 className="font-bold">{ev?.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded ${badge(p.status)}`}>
                        {p.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {ev?.category}
                    </p>

                    <div className="flex justify-between text-sm mb-3">
                      <span>Attendance</span>
                      <span className={`px-2 py-1 rounded text-xs ${attendanceBadge(p.attended)}`}>
                        {attendanceText(p.attended)}
                      </span>
                    </div>

                    {/* ⭐ Feedback Section */}
                    {p.status === "APPROVED" && p.rating == null && (
                      <div className="border-t pt-3">
                        <select
                          className="w-full mb-2 px-3 py-2 border rounded"
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
                          rows="2"
                          className="w-full px-3 py-2 border rounded mb-2"
                          placeholder="Write feedback (optional)"
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
                          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
                          onClick={() => submitFeedback(p.id)}
                        >
                          Submit Feedback
                        </button>
                      </div>
                    )}

                    {/* ✅ Show submitted feedback */}
                    {p.rating && (
                      <div className="mt-3 text-sm text-gray-700">
                        ⭐ Rating: {p.rating}/5 <br />
                        📝 {p.feedback || "No feedback"}
                      </div>
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

export default VolunteerHistory;
