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
    </div>
  );
}
