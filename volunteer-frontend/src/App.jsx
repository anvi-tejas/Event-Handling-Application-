import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

// ✅ Public
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HelpSupport from "./pages/HelpSupport";
import Notifications from "./pages/Notifications";
import RaiseComplaint from "./pages/RaiseComplaint";


// ✅ Organizer
import OrganizerDashboard from "./pages/OrganizerDashboard";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import MyEvents from "./pages/MyEvents";
import VolunteerRequests from "./pages/VolunteerRequests";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import OrganizerProfile from "./pages/OrganizerProfile";


// ✅ Volunteer
import VolunteerDashboard from "./pages/VolunteerDashboard";
import AvailableEvents from "./pages/AvailableEvents";
import VolunteerMyEvents from "./pages/VolunteerMyEvents";
import VolunteerHistory from "./pages/VolunteerHistory";
import VolunteerMessage from "./pages/VolunteerMessage";
import VolunteerProfile from "./pages/VolunteerProfile";
import VolunteerSettings from "./pages/VolunteerSettings";
import Certificates from "./pages/Certificates";

// ✅ Admin
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminUsers from "./pages/AdminUsers";
import AdminUserVerification from "./pages/AdminUserVerification";
import AdminEventApproval from "./pages/AdminEventApproval";
import AdminComplaints from "./pages/AdminComplaints";

// ✅ Optional: Organizer Volunteers page )
import OrganizerVolunteers from "./pages/OrganizerVolunteers";

function App() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <Routes>
      {/* ✅ Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/help" element={<HelpSupport />} />
      <Route
        path="/volunteerprofile"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizerprofile"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <OrganizerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute allowedRoles={["VOLUNTEER", "ORGANIZER", "ADMIN"]}>
            <Notifications />
          </ProtectedRoute>
        }
      />


      {/* ✅ Default redirect after login */}
      <Route
        path="/home"
        element={
          user?.role === "ORGANIZER" ? (
            <Navigate to="/organizer" />
          ) : user?.role === "VOLUNTEER" ? (
            <Navigate to="/volunteer" />
          ) : user?.role === "ADMIN" ? (
            <Navigate to="/admin" />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* ✅ Organizer Routes */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <OrganizerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/create-event"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-events"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <MyEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-event/:eventId"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <EditEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests/:eventId"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <VolunteerRequests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/organizer-profile"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <OrganizerProfile />
          </ProtectedRoute>
        }
      />


      {/* ✅ Organizer Volunteers (Option 2 page) */}
      <Route
        path="/volunteers"
        element={
          <ProtectedRoute allowedRole="ORGANIZER">
            <OrganizerVolunteers />
          </ProtectedRoute>
        }
      />

      {/* ✅ Volunteer Routes */}
      <Route
        path="/volunteer"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerDashboard />
          </ProtectedRoute>
        }
      />

      {/* ✅ If you still use AvailableEvents.jsx (optional) */}
      <Route
        path="/available-events"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <AvailableEvents />
          </ProtectedRoute>
        }
      />

      <Route
        path="/volunteer-my-events"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerMyEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer-history"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer-messages"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerMessage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer-profile"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/volunteer-settings"
        element={
          <ProtectedRoute allowedRole="VOLUNTEER">
            <VolunteerSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certificates"
        element={
          <ProtectedRoute allowedRoles={["VOLUNTEER", "ORGANIZER"]}>
            <Certificates />
          </ProtectedRoute>
        }
      />

      {/* ✅ Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/manage-events"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/event-approval"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminEventApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/complaints"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminComplaints />
          </ProtectedRoute>
        }
        
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminUsers />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/admin/user-verification"
        element={
          <ProtectedRoute allowedRole="ADMIN">
            <AdminUserVerification />
          </ProtectedRoute>
        }
      />
      <Route
        path="/raise-complaint"
        element={
          <ProtectedRoute allowedRoles={["VOLUNTEER", "ORGANIZER"]}>
            <RaiseComplaint />
          </ProtectedRoute>
        }
      />

      {/* ✅ 404 fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
