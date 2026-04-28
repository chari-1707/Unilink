import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function load() {
    const data = await apiFetch("/api/groups");
    setGroups(data.groups || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function join(groupId) {
    const data = await apiFetch(`/api/groups/${groupId}/join`, { method: "POST" });
    setToast(data.joined ? "You joined the group" : "You left the group");
    setTimeout(() => setToast(""), 1800);
    await load();
  }

  return (
    <div className="page">
      {toast ? <div className="toast success">{toast}</div> : null}
      {error ? <div className="alert error">{error}</div> : null}
      <div className="card">
        <div className="cardTitle">All groups</div>
        <div className="stack">
          {groups.map((g) => (
            <div key={g._id} className="row between">
              <div>
                <div className="strong">{g.groupName}</div>
                <div className="hint">{g.description || "—"}</div>
              </div>
              <button className="btn" onClick={() => join(g._id)}>Join/Leave</button>
            </div>
          ))}
          {!groups.length ? <div className="hint">No groups available right now.</div> : null}
        </div>
      </div>
    </div>
  );
}

