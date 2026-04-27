import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Invalid credentials");

      const data = await res.json();
      localStorage.setItem("user", JSON.stringify(data));

      if (data.role === "ORGANIZER") navigate("/organizer");
      else if (data.role === "VOLUNTEER") navigate("/volunteer");
      else navigate("/admin");
    } catch {
      alert("❌ Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-4xl">🔑</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-gray-300">Continue your volunteer journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                  📧
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 placeholder-gray-400 group-hover:bg-white/15 text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">
                  🔒
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-4 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 placeholder-gray-400 group-hover:bg-white/15 text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button className="w-full px-5 py-4 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all duration-300 border border-indigo-400/30 mt-8">
              <span className="flex items-center justify-center gap-3">
                <span className="text-xl">✨</span>
                Sign In
              </span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-300">
              New to VolunteerHub?{" "}
              <span
                onClick={() => navigate("/register")}
                className="text-purple-400 cursor-pointer hover:text-purple-300 font-bold transition-colors duration-300 hover:underline"
              >
                Create Account →
              </span>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-400/30 rounded-xl">
            <p className="text-xs text-blue-300 text-center">
              🔐 Secure login with encrypted credentials
            </p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-gray-400 hover:text-white transition-colors duration-300 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
