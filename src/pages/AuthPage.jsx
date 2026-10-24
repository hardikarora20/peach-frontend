<<<<<<< HEAD
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

        // navigate(hasProfile ? "/app/feed" : "/app/onboarding", {
        navigate("/app/feed", {
          replace: true,
        });
        return;
      }

      await register(values.email.trim(), values.password);
      setSuccessMessage(
        "Account created successfully. Let’s build your profile."
      );
      await login(values.email.trim(), values.password);
      setTimeout(() => {
        navigate("/app/onboarding", { replace: true });
      }, 1000);
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
              <span>🍑</span>
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
                <span className="auth-submit__loading">
                  <span className="auth-spinner" />
                  {mode === "login" ? "Signing in…" : "Creating account…"}
                </span>
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
=======
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Heart, Lock, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import { Banner, Button, Segmented } from "../components/ui";
import { Logo } from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/auth.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Decorative stack of cards on the left – pure CSS, no images
function Showcase() {
  return (
    <div className="showcase" aria-hidden="true">
      <div className="showcase__card showcase__card--back" />
      <div className="showcase__card showcase__card--mid" />
      <div className="showcase__card showcase__card--front">
        <div className="showcase__shine" />
        <div className="showcase__meta">
          <span className="showcase__line showcase__line--lg" />
          <span className="showcase__line" />
        </div>
      </div>
      <div className="showcase__bubble">Coffee this weekend?</div>
      <div className="showcase__match">
        <Heart size={14} fill="currentColor" /> It's a match
      </div>
    </div>
  );
}

export default function AuthPage() {
  const { login, register, authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  if (token) return <Navigate to="/app" replace />;

  const isLogin = mode === "login";
  const onChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (authLoading) return;
    setError("");
    const email = values.email.trim();
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.");
    if (!isLogin && values.password.length < 6) return setError("Use at least 6 characters for your password.");
    try {
      if (isLogin) {
        await login(email, values.password);
        navigate("/app", { replace: true });
      } else {
        await register(email, values.password);
        navigate("/app/onboarding", { replace: true });
      }
    } catch (err) {
      setError(getErrorMessage(err, isLogin ? "Email or password is incorrect." : "Couldn't create your account."));
    }
  };

  return (
    <div className="auth">
      <section className="auth__art">
        <Logo size={34} />
        <div className="auth__copy">
          <h1 className="display auth__headline">
            Find someone <em>worth</em> texting back.
          </h1>
          <p>Real profiles, mutual likes only, and a conversation starter on every card.</p>
        </div>
        <Showcase />
      </section>

      <section className="auth__panel">
        <ThemeToggle className="auth__theme" />
        <div className="auth-card">
          <Segmented
            full
            label="Sign in or create an account"
            value={mode}
            onChange={(v) => {
              setMode(v);
              setError("");
            }}
            options={[
              { value: "login", label: "Sign in" },
              { value: "signup", label: "Create account" },
            ]}
          />

          <header key={mode} className="auth-card__head">
            <h2 className="display">{isLogin ? "Welcome back" : "Let's get you started"}</h2>
            <p>{isLogin ? "Sign in with your email and password." : "You'll set up your profile right after this."}</p>
          </header>

          <Banner tone="error">{error}</Banner>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            <label className="field">
              <span className="field__label">Email</span>
              <span className="input-shell">
                <Mail size={18} className="input-shell__icon" />
                <input className="input-shell__input" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={values.email} onChange={onChange} />
              </span>
            </label>

            <label className="field">
              <span className="field__label">Password</span>
              <span className="input-shell">
                <Lock size={18} className="input-shell__icon" />
                <input
                  className="input-shell__input"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  placeholder={isLogin ? "Your password" : "At least 6 characters"}
                  value={values.password}
                  onChange={onChange}
                />
                <button type="button" className="input-shell__action" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </span>
            </label>

            <Button type="submit" size="lg" block loading={authLoading} trailingIcon={<ArrowRight size={18} />}>
              {isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>
        </div>
      </section>
>>>>>>> 8a08bf3 (updated ui)
    </div>
  );
}
