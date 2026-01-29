import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function VolunteerProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch profile
  useEffect(() => {
    if (!user?.email) return;

    fetch(`${API_BASE}/users/email/${user.email}`)
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
        if (data.profilePicture) setPreview(data.profilePicture);
      })
      .catch(() => alert("Failed to load profile"));
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

  // ✅ Save Profile
  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await fetch(`${API_BASE}/users/update/${user.email}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: userData.contact,
          gender: userData.gender,
          skills: userData.skills,
          profilePicture: userData.profilePicture,

          // ✅ new fields
          occupation: userData.occupation,
          city: userData.city,
          age: userData.age ? Number(userData.age) : null,
          bio: userData.bio,
          availability: userData.availability,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setUserData(updated);

      alert("✅ Profile Updated Successfully!");
    } catch {
      alert("❌ Failed to update profile");
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

      <div className="flex">
        <Sidebar
          role="VOLUNTEER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="grow p-4">
          <h2 className="text-2xl font-bold mb-1">👤 My Profile</h2>
          <p className="text-gray-500 mb-4">
            Update your personal details for better event matching.
          </p>

          <div className="bg-white rounded-2xl shadow p-5 max-w-4xl">
            {/* ✅ Profile Picture */}
            <div className="flex flex-col md:flex-row gap-5 items-center md:items-start">
              <div className="w-full md:w-64">
                <div className="flex flex-col items-center">
                  <img
                    src={
                      preview ||
                      `https://ui-avatars.com/api/?name=${userData.name || "Volunteer"}&background=0D8ABC&color=fff`
                    }
                    alt="Profile"
                    className="w-28 h-28 rounded-full object-cover border"
                  />

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* ✅ Fields */}
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={userData.name || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userData.email || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-700"
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Contact
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={userData.contact || ""}
                      onChange={handleChange}
                      placeholder="Enter mobile number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={userData.gender || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Occupation */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Occupation
                    </label>
                    <input
                      type="text"
                      name="occupation"
                      value={userData.occupation || ""}
                      onChange={handleChange}
                      placeholder="Student / Developer / Teacher"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={userData.city || ""}
                      onChange={handleChange}
                      placeholder="Your city"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Age
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={userData.age || ""}
                      onChange={handleChange}
                      placeholder="Example: 21"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block mb-1 font-semibold text-gray-700">
                      Availability
                    </label>
                    <select
                      name="availability"
                      value={userData.availability || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select</option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Weekends">Weekends</option>
                      <option value="Anytime">Anytime</option>
                      <option value="Evenings Only">Evenings Only</option>
                    </select>
                  </div>

                  {/* Skills */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-semibold text-gray-700">
                      Skills
                    </label>
                    <textarea
                      rows={3}
                      name="skills"
                      value={userData.skills || ""}
                      onChange={handleChange}
                      placeholder="Example: Teaching, Communication, First Aid"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block mb-1 font-semibold text-gray-700">
                      Bio
                    </label>
                    <textarea
                      rows={3}
                      name="bio"
                      value={userData.bio || ""}
                      onChange={handleChange}
                      placeholder="Write a short bio about yourself..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* ✅ Save */}
                <button
                  className="w-full mt-5 px-4 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "✅ Save Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* ✅ Backend reminder */}
          <p className="text-xs text-gray-500 mt-3">
            ⚠️ Make sure backend User.java & update API supports occupation, city,
            age, bio, availability fields.
          </p>
        </div>
      </div>
    </>
  );
}

export default VolunteerProfile;
