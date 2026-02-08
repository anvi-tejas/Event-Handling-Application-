import { useNavigate } from "react-router-dom";

function Sidebar({ role, isOpen, closeSidebar }) {
  const navigate = useNavigate();

  const organizerLinks = [
    { label: "Dashboard", icon: "🏠", path: "/organizer" },
    { label: "Create Event", icon: "➕", path: "/create-event" },
    { label: "My Events", icon: "📋", path: "/my-events" },
    { label: "Volunteers", icon: "👥", path: "/volunteers" },
    { label: "Attendance", icon: "✅", path: "/attendance" },
    { label: "Reports", icon: "📊", path: "/reports" },
    { label: "Profile", icon: "👤", path: "/organizer-profile" },
  ];

  const volunteerLinks = [
    { label: "Dashboard", icon: "🏠", path: "/volunteer" },
    { label: "Available Events", icon: "🌍", path: "/available-events" },
    { label: "My Events", icon: "📌", path: "/volunteer-my-events" },
    { label: "History", icon: "📜", path: "/volunteer-history" },
    { label: "Messages", icon: "💬", path: "/volunteer-messages" },
    { label: "Profile", icon: "👤", path: "/volunteer-profile" },
    { label: "Settings", icon: "⚙️", path: "/volunteer-settings" },
  ];

  // ✅ UPDATED ADMIN LINKS
  const adminLinks = [
    { label: "Dashboard", icon: "🏠", path: "/admin" },
    { label: "Manage Events", icon: "📌", path: "/admin/manage-events" },
    { label: "Event Approval", icon: "✅", path: "/admin/event-approval" },
    { label: "Complaints", icon: "🚨", path: "/admin/complaints" },
    { label: "User Verification", icon: "👤", path: "/admin/user-verification" },
    { label: "All Users", icon: "👥", path: "/admin/users" },
  ];


  const links =
    role === "ORGANIZER"
      ? organizerLinks
      : role === "VOLUNTEER"
      ? volunteerLinks
      : adminLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 backdrop-blur-xl bg-linear-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 border-r border-white/20 shadow-2xl shadow-purple-500/20
        transform transition-all duration-500 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Close button (mobile) */}
          <div className="md:hidden flex justify-end p-4">
            <button
              onClick={closeSidebar}
              className="text-white text-2xl hover:bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:rotate-90"
            >
              ×
            </button>
          </div>

          {/* Logo/Brand Section */}
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg">
                <span className="text-2xl">
                  {role === "ORGANIZER" ? "📋" : role === "VOLUNTEER" ? "🌟" : "👑"}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">
                {role === "ORGANIZER" ? "Organizer" : role === "VOLUNTEER" ? "Volunteer" : "Admin"}
              </h2>
            </div>
          </div>

          {/* Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  closeSidebar();
                }}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-xl
                !text-white hover:!text-yellow-300 hover:bg-white/20
                transition-all duration-300 text-left font-semibold
                group relative overflow-hidden border border-transparent hover:border-white/30
                hover:shadow-lg hover:shadow-purple-500/20 hover:scale-105"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform duration-300">{link.icon}</span>
                <span className="relative z-10">{link.label}</span>
              </button>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-6 py-6 border-t border-white/10">
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
                closeSidebar();
              }}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl
              bg-linear-to-r from-red-500 to-pink-600 text-white font-bold text-lg
              hover:shadow-2xl hover:shadow-red-500/50 transform hover:scale-105 transition-all duration-300
              border border-red-400/30"
            >
              <span className="text-2xl">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
