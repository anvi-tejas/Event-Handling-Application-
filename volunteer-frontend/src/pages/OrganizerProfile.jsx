import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function OrganizerProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    contact: "",
    gender: "",
    skills: "",
    profilePicture: "",
  });

  // ================= LOAD PROFILE =================
  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/users/email/${user.email}`);
      if (!res.ok) throw new Error("Failed to load profile");

      const data = await res.json();

      setForm({
        name: data.name || "",
        email: data.email || "",
        role: data.role || "ORGANIZER",
        contact: data.contact || "",
        gender: data.gender || "",
        skills: data.skills || "",
        profilePicture: data.profilePicture || "",
      });
    } catch {
      setMessage("❌ Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) loadProfile();
  }, []);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        profilePicture: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetch(
        `${API_BASE}/users/update/${form.email}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact: form.contact,
            gender: form.gender,
            skills: form.skills,
            profilePicture: form.profilePicture,
          }),
        }
      );

      if (!res.ok) throw new Error();

      setMessage("✅ Profile updated successfully");
    } catch {
      setMessage("❌ Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  // ================= UI =================
  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8 max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Organizer Profile
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your personal details and preferences
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 text-indigo-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
              <div className="animate-spin text-3xl">⏳</div>
              <div>
                <div className="font-bold text-lg">Loading Profile...</div>
                <div className="text-sm text-indigo-600">Please wait while we fetch your details</div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              {/* Profile Image Section */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8 border border-indigo-100">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative group">
                    <img
                      src={
                        form.profilePicture ||
                        `https://ui-avatars.com/api/?name=${form.name}&background=6366f1&color=fff`
                      }
                      alt="profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">Change</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-800 mb-1">{form.name}</h3>
                    <p className="text-gray-600 mb-3">{form.email}</p>
                    <label className="inline-block cursor-pointer px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-200">
                      📷 Change Photo
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <span>👤</span>
                        <span>Name</span>
                      </span>
                    </label>
                    <input
                      value={form.name}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <span>📧</span>
                        <span>Email</span>
                      </span>
                    </label>
                    <input
                      value={form.email}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <span>🎭</span>
                        <span>Role</span>
                      </span>
                    </label>
                    <input
                      value={form.role}
                      disabled
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-500 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <span>📞</span>
                        <span>Contact</span>
                      </span>
                    </label>
                    <input
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <span>⚧</span>
                        <span>Gender</span>
                      </span>
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      <option value="">Select Gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      <span className="inline-flex items-center gap-2">
                        <span>🧠</span>
                        <span>Skills</span>
                      </span>
                    </label>
                    <input
                      name="skills"
                      value={form.skills}
                      onChange={handleChange}
                      placeholder="Leadership, Management, Communication..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Message Alert */}
              {message && (
                <div className={`mt-6 p-4 rounded-xl border-2 font-medium flex items-center gap-3 ${
                  message.includes('✅') 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
                    : 'bg-gradient-to-r from-red-50 to-red-100 border-red-200 text-red-800'
                }`}>
                  <span className="text-2xl">{message.includes('✅') ? '✅' : '❌'}</span>
                  <span>{message}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      <span>Saving...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>💾</span>
                      <span>Save Changes</span>
                    </span>
                  )}
                </button>

                <button
                  onClick={loadProfile}
                  disabled={loading || saving}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default OrganizerProfile;
