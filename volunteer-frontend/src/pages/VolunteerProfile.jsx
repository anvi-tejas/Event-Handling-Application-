import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function VolunteerProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [showDocModal, setShowDocModal] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch profile - with fallback to localStorage
  useEffect(() => {
    if (!user?.email) return;

    const fetchProfile = async () => {
      try {
        // Try multiple possible endpoints
        let res = await fetch(`${API_BASE}/users/email/${user.email}`);
        
        // Fallback endpoint patterns
        if (!res.ok) {
          res = await fetch(`${API_BASE}/users/${user.email}`);
        }
        if (!res.ok) {
          res = await fetch(`${API_BASE}/api/users/email/${user.email}`);
        }
        
        if (res.ok) {
          const data = await res.json();
          setUserData(data);
          if (data.profilePicture) setPreview(data.profilePicture);
          if (data.documentUrl) setDocumentPreview(data.documentUrl);
          // Save to localStorage for offline access
          localStorage.setItem("userProfile", JSON.stringify(data));
        } else {
          throw new Error("API not available");
        }
      } catch {
        // Fallback to localStorage data
        console.log("Using localStorage fallback for profile");
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          const data = JSON.parse(savedProfile);
          setUserData(data);
          if (data.profilePicture) setPreview(data.profilePicture);
          if (data.documentUrl) setDocumentPreview(data.documentUrl);
        } else {
          // Use basic user data from login
          setUserData({
            ...user,
            contact: user.contact || "",
            gender: user.gender || "",
            skills: user.skills || "",
            occupation: user.occupation || "",
            city: user.city || "",
            age: user.age || "",
            bio: user.bio || "",
            availability: user.availability || "",
            verified: user.verified || false,
          });
        }
      }
    };

    fetchProfile();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Image Upload (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);

      setUserData((prev) => ({
        ...prev,
        profilePicture: reader.result, // ✅ store base64
      }));
    };
    reader.readAsDataURL(file);
  };

  // ✅ Handle Document Upload (Base64)
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or image file (JPG, PNG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should be less than 5MB");
      return;
    }

    setDocumentUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Doc = reader.result;
      setDocumentPreview(base64Doc);

      try {
        const res = await fetch(
          `${API_BASE}/users/upload-document/${encodeURIComponent(user.email)}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentUrl: base64Doc,
              documentName: file.name,
            }),
          }
        );

        if (!res.ok) {
          throw new Error("Upload failed");
        }

        const updated = await res.json();
        setUserData(updated);
        if (updated.documentUrl) setDocumentPreview(updated.documentUrl);
        localStorage.setItem("userProfile", JSON.stringify(updated));

        alert("✅ Document uploaded successfully! Waiting for admin verification.");
      } catch (err) {
        console.error("Document upload error:", err);
        // Save locally as fallback
        const updatedData = {
          ...userData,
          documentUrl: base64Doc,
          documentName: file.name,
          verified: false,
        };
        setUserData(updatedData);
        localStorage.setItem("userProfile", JSON.stringify(updatedData));
        alert("⚠️ Document saved locally. Server sync pending - please ensure backend is running.");
      } finally {
        setDocumentUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // ✅ Save Profile
  const handleSave = async () => {
    try {
      setSaving(true);

      const updatePayload = {
        name: userData.name,
        contact: userData.contact,
        gender: userData.gender,
        skills: userData.skills,
        profilePicture: userData.profilePicture,
        occupation: userData.occupation,
        city: userData.city,
        age: userData.age ? Number(userData.age) : null,
        bio: userData.bio,
        availability: userData.availability,
        documentUrl: userData.documentUrl,
        documentName: userData.documentName,
      };

      // Try multiple endpoint patterns including query params
      const endpoints = [
        { url: `${API_BASE}/users/update/${encodeURIComponent(user.email)}`, method: "PUT" },
        { url: `${API_BASE}/users/update?email=${encodeURIComponent(user.email)}`, method: "PUT" },
        { url: `${API_BASE}/users/${encodeURIComponent(user.email)}`, method: "PUT" },
        { url: `${API_BASE}/api/users/${encodeURIComponent(user.email)}`, method: "PUT" },
      ];

      let res = null;
      let lastError = null;
      let successEndpoint = null;

      for (const { url, method } of endpoints) {
        try {
          console.log(`Trying endpoint: ${url}`);
          res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload),
          });
          console.log(`Response from ${url}:`, res.status, res.statusText);
          if (res.ok) {
            successEndpoint = url;
            break;
          }
        } catch (err) {
          lastError = err;
          console.log(`Endpoint ${url} failed:`, err.message);
        }
      }

      if (res && res.ok) {
        console.log(`Success with endpoint: ${successEndpoint}`);
        const updated = await res.json().catch(() => userData);
        setUserData(updated);
        localStorage.setItem("userProfile", JSON.stringify(updated));
        // Also update the main user in localStorage
        localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
        alert("✅ Profile Updated Successfully!");
      } else {
        const errorText = res ? await res.text().catch(() => "Unknown error") : "Network error";
        console.error("All endpoints failed. Last response:", errorText);
        throw lastError || new Error(`API error: ${errorText}`);
      }
    } catch (err) {
      console.error("Profile save error:", err);
      // Save locally even if API fails
      localStorage.setItem("userProfile", JSON.stringify(userData));
      localStorage.setItem("user", JSON.stringify({ ...user, ...userData }));
      alert("⚠️ Profile saved locally. Server sync pending - please ensure backend is running on port 8080.");
    } finally {
      setSaving(false);
    }
  };

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-white">
        <Sidebar
          role="VOLUNTEER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <span className="text-3xl">👤</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  My Profile
                </h2>
                <p className="text-gray-600 mt-1">
                  Update your personal details for better event matching
                </p>
              </div>
            </div>
          </div>

          {/* Verification Status Banner */}
          <div className={`mb-6 p-4 rounded-2xl border-2 flex items-center gap-4 ${
            userData.verified 
              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300" 
              : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300"
          }`}>
            <div className={`p-3 rounded-xl ${
              userData.verified 
                ? "bg-gradient-to-br from-green-500 to-emerald-600" 
                : "bg-gradient-to-br from-amber-500 to-orange-600"
            }`}>
              <span className="text-2xl">{userData.verified ? "✅" : "⏳"}</span>
            </div>
            <div>
              <h3 className={`font-bold text-lg ${userData.verified ? "text-green-800" : "text-amber-800"}`}>
                {userData.verified ? "Account Verified" : "Verification Pending"}
              </h3>
              <p className={`text-sm ${userData.verified ? "text-green-600" : "text-amber-600"}`}>
                {userData.verified 
                  ? "Your account has been verified by admin. You can now participate in all events." 
                  : "Please upload your ID document for verification. Admin will review and verify your account."}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-5xl border border-gray-100">
            {/* ✅ Profile Picture */}
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="w-full md:w-80">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <img
                      src={
                        preview ||
                        `https://ui-avatars.com/api/?name=${userData.name || "Volunteer"}&background=6366f1&color=fff`
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
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* ✅ Fields */}
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">👤</span> Full Name
                    </label>
                    <input
                      type="text"
                      value={userData.name || ""}
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
                      value={userData.email || ""}
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 cursor-not-allowed"
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">📱</span> Contact
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={userData.contact || ""}
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
                      value={userData.gender || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">👨 Male</option>
                      <option value="Female">👩 Female</option>
                      <option value="Other">🧑 Other</option>
                    </select>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">💼</span> Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={userData.occupation || ""}
                      onChange={handleChange}
                      placeholder="Student / Developer / Teacher"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🏙️</span> City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={userData.city || ""}
                      onChange={handleChange}
                      placeholder="Your city"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🎂</span> Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={userData.age || ""}
                      onChange={handleChange}
                      placeholder="Example: 21"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">📅</span> Availability
                    </label>
                    <select
                      name="availability"
                      value={userData.availability || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Select Availability</option>
                      <option value="Weekdays">📅 Weekdays</option>
                      <option value="Weekends">🏖️ Weekends</option>
                      <option value="Anytime">⏰ Anytime</option>
                      <option value="Evenings Only">🌙 Evenings Only</option>
                    </select>
                  </div>

                  {/* Skills */}
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">🎯</span> Skills
                    </label>
                    <textarea
                      rows={3}
                      name="skills"
                      value={userData.skills || ""}
                      onChange={handleChange}
                      placeholder="Example: Teaching, Communication, First Aid, Leadership..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block mb-2 font-semibold text-gray-700 flex items-center gap-2">
                      <span className="text-lg">📝</span> Bio
                    </label>
                    <textarea
                      rows={4}
                      name="bio"
                      value={userData.bio || ""}
                      onChange={handleChange}
                      placeholder="Write a short bio about yourself and your volunteering interests..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  {/* ✅ Document Upload Section */}
                  <div className="md:col-span-2">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-dashed border-blue-300">
                      <label className="block mb-3 font-semibold text-gray-700 flex items-center gap-2">
                        <span className="text-lg">📄</span> Identity Document (For Verification)
                      </label>
                      <p className="text-sm text-gray-600 mb-4">
                        Upload a government-issued ID (Aadhar, PAN, Passport, Driving License) for account verification.
                        Supported formats: PDF, JPG, PNG (Max 5MB)
                      </p>

                      {/* Current Document Status */}
                      {documentPreview || userData.documentUrl ? (
                        <div className="mb-4 p-4 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${userData.verified ? "bg-green-100" : "bg-amber-100"}`}>
                                <span className="text-xl">{userData.verified ? "✅" : "📋"}</span>
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {userData.documentName || "Document Uploaded"}
                                </p>
                                <p className={`text-sm ${userData.verified ? "text-green-600" : "text-amber-600"}`}>
                                  {userData.verified ? "Verified by Admin" : "Pending Verification"}
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
                      ) : null}

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
                                {userData.documentUrl ? "Upload New Document" : "Click to Upload Document"}
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

                {/* ✅ Save */}
                <button
                  className="w-full mt-8 px-6 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl hover:shadow-indigo-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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

          {/* ✅ Backend reminder */}
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <p className="text-sm text-yellow-900">
                <b>Tip:</b> Upload your ID document for verification. Once verified by admin, you'll receive a confirmation email and gain access to all features.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      {showDocModal && (documentPreview || userData?.documentUrl) && (
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
                  <p className="text-sm text-gray-600">{userData?.documentName || "Uploaded Document"}</p>
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
                {(documentPreview || userData?.documentUrl)?.includes("application/pdf") || 
                 (documentPreview || userData?.documentUrl)?.includes("data:application/pdf") ? (
                  <object
                    data={documentPreview || userData?.documentUrl}
                    type="application/pdf"
                    className="w-full h-[500px]"
                  >
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <span className="text-6xl mb-4">📄</span>
                      <p className="text-gray-600 mb-4">PDF preview not supported in this browser</p>
                      <a
                        href={documentPreview || userData?.documentUrl}
                        download={userData?.documentName || "document.pdf"}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        ⬇️ Download PDF
                      </a>
                    </div>
                  </object>
                ) : (
                  <img
                    src={documentPreview || userData?.documentUrl}
                    alt="Document"
                    className="max-w-full max-h-[500px] object-contain"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 shrink-0 flex justify-between items-center">
              <a
                href={documentPreview || userData?.documentUrl}
                download={userData?.documentName || "document"}
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

export default VolunteerProfile;

