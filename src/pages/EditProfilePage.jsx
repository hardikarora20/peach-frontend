import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, RefreshCcw, Save } from "lucide-react";
import { getErrorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import useProfileForm from "../hooks/useProfileForm";
import { Banner, Button, EmptyState, IconButton, Loader } from "../components/ui";
import {
  BasicsSection, IntroSection, LifestyleSection, PersonalitySection, PhotosSection, RelationshipSection, ValuesSection,
} from "../components/profile/ProfileSections";
import { hasText } from "../utils/format";
import "../styles/profile-form.css";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { setProfileExists, refreshProfileExists } = useAuth();
  const pf = useProfileForm();
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [activeId, setActiveId] = useState("basics");

  const SECTIONS = [
    { id: "basics", label: "Basics", done: pf.missingBasics.length === 0 },
    { id: "photos", label: "Photos", done: pf.completion.filledImages > 0 },
    { id: "opening", label: "Opening line", done: Boolean(pf.completion.hasOpening) },
    { id: "prompts", label: "Prompts", done: pf.completion.filledPrompts > 0 },
    { id: "relationship", label: "Looking for", done: hasText(pf.form.datingIntent) },
    { id: "lifestyle", label: "Lifestyle", done: hasText(pf.form.drinkHabit) || hasText(pf.form.sleepStyle) },
    { id: "personality", label: "Interests", done: pf.form.interests.length > 0 },
    { id: "values", label: "Values", done: pf.form.coreValues.length > 0 },
  ];

  useEffect(() => {
    if (!pf.dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [pf.dirty]);

  // Highlight the section you're looking at in the side nav
  useEffect(() => {
    if (pf.loading) return undefined;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );
    document.querySelectorAll(".edit__forms .form-card[id]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pf.loading]);

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const onSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSaved(false);
    if (pf.missingBasics.length) {
      setShowErrors(true);
      setError(`Please add your ${pf.missingBasics.join(", ")} before saving.`);
      jump("basics");
      return;
    }
    try {
      await pf.save();
      setProfileExists(true);
      refreshProfileExists(); // keeps the sidebar avatar/name fresh
      setSaved(true);
      setTimeout(() => navigate("/app/profile"), 700);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't save your changes."));
    }
  };

  const goBack = () => {
    if (pf.dirty && !window.confirm("Discard your unsaved changes?")) return;
    navigate("/app/profile");
  };

  if (pf.loading) {
    return (
      <div className="page-center page-center--inset">
        <Loader label="Loading your profile" />
      </div>
    );
  }

  if (pf.loadError) {
    return (
      <div className="page-center page-center--inset">
        <EmptyState
          title="Couldn't load your profile"
          description={pf.loadError}
          action={
            <Button icon={<RefreshCcw size={18} />} onClick={pf.reload}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <form className="edit" onSubmit={onSubmit} noValidate>
      <aside className="edit__nav">
        <IconButton label="Back to profile" variant="soft" onClick={goBack}>
          <ArrowLeft size={20} />
        </IconButton>
        <div className="edit__title">
          <span className="eyebrow">Edit profile</span>
          <h1 className="display">{pf.completion.percent}% complete</h1>
          <div className="progress">
            <span style={{ width: `${pf.completion.percent}%` }} />
          </div>
        </div>
        <ol className="edit__steps">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <button type="button" className={`edit__step ${activeId === s.id ? "is-active" : ""}`} onClick={() => jump(s.id)}>
                <span className={`edit__check ${s.done ? "is-done" : ""}`}>{s.done ? <Check size={12} strokeWidth={3} /> : null}</span>
                {s.label}
              </button>
            </li>
          ))}
        </ol>
      </aside>

      <div className="edit__forms">
        <Banner tone="error">{error}</Banner>
        <BasicsSection pf={pf} showErrors={showErrors} />
        <PhotosSection pf={pf} />
        <IntroSection pf={pf} />
        <RelationshipSection pf={pf} />
        <LifestyleSection pf={pf} />
        <PersonalitySection pf={pf} />
        <ValuesSection pf={pf} />
        <div className="edit__spacer" />
      </div>

      {/* Save bar slides up as soon as something changes */}
      <div className={`savebar ${pf.dirty || saved || pf.saving ? "is-visible" : ""}`}>
        <span>{saved ? "Saved" : "You have unsaved changes"}</span>
        <div className="row-gap">
          <Button variant="ghost" onClick={goBack}>
            Discard
          </Button>
          <Button type="submit" icon={saved ? <Check size={18} /> : <Save size={18} />} loading={pf.saving}>
            {saved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
