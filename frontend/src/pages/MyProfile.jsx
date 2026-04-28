import { useEffect, useState } from "react";
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

function ChipsEditor({ label, value = [], onChange, placeholder }) {
  const [text, setText] = useState("");
  return (
    <div className="field">
      <div className="label">{label}</div>
      <div className="chips">
        {value.map((v, idx) => (
          <button key={`${v}-${idx}`} type="button" className="chip" onClick={() => onChange(value.filter((_, i) => i !== idx))}>
            {v} <span className="chipX">×</span>
          </button>
        ))}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = text.trim();
              if (!v) return;
              onChange([...value, v]);
              setText("");
            }
          }}
        />
      </div>
      <div className="hint">Press Enter to add. Click a chip to remove.</div>
    </div>
  );
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidLinkedInUrl(value) {
  if (!value) return true;
  if (!isValidUrl(value)) return false;
  const host = new URL(value).hostname.toLowerCase();
  return host === "linkedin.com" || host.endsWith(".linkedin.com");
}

function isValidXUrl(value) {
  if (!value) return true;
  if (!isValidUrl(value)) return false;
  const host = new URL(value).hostname.toLowerCase();
  return host === "x.com" || host.endsWith(".x.com") || host === "twitter.com" || host.endsWith(".twitter.com");
}

export default function MyProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    department: "",
    year: "",
    bio: "",
    skills: [],
    interests: [],
    achievements: [],
    certifications: [],
    contact: { phone: "", linkedin: "", github: "" },
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  async function load() {
    const data = await apiFetch("/api/profiles/me");
    setProfile(data.profile);
    setForm({
      department: data.profile?.department || "",
      year: data.profile?.year || "",
      bio: data.profile?.bio || "",
      skills: data.profile?.skills || [],
      interests: data.profile?.interests || [],
      achievements: data.profile?.achievements || [],
      certifications: data.profile?.certifications || [],
      contact: {
        phone: data.profile?.contact?.phone || "",
        linkedin: data.profile?.contact?.linkedin || "",
        x: data.profile?.contact?.x || "",
      },
    });
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function save() {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const linkedin = form.contact?.linkedin?.trim() || "";
      const x = form.contact?.x?.trim() || "";

      if (!isValidLinkedInUrl(linkedin)) {
        const message = "LinkedIn URL is not correct. Please enter a valid LinkedIn URL (example: https://linkedin.com/in/your-id).";
        window.alert(message);
        setError(message);
        return;
      }

      if (!isValidXUrl(x)) {
        const message = "X URL is not correct. Please enter a valid X URL (example: https://x.com/your-id).";
        window.alert(message);
        setError(message);
        return;
      }

      const data = await apiFetch("/api/profiles/me", { method: "PUT", body: form });
      setProfile(data.profile);
      setSaved("Saved");
      setTimeout(() => setSaved(""), 1500);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <div className="cardTitle">My Profile</div>
        <div className="hint">Keep it real and specific — it improves networking.</div>

        <div className="form">
          <div className="row">
            <label className="field">
              <div className="label">Department</div>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {DEPARTMENTS.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <div className="label">Year</div>
              <input value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
            </label>
          </div>

          <label className="field">
            <div className="label">Bio</div>
            <textarea className="textarea" rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          </label>

          <ChipsEditor label="Skills" value={form.skills} onChange={(skills) => setForm({ ...form, skills })} placeholder="Add a skill" />
          <ChipsEditor label="Interests" value={form.interests} onChange={(interests) => setForm({ ...form, interests })} placeholder="Add an interest" />
          <ChipsEditor label="Achievements" value={form.achievements} onChange={(achievements) => setForm({ ...form, achievements })} placeholder="Add an achievement" />
          <ChipsEditor label="Certifications" value={form.certifications} onChange={(certifications) => setForm({ ...form, certifications })} placeholder="Add a certification" />

          <div className="cardTitle small">Contact</div>
          <div className="row">
            <label className="field">
              <div className="label">Phone</div>
              <input value={form.contact.phone} onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} />
            </label>
            <label className="field">
              <div className="label">LinkedIn</div>
              <input
                value={form.contact.linkedin}
                onChange={(e) => setForm({ ...form, contact: { ...form.contact, linkedin: e.target.value } })}
                placeholder="https://linkedin.com/in/your-id"
              />
            </label>
          </div>
          <label className="field">
            <div className="label">X</div>
            <input
              value={form.contact.x}
              onChange={(e) => setForm({ ...form, contact: { ...form.contact, x: e.target.value } })}
              placeholder="https://x.com/your-id"
            />
          </label>

          {error ? <div className="alert error">{error}</div> : null}
          {saved ? <div className="alert ok">{saved}</div> : null}
          <button className="btn primary" disabled={busy} onClick={save}>
            {busy ? "Saving..." : "Save profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

