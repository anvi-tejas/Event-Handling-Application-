import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function EditEvent() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // ✅ Load existing event data
  const loadEvent = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      
      // Fetch all events by organizer and find the specific one
      const res = await fetch(`${API_BASE}/events/organizer/${user.email}`);
      if (!res.ok) {
        alert("Failed to load events");
        navigate("/my-events");
        return;
      }

      const events = await res.json();
      const data = events.find((e) => e.id === parseInt(eventId) || e.id === eventId);
      
      if (!data) {
        alert("Event not found");
        navigate("/my-events");
        return;
      }
      
      // Check if event has already started
      const today = new Date();
      const startDate = new Date(data.startDate);
      
      if (today >= startDate) {
        alert("❌ Cannot edit event that has already started");
        navigate("/my-events");
        return;
      }

      setEventData({
        title: data.title || "",
        category: data.category || "",
        description: data.description || "",
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        startTime: data.startTime || "",
        endTime: data.endTime || "",
        registrationDeadline: data.registrationDeadline || "",
        locationName: data.locationName || "",
        address: data.address || "",
        city: data.city || "",
        area: data.area || "",
        mapLink: data.mapLink || "",
        requiredVolunteers: data.requiredVolunteers || "",
        skills: data.skills || "",
        minAge: data.minAge || "",
        genderPreference: data.genderPreference || "",
      });
    } catch {
      alert("Error loading event");
      navigate("/my-events");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadEvent();
  }, [eventId]);

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

    const user = JSON.parse(localStorage.getItem("user"));

    if (!validateDeadline()) return;

    const payload = {
      ...eventData,
      organizerEmail: user.email,
      requiredVolunteers: Number(eventData.requiredVolunteers),
      minAge: eventData.minAge ? Number(eventData.minAge) : null,
    };

    try {
      const response = await fetch(`${API_BASE}/events/update/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const msg = await response.text();
        throw new Error(msg || "Failed to update event");
      }

      alert("✅ Event updated successfully");
      navigate("/my-events");
    } catch (error) {
      alert(error.message || "❌ Error updating event");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar toggleSidebar={() => setSidebarOpen(true)} />
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <Sidebar
            role="ORGANIZER"
            isOpen={sidebarOpen}
            closeSidebar={() => setSidebarOpen(false)}
          />
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">⏳</div>
              <p className="text-gray-600 font-semibold">Loading event details...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar toggleSidebar={() => setSidebarOpen(true)} />

      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Sidebar
          role="ORGANIZER"
          isOpen={sidebarOpen}
          closeSidebar={() => setSidebarOpen(false)}
        />

        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8 animate-slide-up max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg">
                <span className="text-3xl">✏️</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                  Edit Event
                </h2>
                <p className="text-gray-600 mt-1">
                  Update event details before it starts
                </p>
              </div>
            </div>
          </div>

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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 resize-none"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
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
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/my-events")}
                  className="flex-1 py-4 px-6 bg-gray-200 text-gray-700 font-bold rounded-xl shadow-lg hover:bg-gray-300 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">←</span>
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-amber-500/50 transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span className="text-xl">💾</span>
                  <span>Update Event</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditEvent;
