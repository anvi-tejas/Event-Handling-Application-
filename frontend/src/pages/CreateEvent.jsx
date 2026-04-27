import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function CreateEvent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isVerified = user?.verificationStatus === "VERIFIED";

  const [eventData, setEventData] = useState({
    title: "",
    category: "",
    description: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    registrationDeadline: "",
    locationName: "",
    address: "",
    city: "",
    area: "",
    mapLink: "",
    requiredVolunteers: "",
    skills: "",
    minAge: "",
    genderPreference: "",
  });

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const validateDeadline = () => {
    if (!eventData.startDate || !eventData.registrationDeadline) return true;

    const start = new Date(eventData.startDate);
    const deadline = new Date(eventData.registrationDeadline);

    const diffDays = (start - deadline) / (1000 * 60 * 60 * 24);

    if (diffDays < 2) {
      alert("❌ Registration deadline must be at least 2 days before event start date");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isVerified) {
      alert("❌ Your account is not verified. You cannot create events.");
      return;
    }

    if (!validateDeadline()) return;

    const payload = {
      ...eventData,
      organizerEmail: user.email,
      requiredVolunteers: Number(eventData.requiredVolunteers),
      minAge: eventData.minAge ? Number(eventData.minAge) : null,
    };

    try {
      const response = await fetch(`${API_BASE}/events/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Failed to create event");
      }

      alert("✅ Event created successfully");
      setEventData({
        title: "",
        category: "",
        description: "",
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        registrationDeadline: "",
        locationName: "",
        address: "",
        city: "",
        area: "",
        mapLink: "",
        requiredVolunteers: "",
        skills: "",
        minAge: "",
        genderPreference: "",
      });
    } catch (error) {
      alert(error.message || "❌ Error creating event");
    }
  };

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8 animate-slide-up max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-linear-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg">
                <span className="text-3xl">✨</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Create New Event
                </h2>
                <p className="text-gray-600 mt-1">
                  Add event details and start accepting volunteers
                </p>
              </div>
            </div>
          </div>

          {/* Verification Warning */}
          {!isVerified && (
            <div className="mb-6 bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-xl max-w-5xl mx-auto">
              ⚠️ Your account is pending verification. You cannot create events yet.
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 max-w-5xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={eventData.title}
                      onChange={handleChange}
                      required
                      placeholder="Enter event title"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={eventData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    >
                      <option value="">Select Category</option>
                      <option value="Cleanup">Cleanup</option>
                      <option value="Disaster Relief">Disaster Relief</option>
                      <option value="Infrastructure">Infrastructure</option>
                      <option value="Awareness Program">Awareness Program</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={eventData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      placeholder="Describe your event..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📅</span>
                  Date & Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={eventData.startDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={eventData.endDate}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      value={eventData.startTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      value={eventData.endTime}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Registration Deadline *
                    </label>
                    <input
                      type="date"
                      name="registrationDeadline"
                      value={eventData.registrationDeadline}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <span>⚠️</span>
                      Deadline must be at least 2 days before start date
                    </p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  Location Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Location Name *
                    </label>
                    <input
                      type="text"
                      name="locationName"
                      value={eventData.locationName}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Central Park"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={eventData.city}
                      onChange={handleChange}
                      required
                      placeholder="Enter city"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      name="address"
                      value={eventData.address}
                      onChange={handleChange}
                      required
                      rows={2}
                      placeholder="Enter complete address"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Volunteer Requirements Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="text-xl">👥</span>
                  Volunteer Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Required Volunteers *
                    </label>
                    <input
                      type="number"
                      name="requiredVolunteers"
                      value={eventData.requiredVolunteers}
                      onChange={handleChange}
                      required
                      min="1"
                      placeholder="Number of volunteers needed"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Skills Required
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={eventData.skills}
                      onChange={handleChange}
                      placeholder="e.g., First Aid, Teaching (optional)"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={!isVerified}
                  className={`w-full py-4 px-6 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    !isVerified
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-linear-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:shadow-2xl hover:shadow-purple-500/50 transform hover:scale-[1.02]"
                  }`}
                >
                  <span className="text-xl">{!isVerified ? "⛔" : "🚀"}</span>
                  <span>{!isVerified ? "Verification Required" : "Create Event"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default CreateEvent;

