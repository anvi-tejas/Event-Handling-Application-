import { useEffect, useState } from "react";
import api from "../../config";

function Complaints() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    api.get(`/complaints/user/${user.email}`)
      .then(res => setComplaints(res.data));
  }, []);

  const submitComplaint = () => {
    api.post("/complaints/raise", {
      email: user.email,
      role: user.role,
      subject,
      message
    }).then(() => {
      alert("Complaint submitted");
      setSubject("");
      setMessage("");
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Help & Support</h1>

      {/* Raise Complaint */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <input
          className="w-full border p-2 mb-2"
          placeholder="Subject"
          value={subject}
          onChange={e => setSubject(e.target.value)}
        />
        <textarea
          className="w-full border p-2 mb-2"
          placeholder="Describe your issue"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button
          onClick={submitComplaint}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Submit Complaint
        </button>
      </div>

      {/* Complaint History */}
      <h2 className="font-semibold mb-2">Your Complaints</h2>
      {complaints.map(c => (
        <div key={c.id} className="bg-white p-4 rounded shadow mb-2">
          <p className="font-semibold">{c.subject}</p>
          <p className="text-sm text-gray-600">{c.message}</p>
          <span className={`text-sm ${c.status === "RESOLVED" ? "text-green-600" : "text-red-600"}`}>
            {c.status}
          </span>
        </div>
      ))}
    </div>
  );
}

export default Complaints;
