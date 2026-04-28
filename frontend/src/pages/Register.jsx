import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(name, email, password);
      navigate("/app/profile");
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <div className="brandMark lg">U</div>
          <div>
            <div className="authTitle">Create your UniLink account</div>
            <div className="authSub">Build a profile. Find peers. Join events.</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <div className="label">Full name</div>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required />
          </label>
          <label className="field">
            <div className="label">Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} type="email" required />
            <div className="hint">Use your `@unilink.com` email only.</div>
          </label>
          <label className="field">
            <div className="label">Password (min 8)</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" minLength={8} required />
          </label>

          {error ? <div className="alert error">{error}</div> : null}

          <button className="btn primary" disabled={busy} type="submit">
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="authFooter">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

