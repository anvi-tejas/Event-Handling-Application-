import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function VolunteerRequests() {
  const { eventId } = useParams();

  const [requests, setRequests] = useState([]);
  const [event, setEvent] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [limitAlert, setLimitAlert] = useState("");

  // ✅ store fetched profiles: email -> profile
  const [profiles, setProfiles] = useState({});

  // ✅ Search
  const [search, setSearch] = useState("");

  // ✅ Profile Modal
  const [selectedProfile, setSelectedProfile] = useState(null); // { profile, participation }

  const fetchData = async () => {
    try {
      setLimitAlert("");

      // ✅ Requests for this event
      const res = await fetch(`${API_BASE}/participations/event/${eventId}`);
      const reqData = await res.json();
      const list = Array.isArray(reqData) ? reqData : [];
      setRequests(list);

      // ✅ Event details
      const eRes = await fetch(`${API_BASE}/events/all`);
      const eData = await eRes.json();
      const events = Array.isArray(eData) ? eData : [];

      const foundEvent = events.find((e) => String(e.id) === String(eventId));
      setEvent(foundEvent || null);
    } catch {
      alert("Failed to load volunteer requests");
    }
  };

  useEffect(() => {
    fetchData();
  }, [eventId]);

  // ✅ Auto-fetch volunteer profiles
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const uniqueEmails = [...new Set(requests.map((r) => r.volunteerEmail))];
        const newProfiles = { ...profiles };

        const missingEmails = uniqueEmails.filter((email) => !newProfiles[email]);
        if (missingEmails.length === 0) return;

        await Promise.all(
          missingEmails.map(async (email) => {
            try {
              const res = await fetch(`${API_BASE}/users/email/${email}`);
              if (res.ok) {
                const data = await res.json();
                newProfiles[email] = data; // ✅ store full profile
              } else {
                newProfiles[email] = { name: "Unknown", email };
              }
            } catch {
              newProfiles[email] = { name: "Unknown", email };
            }
          })
        );

        setProfiles(newProfiles);
      } catch (err) {
        console.log(err);
      }
    };

    if (requests.length > 0) loadProfiles();
  }, [requests]);

  // ✅ Counts
  const approvedCount = requests.filter((r) => r.status === "APPROVED").length;
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;
  const rejectedCount = requests.filter((r) => r.status === "REJECTED").length;

  const totalLimit = event?.requiredVolunteers || 0;
  const isLimitReached = totalLimit > 0 && approvedCount >= totalLimit;

  const updateStatus = async (id, status) => {
    try {
      setLimitAlert("");

      if (status === "APPROVED" && isLimitReached) {
        setLimitAlert("⚠️ Volunteer limit reached. You cannot approve more.");
        return;
      }

      const res = await fetch(
        `${API_BASE}/participations/update-status/${id}?status=${status}`,
        { method: "PUT" }
      );

      if (!res.ok) {
        const msg = await res.text();
        setLimitAlert(msg || "Failed to update status");
        return;
      }

      await fetchData();
      setSelectedProfile(null); // ✅ close modal after action
    } catch {
      setLimitAlert("Failed to update status");
    }
  };

  const badgeClass = (status) => {
    if (status === "APPROVED") return "bg-green-600 text-white";
    if (status === "REJECTED") return "bg-red-600 text-white";
    return "bg-yellow-500 text-white";
  };

  // ✅ Sort pending first
  const sortPriority = (status) => {
    if (status === "PENDING") return 1;
    if (status === "APPROVED") return 2;
    if (status === "REJECTED") return 3;
    return 4;
  };

  const filteredSortedRequests = [...requests]
    .filter((r) => {
      const p = profiles[r.volunteerEmail];
      const name = (p?.name || "").toLowerCase();
      const email = (r.volunteerEmail || "").toLowerCase();
      const query = search.toLowerCase();

      return name.includes(query) || email.includes(query);
    })
    .sort((a, b) => sortPriority(a.status) - sortPriority(b.status));

  // ✅ Modal UI
  const ProfileModal = ({ profile, participation }) => {
    if (!profile) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-3 animate-fade-in">
        <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <img
                  src={
                    profile.profilePicture
                      ? profile.profilePicture
                      : `https://ui-avatars.com/api/?name=${profile.name || "V"}&background=fff&color=6366f1`
                  }
                  alt="profile"
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div>
                  <h3 className="text-2xl font-bold">{profile.name || "Volunteer"}</h3>
                  <p className="text-indigo-100 text-sm mt-1">{profile.email}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedProfile(null)}
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
                <span className="text-gray-700 font-bold">Request Status:</span>
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
                <div className="text-gray-800 font-medium">{profile.contact || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                <div className="text-xs text-purple-600 font-semibold mb-1">⚧ Gender</div>
                <div className="text-gray-800 font-medium">{profile.gender || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <div className="text-xs text-green-600 font-semibold mb-1">🎓 Occupation</div>
                <div className="text-gray-800 font-medium">{profile.occupation || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                <div className="text-xs text-amber-600 font-semibold mb-1">🏙 City</div>
                <div className="text-gray-800 font-medium">{profile.city || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl border border-pink-200">
                <div className="text-xs text-pink-600 font-semibold mb-1">🎂 Age</div>
                <div className="text-gray-800 font-medium">{profile.age || "-"}</div>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
                <div className="text-xs text-indigo-600 font-semibold mb-1">📅 Availability</div>
                <div className="text-gray-800 font-medium">{profile.availability || "-"}</div>
              </div>
            </div>

            {/* Skills Section */}
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border border-cyan-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🧠</span>
                <span className="font-bold text-cyan-800">Skills & Expertise</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {profile.skills || "Not mentioned"}
              </p>
            </div>

            {/* Bio Section */}
            <div className="bg-gradient-to-br from-violet-50 to-violet-100 p-4 rounded-xl border border-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📝</span>
                <span className="font-bold text-violet-800">About</span>
              </div>
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                {profile.bio || "No bio provided"}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
            {participation?.status !== "APPROVED" && (
              <button
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-200"
                disabled={isLimitReached && participation?.status !== "APPROVED"}
                style={{
                  opacity: isLimitReached && participation?.status !== "APPROVED" ? 0.6 : 1,
                }}
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
              onClick={() => setSelectedProfile(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

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
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">👥</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Volunteer Requests
                </h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span>Event ID: <b className="text-indigo-600">{eventId}</b></span>
                  {event && (
                    <span>• Event: <b className="text-gray-800">{event.title}</b></span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            {event && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 border border-green-200">
                  <div className="text-xs text-green-600 font-semibold mb-1">✅ Approved</div>
                  <div className="text-2xl font-bold text-green-700">{approvedCount}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3 border border-amber-200">
                  <div className="text-xs text-amber-600 font-semibold mb-1">⏳ Pending</div>
                  <div className="text-2xl font-bold text-amber-700">{pendingCount}</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 border border-red-200">
                  <div className="text-xs text-red-600 font-semibold mb-1">❌ Rejected</div>
                  <div className="text-2xl font-bold text-red-700">{rejectedCount}</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3 border border-indigo-200">
                  <div className="text-xs text-indigo-600 font-semibold mb-1">🎯 Limit</div>
                  <div className="text-2xl font-bold text-indigo-700">{approvedCount}/{totalLimit}</div>
                </div>
                {isLimitReached && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border border-gray-700">
                    <div className="text-xs text-gray-300 font-semibold mb-1">🚫 Status</div>
                    <div className="text-sm font-bold text-white">Limit Reached</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xl">🔍</span>
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 hover:bg-white transition-all duration-200"
                placeholder="Search volunteer by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Alert */}
          {limitAlert && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-2xl shadow-md relative mb-6 animate-slide-up">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1 font-medium">{limitAlert}</div>
                <button
                  type="button"
                  className="p-2 rounded-full hover:bg-red-200 transition-all duration-200 font-bold"
                  onClick={() => setLimitAlert("")}
                >
                  ✖
                </button>
              </div>
            </div>
          )}

          {/* Volunteers Table */}
          {filteredSortedRequests.length === 0 ? (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 px-6 py-8 rounded-2xl shadow-md flex items-center justify-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <div className="font-bold text-lg">No Matching Volunteers</div>
                <div className="text-sm text-blue-600 mt-1">Try adjusting your search criteria</div>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">ID</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Volunteer</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Skills</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left font-bold text-sm uppercase tracking-wider" style={{ width: 400 }}>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredSortedRequests.map((r) => {
                      const p = profiles[r.volunteerEmail];

                      return (
                        <tr key={r.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                          <td className="px-6 py-4 font-bold text-gray-700">{r.id}</td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  p?.profilePicture
                                    ? p.profilePicture
                                    : `https://ui-avatars.com/api/?name=${p?.name || "V"}&background=6366f1&color=fff`
                                }
                                alt="profile"
                                className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200 shadow-md"
                              />

                              <div>
                                <div className="font-bold text-gray-800">
                                  {p?.name || "Loading..."}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {r.volunteerEmail}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-gray-700 font-medium">{p?.contact || "-"}</td>
                          <td className="px-6 py-4 text-gray-700 font-medium">{p?.gender || "-"}</td>

                          <td className="px-6 py-4 max-w-[260px]">
                            <div className="text-gray-600 text-sm line-clamp-2">
                              {p?.skills || "-"}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-4 py-2 rounded-full text-xs font-bold shadow-md ${badgeClass(
                                r.status
                              )}`}
                            >
                              {r.status || "PENDING"}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex gap-2 flex-wrap">
                              {/* View Profile Button */}
                              <button
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                onClick={() =>
                                  setSelectedProfile({
                                    profile: p,
                                    participation: r,
                                  })
                                }
                                disabled={!p}
                              >
                                👀 View
                              </button>

                              {/* Approve Button */}
                              {r.status !== "APPROVED" && (
                                <button
                                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                  disabled={isLimitReached && r.status !== "APPROVED"}
                                  onClick={() => updateStatus(r.id, "APPROVED")}
                                  title="Approve"
                                >
                                  ✅
                                </button>
                              )}

                              {/* Reject Button */}
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
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal */}
      {selectedProfile?.profile && (
        <ProfileModal
          profile={selectedProfile.profile}
          participation={selectedProfile.participation}
        />
      )}
    </>
  );
}

export default VolunteerRequests;
