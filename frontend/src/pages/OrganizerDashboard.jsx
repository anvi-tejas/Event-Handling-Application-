import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import "./OrganizerDashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

function OrganizerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const loadStats = async () => {
    try {
      if (!user?.email) return;

      const eRes = await fetch(`${API_BASE}/events/organizer/${user.email}`);
      const eData = await eRes.json();
      const events = Array.isArray(eData) ? eData : [];

      let totalRequests = 0;
      let pendingRequests = 0;
      let approvedRequests = 0;

      await Promise.all(
        events.map(async (ev) => {
          try {
            const rRes = await fetch(`${API_BASE}/participations/event/${ev.id}`);
            if (!rRes.ok) return;

            const rData = await rRes.json();
            const list = Array.isArray(rData) ? rData : [];

            totalRequests += list.length;
            pendingRequests += list.filter((p) => p.status === "PENDING").length;
            approvedRequests += list.filter((p) => p.status === "APPROVED").length;
          } catch {}
        })
      );

      setStats({
        totalEvents: events.length,
        totalRequests,
        pendingRequests,
        approvedRequests,
      });
    } catch {}
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header Section */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🏠</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name}!
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your events and track volunteer engagement
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">📅</span>
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-gray-600 font-semibold text-sm mb-2">Total Events</h4>
                <p className="text-4xl font-extrabold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stats.totalEvents}</p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">📬</span>
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-gray-600 font-semibold text-sm mb-2">Total Requests</h4>
                <p className="text-4xl font-extrabold bg-linear-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalRequests}</p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-amber-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">⏳</span>
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-gray-600 font-semibold text-sm mb-2">Pending Requests</h4>
                <p className="text-4xl font-extrabold bg-linear-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">{stats.pendingRequests}</p>
              </div>
            </div>

            <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">✅</span>
                  <div className="p-2 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h4 className="text-gray-600 font-semibold text-sm mb-2">Approved Volunteers</h4>
                <p className="text-4xl font-extrabold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.approvedRequests}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Volunteer Requests Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span>
                Request Status Overview
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Approved", value: stats.approvedRequests, color: "#10b981" },
                        { name: "Pending", value: stats.pendingRequests, color: "#f59e0b" },
                        { name: "Rejected", value: Math.max(0, stats.totalRequests - stats.approvedRequests - stats.pendingRequests), color: "#ef4444" },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "Approved", value: stats.approvedRequests, color: "#10b981" },
                        { name: "Pending", value: stats.pendingRequests, color: "#f59e0b" },
                        { name: "Rejected", value: Math.max(0, stats.totalRequests - stats.approvedRequests - stats.pendingRequests), color: "#ef4444" },
                      ].filter(item => item.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance Bar Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📈</span>
                Event Performance
              </h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Events", value: stats.totalEvents, fill: "#6366f1" },
                      { name: "Requests", value: stats.totalRequests, fill: "#3b82f6" },
                      { name: "Approved", value: stats.approvedRequests, fill: "#10b981" },
                      { name: "Pending", value: stats.pendingRequests, fill: "#f59e0b" },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b" }} />
                    <YAxis tick={{ fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "12px",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {[
                        { name: "Events", value: stats.totalEvents, fill: "#6366f1" },
                        { name: "Requests", value: stats.totalRequests, fill: "#3b82f6" },
                        { name: "Approved", value: stats.approvedRequests, fill: "#10b981" },
                        { name: "Pending", value: stats.pendingRequests, fill: "#f59e0b" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span>⚡</span>
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                className="group relative p-6 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                onClick={() => navigate("/create-event")}
              >
                <div className="absolute inset-0 bg-linear-to-br from-indigo-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-3xl">➕</span>
                  <span>Create Event</span>
                </div>
              </button>

              <button
                className="group relative p-6 rounded-xl bg-linear-to-br from-blue-500 to-cyan-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                onClick={() => navigate("/my-events")}
              >
                <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-3xl">📋</span>
                  <span>My Events</span>
                </div>
              </button>

              <button
                className="group relative p-6 rounded-xl bg-linear-to-br from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                onClick={() => navigate("/attendance")}
              >
                <div className="absolute inset-0 bg-linear-to-br from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-3xl">✅</span>
                  <span>Attendance</span>
                </div>
              </button>

              <button
                className="group relative p-6 rounded-xl bg-linear-to-br from-purple-500 to-pink-600 text-white font-semibold shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
                onClick={() => navigate("/reports")}
              >
                <div className="absolute inset-0 bg-linear-to-br from-purple-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <span className="text-3xl">📊</span>
                  <span>Reports</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default OrganizerDashboard;

