import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function Reports() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD DATA =================

  const loadReports = async () => {
    try {
      setLoading(true);

      // 1️⃣ Get organizer events
      const eRes = await fetch(
        `${API_BASE}/events/organizer/${user.email}`
      );
      const eventsData = await eRes.json();
      const eventsList = Array.isArray(eventsData) ? eventsData : [];

      setEvents(eventsList);

      const reportData = [];

      // 2️⃣ For each event → get participations
      for (const event of eventsList) {
        const pRes = await fetch(
          `${API_BASE}/participations/event/${event.id}`
        );
        const pData = await pRes.json();
        const list = Array.isArray(pData) ? pData : [];

        // only approved + rated
        const rated = list.filter(
          (p) => p.status === "APPROVED" && p.rating
        );

        const totalFeedbacks = rated.length;

        const avgRating =
          totalFeedbacks === 0
            ? 0
            : (
                rated.reduce((sum, r) => sum + r.rating, 0) /
                totalFeedbacks
              ).toFixed(1);

        const positive = rated.filter((r) => r.rating >= 4).length;
        const neutral = rated.filter((r) => r.rating === 3).length;
        const negative = rated.filter((r) => r.rating <= 2).length;

        reportData.push({
          event,
          totalFeedbacks,
          avgRating,
          positive,
          neutral,
          negative,
        });
      }

      setReports(reportData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) loadReports();
  }, []);

  // ================= UI =================

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="grow p-4">
          <h2 className="text-2xl font-bold mb-1">📊 Organizer Reports</h2>
          <p className="text-gray-500 mb-4">
            Event-wise volunteer feedback & ratings
          </p>

          {loading ? (
            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded">
              No reports available yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {reports.map((r) => (
                <div
                  key={r.event.id}
                  className="bg-white rounded-2xl shadow p-4 border hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">
                        {r.event.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {r.event.category}
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-sm font-semibold">
                      ⭐ {r.avgRating}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      👥 <b>Total Feedbacks:</b> {r.totalFeedbacks}
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg text-green-700">
                      👍 <b>Positive:</b> {r.positive}
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg text-yellow-700">
                      😐 <b>Neutral:</b> {r.neutral}
                    </div>

                    <div className="bg-red-50 p-3 rounded-lg text-red-700">
                      👎 <b>Negative:</b> {r.negative}
                    </div>
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    📅 {r.event.startDate} → {r.event.endDate}
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

export default Reports;
