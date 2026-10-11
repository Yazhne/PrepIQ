
import { useState } from "react";
import "./Auth.css";

const API_URL = "/api/auth";

function Auth({ onBack }) {
  const [register, setRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (register && !name.trim()) {
      setMessage("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/${register ? "register" : "login"}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(
            register
              ? { name: name.trim(), email: email.trim(), password }
              : { email: email.trim(), password }
          )
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      localStorage.setItem("prepiqToken", data.token);
      localStorage.setItem("prepiqUser", JSON.stringify(data.user));

      setMessage(data.message || "Success!");

      setTimeout(() => {
        onBack();
      }, 800);
    } catch (error) {
      setMessage(
        error.message === "Failed to fetch"
          ? "Cannot connect to PrepIQ. Make sure the backend is running."
          : error.message
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setRegister(!register);
    setMessage("");
    setPassword("");
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand" onClick={onBack}>
          <span>◆</span> PrepIQ
        </div>

        <div className="auth-content">
          <p className="auth-label">PLACEMENT INTELLIGENCE</p>
          <h1>
            Your career.
            <br />
            <span>Your advantage.</span>
          </h1>
          <p>
            Build your profile, discover your skill gaps and prepare
            with a roadmap designed around your career goals.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <button className="back-btn" onClick={onBack} type="button">
            ← Back
          </button>

          <h2>{register ? "Create your account" : "Welcome back"}</h2>

          <p className="auth-sub">
            {register
              ? "Start your personalized placement journey."
              : "Continue your placement preparation."}
          </p>

          <form onSubmit={handleSubmit}>
            {register && (
              <div className="input-group">
                <label htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div className="input-group">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder={
                  register
                    ? "At least 8 characters"
                    : "Enter your password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  register ? "new-password" : "current-password"
                }
                minLength={register ? 8 : undefined}
                required
              />
            </div>

            {!register && (
              <div className="forgot">
                <button
                  type="button"
                  onClick={() =>
                    setMessage(
                      "Password reset is not available yet. Please contact support."
                    )
                  }
                >
                  Forgot password?
                </button>
              </div>
            )}

            {message && (
              <p role="status" aria-live="polite">
                {message}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : register
                  ? "Create Account →"
                  : "Login →"}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            className="google-btn"
            type="button"
            onClick={() =>
              setMessage(
                "Google sign-in is not configured yet. Use email and password."
              )
            }
          >
            Continue with Google
          </button>

          <p className="switch-auth">
            {register
              ? "Already have an account?"
              : "Don't have an account?"}

            <button type="button" onClick={switchMode}>
              {register ? " Login" : " Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
