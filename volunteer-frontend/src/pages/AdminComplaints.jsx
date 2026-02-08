import { useEffect, useState } from "react";
import api, { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("OPEN");
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ LOAD COMPLAINTS (FIXED ENDPOINT)
  const loadComplaints = async () => {
    try {
      setLoading(true);

      try {
        const res = await api.get("/complaints/admin/all");
        setAllComplaints(Array.isArray(res.data) ? res.data : []);
      } catch {
        const res = await fetch(`${API_BASE}/complaints/admin/all`);
        const data = await res.json();
        setAllComplaints(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
      setAllComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // ✅ FILTER + SEARCH
  useEffect(() => {
    let filtered = [...allComplaints];

    if (filter !== "ALL") {
      filtered = filtered.filter(
        (c) => (c.status || "OPEN") === filter
      );
    }

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.subject?.toLowerCase().includes(q) ||
          c.userEmail?.toLowerCase().includes(q) ||
          c.message?.toLowerCase().includes(q)
      );
    }

    setComplaints(filtered);
  }, [allComplaints, filter, searchTerm]);

  // ✅ RESOLVE COMPLAINT (FIXED ENDPOINT)
  const resolve = async (id) => {
    try {
      setActionLoading(id);

      try {
        await api.put(`/complaints/admin/resolve/${id}`);
      } catch {
        await fetch(`${API_BASE}/complaints/admin/resolve/${id}`, {
          method: "PUT",
        });
      }

      setAllComplaints((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, status: "RESOLVED" } : c
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to resolve complaint");
    } finally {
      setActionLoading(null);
    }
  };

  const statusCounts = {
    ALL: allComplaints.length,
    OPEN: allComplaints.filter((c) => c.status === "OPEN").length,
    RESOLVED: allComplaints.filter((c) => c.status === "RESOLVED").length,
  };

  const getFilterIcon = (f) => {
    if (f === "OPEN") return "🔴";
    if (f === "RESOLVED") return "✅";
    return "📋";
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-white">
        <Sidebar
          role="ADMIN"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8 bg-linear-to-br from-gray-50 to-gray-100">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🚨</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Complaints Management
                </h2>
                <p className="text-gray-600 mt-1">
                  Review and resolve user complaints
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Complaints</p>
                  <p className="text-3xl font-bold text-gray-800">{statusCounts.ALL}</p>
                </div>
                <div className="p-4 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Open</p>
                  <p className="text-3xl font-bold text-red-600">{statusCounts.OPEN}</p>
                </div>
                <div className="p-4 bg-linear-to-br from-red-500 to-rose-600 rounded-2xl">
                  <span className="text-2xl">🔴</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{statusCounts.RESOLVED}</p>
                </div>
                <div className="p-4 bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-100">
            <div className="flex flex-wrap gap-4 mb-4">
              {/* Filter Buttons */}
              <div className="flex gap-2 flex-wrap">
                {["ALL", "OPEN", "RESOLVED"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 ${
                      filter === f
                        ? "bg-linear-to-r from-red-500 to-orange-600 text-white shadow-lg shadow-red-500/30"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <span>{getFilterIcon(f)}</span>
                    {f} ({statusCounts[f]})
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all bg-gray-50"
                placeholder="Search by subject, email, or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Complaints List */}
          {loading ? (
            <div className="bg-linear-to-r from-blue-50 to-cyan-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="font-semibold">Loading complaints...</span>
              </div>
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-linear-to-r from-gray-50 to-slate-50 border border-gray-200 text-gray-700 px-6 py-8 rounded-2xl shadow-md text-center">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-lg font-semibold">No complaints found</p>
              <p className="text-sm text-gray-500 mt-2">All clear! No complaints match your filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c) => (
                <div
                  key={c.id}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border-l-4 ${
                    c.status === "RESOLVED"
                      ? "border-green-500"
                      : "border-red-500"
                  } overflow-hidden relative`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-red-500/5 to-orange-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-xl text-gray-800 group-hover:text-red-600 transition-colors">
                            {c.subject}
                          </h3>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-semibold ${
                              c.status === "RESOLVED"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {c.status === "RESOLVED" ? "✅ Resolved" : "🔴 Open"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span>📧</span> {c.userEmail}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <p className="text-gray-700 leading-relaxed">{c.message}</p>
                    </div>

                    <div className="flex justify-end">
                      {c.status !== "RESOLVED" ? (
                        <button
                          onClick={() => resolve(c.id)}
                          disabled={actionLoading === c.id}
                          className="px-6 py-2.5 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-500/30 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                        >
                          {actionLoading === c.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Resolving...
                            </>
                          ) : (
                            <>
                              <span>✅</span> Mark as Resolved
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="px-6 py-2.5 bg-green-100 text-green-700 font-semibold rounded-xl flex items-center gap-2">
                          <span>✅</span> Resolved
                        </span>
                      )}
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

export default AdminComplaints;
