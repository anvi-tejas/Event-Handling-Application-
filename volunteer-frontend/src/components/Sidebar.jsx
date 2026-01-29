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

  const adminLinks = [
    { label: "Dashboard", icon: "🏠", path: "/admin" },
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
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <div className="md:hidden flex justify-end p-4">
            <button
              onClick={closeSidebar}
              className="text-white text-2xl hover:text-gray-300"
            >
              ×
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {links.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  closeSidebar();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors duration-200 text-left"
              >
                <span className="text-xl">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
