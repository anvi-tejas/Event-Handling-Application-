function Footer() {
  return (
    <footer className="relative z-10 bg-slate-950/80 backdrop-blur-sm text-gray-300 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* ✅ Brand */}
          <div>
            <h2 className="text-xl font-bold text-white">VolunteerHub</h2>
            <p className="text-sm mt-2 text-gray-400">
              A community volunteer management platform to create, join and manage events easily.
            </p>
          </div>

          {/* ✅ Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-white cursor-pointer">Home</li>
              <li className="hover:text-white cursor-pointer">Events</li>
              <li className="hover:text-white cursor-pointer">About</li>
              <li className="hover:text-white cursor-pointer">Contact</li>
            </ul>
          </div>

          {/* ✅ Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Contact</h3>
            <p className="text-sm text-gray-400">📧 support@volunteerhub.com</p>
            <p className="text-sm text-gray-400 mt-1">📍 India</p>

            <div className="flex gap-3 mt-4">
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition">
                🌐
              </span>
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition">
                💬
              </span>
              <span className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 cursor-pointer transition">
                📷
              </span>
            </div>
          </div>

        </div>

        {/* ✅ Bottom Text */}
        <div className="border-t border-white/10 mt-8 pt-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} VolunteerHub. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
