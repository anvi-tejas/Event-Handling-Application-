import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VOLUNTEER",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Register failed");

      alert("✅ Registered Successfully!");
      navigate("/login");
    } catch {
      alert("❌ Failed to register");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <span className="text-4xl">📝</span>
            </div>
            <h2 className="text-3xl font-bold mb-2 bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Join Us</h2>
            <p className="text-gray-300">Start making a difference today</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-300">Full Name</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">👤</span>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 placeholder-gray-400 group-hover:bg-white/15 text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-300">Email Address</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">📧</span>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 placeholder-gray-400 group-hover:bg-white/15 text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🔒</span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 placeholder-gray-400 group-hover:bg-white/15 text-white"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium mb-2 text-gray-300">I want to</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🎯</span>
                <select
                  name="role"
                  className="w-full pl-12 pr-5 py-3.5 rounded-xl bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15 cursor-pointer text-white appearance-none"
                  onChange={handleChange}
                  value={form.role}
                >
                  <option value="VOLUNTEER" className="bg-slate-800">🤝 Volunteer</option>
                  <option value="ORGANIZER" className="bg-slate-800">📋 Organizer</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▼</span>
              </div>
            </div>

            <button className="w-full px-5 py-4 rounded-xl bg-linear-to-r from-indigo-600 to-purple-600 font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02] transition-all duration-300 border border-indigo-400/30 mt-6">
              <span className="flex items-center justify-center gap-3">
                <span className="text-xl">✨</span>
                Create Account
              </span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-purple-400 cursor-pointer hover:text-purple-300 font-bold transition-colors duration-300 hover:underline"
              >
                Sign In →
              </span>
            </p>
          </div>

          <div className="mt-6 p-4 bg-green-500/10 border border-green-400/30 rounded-xl">
            <p className="text-xs text-green-300 text-center">
              🌟 Join thousands of volunteers making a difference
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

export default Register;

