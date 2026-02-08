import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    users: 0,
    totalEvents: 0,
    pendingEvents: 0,
    complaints: 0,
    pendingUsers: 0,
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      // 1️⃣ Users
      const uRes = await fetch(`${API_BASE}/admin/users/all`);
      const users = await uRes.json();
      const usersList = Array.isArray(users) ? users : [];
      const pendingUsers = usersList.filter(u => u.verified === false).length;

      // 2️⃣ Events
      const eRes = await fetch(`${API_BASE}/admin/events/all`);
      const events = await eRes.json();
      const eventsList = Array.isArray(events) ? events : [];

      const pendingEvents = eventsList.filter(
        (e) => e.status === "PENDING"
      ).length;

      // 3️⃣ Complaints
      const cRes = await fetch(`${API_BASE}/admin/complaints/all`);
      const complaints = await cRes.json();
      const complaintsList = Array.isArray(complaints) ? complaints : [];

      const openComplaints = complaintsList.filter(
        (c) => c.status === "OPEN"
      ).length;

      // Build recent activity
      const activities = [];
      eventsList.slice(0, 3).forEach(e => {
        activities.push({
          type: 'event',
          title: e.title,
          status: e.status,
          time: e.startDate
        });
      });
      complaintsList.slice(0, 2).forEach(c => {
        activities.push({
          type: 'complaint',
          title: c.subject,
          status: c.status,
          time: 'Recent'
        });
      });
      setRecentActivity(activities);

      setStats({
        users: usersList.length || 0,
        totalEvents: eventsList.length || 0,
        pendingEvents,
        complaints: openComplaints,
        pendingUsers,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const quickActions = [
    { label: "Approve Events", icon: "✅", path: "/admin/manage-events", color: "from-green-500 to-emerald-600" },
    { label: "Verify Users", icon: "👤", path: "/admin/user-verification", color: "from-blue-500 to-indigo-600" },
    { label: "View Complaints", icon: "🚨", path: "/admin/complaints", color: "from-red-500 to-pink-600" },
    { label: "All Users", icon: "👥", path: "/admin/users", color: "from-purple-500 to-violet-600" },
  ];

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
              <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl shadow-indigo-500/30">
                <span className="text-4xl">🛡️</span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Admin Dashboard
                </h2>
                <p className="text-gray-600 text-lg">
                  System overview & monitoring center
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="bg-white border-2 border-indigo-200 text-indigo-800 px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold text-lg">Loading dashboard...</span>
              </div>
            </div>
          ) : (
            <>
              {/* ===== PREMIUM STATS CARDS ===== */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Users Card */}
                <div 
                  onClick={() => navigate('/admin/users')}
                  className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-indigo-400 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-full -ml-10 -mb-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                        <span className="text-3xl">👥</span>
                      </div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">USERS</span>
                    </div>
                    <h3 className="text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                      {stats.users}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Total registered users</p>
                    <div className="mt-3 flex items-center text-indigo-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View all</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>

                {/* Events Card */}
                <div 
                  onClick={() => navigate('/admin/manage-events')}
                  className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-400 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-blue-500/10 to-cyan-500/10 rounded-full -ml-10 -mb-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                        <span className="text-3xl">📅</span>
                      </div>
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">EVENTS</span>
                    </div>
                    <h3 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                      {stats.totalEvents}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Total events created</p>
                    <div className="mt-3 flex items-center text-blue-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Manage</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>

                {/* Pending Approvals Card */}
                <div 
                  onClick={() => navigate('/admin/manage-events')}
                  className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-amber-400 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-500/10 to-orange-500/10 rounded-full -ml-10 -mb-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                        <span className="text-3xl">⏳</span>
                      </div>
                      {stats.pendingEvents > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full animate-pulse">
                          <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                          ACTION
                        </span>
                      )}
                    </div>
                    <h3 className="text-5xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                      {stats.pendingEvents}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Pending approvals</p>
                    <div className="mt-3 flex items-center text-amber-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Review now</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>

                {/* Complaints Card */}
                <div 
                  onClick={() => navigate('/admin/complaints')}
                  className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-red-400 overflow-hidden cursor-pointer transform hover:-translate-y-2"
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-red-500/10 to-pink-500/10 rounded-full -ml-10 -mb-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
                        <span className="text-3xl">🚨</span>
                      </div>
                      {stats.complaints > 0 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full animate-pulse">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          URGENT
                        </span>
                      )}
                    </div>
                    <h3 className="text-5xl font-black bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
                      {stats.complaints}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">Open complaints</p>
                    <div className="mt-3 flex items-center text-red-600 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Resolve</span>
                      <span className="ml-2">→</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== QUICK ACTIONS ===== */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl">⚡</span>
                  <h4 className="text-xl font-bold text-gray-800">Quick Actions</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(action.path)}
                      className={`group flex flex-col items-center gap-3 p-6 bg-gradient-to-br ${action.color} rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform">{action.icon}</span>
                      <span className="font-semibold text-sm text-center">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== TWO COLUMN LAYOUT ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">📊</span>
                    <h4 className="text-xl font-bold text-gray-800">Recent Activity</h4>
                  </div>
                  <div className="space-y-4">
                    {recentActivity.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No recent activity</p>
                    ) : (
                      recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className={`p-3 rounded-xl ${
                            activity.type === 'event' 
                              ? 'bg-gradient-to-br from-blue-100 to-indigo-100' 
                              : 'bg-gradient-to-br from-red-100 to-pink-100'
                          }`}>
                            <span className="text-xl">{activity.type === 'event' ? '📅' : '🚨'}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.type === 'event' ? 'Event' : 'Complaint'}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            activity.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                            activity.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            activity.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {activity.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Admin Responsibilities */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-2xl">🔍</span>
                    <h4 className="text-xl font-bold text-gray-800">Admin Responsibilities</h4>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <span className="text-2xl">✅</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 mb-1">Event Management</h5>
                        <p className="text-sm text-gray-600">Approve or reject event submissions from organizers</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 mb-1">User Verification</h5>
                        <p className="text-sm text-gray-600">Verify organizer accounts and documents</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100 hover:shadow-md transition-shadow">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <span className="text-2xl">🛠️</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 mb-1">Resolve Complaints</h5>
                        <p className="text-sm text-gray-600">Address user issues and platform concerns</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:shadow-md transition-shadow">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <span className="text-2xl">🔒</span>
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-800 mb-1">System Integrity</h5>
                        <p className="text-sm text-gray-600">Maintain platform security and quality standards</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
