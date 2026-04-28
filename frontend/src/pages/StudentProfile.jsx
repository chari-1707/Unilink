import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";

function normalizeExternalUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

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
                {profile.contact?.linkedin || profile.contact?.x ? (
                  <div className="socialLinksRow">
                    {profile.contact?.linkedin ? (
                      <a
                        className="socialIconLink"
                        href={normalizeExternalUrl(profile.contact.linkedin)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${user.name}'s LinkedIn profile`}
                        title="Open LinkedIn"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6.94 8.45v8.58H4.08V8.45h2.86ZM6.94 5.8a1.43 1.43 0 1 1-2.86 0 1.43 1.43 0 0 1 2.86 0ZM19.92 12.1v4.93h-2.85v-4.6c0-1.16-.42-1.95-1.46-1.95-.8 0-1.28.54-1.49 1.06-.08.18-.1.44-.1.7v4.79h-2.86s.04-7.78 0-8.58h2.86v1.22l-.02.03h.02v-.03c.38-.58 1.06-1.41 2.58-1.41 1.89 0 3.32 1.23 3.32 3.85Z" />
                        </svg>
                      </a>
                    ) : null}
                    {profile.contact?.x ? (
                      <a
                        className="socialIconLink"
                        href={normalizeExternalUrl(profile.contact.x)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${user.name}'s X profile`}
                        title="Open X"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.24 3h2.99l-6.52 7.45L22.4 21h-6.02l-4.72-6.17L6.27 21H3.28l6.97-7.97L2.8 3h6.18l4.27 5.64L18.24 3Zm-1.05 16.2h1.66L8.08 4.7H6.3l10.9 14.5Z" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                ) : null}
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
                {profile.contact?.linkedin || profile.contact?.x ? (
                  <div className="socialLinksRow">
                    {profile.contact?.linkedin ? (
                      <a
                        className="socialIconLink"
                        href={normalizeExternalUrl(profile.contact.linkedin)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${user.name}'s LinkedIn profile`}
                        title="Open LinkedIn"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M6.94 8.45v8.58H4.08V8.45h2.86ZM6.94 5.8a1.43 1.43 0 1 1-2.86 0 1.43 1.43 0 0 1 2.86 0ZM19.92 12.1v4.93h-2.85v-4.6c0-1.16-.42-1.95-1.46-1.95-.8 0-1.28.54-1.49 1.06-.08.18-.1.44-.1.7v4.79h-2.86s.04-7.78 0-8.58h2.86v1.22l-.02.03h.02v-.03c.38-.58 1.06-1.41 2.58-1.41 1.89 0 3.32 1.23 3.32 3.85Z" />
                        </svg>
                      </a>
                    ) : null}
                    {profile.contact?.x ? (
                      <a
                        className="socialIconLink"
                        href={normalizeExternalUrl(profile.contact.x)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${user.name}'s X profile`}
                        title="Open X"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.24 3h2.99l-6.52 7.45L22.4 21h-6.02l-4.72-6.17L6.27 21H3.28l6.97-7.97L2.8 3h6.18l4.27 5.64L18.24 3Zm-1.05 16.2h1.66L8.08 4.7H6.3l10.9 14.5Z" />
                        </svg>
                      </a>
                    ) : null}
                  </div>
                ) : null}
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
