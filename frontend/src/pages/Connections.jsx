import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Connections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [chatError, setChatError] = useState("");

  async function load() {
    setError("");
    const [c, r] = await Promise.all([
      apiFetch("/api/connections"),
      apiFetch("/api/connections/requests/incoming"),
    ]);
    setConnections(c.connections || []);
    setRequests(r.requests || []);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      load().catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    apiFetch(`/api/messages/${selectedUserId}`)
      .then((data) => setMessages(data.messages || []))
      .catch((e) => setChatError(e.message));
  }, [selectedUserId]);

  async function respond(requestId, action) {
    setError("");
    try {
      await apiFetch(`/api/connections/requests/${requestId}/respond`, {
        method: "POST",
        body: { action },
      });
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function sendMessage() {
    if (!selectedUserId || !messageText.trim()) return;
    setChatError("");
    try {
      await apiFetch(`/api/messages/${selectedUserId}`, {
        method: "POST",
        body: { text: messageText.trim() },
      });
      setMessageText("");
      const data = await apiFetch(`/api/messages/${selectedUserId}`);
      setMessages(data.messages || []);
    } catch (e) {
      setChatError(e.message);
    }
  }

  const selectedConnection = connections.find(
    (c) => c.toUserId?._id === selectedUserId,
  );

  return (
    <div className="page">
      {error ? <div className="alert error">{error}</div> : null}
      <div className="grid two">
        <div className="card">
          <div className="cardTitle">Incoming requests</div>
          {requests.length ? (
            <div className="stack">
              {requests.map((r) => (
                <div key={r._id} className="row between">
                  <div>
                    <div className="strong">{r.fromUserId?.name}</div>
                    <div className="hint">{r.fromUserId?.email}</div>
                  </div>
                  <div className="row">
                    <button
                      className="btn primary"
                      onClick={() => respond(r._id, "accept")}
                    >
                      Accept
                    </button>
                    <button
                      className="btn ghost"
                      onClick={() => respond(r._id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hint">No pending requests.</div>
          )}
        </div>

        <div className="card">
          <div className="cardTitle">My connections</div>
          {connections.length ? (
            <div className="stack">
              {connections.map((c) => (
                <div key={c._id} className="row between">
                  <div>
                    <div className="strong">{c.toUserId?.name}</div>
                    <div className="hint">{c.toUserId?.email}</div>
                  </div>
                  <div className="pill muted">Connected</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="hint">
              No connections yet. Search students and send requests.
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="cardTitle">Messages</div>
        <div className="chatWrap">
          <div className="chatList">
            {connections.length ? (
              connections.map((c) => (
                <button
                  key={c._id}
                  className={`chatUser ${selectedUserId === c.toUserId?._id ? "active" : ""}`}
                  onClick={() => {
                    setSelectedUserId(c.toUserId?._id || "");
                    setChatError("");
                  }}
                >
                  <div className="chatUserMain">
                    <div className="avatar sm">
                      {c.toUserId?.name?.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <div className="strong">{c.toUserId?.name}</div>
                      <div className="hint">
                        {c.unreadCount > 0
                          ? `New message from ${c.toUserId?.name}`
                          : c.lastMessageText || c.toUserId?.email}
                      </div>
                    </div>
                  </div>
                  {c.unreadCount > 0 ? (
                    <div className="pill on">{c.unreadCount}</div>
                  ) : null}
                </button>
              ))
            ) : (
              <div className="hint">Accept connections to start chatting.</div>
            )}
          </div>

          <div className="chatMain">
            {!selectedUserId ? (
              <div className="hint">
                Select a connected student to open chat.
              </div>
            ) : (
              <>
                <div className="chatTop">
                  <div className="row between">
                    <div>
                      Chat with{" "}
                      <span className="strong">
                        {selectedConnection?.toUserId?.name || "Student"}
                      </span>
                    </div>
                    <button
                      className="btn ghost btnSmall"
                      onClick={() => setSelectedUserId("")}
                    >
                      Exit chat
                    </button>
                  </div>
                </div>
                <div className="chatMessages">
                  {messages.length ? (
                    messages.map((m) => {
                      const mine =
                        m.senderId?.toString?.() === user?.id ||
                        m.senderId === user?.id;
                      return (
                        <div
                          key={m._id}
                          className={`chatBubble ${mine ? "mine" : "their"}`}
                        >
                          {m.text}
                        </div>
                      );
                    })
                  ) : (
                    <div className="hint">No messages yet. Say hello.</div>
                  )}
                </div>
                {chatError ? (
                  <div className="alert error">{chatError}</div>
                ) : null}
                <div className="chatComposer">
                  <input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                  />
                  <button className="btn primary" onClick={sendMessage}>
                    Send
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}