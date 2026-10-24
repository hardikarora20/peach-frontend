import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, LogOut } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import useProfileForm from "../hooks/useProfileForm";
import { Banner, Button, Loader } from "../components/ui";
import { Logo } from "../components/Logo";
import ThemeToggle from "../components/ThemeToggle";
import {
  BasicsSection, IntroSection, LifestyleSection, PersonalitySection, PhotosSection, RelationshipSection, ValuesSection,
} from "../components/profile/ProfileSections";
import "../styles/profile-form.css";

// Only Basics is required. Everything else can be skipped and filled in later.
const STEPS = [
  { key: "basics", title: "The basics", text: "Your name, age, city and a few lines about you. This is all you need to start.", required: true },
  { key: "photos", title: "Add some photos", text: "Optional, but profiles with photos get far more replies. You can add them later too." },
  { key: "looking", title: "What you're after", text: "Helps people see if you want the same thing." },
  { key: "about", title: "A bit more about you", text: "Personality, habits and the things that matter to you." },
  { key: "intro", title: "Make it easy to say hi", text: "An opening line and a couple of prompts give people something to reply to." },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { logout, refreshProfileExists, setProfileExists } = useAuth();
  const pf = useProfileForm();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState("forward");
  const [error, setError] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const last = step === STEPS.length - 1;
  const basicsDone = pf.missingBasics.length === 0;
  const current = STEPS[step];

  const goTo = (i) => {
    setError("");
    setDir(i >= step ? "forward" : "back");
    setStep(i);
    document.querySelector(".ob__main")?.scrollTo({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const requireBasics = () => {
    if (basicsDone) return true;
    setShowErrors(true);
    setError(`Please add your ${pf.missingBasics.join(", ")}.`);
    if (step !== 0) goTo(0);
    return false;
  };

  const next = () => {
    if (step === 0 && !requireBasics()) return;
    goTo(Math.min(step + 1, STEPS.length - 1));
  };

  const finish = async () => {
    if (!requireBasics()) return;
    try {
      await pf.save();
      const ok = await refreshProfileExists();
      if (!ok) setProfileExists(true);
      navigate("/app/feed", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save your profile."));
    }
  };

  if (pf.loading) {
    return (
      <div className="page-center">
        <Loader label="Getting things ready" />
      </div>
    );
  }

  return (
    <div className="ob">
      <aside className="ob__aside">
        <div className="ob__top">
          <Logo size={30} />
          <div className="row-gap">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut size={16} />}
              onClick={() => {
                logout();
                navigate("/auth", { replace: true });
              }}
            >
              Log out
            </Button>
          </div>
        </div>

        <div key={step} className={`ob__intro is-${dir}`}>
          <span className="eyebrow">
            Step {step + 1} of {STEPS.length}
            {current.required ? " · required" : " · optional"}
          </span>
          <h1 className="display">{current.title}</h1>
          <p>{current.text}</p>
        </div>

        <ol className="ob__steps">
          {STEPS.map((s, i) => {
            const reachable = i <= step || basicsDone;
            return (
              <li key={s.key} className={i < step ? "is-done" : i === step ? "is-current" : ""}>
                <button type="button" onClick={() => reachable && goTo(i)} disabled={!reachable}>
                  <span className="ob__dot">{i < step ? <Check size={13} strokeWidth={3} /> : i + 1}</span>
                  <span>{s.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="ob__progress" aria-hidden="true">
          <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
      </aside>

      <main className="ob__main">
        <Banner tone="error">{error || pf.loadError}</Banner>
        <div key={step} className={`ob__step is-${dir}`}>
          {current.key === "basics" ? <BasicsSection pf={pf} showErrors={showErrors} /> : null}
          {current.key === "photos" ? <PhotosSection pf={pf} /> : null}
          {current.key === "looking" ? <RelationshipSection pf={pf} /> : null}
          {current.key === "about" ? (
            <>
              <PersonalitySection pf={pf} />
              <LifestyleSection pf={pf} />
              <ValuesSection pf={pf} />
            </>
          ) : null}
          {current.key === "intro" ? <IntroSection pf={pf} /> : null}
        </div>

        <footer className="ob__nav">
          <Button variant="outline" icon={<ArrowLeft size={18} />} onClick={() => goTo(Math.max(step - 1, 0))} disabled={step === 0 || pf.saving}>
            Back
          </Button>
          <div className="row-gap">
            {step > 0 && !last ? (
              <Button variant="ghost" onClick={finish} disabled={pf.saving}>
                Finish later
              </Button>
            ) : null}
            {last ? (
              <Button icon={<Check size={18} />} loading={pf.saving} onClick={finish}>
                Start discovering
              </Button>
            ) : (
              <Button trailingIcon={<ArrowRight size={18} />} onClick={next}>
                Continue
              </Button>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
