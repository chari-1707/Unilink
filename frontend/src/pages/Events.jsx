import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Events() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    const data = await apiFetch("/api/events");
    setEvents(data.events || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function create() {
    setError("");
    try {
      await apiFetch("/api/events", {
        method: "POST",
        body: { eventName: eventName.trim(), date, location: location.trim(), description: description.trim() },
      });
      setEventName("");
      setDate("");
      setLocation("");
      setDescription("");
      setToast(user?.role === "admin" ? "Event created and approved" : "Event created and sent for admin approval");
      setTimeout(() => setToast(""), 2200);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleRegister(eventId) {
    setError("");
    try {
      await apiFetch(`/api/events/${eventId}/register`, { method: "POST" });
      setToast("Registration status updated");
      setTimeout(() => setToast(""), 1800);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      {toast ? <div className="toast success">{toast}</div> : null}
      <div className="grid two">
        <div className="card">
          <div className="cardTitle">Create event</div>
          <div className="hint">
            {user?.role === "admin"
              ? "As admin, events are auto-approved."
              : "Student-created events go to admin approval."}
          </div>
          <label className="field">
            <div className="label">Event name</div>
            <input value={eventName} onChange={(e) => setEventName(e.target.value)} />
          </label>
          <label className="field">
            <div className="label">Date</div>
            <input value={date} onChange={(e) => setDate(e.target.value)} type="datetime-local" />
          </label>
          <label className="field">
            <div className="label">Location</div>
            <input value={location} onChange={(e) => setLocation(e.target.value)} />
          </label>
          <label className="field">
            <div className="label">Description</div>
            <textarea className="textarea" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </label>
          {error ? <div className="alert error">{error}</div> : null}
          <button className="btn primary" onClick={create} disabled={!eventName.trim() || !date}>
            Create
          </button>
        </div>

        <div className="card">
          <div className="cardTitle">Upcoming events</div>
          <div className="stack">
            {events.map((e) => (
              <div key={e._id} className="card soft">
                <div className="row between">
                  <div>
                    <div className="strong">{e.eventName}</div>
                    <div className="hint">
                      {new Date(e.date).toLocaleString()} · {e.location || "—"}
                    </div>
                  </div>
                  <button className="btn" onClick={() => toggleRegister(e._id)}>
                    Register/Unregister
                  </button>
                </div>
                <div className="hint">{e.description || "—"}</div>
              </div>
            ))}
            {!events.length ? <div className="hint">No events available yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

