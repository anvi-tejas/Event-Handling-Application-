import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function VolunteerMessage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex">
        <Sidebar
          role="VOLUNTEER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="grow p-4">
          <h2 className="text-2xl font-bold mb-1">💬 Messages</h2>
          <p className="text-gray-500 mb-4">
            Communication module (coming soon).
          </p>

          <div className="bg-white rounded-xl shadow p-4">
            <p className="text-gray-500">Messaging functionality will be available here.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default VolunteerMessage;
