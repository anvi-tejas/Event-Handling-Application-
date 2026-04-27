import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const HelpSupport = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("contact");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const faqs = [
    {
      question: "How do I join a volunteer event?",
      answer: "Go to 'Available Events', browse the events, and click 'Join' on any event you're interested in. Your request will be sent to the organizer for approval."
    },
    {
      question: "How do I get my certificate?",
      answer: "After completing an event (attending and getting marked present), you can download your certificate from the 'Certificates' section in the navbar dropdown."
    },
    {
      question: "What if my participation request is rejected?",
      answer: "Organizers may reject requests due to limited spots or specific requirements. You can try joining other events or contact the organizer for more information."
    },
    {
      question: "How do I update my profile?",
      answer: "Go to 'Profile' from the sidebar or navbar dropdown. You can update your skills, contact information, and other details there."
    },
    {
      question: "How can I raise a complaint?",
      answer: "Click the 'Raise Complaint' button below or go to the complaints section. Admin will review and respond to your complaint."
    },
    {
      question: "Why can't I see my certificate?",
      answer: "Certificates are only available for completed events where you had sufficient attendance. Make sure the event has ended and you were marked present."
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          role={user?.role || "VOLUNTEER"}
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🆘</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Help & Support
                </h2>
                <p className="text-gray-600 mt-1">
                  Get help, find answers, and contact our support team
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 inline-flex gap-2">
            <button
              onClick={() => setActiveTab("contact")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "contact"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              📞 Contact Us
            </button>
            <button
              onClick={() => setActiveTab("faq")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                activeTab === "faq"
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              ❓ FAQs
            </button>
          </div>

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-2xl">📬</span>
                  Contact Information
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      📧
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Email</p>
                      <p className="text-gray-800 font-bold">support@volunteerhub.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      📞
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Phone</p>
                      <p className="text-gray-800 font-bold">+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🕒
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Support Hours</p>
                      <p className="text-gray-800 font-bold">Mon – Fri (9 AM – 6 PM)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      📍
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Location</p>
                      <p className="text-gray-800 font-bold">Bangalore, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  Quick Actions
                </h3>

                <div className="space-y-4">
                  <button
                    onClick={() => navigate("/raise-complaint")}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🚨
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold">Raise a Complaint</p>
                      <p className="text-sm text-gray-500">Report issues or problems</p>
                    </div>
                    <span className="ml-auto text-gray-400">→</span>
                  </button>

                  <button
                    onClick={() => navigate("/volunteer-profile")}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      👤
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold">Update Profile</p>
                      <p className="text-sm text-gray-500">Edit your information</p>
                    </div>
                    <span className="ml-auto text-gray-400">→</span>
                  </button>

                  <button
                    onClick={() => navigate("/certificates")}
                    className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-100 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-left"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🏆
                    </div>
                    <div>
                      <p className="text-gray-800 font-bold">View Certificates</p>
                      <p className="text-sm text-gray-500">Download your achievements</p>
                    </div>
                    <span className="ml-auto text-gray-400">→</span>
                  </button>
                </div>

                {/* Support Note */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                  <p className="text-sm font-medium flex items-start gap-2">
                    <span className="text-lg">💡</span>
                    <span>
                      For event issues, complaints, or verification queries, our admin team will assist you within 24-48 hours.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-4xl">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">❓</span>
                Frequently Asked Questions
              </h3>

              <div className="space-y-3">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors duration-200"
                    >
                      <span className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-blue-500">Q:</span>
                        {faq.question}
                      </span>
                      <span
                        className={`text-gray-400 transition-transform duration-300 ${
                          openFaq === index ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                    {openFaq === index && (
                      <div className="px-4 pb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-100">
                        <p className="text-gray-600 pt-3 flex items-start gap-2">
                          <span className="text-green-500 font-bold">A:</span>
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Still need help */}
              <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 text-center">
                <p className="text-gray-600 mb-4">
                  <span className="text-2xl">🤔</span> Still have questions?
                </p>
                <button
                  onClick={() => setActiveTab("contact")}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300"
                >
                  Contact Support →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpSupport;
