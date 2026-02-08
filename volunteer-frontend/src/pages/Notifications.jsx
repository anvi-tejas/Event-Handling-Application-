import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    // Fetch notifications from API
    const fetchNotifications = async () => {
      try {
        // TODO: Replace with actual API endpoint
        // const response = await fetch("YOUR_API_ENDPOINT/notifications");
        // const data = await response.json();
        // setNotifications(data);
        
        // Mock data for now
        setNotifications([
          {
            id: 1,
            title: "Welcome!",
            message: "Thank you for joining our volunteer platform.",
            date: new Date().toISOString(),
            read: false,
            type: "success"
          },
          {
            id: 2,
            title: "Event Approved",
            message: "Your event 'Community Cleanup' has been approved by admin.",
            date: new Date(Date.now() - 86400000).toISOString(),
            read: false,
            type: "info"
          },
        ]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const getTypeStyles = (type) => {
    switch(type) {
      case 'success':
        return 'border-green-500 bg-linear-to-r from-green-50 to-emerald-50';
      case 'info':
        return 'border-blue-500 bg-linear-to-r from-blue-50 to-indigo-50';
      case 'warning':
        return 'border-yellow-500 bg-linear-to-r from-yellow-50 to-amber-50';
      case 'error':
        return 'border-red-500 bg-linear-to-r from-red-50 to-pink-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />
      
      <div className="flex">
        <Sidebar
          role={user.role}
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />
        
        <div className="flex-1 p-8 bg-linear-to-br from-gray-50 to-gray-100 min-h-screen">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl animate-bounce-slow">
                <span className="text-3xl">🔔</span>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
                <p className="text-gray-600 text-lg">
                  Stay updated with your latest activities
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 text-blue-800 px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
              <span className="text-2xl animate-spin">⚙️</span>
              <span className="font-semibold">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl shadow-lg text-center border border-gray-200">
              <div className="inline-block p-6 bg-linear-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <span className="text-6xl">📭</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Notifications</h3>
              <p className="text-gray-600">You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-l-4 ${
                    notification.read
                      ? "bg-white border-gray-300"
                      : getTypeStyles(notification.type)
                  } hover:scale-[1.01]`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {!notification.read && (
                          <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                        )}
                        <h3
                          className={`text-xl font-bold ${
                            notification.read
                              ? "text-gray-600"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span>🕐</span>
                        {new Date(notification.date).toLocaleDateString()} at{" "}
                        {new Date(notification.date).toLocaleTimeString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center gap-2 px-5 py-3 text-sm bg-linear-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                      >
                        <span>✓</span>
                        <span>Mark as Read</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
