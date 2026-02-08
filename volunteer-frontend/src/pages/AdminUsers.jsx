import { useEffect, useState } from "react";
import api, { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Try axios first, fallback to fetch
      try {
        const res = await api.get("/admin/users/all");
        const data = Array.isArray(res.data) ? res.data : [];
        setUsers(data);
      } catch {
        const res = await fetch(`${API_BASE}/admin/users/all`);
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    // Filter by role
    if (roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  }, [users, roleFilter, searchTerm]);

  const deleteUser = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setActionLoading(email);
      try {
        await api.delete(`/users/delete?email=${email}`);
      } catch {
        await fetch(`${API_BASE}/users/delete?email=${email}`, {
          method: "DELETE"
        });
      }
      setUsers(users.filter(u => u.email !== email));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setActionLoading(null);
    }
  };

  const roleCounts = {
    ALL: users.length,
    ADMIN: users.filter(u => u.role === "ADMIN").length,
    ORGANIZER: users.filter(u => u.role === "ORGANIZER").length,
    VOLUNTEER: users.filter(u => u.role === "VOLUNTEER").length,
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30";
      case "ORGANIZER":
        return "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30";
      case "VOLUNTEER":
        return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600 text-white";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "ADMIN": return "👑";
      case "ORGANIZER": return "📋";
      case "VOLUNTEER": return "🌟";
      default: return "👤";
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

        <div className="flex-1 p-4 md:p-8 bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl shadow-purple-500/30">
                <span className="text-4xl">👥</span>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  All Users
                </h2>
                <p className="text-gray-600 text-lg">
                  Manage all platform users
                </p>
              </div>
            </div>
          </div>

          {/* Role Filter Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "All Users", value: roleCounts.ALL, filter: "ALL", color: "from-slate-500 to-gray-600", icon: "👥" },
              { label: "Admins", value: roleCounts.ADMIN, filter: "ADMIN", color: "from-purple-500 to-violet-600", icon: "👑" },
              { label: "Organizers", value: roleCounts.ORGANIZER, filter: "ORGANIZER", color: "from-blue-500 to-indigo-600", icon: "📋" },
              { label: "Volunteers", value: roleCounts.VOLUNTEER, filter: "VOLUNTEER", color: "from-green-500 to-emerald-600", icon: "🌟" },
            ].map((stat, idx) => (
              <button
                key={idx}
                onClick={() => setRoleFilter(stat.filter)}
                className={`relative overflow-hidden p-4 rounded-2xl transition-all duration-300 ${
                  roleFilter === stat.filter
                    ? `bg-gradient-to-br ${stat.color} text-white shadow-xl transform scale-105`
                    : "bg-white text-gray-800 shadow-lg hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className={`text-xs font-semibold ${roleFilter === stat.filter ? 'text-white/80' : 'text-gray-500'}`}>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-white border-2 border-gray-200 rounded-2xl shadow-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 text-lg"
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[300px]">
              <div className="bg-white border-2 border-purple-200 text-purple-800 px-8 py-6 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold text-lg">Loading users...</span>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-200">
              <div className="inline-block p-6 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full mb-4">
                <span className="text-6xl">📭</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Users Found</h3>
              <p className="text-gray-600">
                {searchTerm ? "Try adjusting your search terms" : "No users match the selected filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map(u => (
                <div
                  key={u.id || u.email}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Card Header */}
                  <div className={`p-4 bg-gradient-to-r ${
                    u.role === "ADMIN" ? "from-purple-500 to-violet-600" :
                    u.role === "ORGANIZER" ? "from-blue-500 to-indigo-600" :
                    "from-green-500 to-emerald-600"
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-white/90 text-sm font-medium flex items-center gap-2">
                        <span>{getRoleIcon(u.role)}</span>
                        {u.role || "USER"}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.verified 
                          ? "bg-white/20 text-white" 
                          : "bg-amber-400 text-amber-900"
                      }`}>
                        {u.verified ? "✅ Verified" : "⏳ Pending"}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {/* Avatar & Name */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white ${
                        u.role === "ADMIN" ? "bg-gradient-to-br from-purple-400 to-violet-500" :
                        u.role === "ORGANIZER" ? "bg-gradient-to-br from-blue-400 to-indigo-500" :
                        "bg-gradient-to-br from-green-400 to-emerald-500"
                      }`}>
                        {u.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xl font-bold text-gray-800 truncate">{u.name || "Unknown"}</h3>
                        <p className="text-sm text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {u.phone && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                          <span className="text-lg">📱</span>
                          <span className="text-sm text-gray-700">{u.phone}</span>
                        </div>
                      )}
                      {u.city && (
                        <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                          <span className="text-lg">📍</span>
                          <span className="text-sm text-gray-700">{u.city}</span>
                        </div>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${getRoleBadge(u.role)}`}>
                          {u.role || "USER"}
                        </span>
                      </div>
                      {u.role !== "ADMIN" && (
                        <button
                          onClick={() => deleteUser(u.email)}
                          disabled={actionLoading === u.email}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors disabled:opacity-50"
                        >
                          {actionLoading === u.email ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              <span>🗑️</span>
                              <span>Delete</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results Summary */}
          {!loading && filteredUsers.length > 0 && (
            <div className="mt-8 text-center">
              <p className="text-gray-500">
                Showing <span className="font-bold text-purple-600">{filteredUsers.length}</span> of{" "}
                <span className="font-bold">{users.length}</span> users
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminUsers;
