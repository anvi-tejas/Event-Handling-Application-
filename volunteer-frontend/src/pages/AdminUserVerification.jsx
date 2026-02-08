import { useEffect, useState } from "react";
import api, { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminUserVerification() {
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("PENDING");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Document modal
  const [showModal, setShowModal] = useState(false);
  const [docUrl, setDocUrl] = useState(null);
  const [docName, setDocName] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // ================= LOAD USERS =================
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/users/all");
      setAllUsers(res.data || []);
    } catch {
      const res = await fetch(`${API_BASE}/admin/users/all`);
      const data = await res.json();
      setAllUsers(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ================= FILTER USERS =================
  useEffect(() => {
    let filtered = [...allUsers];

    if (filter !== "ALL") {
      filtered = filtered.filter(u => u.verificationStatus === filter);
    }

    if (roleFilter !== "ALL") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setUsers(filtered);
  }, [allUsers, filter, roleFilter, searchTerm]);

  // ================= ACTIONS =================
  const verifyUser = async (user) => {
    try {
      setActionLoading(user.id);
      await api.put(`/admin/users/verify/${user.id}`);
      await loadUsers();
      alert(`✅ ${user.email} verified`);
    } catch {
      alert("Verification failed");
    } finally {
      setActionLoading(null);
    }
  };

  const rejectUser = async (user) => {
    try {
      setActionLoading(user.id);
      await api.put(`/admin/users/reject/${user.id}`);
      await loadUsers();
      alert(`❌ ${user.email} rejected`);
    } catch {
      alert("Rejection failed");
    } finally {
      setActionLoading(null);
    }
  };

  const statusCounts = {
    ALL: allUsers.length,
    PENDING: allUsers.filter(u => u.verificationStatus === "PENDING").length,
    VERIFIED: allUsers.filter(u => u.verificationStatus === "VERIFIED").length,
    REJECTED: allUsers.filter(u => u.verificationStatus === "REJECTED").length,
  };

  const getFilterIcon = (f) => {
    if (f === "PENDING") return "⏳";
    if (f === "VERIFIED") return "✅";
    if (f === "REJECTED") return "❌";
    return "👥";
  };

  const getFilterColors = (f, isActive) => {
    if (isActive) {
      if (f === "PENDING") return "bg-linear-to-r from-yellow-500 to-amber-600 text-white shadow-lg shadow-yellow-500/30";
      if (f === "VERIFIED") return "bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30";
      if (f === "REJECTED") return "bg-linear-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30";
      return "bg-linear-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30";
    }
    return "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  const getRoleIcon = (role) => {
    if (role === "VOLUNTEER") return "🙋";
    if (role === "ORGANIZER") return "📋";
    if (role === "ADMIN") return "👑";
    return "👤";
  };

  const getStatusBadge = (status) => {
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700 border-yellow-300";
    if (status === "VERIFIED") return "bg-green-100 text-green-700 border-green-300";
    if (status === "REJECTED") return "bg-red-100 text-red-700 border-red-300";
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  // ================= UI =================
  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex min-h-screen bg-white">
        <Sidebar role="ADMIN" isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

        <div className="flex-1 p-8 bg-linear-to-br from-gray-50 to-gray-100">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🔐</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  User Verification
                </h2>
                <p className="text-gray-600 mt-1">
                  Review and verify user accounts
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{statusCounts.ALL}</p>
                </div>
                <div className="p-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{statusCounts.PENDING}</p>
                </div>
                <div className="p-4 bg-linear-to-br from-yellow-500 to-amber-600 rounded-2xl">
                  <span className="text-2xl">⏳</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Verified</p>
                  <p className="text-3xl font-bold text-green-600">{statusCounts.VERIFIED}</p>
                </div>
                <div className="p-4 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Rejected</p>
                  <p className="text-3xl font-bold text-red-600">{statusCounts.REJECTED}</p>
                </div>
                <div className="p-4 bg-linear-to-br from-red-500 to-rose-600 rounded-2xl">
                  <span className="text-2xl">❌</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3 mb-4">
              {["PENDING", "VERIFIED", "REJECTED", "ALL"].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${getFilterColors(s, filter === s)}`}
                >
                  <span>{getFilterIcon(s)}</span>
                  {s} ({statusCounts[s]})
                </button>
              ))}
            </div>

            {/* Search + Role */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[250px] relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
                <input
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 min-w-[150px]"
              >
                <option value="ALL">👥 All Roles</option>
                <option value="VOLUNTEER">🙋 Volunteer</option>
                <option value="ORGANIZER">📋 Organizer</option>
                <option value="ADMIN">👑 Admin</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          {loading ? (
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="font-semibold">Loading users...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-linear-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-2xl shadow-md text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold">No users found</p>
              <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map(user => (
                <div
                  key={user.id}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 overflow-hidden relative"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative z-10">
                    {/* User Info */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {user.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xl text-gray-800 truncate group-hover:text-indigo-600 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-gray-500 text-sm truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold border ${getStatusBadge(user.verificationStatus)}`}>
                        {getFilterIcon(user.verificationStatus)} {user.verificationStatus}
                      </span>
                      <span className="px-3 py-1 text-xs rounded-full font-semibold bg-indigo-100 text-indigo-700 border border-indigo-300">
                        {getRoleIcon(user.role)} {user.role}
                      </span>
                    </div>

                    {/* Document Preview */}
                    {user.documentUrl ? (
                      <button
                        onClick={() => {
                          setDocUrl(user.documentUrl);
                          setDocName(user.documentName || "Document");
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="w-full mb-4 px-4 py-2.5 bg-linear-to-r from-blue-50 to-indigo-50 text-indigo-600 font-semibold rounded-xl border border-indigo-200 hover:shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>📄</span> View Document
                      </button>
                    ) : (
                      <div className="w-full mb-4 px-4 py-2.5 bg-gray-50 text-gray-500 font-medium rounded-xl border border-gray-200 flex items-center justify-center gap-2">
                        <span>📭</span> No Document Uploaded
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                      {user.verificationStatus === "PENDING" && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => verifyUser(user)}
                            disabled={actionLoading === user.id}
                            className="flex-1 px-4 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                          >
                            {actionLoading === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>✅ Verify</>
                            )}
                          </button>
                          <button
                            onClick={() => rejectUser(user)}
                            disabled={actionLoading === user.id}
                            className="flex-1 px-4 py-2.5 bg-linear-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                          >
                            {actionLoading === user.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <>❌ Reject</>
                            )}
                          </button>
                        </div>
                      )}

                      {user.verificationStatus === "VERIFIED" && (
                        <div className="w-full px-4 py-2.5 bg-green-100 text-green-700 font-semibold rounded-xl flex items-center justify-center gap-2 border border-green-300">
                          ✅ Verified
                        </div>
                      )}

                      {user.verificationStatus === "REJECTED" && (
                        <div className="w-full px-4 py-2.5 bg-red-100 text-red-700 font-semibold rounded-xl flex items-center justify-center gap-2 border border-red-300">
                          ❌ Rejected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      {showModal && docUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-linear-to-r from-indigo-50 to-purple-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">Document Preview</h3>
                  {selectedUser && (
                    <p className="text-sm text-gray-600">
                      {selectedUser.name} • {selectedUser.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 hover:text-gray-800"
              >
                ✖
              </button>
            </div>

            {/* Document Info Bar */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">📋</span>
                <span className="font-medium text-gray-700">{docName}</span>
                {docUrl.includes("application/pdf") && (
                  <span className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full font-semibold">PDF</span>
                )}
                {(docUrl.includes("image/png") || docUrl.includes("image/jpeg") || docUrl.includes("image/jpg")) && (
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-semibold">Image</span>
                )}
              </div>
              <a
                href={docUrl}
                download={docName}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-colors flex items-center gap-2"
              >
                <span>⬇️</span> Download
              </a>
            </div>

            {/* Document Content */}
            <div className="p-4 flex-1 overflow-auto bg-gray-100">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px] flex items-center justify-center">
                {docUrl.includes("application/pdf") ? (
                  <iframe
                    src={docUrl}
                    title="Document Preview"
                    className="w-full h-[500px]"
                  />
                ) : (
                  <img
                    src={docUrl}
                    alt="Document"
                    className="max-w-full max-h-[500px] object-contain"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer with Actions */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0">
              {selectedUser && selectedUser.verificationStatus === "PENDING" ? (
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                      ⏳ Pending Verification
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowModal(false);
                        setSelectedUser(null);
                      }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        rejectUser(selectedUser);
                        setShowModal(false);
                        setSelectedUser(null);
                      }}
                      disabled={actionLoading === selectedUser.id}
                      className="px-6 py-2.5 bg-linear-to-r from-red-500 to-rose-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      ❌ Reject
                    </button>
                    <button
                      onClick={() => {
                        verifyUser(selectedUser);
                        setShowModal(false);
                        setSelectedUser(null);
                      }}
                      disabled={actionLoading === selectedUser.id}
                      className="px-6 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      ✅ Verify
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-600">
                    <span className="font-semibold">Status:</span>{" "}
                    {selectedUser?.verificationStatus === "VERIFIED" ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✅ Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                        ❌ Rejected
                      </span>
                    )}
                  </p>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2.5 bg-linear-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminUserVerification;
