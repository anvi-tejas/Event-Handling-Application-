import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          role="ADMIN"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="grow p-4">
          <h2 className="text-2xl font-bold mb-2">🛡️ Admin Dashboard</h2>
          <p className="text-gray-500 mb-4">
            Admin panel UI is ready. Features will be added soon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
              <h3 className="font-bold text-lg">👥 Users</h3>
              <p className="text-gray-500 text-sm mt-1">
                Manage all registered users.
              </p>
              <button className="mt-4 w-full px-4 py-2 rounded-xl bg-black text-white font-semibold">
                Coming Soon
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
              <h3 className="font-bold text-lg">📌 Events</h3>
              <p className="text-gray-500 text-sm mt-1">
                Manage all events created by organizers.
              </p>
              <button className="mt-4 w-full px-4 py-2 rounded-xl bg-black text-white font-semibold">
                Coming Soon
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
              <h3 className="font-bold text-lg">📊 Reports</h3>
              <p className="text-gray-500 text-sm mt-1">
                View analytics & system performance.
              </p>
              <button className="mt-4 w-full px-4 py-2 rounded-xl bg-black text-white font-semibold">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
