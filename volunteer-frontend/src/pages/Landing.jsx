import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";

import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex flex-col">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 relative z-10">
        <div className="max-w-4xl text-center">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
              VolunteerHub 🌍
            </h1>
            <div className="h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-6"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-10 leading-relaxed animate-slide-up">
            Empowering communities through seamless volunteer management
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-slide-up-delay">
            <button
              onClick={() => navigate("/login")}
              className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold text-lg shadow-2xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                🔑 Login
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={() => navigate("/register")}
              className="group relative px-8 py-4 rounded-2xl border-2 border-white/30 font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/50 transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <span className="flex items-center gap-2">
                📝 Register
              </span>
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-slow">
            <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-lg font-bold mb-2">Connect</h3>
              <p className="text-sm text-gray-400">Join meaningful causes</p>
            </div>
            <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold mb-2">Manage</h3>
              <p className="text-sm text-gray-400">Track participation</p>
            </div>
            <div className="backdrop-blur-md bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2">Impact</h3>
              <p className="text-sm text-gray-400">Make a difference</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
