import { useNavigate } from "react-router-dom";

function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="w-full bg-slate-900 border-b border-white/10 px-4 py-3 flex justify-between items-center">
      <button
        className="md:hidden text-white px-3 py-2 border border-white/20 rounded"
        onClick={toggleSidebar}
      >
        ☰
      </button>

      <h2 className="text-white font-bold text-lg">
        VolunteerHub 🚀
      </h2>

      <div className="flex items-center gap-3">
        <span className="text-white text-sm hidden md:inline">
          {user?.name || "User"}
        </span>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;
