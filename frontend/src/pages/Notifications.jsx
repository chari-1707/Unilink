import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    const data = await apiFetch("/api/notifications");
    setItems(data.notifications || []);
  }

  useEffect(() => {
    async function loadAndAutoRead() {
      const data = await apiFetch("/api/notifications");
      const notifications = data.notifications || [];
      setItems(notifications);

      const hasUnread = notifications.some((n) => !n.readAt);
      if (hasUnread) {
        // Update UI and badge immediately so user sees instant feedback.
        setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
        window.dispatchEvent(new Event("notifications:read-all"));
        await apiFetch("/api/notifications/read-all", { method: "POST" });
        await load();
      }
    }

    loadAndAutoRead().catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page">
      <div className="card">
        <div className="cardTitle">Notifications</div>
        {error ? <div className="alert error">{error}</div> : null}
        <div className="stack">
          {items.map((n) => (
            <div key={n._id} className={`row between notifCard ${n.readAt ? "read" : "unread"}`}>
              <div>
                <div className="strong">
                  {!n.readAt ? <span className="notifDot" /> : null}
                  {n.message}
                </div>
                <div className="hint">{new Date(n.createdAt).toLocaleString()}</div>
              </div>
              <div className="pill muted">{n.readAt ? "Read" : "Unread"}</div>
            </div>
          ))}
          {!items.length ? <div className="hint">You’re all caught up.</div> : null}
        </div>
      </div>
    </div>
  );
}

