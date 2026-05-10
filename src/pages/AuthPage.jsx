import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Heart,
  MessageCircle,
  Sparkles,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button, Input, Loader } from "../components/UI";
import { useAuth } from "../context/AuthContext";
import "./authpage.css";

function hasText(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function Bubble({ delay, size, x, y, active = false }) {
  return (
    <span
      className={`auth-bubble ${active ? "is-active" : ""}`}
      style={{
        ["--delay"]: delay,
        ["--size"]: size,
        ["--x"]: x,
        ["--y"]: y,
      }}
      aria-hidden="true"
    />
  );
}

export default function AuthPage() {
  const { login, register, authLoading, hasProfile } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const subtitle = useMemo(
    () =>
      mode === "login"
        ? "Continue where you left off."
        : "Create your Peach account in seconds.",
    [mode]
  );

  const heroCopy = useMemo(
    () =>
      mode === "login"
        ? "A calmer, softer way to meet. Profile first, pressure last."
        : "Build your profile once, then jump straight into the feed.",
    [mode]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authLoading) return;

    setError("");
    setSuccessMessage("");

    try {
      if (mode === "login") {
        await login(values.email.trim(), values.password);

        navigate(hasProfile ? "/app/feed" : "/app/onboarding", {
          replace: true,
        });
        return;
      }

      await register(values.email.trim(), values.password);

      setSuccessMessage(
        "Account created successfully. Let’s build your profile."
      );
      navigate("/app/onboarding", { replace: true });
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
      <div className="auth-shell">
        <div className="auth-hero">
          <div className="auth-brand">
            <div className="auth-brand__mark">
              <Sparkles size={20} />
            </div>

            <div>
              <div className="auth-brand__name">Peach</div>
              <div className="auth-brand__tag">
                Warm, modern, minimal matchmaking.
              </div>
            </div>
          </div>

          <p className="auth-hero__copy">{heroCopy}</p>

          <div className="auth-preview">
            <div className="auth-preview__card">
              <div className="auth-preview__top">
                <span className="auth-preview__dot" />
                <span className="auth-preview__dot" />
                <span className="auth-preview__dot" />
              </div>

              <div className="auth-preview__bubble-wrap">
                <Bubble delay="0s" size="74px" x="12%" y="18%" />
                <Bubble delay="0.6s" size="56px" x="30%" y="8%" />
                <Bubble delay="1.1s" size="64px" x="74%" y="16%" />
                <Bubble delay="0.2s" size="52px" x="18%" y="56%" />
                <Bubble delay="0.8s" size="86px" x="44%" y="34%" active />
                <Bubble delay="0.4s" size="58px" x="78%" y="58%" />
                <Bubble delay="1.4s" size="48px" x="58%" y="76%" />
              </div>

              <div className="auth-preview__caption">
                Thoughtful matches, softer conversations.
              </div>
            </div>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <Users size={16} />
              <span>More personal profiles</span>
            </div>
            <div className="auth-feature">
              <Heart size={16} />
              <span>Better match signals</span>
            </div>
            <div className="auth-feature">
              <MessageCircle size={16} />
              <span>Simple, calm messaging</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "is-active" : ""}`}
              onClick={() => {
                setMode("login");
                setError("");
                setSuccessMessage("");
              }}
            >
              Log in
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "signup" ? "is-active" : ""}`}
              onClick={() => {
                setMode("signup");
                setError("");
                setSuccessMessage("");
              }}
            >
              Create account
            </button>
          </div>

          <div className="auth-card__copy">
            <span className="auth-card__eyebrow">
              {mode === "login" ? "Welcome back" : "Join Peach"}
            </span>
            <h1>
              {mode === "login" ? "Sign in to Peach" : "Create your account"}
            </h1>
            <p>{subtitle}</p>
          </div>

          {error ? (
            <div className="auth-banner auth-banner--error">{error}</div>
          ) : null}

          {successMessage ? (
            <div className="auth-banner auth-banner--success">
              {successMessage}
            </div>
          ) : null}

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
              icon={<Mail size={16} />}
            />

            <label className="auth-password-wrap">
              <Input
                label="Password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                placeholder="••••••••"
                value={values.password}
                onChange={handleChange}
                required
                icon={<Lock size={16} />}
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setPasswordVisible((v) => !v)}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
              >
                {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </label>

            <div className="auth-note">
              {mode === "login"
                ? "If your profile is missing, you will be sent to onboarding."
                : "After signup, you will go straight to onboarding."}
            </div>

            <Button type="submit" disabled={authLoading}>
              {authLoading ? (
                <Loader label="Working" />
              ) : mode === "login" ? (
                <>
                  Log in <ArrowRight size={18} />
                </>
              ) : (
                <>
                  Create account <ArrowRight size={18} />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
