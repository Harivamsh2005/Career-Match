import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import SubmitButton from "../components/SubmitButton";
import Wordmark from "../components/Wordmark";
import { registerUser } from "../api";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [alert, setAlert] = useState({ message: "", type: "error" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  useEffect(() => () => clearTimeout(redirectTimer.current), []);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  const fail = (message) => setAlert({ message, type: "error" });

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert({ message: "", type: "error" });

    const name = form.name.trim();
    const email = form.email.trim();
    const { password, confirm } = form;

    if (!name || !email || !password || !confirm) return fail("All fields are required.");
    if (password.length < 6) return fail("Password must be at least 6 characters.");
    if (password !== confirm) return fail("Passwords do not match.");

    setLoading(true);
    try {
      await registerUser(name, email, password);
      setAlert({ message: "Account created! Redirecting to login…", type: "success" });
      redirectTimer.current = setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      fail(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card fade-up">
        <Wordmark />

        <h2 style={{ marginBottom: "0.3rem" }}>Create an account</h2>
        <p style={{ color: "var(--ink-muted)", fontSize: "0.9rem", marginBottom: "1.75rem" }}>
          Start analyzing your resume in seconds.
        </p>

        <Alert message={alert.message} type={alert.type} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input type="text" id="name" placeholder="Jane Doe" autoComplete="name"
              value={form.name} onChange={update("name")} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input type="email" id="email" placeholder="you@example.com" autoComplete="email"
              value={form.email} onChange={update("email")} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Min. 6 characters" autoComplete="new-password"
              value={form.password} onChange={update("password")} />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm password</label>
            <input type="password" id="confirm" placeholder="Repeat password" autoComplete="new-password"
              value={form.confirm} onChange={update("confirm")} />
          </div>

          <SubmitButton type="submit" id="register-btn" loading={loading} loadingText="Creating…">
            Create Account
          </SubmitButton>
        </form>

        <div className="divider">or</div>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in →</Link>
        </div>
      </div>
    </div>
  );
}
