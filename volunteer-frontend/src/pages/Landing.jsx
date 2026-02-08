import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import ChatBot from "../components/ChatBot";

import "./Landing.css";

function Landing() {
  const navigate = useNavigate();

  const stats = [
    { number: "10K+", label: "Active Volunteers", icon: "👥" },
    { number: "500+", label: "Events Completed", icon: "🎉" },
    { number: "50+", label: "Partner Organizations", icon: "🏢" },
    { number: "100K+", label: "Hours Contributed", icon: "⏱️" },
  ];

  const features = [
    {
      icon: "🎯",
      title: "Smart Event Matching",
      description: "AI-powered recommendations match you with events based on your skills, interests, and availability.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: "📊",
      title: "Real-time Analytics",
      description: "Track your impact with detailed dashboards showing hours contributed, events attended, and achievements.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: "🏆",
      title: "Digital Certificates",
      description: "Earn verified certificates for your contributions that you can share on LinkedIn and other platforms.",
      color: "from-amber-500 to-orange-500"
    },
    {
      icon: "💬",
      title: "Seamless Communication",
      description: "Stay connected with organizers and fellow volunteers through built-in messaging and notifications.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: "📱",
      title: "Mobile Responsive",
      description: "Access the platform anywhere, anytime. Our responsive design works perfectly on all devices.",
      color: "from-red-500 to-rose-500"
    },
    {
      icon: "🔒",
      title: "Secure & Verified",
      description: "All users are verified by admins ensuring a safe and trustworthy volunteering community.",
      color: "from-indigo-500 to-violet-500"
    }
  ];

  const howItWorks = [
    { step: "01", title: "Create Account", description: "Sign up and complete your profile with skills and interests", icon: "📝" },
    { step: "02", title: "Get Verified", description: "Upload documents for admin verification within 24 hours", icon: "✅" },
    { step: "03", title: "Browse Events", description: "Explore available volunteer opportunities near you", icon: "🔍" },
    { step: "04", title: "Make Impact", description: "Participate, earn certificates, and change lives", icon: "🌟" }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Student Volunteer",
      text: "VolunteerHub made it so easy to find meaningful opportunities. I've contributed over 200 hours and earned multiple certificates!",
      avatar: "👩‍🎓"
    },
    {
      name: "Rajesh Kumar",
      role: "Event Organizer",
      text: "Managing volunteers has never been easier. The platform streamlines everything from registration to attendance tracking.",
      avatar: "👨‍💼"
    },
    {
      name: "Ananya Patel",
      role: "NGO Coordinator",
      text: "We've partnered with VolunteerHub for 2 years. The quality of volunteers and professional management is outstanding.",
      avatar: "👩‍💻"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-slate-900/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
              🌍
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              VolunteerHub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-5 py-2 text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-sm text-gray-300">Trusted by 10,000+ volunteers worldwide</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
              Make Every Hour
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Count
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            The most powerful platform for connecting passionate volunteers with 
            meaningful opportunities. Track impact, earn certificates, make a difference.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-16">
            <button
              onClick={() => navigate("/register")}
              className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl font-semibold text-lg shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                Start Volunteering
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-white/5 border border-white/20 rounded-2xl font-semibold text-lg backdrop-blur-sm hover:bg-white/10 hover:border-white/30 transform hover:scale-105 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                🎥 Watch Demo
              </span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-950/50 to-slate-900"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium">
              FEATURES
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Volunteer Smarter</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Powerful tools designed to streamline your volunteering journey from discovery to certification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-950/50 to-purple-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-sm font-medium">
              HOW IT WORKS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4">
              Get Started in
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> 4 Simple Steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent z-0"></div>
                )}
                <div className="relative z-10 text-center">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl flex items-center justify-center">
                    <span className="text-4xl">{item.icon}</span>
                  </div>
                  <div className="text-purple-400 font-bold text-sm mb-2">STEP {item.step}</div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium">
              TESTIMONIALS
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mt-6 mb-4">
              Loved by
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"> Volunteers & Organizers</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-2xl">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-white">{t.name}</div>
                    <div className="text-sm text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 md:p-16 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-32 -mb-32 blur-2xl"></div>
            
            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of volunteers who are creating positive change in their communities. 
                Your journey to meaningful impact starts here.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <button
                  onClick={() => navigate("/register")}
                  className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white/10 border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/20 transform hover:scale-105 transition-all"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ChatBot */}
      <ChatBot />

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;

