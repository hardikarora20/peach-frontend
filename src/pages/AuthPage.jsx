import React, { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  Lock,
  Mail,
  RotateCw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../api/client";
import { Banner, Button, Segmented } from "../components/ui";
import { Logo } from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/auth.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 60;

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
  const {
    login,
    requestSignupOtp,
    resendSignupOtp,
    verifySignup,
    authLoading,
    token,
  } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState("login"); // login | signup
  const [step, setStep] = useState("form"); // form | otp (signup only)
  const [values, setValues] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const otpRef = useRef(null);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  useEffect(() => {
    if (step === "otp") otpRef.current?.focus();
  }, [step]);

  if (token) return <Navigate to="/app" replace />;

  const isLogin = mode === "login";
  const email = values.email.trim().toLowerCase();
  const onChange = (e) =>
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  const resetMessages = () => {
    setError("");
    setNotice("");
  };

  const backToForm = () => {
    setStep("form");
    setOtp("");
    resetMessages();
  };

  // Step 1 (or sign in)
  const onSubmit = async (e) => {
    e.preventDefault();
    if (authLoading) return;
    resetMessages();
    if (!EMAIL_RE.test(email)) return setError("Enter a valid email address.");
    if (!isLogin && values.password.length < 6)
      return setError("Use at least 6 characters for your password.");

    try {
      if (isLogin) {
        await login(email, values.password);
        navigate("/app", { replace: true });
      } else {
        await requestSignupOtp(email, values.password);
        setStep("otp");
        setCooldown(RESEND_SECONDS);
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          isLogin
            ? "Email or password is incorrect."
            : "Couldn't send the code."
        )
      );
    }
  };

  // Step 2
  const onVerify = async (e) => {
    e.preventDefault();
    if (authLoading) return;
    resetMessages();
    if (!/^\d{6}$/.test(otp))
      return setError("Enter the 6-digit code from your email.");
    try {
      await verifySignup(email, otp);
      navigate("/app/onboarding", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      setError(getErrorMessage(err, "Couldn't verify the code."));
      if (status === 404) backToForm(); // pending sign-up gone → start again
      else setOtp("");
    }
  };

  const onResend = async () => {
    if (cooldown > 0 || resending) return;
    resetMessages();
    setResending(true);
    try {
      await resendSignupOtp(email);
      setNotice(`New code sent to ${email}.`);
      setOtp("");
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't resend the code."));
      if (err?.response?.status === 404) backToForm();
    } finally {
      setResending(false);
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
          <p>
            Real profiles, mutual likes only, and a conversation starter on
            every card.
          </p>
        </div>
        <Showcase />
      </section>

      <section className="auth__panel">
        <ThemeToggle className="auth__theme" />

        <div className="auth-card">
          {step === "form" ? (
            <>
              <Segmented
                full
                label="Sign in or create an account"
                value={mode}
                onChange={(v) => {
                  setMode(v);
                  resetMessages();
                }}
                options={[
                  { value: "login", label: "Sign in" },
                  { value: "signup", label: "Create account" },
                ]}
              />

              <header className="auth-card__head" key={mode}>
                <h2 className="display">
                  {isLogin ? "Welcome back" : "Let's get you started"}
                </h2>
                <p>
                  {isLogin
                    ? "Sign in with your email and password."
                    : "We'll email you a code to confirm it's you."}
                </p>
              </header>

              <Banner tone="error">{error}</Banner>

              <form className="auth-form" onSubmit={onSubmit} noValidate>
                <label className="field">
                  <span className="field__label">Email</span>
                  <span className="input-shell">
                    <Mail size={18} className="input-shell__icon" />
                    <input
                      className="input-shell__input"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={values.email}
                      onChange={onChange}
                    />
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
                      autoComplete={
                        isLogin ? "current-password" : "new-password"
                      }
                      placeholder={
                        isLogin ? "Your password" : "At least 6 characters"
                      }
                      value={values.password}
                      onChange={onChange}
                    />
                    <button
                      type="button"
                      className="input-shell__action"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <Button
                  type="submit"
                  size="lg"
                  block
                  loading={authLoading}
                  trailingIcon={<ArrowRight size={18} />}
                >
                  {isLogin ? "Sign in" : "Send code"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <button
                type="button"
                className="link-btn auth-back"
                onClick={backToForm}
              >
                <ArrowLeft size={16} /> Use a different email
              </button>

              <header className="auth-card__head" key="otp">
                <h2 className="display">Check your inbox</h2>
                <p>
                  We sent a 6-digit code to <strong>{email}</strong>. It expires
                  in 10 minutes.
                </p>
              </header>

              <Banner tone="error">{error}</Banner>
              <Banner tone="success">{notice}</Banner>

              <form className="auth-form" onSubmit={onVerify} noValidate>
                <label className="field">
                  <span className="field__label">Verification code</span>
                  <span className="input-shell">
                    <KeyRound size={18} className="input-shell__icon" />
                    <input
                      ref={otpRef}
                      className="input-shell__input otp-input"
                      name="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]*"
                      maxLength={6}
                      placeholder="••••••"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                    />
                  </span>
                </label>

                <Button
                  type="submit"
                  size="lg"
                  block
                  loading={authLoading}
                  disabled={otp.length !== 6}
                  trailingIcon={<ArrowRight size={18} />}
                >
                  Verify & create account
                </Button>

                <p className="auth-resend">
                  Didn't get it? Check spam, or{" "}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={onResend}
                    disabled={cooldown > 0 || resending}
                  >
                    {resending ? (
                      "sending…"
                    ) : cooldown > 0 ? (
                      `resend in ${cooldown}s`
                    ) : (
                      <>
                        <RotateCw size={13} /> resend code
                      </>
                    )}
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
