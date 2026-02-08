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
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "ORGANIZER",
    contact: "",
    gender: "",
    skills: "",
    organizationName: "",
    city: "",
    bio: "",
    profilePicture: "",
    documentUrl: "",
    documentName: "",
    verificationStatus: "PENDING",
    verified: false,
  });

  // ================= LOAD PROFILE =================
  const loadProfile = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/users/email/${user.email}`);
      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      const verified = data.verificationStatus === "VERIFIED";

      const profile = {
        name: data.name || "",
        email: data.email || "",
        role: data.role || "ORGANIZER",
        contact: data.contact || "",
        gender: data.gender || "",
        skills: data.skills || "",
        organizationName: data.organizationName || "",
        city: data.city || "",
        bio: data.bio || "",
        profilePicture: data.profilePicture || "",
        documentUrl: data.documentUrl || "",
        documentName: data.documentName || "",
        verificationStatus: data.verificationStatus || "PENDING",
        verified,
      };

      setForm(profile);
      if (profile.profilePicture) setPreview(profile.profilePicture);
      if (profile.documentUrl) setDocumentPreview(profile.documentUrl);

      localStorage.setItem("organizerProfile", JSON.stringify(profile));
      localStorage.setItem("user", JSON.stringify({ ...user, ...profile }));
    } catch (err) {
      console.log("Fallback to localStorage");
      const cached = localStorage.getItem("organizerProfile");
      if (cached) {
        const data = JSON.parse(cached);
        setForm(data);
        if (data.profilePicture) setPreview(data.profilePicture);
        if (data.documentUrl) setDocumentPreview(data.documentUrl);
      }
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

  // ================= PROFILE IMAGE =================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setForm((prev) => ({ ...prev, profilePicture: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // ================= DOCUMENT UPLOAD =================
  const handleDocumentUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setMessage("❌ Please upload a PDF or image file (JPG, PNG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("❌ File size must be under 5MB");
      return;
    }

    setDocumentUploading(true);
    setMessage("");

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const payload = {
          documentUrl: reader.result,
          documentName: file.name,
        };

        const res = await fetch(
          `${API_BASE}/users/update/${encodeURIComponent(form.email)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error("Upload failed");

        const updated = {
          ...form,
          documentUrl: reader.result,
          documentName: file.name,
          verificationStatus: "PENDING",
          verified: false,
        };

        setForm(updated);
        setDocumentPreview(reader.result);
        localStorage.setItem("organizerProfile", JSON.stringify(updated));

        setMessage("✅ Document uploaded successfully! Waiting for admin verification.");
      } catch (err) {
        // Save locally even if API fails
        const updated = {
          ...form,
          documentUrl: reader.result,
          documentName: file.name,
          verificationStatus: "PENDING",
          verified: false,
        };
        setForm(updated);
        setDocumentPreview(reader.result);
        localStorage.setItem("organizerProfile", JSON.stringify(updated));
        setMessage("⚠️ Document saved locally. Server sync pending.");
      } finally {
        setDocumentUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  // ================= SAVE PROFILE =================
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const payload = {
        contact: form.contact,
        gender: form.gender,
        skills: form.skills,
        organizationName: form.organizationName,
        city: form.city,
        bio: form.bio,
        profilePicture: form.profilePicture,
      };

      const res = await fetch(
        `${API_BASE}/users/update/${encodeURIComponent(form.email)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Save failed");

      const updated = { ...form };
      localStorage.setItem("organizerProfile", JSON.stringify(updated));
      localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));

      setMessage("✅ Profile updated successfully!");
    } catch {
      // Save locally even if API fails
      localStorage.setItem("organizerProfile", JSON.stringify(form));
      localStorage.setItem("user", JSON.stringify({ ...user, ...form }));
      setMessage("⚠️ Profile saved locally. Server sync pending.");
    } finally {
      setSaving(false);
    }
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <>
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex min-h-screen bg-white">
          <Sidebar role="ORGANIZER" isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 font-medium">Loading profile...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ================= UI =================
  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />
      <div className="flex min-h-screen bg-white">
        <Sidebar role="ORGANIZER" isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

        <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🏢</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Organizer Profile
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your profile and organization details
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div className={`mb-6 p-4 rounded-2xl border-2 flex items-center gap-4 ${
            form.verified 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300" 
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300"
          }`}>
            <div className={`p-3 rounded-xl ${
              form.verified 
                ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                : "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}>
              <span className="text-2xl">{form.verified ? "✅" : "⏳"}</span>
            </div>
            <div>
              <h3 className={`font-bold text-lg ${form.verified ? "text-green-800" : "text-amber-800"}`}>
                {form.verified ? "Account Verified" : "Verification Pending"}
              </h3>
              <p className={`text-sm ${form.verified ? "text-green-600" : "text-amber-600"}`}>
                {form.verified 
                  ? "You can create and manage events. Your organization is verified." 
                  : "Upload your organization document for verification. Admin will review and verify your account."}
              </p>
            </div>
          </div>

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl border border-gray-100">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              
              {/* Profile Picture Section */}
              <div className="w-full md:w-80">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <img
                      src={
                        preview ||
                        `https://ui-avatars.com/api/?name=${form.name || "Organizer"}&background=6366f1&color=fff&size=150`
                      }
                      alt="Profile"
                      className="w-36 h-36 rounded-full object-cover border-4 border-indigo-200 shadow-lg group-hover:shadow-2xl transition-all duration-300"
                    />
                    <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>

                  <div className="w-full mt-4">
                    <label className="block text-center">
                      <span className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold cursor-pointer hover:shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 inline-block">
                        📷 Change Photo
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 w-full bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                      <p className="text-indigo-600 font-bold">Event Organizer</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">👤</span> Full Name
                    </label>
                    <input
                      type="text"
                      value={form.name || ""}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">📧</span> Email
                    </label>
                    <input
                      type="email"
                      value={form.email || ""}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Organization Name */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🏢</span> Organization Name
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={form.organizationName || ""}
                      onChange={handleChange}
                      placeholder="Your organization name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">📱</span> Contact Number
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={form.contact || ""}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">⚧</span> Gender
                    </label>
                    <select
                      name="gender"
                      value={form.gender || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">👨 Male</option>
                      <option value="Female">👩 Female</option>
                      <option value="Other">🧑 Other</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🏙️</span> City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={form.city || ""}
                      onChange={handleChange}
                      placeholder="Your city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Skills / Expertise */}
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🎯</span> Skills / Expertise
                    </label>
                    <textarea
                      rows={3}
                      name="skills"
                      value={form.skills || ""}
                      onChange={handleChange}
                      placeholder="Event Management, Community Outreach, Project Coordination..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">📝</span> About / Bio
                    </label>
                    <textarea
                      rows={4}
                      name="bio"
                      value={form.bio || ""}
                      onChange={handleChange}
                      placeholder="Tell us about yourself and your organization's mission..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Document Upload Section */}
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-dashed border-blue-300">
                      <label className="block mb-3 font-semibold text-gray-700 flex items-center gap-2">
                        <span className="text-lg">📄</span> Organization Document (For Verification)
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload organization registration certificate, NGO certificate, or any official document for verification.
                        Supported formats: PDF, JPG, PNG (Max 5MB)
                      </p>

                      {/* Current Document Status */}
                      {(documentPreview || form.documentUrl) && (
                        <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${form.verified ? "bg-green-100" : "bg-amber-100"}`}>
                                <span className="text-xl">{form.verified ? "✅" : "📋"}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {form.documentName || "Document Uploaded"}
                                </p>
                                <p className={`text-sm ${form.verified ? "text-green-600" : "text-amber-600"}`}>
                                  {form.verified ? "Verified by Admin" : "Pending Verification"}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => setShowDocModal(true)}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
                            >
                              👁️ View
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Upload Button */}
                      <label className="block">
                        <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                          documentUploading 
                            ? "border-gray-300 bg-gray-50" 
                            : "border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                        }`}>
                          {documentUploading ? (
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                              <p className="text-blue-600 font-semibold">Uploading document...</p>
                            </div>
                          ) : (
                            <>
                              <span className="text-4xl mb-2">📤</span>
                              <p className="text-blue-600 font-semibold">
                                {form.documentUrl ? "Upload New Document" : "Click to Upload Document"}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                            </>
                          )}
                        </div>
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleDocumentUpload}
                          disabled={documentUploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {message && (
                  <div className={`mt-6 p-4 rounded-xl ${
                    message.includes("✅") 
                      ? "bg-green-50 border border-green-200 text-green-700" 
                      : message.includes("⚠️")
                      ? "bg-yellow-50 border border-yellow-200 text-yellow-700"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Save Button */}
                <button
                  className="w-full mt-8 px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/50 transform hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </span>
                  ) : (
                    "✅ Save Profile"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Tip Section */}
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-yellow-900">
                <b>Tip:</b> Complete your profile and upload organization documents for faster verification. Once verified, you can create and manage volunteer events.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showDocModal && (documentPreview || form.documentUrl) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-xl">
                  <span className="text-2xl">📄</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800">Document Preview</h3>
                  <p className="text-sm text-gray-600">{form.documentName || "Uploaded Document"}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocModal(false)}
                className="p-2 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 hover:text-gray-800 text-xl"
              >
                ✖
              </button>
            </div>

            {/* Document Content */}
            <div className="p-4 flex-1 overflow-auto bg-gray-100">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px] flex items-center justify-center">
                {(documentPreview || form.documentUrl)?.includes("application/pdf") || 
                 (documentPreview || form.documentUrl)?.includes("data:application/pdf") ? (
                  <object
                    data={documentPreview || form.documentUrl}
                    type="application/pdf"
                    className="w-full h-[500px]"
                  >
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <span className="text-6xl mb-4">📄</span>
                      <p className="text-gray-600 mb-4">PDF preview not supported in this browser</p>
                      <a
                        href={documentPreview || form.documentUrl}
                        download={form.documentName || "document.pdf"}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        ⬇️ Download PDF
                      </a>
                    </div>
                  </object>
                ) : (
                  <img
                    src={documentPreview || form.documentUrl}
                    alt="Document"
                    className="max-w-full max-h-[500px] object-contain"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0 flex justify-between items-center">
              <a
                href={documentPreview || form.documentUrl}
                download={form.documentName || "document"}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl font-semibold hover:bg-indigo-200 transition-colors flex items-center gap-2"
              >
                <span>⬇️</span> Download
              </a>
              <button
                onClick={() => setShowDocModal(false)}
                className="px-6 py-2.5 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default OrganizerProfile;
