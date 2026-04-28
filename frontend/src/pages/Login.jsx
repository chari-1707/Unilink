import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/app");
    } catch (err) {
      setError(err.message || "Login failed");
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
            <div className="authTitle">Sign in to UniLink</div>
            <div className="authSub">Your campus feed, groups and events in one place.</div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="form">
          <label className="field">
            <div className="label">Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} type="email" required />
            <div className="hint">Sign in with your `@unilink.com` email.</div>
          </label>
          <label className="field">
            <div className="label">Password</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>

          {error ? <div className="alert error">{error}</div> : null}

          <button className="btn primary" disabled={busy} type="submit">
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="authFooter">
          New here? <Link to="/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
}

