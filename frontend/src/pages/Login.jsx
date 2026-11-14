import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import SubmitButton from "../components/SubmitButton";
import Wordmark from "../components/Wordmark";
import { loginUser } from "../api";
import { useAuth } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const data = await loginUser(email.trim(), password);
      login(data.token, data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card fade-up">
        <Wordmark />

        <h2 style={{ marginBottom: "0.3rem" }}>Welcome back</h2>
        <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
          Sign in to your account to continue.
        </p>

        <Alert message={error} type="error" />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <SubmitButton type="submit" id="login-btn" loading={loading} loadingText="Signing in…">
            Sign In
          </SubmitButton>
        </form>

        <div className="divider">or</div>

        <div className="auth-footer">
          Don&rsquo;t have an account? <Link to="/register">Create one →</Link>
        </div>
      </div>
    </div>
  );
}
