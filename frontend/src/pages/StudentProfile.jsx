import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";

function Section({ title, items }) {
  if (!items?.length) return null;
  return (
    <div className="stack">
      <div className="cardTitle small">{title}</div>
      <div className="tags">
        {items.map((item, idx) => (
          <span key={`${title}-${item}-${idx}`} className="tag">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function StudentProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    apiFetch(`/api/profiles/${userId}`)
      .then((data) => {
        if (cancelled) return;
        setUser(data.user || null);
        setProfile(data.profile || null);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="page">
      <div className="card">
        <div className="row between">
          <button className="btn ghost btnSmall" onClick={() => navigate("/app/students")}>
            Back to students
          </button>
        </div>
        {error ? <div className="alert error">{error}</div> : null}
        {user && profile ? (
          <div className="studentProfileLayout">
            <div className="studentProfileHero">
              {profile.avatarUrl ? (
                <img className="avatarImg xl" src={profile.avatarUrl} alt={user.name} />
              ) : (
                <div className="avatar xl">{user.name?.slice(0, 1)?.toUpperCase() || "?"}</div>
              )}
              <div>
                <div className="studentProfileName">{user.name}</div>
                <div className="studentMeta">{profile.department || "—"} · {profile.year || "—"}</div>
                <div className="studentBio">{profile.bio || "No bio available yet."}</div>
                <div className="row">
                  {profile.contact?.linkedin ? (
                    <a className="btn ghost btnSmall" href={profile.contact.linkedin} target="_blank" rel="noreferrer">
                      Open LinkedIn
                    </a>
                  ) : null}
                  {profile.contact?.x ? (
                    <a className="btn ghost btnSmall" href={profile.contact.x} target="_blank" rel="noreferrer">
                      Open X
                    </a>
                  ) : null}
                </div>
              </div>
            </div>

            <Section title="Skills" items={profile.skills} />
            <Section title="Interests" items={profile.interests} />
            <Section title="Achievements" items={profile.achievements} />
            <Section title="Certifications" items={profile.certifications} />

            <div className="stack">
              <div className="cardTitle small">Contact</div>
              <div className="stack">
                {profile.contact?.phone ? <div className="hint">Phone: {profile.contact.phone}</div> : null}
                {profile.contact?.linkedin ? <div className="hint">LinkedIn: {profile.contact.linkedin}</div> : null}
                {profile.contact?.x ? <div className="hint">X: {profile.contact.x}</div> : null}
              </div>
            </div>
          </div>
        ) : !error ? (
          <div className="hint">Loading profile...</div>
        ) : null}
      </div>
    </div>
  );
}
