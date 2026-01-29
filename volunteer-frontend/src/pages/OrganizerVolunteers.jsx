import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function OrganizerVolunteers() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ✅ Organizer Events
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");

  // ✅ Requests
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({}); // email -> user profile

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);

  // ✅ Search + Status Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL/PENDING/APPROVED/REJECTED

  // ✅ Modal
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);

  // ✅ Load organizer events
  const loadMyEvents = async () => {
    try {
      setLoadingEvents(true);

      const res = await fetch(`${API_BASE}/events/organizer/${user.email}`);
      const data = await res.json();

      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // ✅ Load participation list for selected event
  const loadVolunteers = async (eventId) => {
    try {
      setLoadingVolunteers(true);

      const res = await fetch(`${API_BASE}/participations/event/${eventId}`);
      const data = await res.json();

      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoadingVolunteers(false);
    }
  };

  // ✅ Load volunteer profile by email
  const fetchProfile = async (email) => {
    if (!email || profiles[email]) return;

    try {
      const res = await fetch(`${API_BASE}/users/email/${email}`);
      if (!res.ok) return;

      const data = await res.json();

      setProfiles((prev) => ({
        ...prev,
        [email]: data,
      }));
    } catch {}
  };

  useEffect(() => {
    if (user?.email) loadMyEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) loadVolunteers(selectedEventId);
  }, [selectedEventId]);

  useEffect(() => {
    requests.forEach((r) => fetchProfile(r.volunteerEmail));
  }, [requests]);

  // ✅ Update Status Approve/Reject
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(
        `${API_BASE}/participations/update-status/${id}?status=${status}`,
        { method: "PUT" }
      );

      if (!res.ok) {
        const msg = await res.text();
        alert(msg || "Failed to update status");
        return;
      }

      // refresh
      loadVolunteers(selectedEventId);
    } catch {
      alert("Failed to update status");
    }
  };

  const badgeClass = (status) => {
    if (status === "APPROVED") return "bg-green-600 text-white";
    if (status === "REJECTED") return "bg-red-600 text-white";
    return "bg-yellow-500 text-white";
  };

  // ✅ Filter based on search + status
  const filteredRequests = requests.filter((r) => {
    const profile = profiles[r.volunteerEmail];
    const name = (profile?.name || "").toLowerCase();
    const email = (r.volunteerEmail || "").toLowerCase();
    const skills = (profile?.skills || "").toLowerCase();

    const query = search.toLowerCase();

    const matchesSearch =
      name.includes(query) || email.includes(query) || skills.includes(query);

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ✅ Modal
  const VolunteerModal = ({ volunteer, participation }) => {
    if (!volunteer) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 animate-fade-in">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src={
                    volunteer.profilePicture
                      ? volunteer.profilePicture
                      : `https://ui-avatars.com/api/?name=${volunteer.name || "V"}&background=fff&color=6366f1`
                  }
                  alt="profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div>
                  <h3 className="text-2xl font-bold">{volunteer.name || "Volunteer"}</h3>
                  <p className="text-indigo-100 text-sm mt-1">{volunteer.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVolunteer(null)}
                className="p-2 rounded-full hover:bg-white/20 transition-all duration-200 text-white"
              >
                <span className="text-2xl">✖</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Status Badge */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span className="text-gray-700 font-bold">Participation Status:</span>
              </div>
              <span
                className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${badgeClass(
                  participation?.status || "PENDING"
                )}`}
              >
                {participation?.status || "PENDING"}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <div className="text-xs text-blue-600 font-semibold mb-1">📞 Contact</div>
                <div className="text-gray-800 font-medium">{volunteer.contact || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">⚧ Gender</div>
                <div className="text-gray-800 font-medium">{volunteer.gender || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="text-xs text-green-600 font-semibold mb-1">🎓 Occupation</div>
                <div className="text-gray-800 font-medium">{volunteer.occupation || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                <div className="text-xs text-amber-600 font-semibold mb-1">🏙 City</div>
                <div className="text-gray-800 font-medium">{volunteer.city || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
                <div className="text-xs text-pink-600 font-semibold mb-1">🎂 Age</div>
                <div className="text-gray-800 font-medium">{volunteer.age || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                <div className="text-xs text-indigo-600 font-semibold mb-1">📅 Availability</div>
                <div className="text-gray-800 font-medium">{volunteer.availability || "-"}</div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🧠</span>
                <span className="font-bold text-cyan-800">Skills & Expertise</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {volunteer.skills || "Not mentioned"}
              </p>
            </div>

            {/* Bio Section */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-xl border border-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <span className="font-bold text-violet-800">About</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {volunteer.bio || "No bio provided"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
            {participation?.status !== "APPROVED" && (
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-200"
                onClick={() => updateStatus(participation.id, "APPROVED")}
              >
                ✅ Approve
              </button>
            )}

            {participation?.status !== "REJECTED" && (
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-200"
                onClick={() => updateStatus(participation.id, "REJECTED")}
              >
                ❌ Reject
              </button>
            )}

            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              onClick={() => setSelectedVolunteer(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const selectedEvent = events.find((e) => String(e.id) === String(selectedEventId));

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header Section */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Event Volunteers
                </h2>
                <p className="text-gray-600 mt-1">
                  Select an event to view and manage volunteer applications
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Select Event */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📅</span>
              <label className="block font-bold text-gray-800 text-lg">
                Select Event
              </label>
            </div>

            <select
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              <option value="">
                {loadingEvents ? "Loading events..." : "-- Choose an event to manage --"}
              </option>

              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.startDate})
                </option>
              ))}
            </select>

            {selectedEvent && (
              <div className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Event:</span>{" "}
                    <span className="text-indigo-600 font-medium">{selectedEvent.title}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Category:</span>{" "}
                    <span className="text-purple-600 font-medium">{selectedEvent.category}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Date:</span>{" "}
                    <span className="text-gray-800 font-medium">{selectedEvent.startDate}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Search + Filter */}
          {selectedEventId && (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 text-xl">🔍</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, or skills..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <select
                  className="md:w-56 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200 font-medium"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">📋 All Status</option>
                  <option value="PENDING">⏳ Pending</option>
                  <option value="APPROVED">✅ Approved</option>
                  <option value="REJECTED">❌ Rejected</option>
                </select>
              </div>

              {/* Stats Summary */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-blue-600 font-semibold mb-1">Total</div>
                  <div className="text-2xl font-bold text-blue-700">{requests.length}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3 border border-amber-200">
                  <div className="text-xs text-amber-600 font-semibold mb-1">Pending</div>
                  <div className="text-2xl font-bold text-amber-700">
                    {requests.filter(r => r.status === "PENDING").length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-green-600 font-semibold mb-1">Approved</div>
                  <div className="text-2xl font-bold text-green-700">
                    {requests.filter(r => r.status === "APPROVED").length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 border border-red-200">
                  <div className="text-xs text-red-600 font-semibold mb-1">Rejected</div>
                  <div className="text-2xl font-bold text-red-700">
                    {requests.filter(r => r.status === "REJECTED").length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Table */}
          {!selectedEventId ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <div className="font-bold text-lg">No Event Selected</div>
                <div className="text-sm text-blue-600">Please select an event to view volunteer applications</div>
              </div>
            </div>
          ) : loadingVolunteers ? (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 text-indigo-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <div className="animate-spin text-3xl">⏳</div>
              <div>
                <div className="font-bold text-lg">Loading...</div>
                <div className="text-sm text-indigo-600">Fetching volunteer applications</div>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <div className="font-bold text-lg">No Volunteers Found</div>
                <div className="text-sm text-gray-600">Try adjusting your search or filter criteria</div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <tr>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider">Volunteer</th>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider">Contact</th>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider">Skills</th>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-4 font-bold text-sm uppercase tracking-wider w-64">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((r) => {
                    const profile = profiles[r.volunteerEmail];

                    return (
                      <tr key={r.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={
                                profile?.profilePicture
                                  ? profile.profilePicture
                                  : `https://ui-avatars.com/api/?name=${profile?.name || "V"}&background=6366f1&color=fff`
                              }
                              alt="profile"
                              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 shadow-md"
                            />
                            <div>
                              <div className="font-bold text-gray-800">
                                {profile?.name || "Loading..."}
                              </div>
                              <div className="text-xs text-gray-500">
                                {r.volunteerEmail}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-700 font-medium">
                          {profile?.contact || "-"}
                        </td>

                        <td className="px-6 py-4 max-w-[220px]">
                          <div className="truncate text-gray-600 text-sm">
                            {profile?.skills || "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${badgeClass(
                              r.status
                            )}`}
                          >
                            {r.status}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-200"
                              onClick={() =>
                                setSelectedVolunteer({
                                  profile,
                                  participation: r,
                                })
                              }
                            >
                              👀 View
                            </button>

                            {r.status !== "APPROVED" && (
                              <button
                                className="px-3 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-200"
                                onClick={() => updateStatus(r.id, "APPROVED")}
                                title="Approve"
                              >
                                ✅
                              </button>
                            )}

                            {r.status !== "REJECTED" && (
                              <button
                                className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:shadow-lg hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-200"
                                onClick={() => updateStatus(r.id, "REJECTED")}
                                title="Reject"
                              >
                                ❌
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>

              {/* Results Summary */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 rounded-b-2xl">
                <div className="text-sm text-gray-600 text-center">
                  Showing <span className="font-bold text-indigo-600">{filteredRequests.length}</span> of{" "}
                  <span className="font-bold text-gray-800">{requests.length}</span> volunteer(s)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal */}
      {selectedVolunteer?.profile && (
        <VolunteerModal
          volunteer={selectedVolunteer.profile}
          participation={selectedVolunteer.participation}
        />
      )}
    </>
  );
}

export default OrganizerVolunteers;
