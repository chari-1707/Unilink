import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    const [u, e] = await Promise.all([apiFetch("/api/admin/users"), apiFetch("/api/admin/events/pending")]);
    setUsers(u.users || []);
    setPendingEvents(e.events || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function setStatus(eventId, status) {
    setError("");
    try {
      await apiFetch(`/api/admin/events/${eventId}/status`, { method: "POST", body: { status } });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function makeAdmin(userId) {
    setError("");
    try {
      await apiFetch(`/api/admin/users/${userId}/make-admin`, { method: "POST" });
      setToast("User promoted to admin");
      setTimeout(() => setToast(""), 1800);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeUser(userId) {
    setError("");
    try {
      await apiFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      setToast("User removed from platform");
      setTimeout(() => setToast(""), 1800);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      {toast ? <div className="toast success">{toast}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}
      <div className="grid two">
        <div className="card">
          <div className="cardTitle">Pending events</div>
          <div className="stack">
            {pendingEvents.map((ev) => (
              <div key={ev._id} className="card soft">
                <div className="strong">{ev.eventName}</div>
                <div className="hint">{new Date(ev.date).toLocaleString()} · {ev.location || "—"}</div>
                <div className="hint">{ev.description || "—"}</div>
                <div className="row">
                  <button className="btn primary" onClick={() => setStatus(ev._id, "approved")}>Approve</button>
                  <button className="btn ghost" onClick={() => setStatus(ev._id, "rejected")}>Reject</button>
                </div>
              </div>
            ))}
            {!pendingEvents.length ? <div className="hint">No pending events.</div> : null}
          </div>
        </div>

        <div className="card">
          <div className="cardTitle">Users</div>
          <div className="stack">
            {users.map((u) => (
              <div key={u._id} className="row between">
                <div>
                  <div className="strong">{u.name}</div>
                  <div className="hint">{u.email}</div>
                </div>
                <div className="row">
                  <div className={`pill ${u.role === "admin" ? "on" : "muted"}`}>{u.role}</div>
                  {u.role !== "admin" ? (
                    <button className="btn btnSmall" onClick={() => makeAdmin(u._id)}>
                      Make admin
                    </button>
                  ) : null}
                  <button className="btn btnSmall danger" onClick={() => removeUser(u._id)}>
                    Remove user
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

