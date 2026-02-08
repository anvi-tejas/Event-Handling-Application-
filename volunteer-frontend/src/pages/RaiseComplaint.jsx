import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function RaiseComplaint() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  const submitComplaint = async () => {
    if (!subject || !message || !category) {
      alert("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await fetch(`${API_BASE}/complaints/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raisedByEmail: user.email,
          raisedByRole: user.role,
          subject,
          message,
          category,
          priority,
        }),
      });

      alert("✅ Complaint submitted successfully! Our team will review it shortly.");
      setSubject("");
      setMessage("");
      setCategory("");
      setPriority("MEDIUM");
    } catch {
      alert("❌ Failed to submit complaint");
    } finally {
      setSubmitting(false);
    }
  };

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
              <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🚨</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                  Raise a Complaint
                </h2>
                <p className="text-gray-600 mt-1">
                  Report issues and our admin team will assist you
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Complaint Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                Complaint Details
              </h3>

              <div className="space-y-5">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="">Select a category</option>
                    <option value="Event Issue">🎫 Event Issue</option>
                    <option value="Organizer Behavior">👤 Organizer Behavior</option>
                    <option value="Volunteer Misconduct">⚠️ Volunteer Misconduct</option>
                    <option value="Technical Problem">💻 Technical Problem</option>
                    <option value="Payment/Certificate">📜 Payment / Certificate</option>
                    <option value="Other">📌 Other</option>
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                    placeholder="Brief description of the issue"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: "LOW", label: "🟢 Low", color: "green" },
                      { value: "MEDIUM", label: "🟡 Medium", color: "yellow" },
                      { value: "HIGH", label: "🟠 High", color: "orange" },
                      { value: "URGENT", label: "🔴 Urgent", color: "red" },
                    ].map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => setPriority(p.value)}
                        className={`px-4 py-2 rounded-xl border-2 font-semibold transition-all duration-200 ${
                          priority === p.value
                            ? p.color === "green"
                              ? "bg-green-500 text-white border-green-500"
                              : p.color === "yellow"
                              ? "bg-yellow-500 text-white border-yellow-500"
                              : p.color === "orange"
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-red-500 text-white border-red-500"
                            : "!bg-white !text-gray-700 !border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe Your Issue *
                  </label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 resize-none"
                    rows="6"
                    placeholder="Please provide detailed information about your complaint. Include event names, dates, people involved, and any relevant details..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Tip: The more details you provide, the faster we can resolve your issue
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 py-4 px-6 bg-gray-200 text-gray-700 font-bold rounded-xl shadow-lg hover:bg-gray-300 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>←</span>
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={submitComplaint}
                    disabled={submitting}
                    className="flex-1 py-4 px-6 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-red-500/50 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        <span>Submit Complaint</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6">
              {/* User Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>👤</span> Your Information
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {(user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{user?.name || "User"}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Role:</span>{" "}
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold">
                      {user?.role || "VOLUNTEER"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Guidelines Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border border-amber-200">
                <h4 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <span>📋</span> Guidelines
                </h4>
                <ul className="space-y-2 text-sm text-amber-700">
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Be specific about the issue</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Include dates and event names</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Mention people involved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>Keep language professional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>✓</span>
                    <span>One complaint per issue</span>
                  </li>
                </ul>
              </div>

              {/* Response Time Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                  <span>⏱️</span> Response Time
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🔴 Urgent</span>
                    <span className="font-semibold text-blue-700">4-8 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🟠 High</span>
                    <span className="font-semibold text-blue-700">24 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🟡 Medium</span>
                    <span className="font-semibold text-blue-700">48 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">🟢 Low</span>
                    <span className="font-semibold text-blue-700">3-5 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RaiseComplaint;
