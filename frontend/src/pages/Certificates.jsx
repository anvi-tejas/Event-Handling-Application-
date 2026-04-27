import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { API_BASE } from "../config";

function Certificates() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState("");
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isOrganizer = user?.role === "ORGANIZER";

  // For Volunteer
  const [volunteerData, setVolunteerData] = useState([]);
  const [eventsMap, setEventsMap] = useState({});

  // Certificate Edit & Preview States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [certificateData, setCertificateData] = useState({
    volunteerName: "",
    eventTitle: "",
    organizationName: "VolunteerHub",
    certificateTitle: "Certificate of Appreciation",
    subtitle: "For Outstanding Volunteer Service",
    description: "",
    issueDate: new Date().toLocaleDateString(),
    signatoryName: "",
    signatoryTitle: "Event Organizer",
    badgeEmoji: "🏆",
    primaryColor: "#d4af37",
    accentColor: "#667eea"
  });
  const previewRef = useRef(null);

  // For Organizer
  const [organizerEvents, setOrganizerEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  // ✅ Helper: Get all dates between start and end
  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  // ✅ Helper: Calculate attendance percentage from daily records
  const calculateAttendancePercentage = async (eventId, volunteerEmail, eventStartDate, eventEndDate) => {
    try {
      const allDates = getDatesBetween(eventStartDate, eventEndDate);
      if (allDates.length === 0) return 0;

      let presentCount = 0;

      // Fetch attendance for each date
      for (const date of allDates) {
        try {
          const res = await fetch(
            `${API_BASE}/participations/attendance/list?eventId=${eventId}&date=${date}`
          );
          if (res.ok) {
            const data = await res.json();
            const record = (Array.isArray(data) ? data : []).find(
              (r) => r.volunteerEmail === volunteerEmail
            );
            if (record && record.attended === true) {
              presentCount++;
            }
          }
        } catch {
          // Skip this date if fetch fails
        }
      }

      return Math.round((presentCount / allDates.length) * 100);
    } catch {
      return 0;
    }
  };

  // ✅ Load events map for names
  const loadEventsMap = async () => {
    try {
      const res = await fetch(`${API_BASE}/events/all`);
      const data = await res.json();
      const map = {};
      (Array.isArray(data) ? data : []).forEach((e) => {
        map[e.id] = e;
      });
      setEventsMap(map);
    } catch {}
  };

  // ✅ Volunteer: Load their completed participations with attendance
  const loadVolunteerCertificates = async () => {
    try {
      setLoading(true);
      if (!user?.email) return;

      const res = await fetch(`${API_BASE}/participations/volunteer/${user.email}`);
      if (!res.ok) {
        setVolunteerData([]);
        return;
      }

      const participations = await res.json();
      const approvedParts = Array.isArray(participations)
        ? participations.filter((p) => p.status === "APPROVED")
        : [];

      // Get completed events with attendance data
      const today = new Date();
      const completedData = [];

      for (const part of approvedParts) {
        const event = eventsMap[part.eventId];
        if (!event) continue;

        const endDate = new Date(event.endDate);
        if (today <= endDate) continue; // Event not completed

        // Fetch organizer name
        let organizerName = "Event Organizer";
        try {
          if (event.organizerEmail) {
            const orgRes = await fetch(`${API_BASE}/users/email/${event.organizerEmail}`);
            if (orgRes.ok) {
              const orgData = await orgRes.json();
              organizerName = orgData.name || "Event Organizer";
            }
          }
        } catch {
          organizerName = "Event Organizer";
        }

        // Calculate attendance from daily records
        try {
          const attendancePercentage = await calculateAttendancePercentage(
            part.eventId,
            user.email,
            event.startDate,
            event.endDate
          );

          completedData.push({
            ...part,
            event: { ...event, organizerName },
            attendancePercentage: attendancePercentage || 0,
            certificateEligible: attendancePercentage >= 75,
          });
        } catch {
          completedData.push({
            ...part,
            event: { ...event, organizerName },
            attendancePercentage: 0,
            certificateEligible: false,
          });
        }
      }

      setVolunteerData(completedData);
    } catch (err) {
      console.error(err);
      setVolunteerData([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Organizer: Load their events
  const loadOrganizerEvents = async () => {
    try {
      setLoading(true);
      if (!user?.email) return;

      const res = await fetch(`${API_BASE}/events/organizer/${user.email}`);
      const data = await res.json();
      
      // Filter completed events only
      const today = new Date();
      const completedEvents = (Array.isArray(data) ? data : []).filter((e) => {
        const endDate = new Date(e.endDate);
        return today > endDate;
      });

      setOrganizerEvents(completedEvents);
    } catch {
      setOrganizerEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Organizer: Load volunteers for selected event
  const loadEventVolunteers = async (eventId) => {
    if (!eventId) {
      setVolunteers([]);
      return;
    }

    try {
      // First get the event details to know start/end dates
      const selectedEvent = organizerEvents.find(e => e.id === parseInt(eventId) || e.id === eventId);
      if (!selectedEvent) {
        setVolunteers([]);
        return;
      }

      const res = await fetch(`${API_BASE}/participations/event/${eventId}`);
      const data = await res.json();
      
      const approvedVolunteers = (Array.isArray(data) ? data : []).filter(
        (p) => p.status === "APPROVED"
      );

      // Fetch attendance for each volunteer
      const volunteersWithAttendance = await Promise.all(
        approvedVolunteers.map(async (vol) => {
          try {
            // Calculate attendance from daily records
            const attendancePercentage = await calculateAttendancePercentage(
              eventId,
              vol.volunteerEmail,
              selectedEvent.startDate,
              selectedEvent.endDate
            );

            // Fetch volunteer name
            let volunteerName = vol.volunteerEmail;
            try {
              const userRes = await fetch(`${API_BASE}/users/email/${vol.volunteerEmail}`);
              if (userRes.ok) {
                const userData = await userRes.json();
                volunteerName = userData.name || vol.volunteerEmail;
              }
            } catch {}

            return {
              ...vol,
              volunteerName,
              attendancePercentage: attendancePercentage || 0,
              certificateEligible: attendancePercentage >= 75,
            };
          } catch {
            return {
              ...vol,
              volunteerName: vol.volunteerEmail,
              attendancePercentage: 0,
              certificateEligible: false,
            };
          }
        })
      );

      setVolunteers(volunteersWithAttendance);
    } catch {
      setVolunteers([]);
    }
  };

  useEffect(() => {
    loadEventsMap();
  }, []);

  useEffect(() => {
    if (Object.keys(eventsMap).length > 0 || isOrganizer) {
      if (isOrganizer) {
        loadOrganizerEvents();
      } else {
        loadVolunteerCertificates();
      }
    }
  }, [eventsMap, isOrganizer]);

  useEffect(() => {
    if (selectedEvent) {
      loadEventVolunteers(selectedEvent);
    }
  }, [selectedEvent]);

  // ✅ Download certificate
  const generateCertificateHTML = (data) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Volunteer Certificate</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Georgia', serif; 
            background: linear-gradient(135deg, ${data.accentColor} 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
          }
          .certificate {
            background: white;
            width: 800px;
            padding: 60px;
            border: 8px double ${data.primaryColor};
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            position: relative;
          }
          .certificate::before {
            content: '';
            position: absolute;
            top: 20px;
            left: 20px;
            right: 20px;
            bottom: 20px;
            border: 2px solid ${data.primaryColor};
            pointer-events: none;
          }
          .header { color: ${data.primaryColor}; font-size: 16px; letter-spacing: 4px; margin-bottom: 20px; }
          .title { font-size: 48px; color: #333; margin-bottom: 10px; font-weight: bold; }
          .subtitle { font-size: 18px; color: #666; margin-bottom: 40px; }
          .presented { font-size: 14px; color: #888; margin-bottom: 10px; }
          .name { font-size: 36px; color: #4a4a4a; font-style: italic; margin-bottom: 30px; border-bottom: 2px solid ${data.primaryColor}; display: inline-block; padding-bottom: 10px; }
          .description { font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 30px; }
          .event-name { font-weight: bold; color: ${data.accentColor}; }
          .badge { font-size: 60px; margin-bottom: 20px; }
          .signature { margin-top: 50px; }
          .signature-line { width: 200px; border-top: 1px solid #333; margin: 0 auto 10px; }
          .signature-text { font-size: 12px; color: #666; }
          .signatory-name { font-size: 14px; color: #333; font-weight: bold; margin-bottom: 5px; }
          .date { font-size: 12px; color: #888; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="badge">${data.badgeEmoji}</div>
          <div class="header">${data.organizationName.toUpperCase()}</div>
          <div class="title">${data.certificateTitle}</div>
          <div class="subtitle">${data.subtitle}</div>
          <div class="presented">This certificate is proudly presented to</div>
          <div class="name">${data.volunteerName}</div>
          <div class="description">
            ${data.description || `With sincere appreciation for the time, effort, and compassion shown while serving as a volunteer in<br/><span class="event-name">"${data.eventTitle}"</span>`}
          </div>
          <div class="signature">
            ${data.signatoryName ? `<div class="signatory-name">${data.signatoryName}</div>` : ''}
            <div class="signature-line"></div>
            <div class="signature-text">${data.signatoryTitle}</div>
          </div>
          <div class="date">Issued on: ${data.issueDate}</div>
        </div>
      </body>
      </html>
    `;
  };

  // ✅ Open edit modal for organizer
  const openEditCertificate = (vol, eventTitle) => {
    setEditingCertificate(vol);
    setCertificateData({
      volunteerName: vol.volunteerName,
      eventTitle: eventTitle,
      organizationName: "VolunteerHub",
      certificateTitle: "Certificate of Appreciation",
      subtitle: "For Outstanding Volunteer Service",
      description: "",
      issueDate: new Date().toLocaleDateString(),
      signatoryName: user?.name || "",
      signatoryTitle: "Event Organizer",
      badgeEmoji: "🏆",
      primaryColor: "#d4af37",
      accentColor: "#667eea"
    });
    setShowEditModal(true);
  };

  // ✅ Open preview modal
  const openPreview = () => {
    setShowEditModal(false);
    setShowPreviewModal(true);
  };

  // ✅ Download from preview
  const downloadFromPreview = () => {
    const certificateHTML = generateCertificateHTML(certificateData);
    const printWindow = window.open("", "_blank");
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ✅ Volunteer direct preview before download
  const previewVolunteerCertificate = (cert) => {
    setCertificateData({
      volunteerName: user?.name || "Volunteer",
      eventTitle: cert.event?.title || "Event",
      organizationName: "VolunteerHub",
      certificateTitle: "Certificate of Appreciation",
      subtitle: "For Outstanding Volunteer Service",
      description: "",
      issueDate: new Date().toLocaleDateString(),
      signatoryName: cert.event?.organizerName || "Event Organizer",
      signatoryTitle: "Event Organizer",
      badgeEmoji: "🏆",
      primaryColor: "#d4af37",
      accentColor: "#667eea"
    });
    setShowPreviewModal(true);
  };

  const downloadCertificate = (participationId, eventTitle, volunteerName) => {
    const certificateHTML = generateCertificateHTML({
      ...certificateData,
      volunteerName,
      eventTitle
    });

    const printWindow = window.open("", "_blank");
    printWindow.document.write(certificateHTML);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // ✅ Get attendance badge color
  const getAttendanceBadge = (percentage) => {
    if (percentage >= 75) return "bg-green-100 text-green-700 border-green-300";
    if (percentage >= 50) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-red-100 text-red-700 border-red-300";
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
              <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-lg">
                <span className="text-3xl">🏆</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                  {isOrganizer ? "Issue Certificates" : "My Certificates"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isOrganizer
                    ? "View volunteer attendance and issue certificates (75%+ attendance required)"
                    : "Download certificates for completed events with 75%+ attendance"}
                </p>
              </div>
            </div>
          </div>

          {/* Organizer View */}
          {isOrganizer ? (
            <div className="space-y-6">
              {/* Event Selector */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>📋</span> Select Completed Event
                </h3>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full md:w-96 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                >
                  <option value="">-- Select an event --</option>
                  {organizerEvents.map((event) => (
                    <option key={event.id} value={event.id}>
                      {event.title} (Ended: {event.endDate})
                    </option>
                  ))}
                </select>
                {organizerEvents.length === 0 && !loading && (
                  <p className="text-gray-500 mt-3 text-sm">
                    No completed events found. Certificates can only be issued after event ends.
                  </p>
                )}
              </div>

              {/* Volunteers List */}
              {selectedEvent && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <span>👥</span> Volunteer Attendance
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        (75%+ attendance required for certificate)
                      </span>
                    </h3>
                  </div>

                  {volunteers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <span className="text-4xl">📭</span>
                      <p className="mt-2">No approved volunteers for this event</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-amber-50 to-yellow-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Volunteer</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Email</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Attendance</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Status</th>
                            <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Certificate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {volunteers.map((vol, index) => (
                            <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {(vol.volunteerName || "V")[0].toUpperCase()}
                                  </div>
                                  <span className="font-semibold text-gray-800">{vol.volunteerName}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center text-gray-600 text-sm">
                                {vol.volunteerEmail}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold border ${getAttendanceBadge(vol.attendancePercentage)}`}>
                                  {vol.attendancePercentage.toFixed(1)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                {vol.certificateEligible ? (
                                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                    ✅ Eligible
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                    ❌ Not Eligible
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {vol.certificateEligible ? (
                                  <button
                                    onClick={() => {
                                      const event = organizerEvents.find(e => e.id === parseInt(selectedEvent));
                                      openEditCertificate(vol, event?.title || "Event");
                                    }}
                                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-amber-500/50 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                                  >
                                    ✏️ Edit & Generate
                                  </button>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Volunteer View */
            <div>
              {loading ? (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl shadow-md flex items-center gap-3">
                  <span className="text-3xl animate-bounce">⏳</span>
                  <div>
                    <div className="font-bold text-lg">Loading...</div>
                    <div className="text-sm text-amber-600">Fetching your certificates</div>
                  </div>
                </div>
              ) : volunteerData.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                  <div className="text-7xl mb-4">📜</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Certificates Yet</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Complete volunteer events with 75%+ attendance to earn certificates!
                  </p>
                  <button
                    onClick={() => navigate("/available-events")}
                    className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl hover:shadow-amber-500/50 transform hover:scale-105 transition-all duration-200"
                  >
                    🌍 Browse Events
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {volunteerData.map((cert, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-105"
                    >
                      {/* Card Header */}
                      <div className={`p-5 text-white relative ${cert.certificateEligible ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                        <div className="absolute top-3 right-3 text-4xl opacity-30">
                          {cert.certificateEligible ? '🏆' : '📋'}
                        </div>
                        <h3 className="font-bold text-xl mb-1 line-clamp-1 pr-10">
                          {cert.event?.title || `Event #${cert.eventId}`}
                        </h3>
                        <p className="text-sm opacity-90">
                          📍 {cert.event?.locationName}, {cert.event?.city}
                        </p>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 font-semibold text-blue-700">
                            🏷️ {cert.event?.category}
                          </span>
                        </div>

                        <div className="bg-gradient-to-r from-purple-50 to-purple-100 px-3 py-2 rounded-lg border border-purple-200">
                          <span className="text-sm font-semibold text-purple-700">
                            📅 Completed: {cert.event?.endDate}
                          </span>
                        </div>

                        {/* Attendance */}
                        <div className={`px-3 py-2 rounded-lg border ${getAttendanceBadge(cert.attendancePercentage)}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold">📊 Attendance</span>
                            <span className="text-lg font-bold">{cert.attendancePercentage.toFixed(1)}%</span>
                          </div>
                          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cert.attendancePercentage >= 75 ? 'bg-green-500' : cert.attendancePercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(cert.attendancePercentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {/* Eligibility Status */}
                        <div className={`px-3 py-2 rounded-lg text-center font-semibold ${cert.certificateEligible ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                          {cert.certificateEligible ? '✅ Certificate Eligible!' : '❌ Need 75%+ attendance'}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
                        {cert.certificateEligible ? (
                          <button
                            onClick={() => previewVolunteerCertificate(cert)}
                            className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:shadow-lg hover:shadow-amber-500/50 transition-all duration-200 font-bold transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <span>👁️</span>
                            <span>Preview & Download</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="w-full px-4 py-3 rounded-xl bg-gray-300 text-gray-500 font-bold cursor-not-allowed"
                          >
                            🔒 Not Available
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Edit Certificate Modal (Organizer) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✏️</span>
                  <div>
                    <h3 className="text-2xl font-bold">Edit Certificate</h3>
                    <p className="text-amber-100">Customize certificate for {editingCertificate?.volunteerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Volunteer Name</label>
                  <input
                    type="text"
                    value={certificateData.volunteerName}
                    onChange={(e) => setCertificateData({...certificateData, volunteerName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    value={certificateData.eventTitle}
                    onChange={(e) => setCertificateData({...certificateData, eventTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Certificate Titles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={certificateData.organizationName}
                    onChange={(e) => setCertificateData({...certificateData, organizationName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Certificate Title</label>
                  <input
                    type="text"
                    value={certificateData.certificateTitle}
                    onChange={(e) => setCertificateData({...certificateData, certificateTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={certificateData.subtitle}
                  onChange={(e) => setCertificateData({...certificateData, subtitle: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              {/* Custom Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Custom Description (Optional)</label>
                <textarea
                  value={certificateData.description}
                  onChange={(e) => setCertificateData({...certificateData, description: e.target.value})}
                  placeholder="Leave empty for default description, or write a custom message..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Signature Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Signatory Name</label>
                  <input
                    type="text"
                    value={certificateData.signatoryName}
                    onChange={(e) => setCertificateData({...certificateData, signatoryName: e.target.value})}
                    placeholder="Your name (optional)"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Signatory Title</label>
                  <input
                    type="text"
                    value={certificateData.signatoryTitle}
                    onChange={(e) => setCertificateData({...certificateData, signatoryTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Date & Badge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Issue Date</label>
                  <input
                    type="text"
                    value={certificateData.issueDate}
                    onChange={(e) => setCertificateData({...certificateData, issueDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Badge Emoji</label>
                  <select
                    value={certificateData.badgeEmoji}
                    onChange={(e) => setCertificateData({...certificateData, badgeEmoji: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="🏆">🏆 Trophy</option>
                    <option value="🎖️">🎖️ Medal</option>
                    <option value="⭐">⭐ Star</option>
                    <option value="🌟">🌟 Glowing Star</option>
                    <option value="🎓">🎓 Graduation</option>
                    <option value="🏅">🏅 Sports Medal</option>
                    <option value="👏">👏 Clap</option>
                    <option value="💪">💪 Strong</option>
                    <option value="❤️">❤️ Heart</option>
                    <option value="🤝">🤝 Handshake</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Color Theme</label>
                  <select
                    value={certificateData.primaryColor}
                    onChange={(e) => {
                      const colors = {
                        "#d4af37": { primary: "#d4af37", accent: "#667eea" },
                        "#2563eb": { primary: "#2563eb", accent: "#3b82f6" },
                        "#059669": { primary: "#059669", accent: "#10b981" },
                        "#dc2626": { primary: "#dc2626", accent: "#ef4444" },
                        "#7c3aed": { primary: "#7c3aed", accent: "#8b5cf6" },
                      };
                      const selected = colors[e.target.value] || colors["#d4af37"];
                      setCertificateData({...certificateData, primaryColor: selected.primary, accentColor: selected.accent});
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="#d4af37">🟡 Gold (Classic)</option>
                    <option value="#2563eb">🔵 Blue (Professional)</option>
                    <option value="#059669">🟢 Green (Nature)</option>
                    <option value="#dc2626">🔴 Red (Bold)</option>
                    <option value="#7c3aed">🟣 Purple (Royal)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={openPreview}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-bold hover:shadow-lg hover:shadow-amber-500/50 transition-all flex items-center gap-2"
              >
                <span>👁️</span> Preview Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Preview Certificate Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
            {/* Preview Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👁️</span>
                <div>
                  <h3 className="text-xl font-bold">Certificate Preview</h3>
                  <p className="text-indigo-200 text-sm">Review before downloading</p>
                </div>
              </div>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto p-6 bg-gradient-to-br from-gray-100 to-gray-200">
              <div 
                ref={previewRef}
                className="mx-auto"
                style={{ 
                  width: '100%',
                  maxWidth: '800px',
                  background: 'white',
                  padding: '60px',
                  border: `8px double ${certificateData.primaryColor}`,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                  textAlign: 'center',
                  position: 'relative'
                }}
              >
                {/* Inner border */}
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
                  right: '20px',
                  bottom: '20px',
                  border: `2px solid ${certificateData.primaryColor}`,
                  pointerEvents: 'none'
                }} />
                
                {/* Badge */}
                <div style={{ fontSize: '60px', marginBottom: '20px' }}>{certificateData.badgeEmoji}</div>
                
                {/* Header */}
                <div style={{ color: certificateData.primaryColor, fontSize: '16px', letterSpacing: '4px', marginBottom: '20px' }}>
                  {certificateData.organizationName.toUpperCase()}
                </div>
                
                {/* Title */}
                <div style={{ fontSize: '42px', color: '#333', marginBottom: '10px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
                  {certificateData.certificateTitle}
                </div>
                
                {/* Subtitle */}
                <div style={{ fontSize: '18px', color: '#666', marginBottom: '40px' }}>
                  {certificateData.subtitle}
                </div>
                
                {/* Presented */}
                <div style={{ fontSize: '14px', color: '#888', marginBottom: '10px' }}>
                  This certificate is proudly presented to
                </div>
                
                {/* Name */}
                <div style={{ 
                  fontSize: '36px', 
                  color: '#4a4a4a', 
                  fontStyle: 'italic', 
                  marginBottom: '30px',
                  borderBottom: `2px solid ${certificateData.primaryColor}`,
                  display: 'inline-block',
                  paddingBottom: '10px',
                  fontFamily: 'Georgia, serif'
                }}>
                  {certificateData.volunteerName}
                </div>
                
                {/* Description */}
                <div style={{ fontSize: '16px', color: '#555', lineHeight: '1.8', marginBottom: '30px' }}>
                  {certificateData.description || (
                    <>
                      With sincere appreciation for the time, effort, and compassion shown while serving as a volunteer in
                      <br />
                      <span style={{ fontWeight: 'bold', color: certificateData.accentColor }}>
                        "{certificateData.eventTitle}"
                      </span>
                    </>
                  )}
                </div>
                
                {/* Signature */}
                <div style={{ marginTop: '50px' }}>
                  {certificateData.signatoryName && (
                    <div style={{ fontSize: '14px', color: '#333', fontWeight: 'bold', marginBottom: '5px' }}>
                      {certificateData.signatoryName}
                    </div>
                  )}
                  <div style={{ width: '200px', borderTop: '1px solid #333', margin: '0 auto 10px' }} />
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {certificateData.signatoryTitle}
                  </div>
                </div>
                
                {/* Date */}
                <div style={{ fontSize: '12px', color: '#888', marginTop: '20px' }}>
                  Issued on: {certificateData.issueDate}
                </div>
              </div>
            </div>

            {/* Preview Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (isOrganizer) setShowEditModal(true);
                }}
                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                {isOrganizer ? (
                  <>
                    <span>✏️</span> Back to Edit
                  </>
                ) : (
                  <>
                    <span>←</span> Close
                  </>
                )}
              </button>
              <button
                onClick={downloadFromPreview}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2"
              >
                <span>📥</span> Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Certificates;
