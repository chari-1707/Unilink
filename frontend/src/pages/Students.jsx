import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";

const DEPARTMENTS = [
  "Computer Science",
  "Information Technology",
  "Electronics and Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Biotechnology",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Commerce",
  "Economics",
  "Business Administration",
  "English",
  "Psychology",
  "Law",
  "Architecture",
  "Design",
  "Media Studies",
];

export default function Students() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [department, setDepartment] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  async function search() {
    setError("");
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (department.trim()) params.set("department", department.trim());
    const data = await apiFetch(`/api/profiles/search?${params.toString()}`);
    setResults(data.results || []);
  }

  useEffect(() => {
    search().catch(() => {});
  }, []);

  async function connect(userId) {
    try {
      await apiFetch(`/api/connections/request/${userId}`, { method: "POST" });
      setToast("Connection request sent");
      setTimeout(() => setToast(""), 2200);
      await search();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="page">
      {toast ? <div className="toast success">{toast}</div> : null}
      <div className="card">
        <div className="cardTitle">Find students</div>
        <div className="row">
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student name" />
          <input className="input" list="student-departments" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Department" />
          <datalist id="student-departments">
            {DEPARTMENTS.map((item) => (
              <option key={item} value={item} />
            ))}
          </datalist>
          <button className="btn primary" onClick={() => search().catch((e) => setError(e.message))}>
            Search
          </button>
        </div>
        {error ? <div className="alert error">{error}</div> : null}
      </div>

      <div className="grid three">
        {results.map((r) => (
          <div key={r.user._id} className="card">
            <div className="studentHeader">
              {r.profile.avatarUrl ? (
                <img className="avatarImg" src={r.profile.avatarUrl} alt={r.user.name} />
              ) : (
                <div className="avatar">{r.user.name.slice(0, 1).toUpperCase()}</div>
              )}
              <div>
                <div className="studentName">{r.user.name}</div>
                <div className="studentMeta">{r.profile.department || "—"} · {r.profile.year || "—"}</div>
              </div>
            </div>
            <div className="studentBio">{r.profile.bio || "No bio yet."}</div>
            <div className="tags">
              {(r.profile.skills || []).slice(0, 6).map((s) => (
                <span key={s} className="tag">{s}</span>
              ))}
            </div>
            <div className="row between studentActions">
              <button className="btn btnSmall" onClick={() => navigate(`/app/students/${r.user._id}`)}>
                View profile
              </button>
              {r.connectionStatus === "accepted" ? (
                <span className="pill on">Connected</span>
              ) : r.connectionStatus === "pending" ? (
                <span className="pill muted">Request sent</span>
              ) : (
                <button className="btn" onClick={() => connect(r.user._id)}>Connect</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

