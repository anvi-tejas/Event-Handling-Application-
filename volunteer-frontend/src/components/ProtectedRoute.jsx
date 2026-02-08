import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Support multiple roles (allowedRoles array) or single role (allowedRole string)
  if (allowedRoles && Array.isArray(allowedRoles)) {
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/" />;
    }
  } else if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute;
