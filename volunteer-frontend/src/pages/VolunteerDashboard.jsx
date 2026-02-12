import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import ChatBot from "../components/ChatBot";
import { API_BASE } from "../config";
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
  ResponsiveContainer,
} from "recharts";

function VolunteerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEvents: 0,
    approvedEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
  });
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const cardsRef = useRef(null);

  // ✅ Fetch Stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.email) return;
      
      try {
        // Fetch participations for this volunteer
        const pRes = await fetch(`${API_BASE}/participations/volunteer/${user.email}`);
        if (pRes.ok) {
          const participations = await pRes.json();
          const pList = Array.isArray(participations) ? participations : [];
          
          const approvedCount = pList.filter(p => p.status === "APPROVED").length;
          const pendingCount = pList.filter(p => p.status === "PENDING").length;
          
          // Fetch events to check for completed ones
          const eRes = await fetch(`${API_BASE}/events/all`);
          let completedCount = 0;
          
          if (eRes.ok) {
            const events = await eRes.json();
            const eventMap = {};
            (Array.isArray(events) ? events : []).forEach(e => {
              eventMap[e.id] = e;
            });
            
            // Count completed events (approved + event has ended)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            pList.forEach(p => {
              if (p.status === "APPROVED" && eventMap[p.eventId]) {
                const endDate = new Date(eventMap[p.eventId].endDate);
                endDate.setHours(0, 0, 0, 0);
                if (today > endDate) {
                  completedCount++;
                }
              }
            });
          }
          
          setStats({
            totalEvents: pList.length,
            approvedEvents: approvedCount,
            pendingEvents: pendingCount,
            completedEvents: completedCount,
          });
        }
      } catch (err) {
        console.log("Failed to fetch stats:", err);
      }
    };
    
    fetchStats();
  }, [user?.email]);

  // ✅ GSAP Animation
  useEffect(() => {
    if (!cardsRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.querySelectorAll(".dash-card"), {
        duration: 0.55,
        opacity: 0,
        y: 25,
        stagger: 0.12,
        ease: "power2.out",
      });
    }, cardsRef);

    return () => ctx.revert();
  }, []);

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
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <span className="text-3xl">👋</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Welcome, {user?.name || "Volunteer"}!
                </h2>
                <p className="text-gray-600 mt-1">
                  Explore events, join opportunities & track your participation
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => navigate("/volunteer-my-events")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Applied</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalEvents}</p>
                </div>
                <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
              <div className="mt-3 flex items-center text-indigo-600 text-sm">
                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
                Click to view
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => navigate("/volunteer-my-events")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedEvents}</p>
                </div>
                <div className="p-3 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalEvents > 0 ? (stats.approvedEvents / stats.totalEvents) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => navigate("/volunteer-my-events")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pendingEvents}</p>
                </div>
                <div className="p-3 bg-linear-to-br from-yellow-500 to-amber-600 rounded-xl">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-linear-to-r from-yellow-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${stats.totalEvents > 0 ? (stats.pendingEvents / stats.totalEvents) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={() => navigate("/volunteer-history")}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Completed</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.completedEvents}</p>
                </div>
                <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-600 rounded-xl">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <div className="mt-3 flex items-center text-blue-600 text-sm">
                <span>🎉</span>
                <span className="ml-1">Great progress!</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Participation Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span>
                Your Participation Overview
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Approved", value: stats.approvedEvents, color: "#10b981" },
                        { name: "Pending", value: stats.pendingEvents, color: "#f59e0b" },
                        { name: "Completed", value: stats.completedEvents, color: "#3b82f6" },
                      ].filter(item => item.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: "Approved", value: stats.approvedEvents, color: "#10b981" },
                        { name: "Pending", value: stats.pendingEvents, color: "#f59e0b" },
                        { name: "Completed", value: stats.completedEvents, color: "#3b82f6" },
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
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Bar Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📈</span>
                Activity Summary
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Applied", value: stats.totalEvents, fill: "#6366f1" },
                      { name: "Approved", value: stats.approvedEvents, fill: "#10b981" },
                      { name: "Pending", value: stats.pendingEvents, fill: "#f59e0b" },
                      { name: "Completed", value: stats.completedEvents, fill: "#3b82f6" },
                    ]}
                    margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
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
                        { name: "Applied", value: stats.totalEvents, fill: "#6366f1" },
                        { name: "Approved", value: stats.approvedEvents, fill: "#10b981" },
                        { name: "Pending", value: stats.pendingEvents, fill: "#f59e0b" },
                        { name: "Completed", value: stats.completedEvents, fill: "#3b82f6" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Motivational Banner */}
          <div className="bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">🌟 Keep Making a Difference!</h3>
                <p className="text-white/90">
                  Every hour you volunteer creates lasting impact in your community. 
                  You've participated in <span className="font-bold text-yellow-300">{stats.completedEvents}</span> events so far!
                </p>
              </div>
              <div className="hidden md:block text-6xl animate-bounce">
                🎯
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            ref={cardsRef}
          >
            {/* Available Events */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  🌍
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Available Events</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Browse & join volunteer events
                </p>
                <button
                  onClick={() => navigate("/available-events")}
                  className="w-full py-2.5 px-4 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Explore →
                </button>
              </div>
            </div>

            {/* My Events */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-linear-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  📌
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">My Events</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Track your joined events
                </p>
                <button
                  onClick={() => navigate("/volunteer-my-events")}
                  className="w-full py-2.5 px-4 bg-linear-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  View →
                </button>
              </div>
            </div>

            {/* History */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-amber-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-linear-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  🕒
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">History</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  View past participation
                </p>
                <button
                  onClick={() => navigate("/volunteer-history")}
                  className="w-full py-2.5 px-4 bg-linear-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  View →
                </button>
              </div>
            </div>

            {/* Profile */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  👤
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Profile / Settings</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Update your details
                </p>
                <button
                  onClick={() => navigate("/volunteer-profile")}
                  className="w-full py-2.5 px-4 bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Open →
                </button>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <span>💡</span>
              Volunteer Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-linear-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="text-2xl mb-2">🎯</div>
                <h4 className="font-semibold text-gray-800 mb-1">Be Proactive</h4>
                <p className="text-sm text-gray-600">Apply early to events that match your skills and interests.</p>
              </div>
              <div className="p-4 bg-linear-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                <div className="text-2xl mb-2">⏰</div>
                <h4 className="font-semibold text-gray-800 mb-1">Be Punctual</h4>
                <p className="text-sm text-gray-600">Arrive on time and complete your committed hours.</p>
              </div>
              <div className="p-4 bg-linear-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <div className="text-2xl mb-2">🤝</div>
                <h4 className="font-semibold text-gray-800 mb-1">Network</h4>
                <p className="text-sm text-gray-600">Connect with organizers and fellow volunteers.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ChatBot />
    </>
  );
}

export default VolunteerDashboard;

