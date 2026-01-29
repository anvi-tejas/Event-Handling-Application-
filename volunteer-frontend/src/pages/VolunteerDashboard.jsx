import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function VolunteerDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const cardsRef = useRef(null);

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

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="VOLUNTEER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg">
                <span className="text-3xl">👋</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Welcome, {user?.name || "Volunteer"}!
                </h2>
                <p className="text-gray-600 mt-1">
                  Explore events, join opportunities & track your participation
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            ref={cardsRef}
          >
            {/* Available Events */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-green-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  🌍
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Available Events</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Browse volunteer events and send join requests.
                </p>
                <button
                  onClick={() => navigate("/available-events")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-green-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Explore Events
                </button>
              </div>
            </div>

            {/* My Events */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  📌
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">My Events</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Track your joined events and approval status.
                </p>
                <button
                  onClick={() => navigate("/volunteer-my-events")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  View My Events
                </button>
              </div>
            </div>

            {/* History */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-amber-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  🕒
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">History</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  View completed activities and participation record.
                </p>
                <button
                  onClick={() => navigate("/volunteer-history")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  View History
                </button>
              </div>
            </div>

            {/* Profile */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-indigo-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  👤
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">My Profile</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Update your profile details (skills, contact, gender etc.).
                </p>
                <button
                  onClick={() => navigate("/volunteer-profile")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Open Profile
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-pink-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  💬
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Messages</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Communication module (planned).
                </p>
                <button
                  onClick={() => navigate("/volunteer-messages")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-pink-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Open Messages
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="dash-card group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-500/10 to-gray-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-500 to-gray-600 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  ⚙️
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Settings</h3>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  Manage preferences (planned).
                </p>
                <button
                  onClick={() => navigate("/volunteer-settings")}
                  className="w-full py-3 px-4 bg-gradient-to-r from-slate-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-slate-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Open Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default VolunteerDashboard;
