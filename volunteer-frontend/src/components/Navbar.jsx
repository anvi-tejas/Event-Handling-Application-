import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const dropdownRef = useRef(null);

  // 🔔 Fetch unread notification count
  useEffect(() => {
    if (user?.email) {
      axios
        .get(`/notifications/count/${user.email}`)
        .then((res) => setCount(res.data))
        .catch(() => {});
    }
  }, [user?.email]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔔 Toggle notifications page
  const handleBellClick = () => {
    if (location.pathname === "/notifications") {
      navigate(-1); // Go back
    } else {
      navigate("/notifications");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="sticky top-0 z-50 w-full backdrop-blur-xl bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 border-b border-white/20 shadow-2xl shadow-purple-500/20">
      <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        {/* ☰ Sidebar Toggle */}
        <button
          className="md:hidden text-white px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 hover:scale-110"
          onClick={toggleSidebar}
        >
          <span className="text-xl">☰</span>
        </button>

        {/* Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => {
            // Navigate to appropriate dashboard based on role
            const role = user?.role?.toUpperCase();
            if (role === "VOLUNTEER") {
              navigate("/volunteer");
            } else if (role === "ORGANIZER") {
              navigate("/organizer");
            } else if (role === "ADMIN") {
              navigate("/admin");
            } else {
              navigate("/");
            }
          }}
        >
          <div className="p-2 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-110">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-white font-bold text-xl bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            VolunteerHub
          </h2>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
        {/* 🔔 Notification Bell */}
        <button
          onClick={handleBellClick}
          className={`relative p-3 rounded-xl border border-white/20 transition-all duration-300 hover:scale-110 group ${
            location.pathname === "/notifications"
              ? "bg-white/30"
              : "bg-white/10 hover:bg-white/20"
          }`}
        >
          <span className="text-2xl group-hover:animate-bounce">🔔</span>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[22px] h-5 flex items-center justify-center bg-linear-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-1.5 rounded-full shadow-lg shadow-red-500/50 animate-pulse">
              {count}
            </span>
          )}
        </button>

        {/* 👤 User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl border border-white/20 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-purple-500/30"
          >
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shadow-lg">
              {(user?.name || "U")[0].toUpperCase()}
            </div>
            <span className="hidden md:inline font-semibold">{user?.name || "User"}</span>
            <span className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {open && (
            <div className="absolute right-0 mt-4 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-purple-500/20 rounded-2xl w-56 overflow-hidden animate-fadeIn z-50">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => navigate(user?.role === "VOLUNTEER" ? "/volunteerprofile" : user?.role === "ORGANIZER" ? "/organizerprofile" : "/")}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 font-medium"
                >
                  <span className="text-lg">👤</span>
                  <span>Profile</span>
                </button>

                {user?.role !== "ADMIN" && (
                  <button
                    onClick={() => navigate("/certificates")}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 font-medium"
                  >
                    <span className="text-lg">🏆</span>
                    <span>Certificates</span>
                  </button>
                )}

                {user?.role !== "ADMIN" && (
                  <button
                    onClick={() => navigate("/help")}
                    className="flex items-center gap-3 w-full text-left px-4 py-3 text-white hover:bg-white/20 rounded-xl transition-all duration-200 font-medium"
                  >
                    <span className="text-lg">🆘</span>
                    <span>Help & Support</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-all duration-200 font-medium"
                >
                  <span className="text-lg">🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
