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
  const [editingEventId, setEditingEventId] = useState("");
  const [editForm, setEditForm] = useState({ eventName: "", date: "", location: "", description: "" });

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
      const data = await apiFetch(`/api/events/${eventId}/register`, { method: "POST" });
      const message = data?.registered
        ? "You are successfully registered for this event."
        : "You have successfully unregistered from this event.";
      window.alert(message);
      setToast(message);
      setTimeout(() => setToast(""), 1800);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function startEdit(event) {
    const dt = event?.date ? new Date(event.date) : null;
    const localDate = dt && !Number.isNaN(dt.getTime()) ? new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
    setEditingEventId(event._id);
    setEditForm({
      eventName: event.eventName || "",
      date: localDate,
      location: event.location || "",
      description: event.description || "",
    });
  }

  async function saveEdit(eventId) {
    setError("");
    try {
      await apiFetch(`/api/events/${eventId}`, { method: "PUT", body: editForm });
      setEditingEventId("");
      setToast("Event updated successfully");
      setTimeout(() => setToast(""), 1800);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeEvent(eventId) {
    const ok = window.confirm("Are you sure you want to remove this event?");
    if (!ok) return;
    setError("");
    try {
      await apiFetch(`/api/events/${eventId}`, { method: "DELETE" });
      setToast("Event removed successfully");
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
                  {(() => {
                    const currentUserId = user?.id || user?._id;
                    const isRegistered = (e.registrations || []).some((id) => String(id) === String(currentUserId));
                    const isCompleted = new Date(e.date).getTime() < Date.now();
                    const canManage =
                      user?.role === "admin" || String(e.createdBy?._id || "") === String(currentUserId);
                    return (
                      <div className="row eventActions">
                        {isCompleted ? (
                          <span className="pill muted">Event completed</span>
                        ) : (
                          <button
                            className={`btn ${isRegistered ? "danger" : "primary"}`}
                            onClick={() => toggleRegister(e._id)}
                          >
                            {isRegistered ? "Unregister" : "Register"}
                          </button>
                        )}
                        {canManage ? (
                          <>
                            <button className="btn btnSmall" onClick={() => startEdit(e)}>
                              Edit
                            </button>
                            <button className="btn btnSmall danger" onClick={() => removeEvent(e._id)}>
                              Remove
                            </button>
                          </>
                        ) : null}
                      </div>
                    );
                  })()}
                </div>
                <div className="hint">{e.description || "—"}</div>
                {editingEventId === e._id ? (
                  <div className="form eventEditForm">
                    <label className="field">
                      <div className="label">Event name</div>
                      <input
                        value={editForm.eventName}
                        onChange={(ev) => setEditForm({ ...editForm, eventName: ev.target.value })}
                      />
                    </label>
                    <label className="field">
                      <div className="label">Date</div>
                      <input
                        type="datetime-local"
                        value={editForm.date}
                        onChange={(ev) => setEditForm({ ...editForm, date: ev.target.value })}
                      />
                    </label>
                    <label className="field">
                      <div className="label">Location</div>
                      <input
                        value={editForm.location}
                        onChange={(ev) => setEditForm({ ...editForm, location: ev.target.value })}
                      />
                    </label>
                    <label className="field">
                      <div className="label">Description</div>
                      <textarea
                        className="textarea"
                        rows={3}
                        value={editForm.description}
                        onChange={(ev) => setEditForm({ ...editForm, description: ev.target.value })}
                      />
                    </label>
                    <div className="row">
                      <button
                        className="btn primary btnSmall"
                        onClick={() => saveEdit(e._id)}
                        disabled={!editForm.eventName.trim() || !editForm.date}
                      >
                        Save changes
                      </button>
                      <button className="btn btnSmall ghost" onClick={() => setEditingEventId("")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
            {!events.length ? <div className="hint">No events available yet.</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

