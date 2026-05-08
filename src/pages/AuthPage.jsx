import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Loader } from "../components/UI";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register, authLoading, hasProfile } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Continue where you left off."
        : "Create your Peach account in seconds.",
    [mode]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(values.email.trim(), values.password);
      } else {
        await register(values.email.trim(), values.password);
      }
      // navigate(hasProfile ? "/app/feed" : "/app/editprofile", {
      navigate("/app/feed", {
        replace: true,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Authentication failed";
      setError(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <div className="auth-brand">
          <div className="brand-badge">🍑</div>
          <div>
            <h1>Peach</h1>
            <p>Warm, modern, minimal matchmaking.</p>
          </div>
        </div>

        <div className="auth-toggle">
          <button
            className={mode === "login" ? "toggle active" : "toggle"}
            onClick={() => setMode("login")}
          >
            Log in
          </button>
          <button
            className={mode === "register" ? "toggle active" : "toggle"}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>

        <p className="auth-subtitle">{subtitle}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={values.email}
            onChange={handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            placeholder="••••••••"
            value={values.password}
            onChange={handleChange}
            required
          />

          {error ? <div className="form-error">{error}</div> : null}

          <Button type="submit" disabled={authLoading}>
            {authLoading ? (
              <Loader label="Working" />
            ) : mode === "login" ? (
              "Log in"
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="auth-footer">
          <span>Secure token-based auth</span>
          <span>Responsive UI</span>
        </div>
      </div>

      <div className="auth-art">
        <div className="hero-card hero-large">
          <span className="eyebrow">Peach experience</span>
          <h2>Swipe, match, and chat in a clean interface.</h2>
          <p>Optimized for mobile first, but polished on desktop too.</p>
        </div>
        <div className="hero-grid">
          <div className="hero-card">
            <strong>Feed</strong>
            <span>Beautiful profile cards</span>
          </div>
          <div className="hero-card">
            <strong>Matches</strong>
            <span>See mutual connections</span>
          </div>
          <div className="hero-card">
            <strong>Chat</strong>
            <span>Simple message threads</span>
          </div>
          <div className="hero-card">
            <strong>Profile</strong>
            <span>Fast setup and edit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
