import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  Heart,
  Sparkles,
  Coffee,
  Image as ImageIcon,
  Globe,
  MessageCircle,
  Moon,
  Martini,
  CigaretteOff,
  Utensils,
  X,
  Trash2,
  MapPin,
} from "lucide-react";
import "./editProfile.css";
import "./profile.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const GENDER_OPTIONS = ["MALE", "FEMALE", "NON_BINARY", "PREFER_NOT_TO_SAY"];

const DATING_INTENT_OPTIONS = [
  "SERIOUS_RELATIONSHIP",
  "CASUAL_DATING",
  "FRIENDSHIP",
  "OPEN_TO_BOTH",
  "NOT_SURE_YET",
];

const CONNECTION_OPTIONS = [
  "LONG_TERM",
  "SHORT_TERM",
  "OPEN_TO_BOTH",
  "NOT_SURE_YET",
];

const LONG_DISTANCE_OPTIONS = ["YES", "NO", "MAYBE"];

const COMMUNICATION_OPTIONS = [
  "TEXT_A_LOT",
  "CALLS_OVER_TEXTS",
  "SLOW_REPLIES",
  "DEPENDS_ON_MOOD",
];

const LOVE_LANGUAGE_OPTIONS = [
  "WORDS_OF_AFFIRMATION",
  "ACTS_OF_SERVICE",
  "PHYSICAL_TOUCH",
  "QUALITY_TIME",
  "GIFTS",
];

const CONFLICT_OPTIONS = [
  "TALK_IT_OUT_IMMEDIATELY",
  "TAKE_SPACE_FIRST",
  "AVOID_CONFRONTATION",
  "DEPENDS",
];

const DRINK_OPTIONS = ["NO", "OCCASIONALLY", "YES"];
const SMOKE_OPTIONS = ["NO", "OCCASIONALLY", "YES"];
const FOOD_OPTIONS = ["VEG", "NON_VEG", "EGGETARIAN", "VEGAN"];
const SLEEP_OPTIONS = ["EARLY_BIRD", "NIGHT_OWL", "DEPENDS"];

const PERSONALITY_OPTIONS = [
  "INTROVERT",
  "EXTROVERT",
  "AMBIVERT",
  "FUNNY",
  "DEEP_THINKER",
  "CALM",
  "ADVENTUROUS",
  "ROMANTIC",
  "CHAOTIC",
  "AMBITIOUS",
  "CURIOUS",
  "ARTISTIC",
];

const CORE_VALUE_OPTIONS = [
  "HONESTY",
  "GROWTH",
  "LOYALTY",
  "RESPECT",
  "KINDNESS",
  "COMMUNICATION",
  "AMBITION",
  "PEACE",
  "FAMILY",
  "HUMOR",
  "BALANCE",
  "ADVENTURE",
];

const INTEREST_OPTIONS = [
  "MUSIC",
  "TRAVEL",
  "GYM",
  "MOVIES",
  "FOOD",
  "COFFEE",
  "PHOTOGRAPHY",
  "BOOKS",
  "BEACH",
  "GAMING",
  "ART",
  "DANCE",
  "PETS",
  "SPORTS",
  "YOGA",
  "FASHION",
  "COOKING",
  "TECH",
  "HIKING",
  "THEATRE",
  "CRICKET",
];

const DEALBREAKER_OPTIONS = [
  "DISHONESTY",
  "RUDENESS",
  "TOXICITY",
  "POOR_COMMUNICATION",
  "SMOKING",
  "DRINKING",
  "FLAKINESS",
  "JUDGMENTAL_BEHAVIOR",
  "CHEATING",
  "LACK_OF_AMBITION",
  "ARROGANCE",
  "NEEDINESS",
  "SECRETIVENESS",
  "DISRESPECT",
];

const OPENING_LINE_OPTIONS = [
  {
    value: "Say hi and tell me something small that made you smile today.",
    label: "Say hi and tell me something small that made you smile today.",
  },
  {
    value: "Come with a good joke or a better playlist.",
    label: "Come with a good joke or a better playlist.",
  },
  {
    value: "I respect a bold opener.",
    label: "I respect a bold opener.",
  },
  {
    value: "Start sweet, start funny, start however you like.",
    label: "Start sweet, start funny, start however you like.",
  },
  {
    value: "I am usually nicer in person, but this is a solid start.",
    label: "I am usually nicer in person, but this is a solid start.",
  },
  {
    value: "If you can make me laugh, you already have my attention.",
    label: "If you can make me laugh, you already have my attention.",
  },
  {
    value: "A little curiosity goes a long way.",
    label: "A little curiosity goes a long way.",
  },
  {
    value: "Tell me your most underrated opinion.",
    label: "Tell me your most underrated opinion.",
  },
  {
    value: "You can start with a compliment if you mean it.",
    label: "You can start with a compliment if you mean it.",
  },
  {
    value: "A good conversation beats a perfect line.",
    label: "A good conversation beats a perfect line.",
  },
  {
    value: "I like people who know how to keep it light.",
    label: "I like people who know how to keep it light.",
  },
  {
    value: "WRITE_MY_OWN",
    label: "Write my own",
  },
];

const PROMPT_CATEGORIES = [
  {
    key: "love",
    label: "How I love",
    prompts: [
      {
        id: "feel_loved",
        question: "The way I feel loved is…",
        placeholder: "A little detail about how you like to be cared for.",
      },
      {
        id: "green_flag",
        question: "A green flag I never ignore is…",
        placeholder: "What makes someone stand out in a good way?",
      },
      {
        id: "open_up",
        question: "I usually open up when…",
        placeholder: "What helps you feel comfortable with someone?",
      },
      {
        id: "boundary",
        question: "A boundary I protect is…",
        placeholder: "Something you take seriously in a connection.",
      },
      {
        id: "connection_want",
        question: "The kind of connection I want is…",
        placeholder: "How should the connection feel to you?",
      },
    ],
  },
  {
    key: "life",
    label: "How I live",
    prompts: [
      {
        id: "stressed",
        question: "When I am stressed, I…",
        placeholder: "What do you usually do to reset?",
      },
      {
        id: "weekend",
        question: "My weekend reset looks like…",
        placeholder: "Describe your ideal slow weekend.",
      },
      {
        id: "comfort",
        question: "My comfort habit is…",
        placeholder: "A small habit that feels like home.",
      },
      {
        id: "routine",
        question: "A routine that keeps me sane is…",
        placeholder: "A daily or weekly rhythm you like.",
      },
      {
        id: "misread",
        question: "People think I am ___, but I am actually ___",
        placeholder: "A fun one that shows your real personality.",
      },
    ],
  },
  {
    key: "values",
    label: "What I value",
    prompts: [
      {
        id: "value_people",
        question: "I value people who…",
        placeholder: "What matters most in people around you?",
      },
      {
        id: "biggest_thing",
        question: "The biggest thing I look for in someone is…",
        placeholder: "Your main non-negotiable.",
      },
      {
        id: "safe",
        question: "A relationship feels safe when…",
        placeholder: "What makes a bond feel healthy to you?",
      },
      {
        id: "dealbreaker_prompt",
        question: "A dealbreaker for me is…",
        placeholder: "What absolutely does not work for you?",
      },
      {
        id: "admire",
        question: "I admire people who…",
        placeholder: "What kind of people do you respect most?",
      },
    ],
  },
  {
    key: "human",
    label: "Little human things",
    prompts: [
      {
        id: "secretly_love",
        question: "I secretly love…",
        placeholder: "Something small and honest about you.",
      },
      {
        id: "talk_about",
        question: "A random thing I could talk about for hours is…",
        placeholder: "Your harmless obsession.",
      },
      {
        id: "getting_better",
        question: "Something I am trying to get better at is…",
        placeholder: "A growth thing, but keep it light.",
      },
      {
        id: "song",
        question: "A song that feels like me is…",
        placeholder: "Optional, but fun.",
      },
      {
        id: "simple_joy",
        question: "My simple joy is…",
        placeholder: "The little thing that makes your day better.",
      },
    ],
  },
];

function hasText(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}

function humanize(value) {
  if (!hasText(value)) return "";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeEnum(value) {
  if (!hasText(value)) return "";
  return String(value)
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^\w]/g, "")
    .toUpperCase();
}

function normalizeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeEnum).filter(Boolean);
}

function normalizeValue(value) {
  if (!hasText(value)) return "";
  return normalizeEnum(value);
}

function emptyForm() {
  return {
    name: "",
    age: "",
    gender: "",
    bio: "",
    location: "",
    datingIntent: "",
    connectionPreference: "",
    openToLongDistance: "",
    personalityTraits: [],
    communicationStyle: "",
    loveLanguage: "",
    conflictStyle: "",
    drinkHabit: "",
    smokeHabit: "",
    foodPreference: "",
    sleepStyle: "",
    coreValues: [],
    dealbreakers: [],
    interests: [],
    images: Array.from({ length: 6 }, () => ""),
  };
}

function profileToForm(profile = {}) {
  const fallbackImages = [
    profile?.profileImageUrl,
    profile?.avatarUrl,
    profile?.photoUrl,
    profile?.imageUrl,
  ].filter(Boolean);

  const sourceImages = Array.isArray(profile?.images)
    ? profile.images.filter(Boolean)
    : [];
  const mergedImages = [...sourceImages, ...fallbackImages];

  return {
    name: profile?.name || "",
    age: profile?.age ?? "",
    gender: normalizeValue(profile?.gender),
    bio: profile?.bio || "",
    location: profile?.location || "",
    datingIntent: normalizeValue(profile?.datingIntent),
    connectionPreference: normalizeValue(profile?.connectionPreference),
    openToLongDistance: normalizeValue(profile?.openToLongDistance),
    personalityTraits: normalizeArray(profile?.personalityTraits),
    communicationStyle: normalizeValue(profile?.communicationStyle),
    loveLanguage: normalizeValue(profile?.loveLanguage),
    conflictStyle: normalizeValue(profile?.conflictStyle),
    drinkHabit: normalizeValue(profile?.drinkHabit),
    smokeHabit: normalizeValue(profile?.smokeHabit),
    foodPreference: normalizeValue(profile?.foodPreference),
    sleepStyle: normalizeValue(profile?.sleepStyle),
    coreValues: normalizeArray(profile?.coreValues),
    dealbreakers: normalizeArray(profile?.dealbreakers),
    interests: normalizeArray(profile?.interests),
    images: Array.from({ length: 6 }, (_, index) => mergedImages[index] || ""),
  };
}

function resolveOpeningLineState(line) {
  const value = String(line || "").trim();
  if (!value) return { choice: "", custom: "" };

  const matched = OPENING_LINE_OPTIONS.some((opt) => opt.value === value);
  return matched
    ? { choice: value, custom: "" }
    : { choice: "WRITE_MY_OWN", custom: value };
}

function calculateCompletion(form, openingLine, prompts) {
  const basicFields = [
    form.name,
    form.age,
    form.gender,
    form.bio,
    form.location,
    form.datingIntent,
    form.connectionPreference,
    form.openToLongDistance,
    form.communicationStyle,
    form.loveLanguage,
    form.conflictStyle,
    form.drinkHabit,
    form.smokeHabit,
    form.foodPreference,
    form.sleepStyle,
  ];

  const filledBasic = basicFields.filter((value) => hasText(value)).length;

  const multiCategories = [
    form.personalityTraits,
    form.coreValues,
    form.dealbreakers,
    form.interests,
  ];

  const filledMulti = multiCategories.filter(
    (value) => Array.isArray(value) && value.length > 0
  ).length;

  const filledImages = (form.images || []).filter((url) => hasText(url)).length;
  const filledPrompts = (prompts || []).filter((item) =>
    hasText(item?.answer)
  ).length;
  const hasOpening = hasText(openingLine) ? 1 : 0;

  const totalPoints = 15 + 4 + 6 + 3 + 1;
  const currentPoints =
    filledBasic +
    filledMulti +
    Math.min(filledImages, 6) +
    filledPrompts +
    hasOpening;

  const percent = Math.round((currentPoints / totalPoints) * 100);

  return {
    percent,
    filledBasic,
    filledMulti,
    filledImages,
    filledPrompts,
    hasOpening,
  };
}

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

function Section({ title, icon, hint, children, span = 12 }) {
  return (
    <section className={`edit-card edit-card--span-${span}`}>
      <div className="edit-card__head">
        <div className="edit-card__title">
          {icon ? <span className="edit-card__icon">{icon}</span> : null}
          <div>
            <h2>{title}</h2>
            {hint ? <p>{hint}</p> : null}
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldWrapper({ label, icon, hint, children }) {
  return (
    <label className="edit-field">
      <span className="edit-field__label">
        {icon ? <span className="edit-field__label-icon">{icon}</span> : null}
        <span>{label}</span>
      </span>
      {children}
      {hint ? <span className="edit-field__hint">{hint}</span> : null}
    </label>
  );
}

function TextField({ label, icon, hint, ...props }) {
  return (
    <FieldWrapper label={label} icon={icon} hint={hint}>
      <input className="edit-input" {...props} />
    </FieldWrapper>
  );
}

function SelectField({
  label,
  icon,
  hint,
  placeholder = "Select…",
  options,
  ...props
}) {
  return (
    <FieldWrapper label={label} icon={icon} hint={hint}>
      <select className="edit-input edit-select" {...props}>
        <option value="">{placeholder}</option>
        {options.map((opt) => {
          if (typeof opt === "string") {
            return (
              <option key={opt} value={opt}>
                {humanize(opt)}
              </option>
            );
          }

          return (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          );
        })}
      </select>
    </FieldWrapper>
  );
}

function TextAreaField({ label, icon, hint, ...props }) {
  return (
    <FieldWrapper label={label} icon={icon} hint={hint}>
      <textarea className="edit-input edit-textarea" {...props} />
    </FieldWrapper>
  );
}

function ChipGroup({ label, icon, hint, options, value, onToggle }) {
  return (
    <div className="edit-chip-group">
      <div className="edit-chip-group__head">
        <div className="edit-chip-group__title">
          {icon ? <span className="edit-card__icon">{icon}</span> : null}
          <div>
            <h3>{label}</h3>
            {hint ? <p>{hint}</p> : null}
          </div>
        </div>
      </div>

      <div className="edit-chip-grid">
        {options.map((opt) => {
          const normalized = normalizeEnum(opt);
          const active = value.includes(normalized);

          return (
            <button
              key={opt}
              type="button"
              className={`edit-chip ${active ? "is-active" : ""}`}
              onClick={() => onToggle(normalized)}
            >
              {humanize(opt)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ImageSlot({ index, value, onChange, onClear }) {
  const hasImage = hasText(value);

  return (
    <div className="edit-photo-slot">
      <div className={`edit-photo-slot__preview ${hasImage ? "" : "is-empty"}`}>
        {hasImage ? (
          <img
            src={value}
            alt={`Profile image ${index + 1}`}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.classList.add("is-empty");
            }}
          />
        ) : (
          <div className="edit-photo-slot__empty">
            <ImageIcon size={22} />
            <span>Paste URL</span>
          </div>
        )}
      </div>

      <div className="edit-photo-slot__meta">
        <span>Image {index + 1}</span>
        {hasImage ? (
          <button type="button" className="edit-clear-btn" onClick={onClear}>
            <Trash2 size={14} />
            Clear
          </button>
        ) : null}
      </div>

      <input
        className="edit-input edit-input--url"
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://..."
      />
    </div>
  );
}

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [activePromptCategory, setActivePromptCategory] = useState("love");
  const [profilePrompts, setProfilePrompts] = useState([]);
  const [openingLineChoice, setOpeningLineChoice] = useState("");
  const [openingLineCustom, setOpeningLineCustom] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("peach_token");

      const response = await fetch(`${API_BASE}/profile/me`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 404) {
        setForm(emptyForm());
        setProfilePrompts([]);
        setOpeningLineChoice("");
        setOpeningLineCustom("");
        return;
      }

      if (!response.ok) {
        const body = await readJsonSafe(response);
        throw new Error(body?.message || "Could not load profile");
      }

      const data = await readJsonSafe(response);
      const profile = data?.data ?? data?.profile ?? data;

      setForm(profileToForm(profile));

      const rawPrompts = Array.isArray(profile?.profilePrompts)
        ? profile.profilePrompts
        : [];
      setProfilePrompts(
        rawPrompts.slice(0, 3).map((prompt, index) => ({
          id: prompt?.id || `prompt_${index}`,
          question: prompt?.question || "",
          answer: prompt?.answer || "",
        }))
      );

      const openingState = resolveOpeningLineState(profile?.openingLine);
      setOpeningLineChoice(openingState.choice);
      setOpeningLineCustom(openingState.custom);
    } catch (err) {
      setError(err?.message || "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const currentOpeningLine =
    openingLineChoice === "WRITE_MY_OWN"
      ? openingLineCustom
      : openingLineChoice;

  const completion = useMemo(
    () => calculateCompletion(form, currentOpeningLine, profilePrompts),
    [form, currentOpeningLine, profilePrompts]
  );

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInArray = (field, value) => {
    setForm((prev) => {
      const current = Array.isArray(prev[field]) ? prev[field] : [];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];

      return { ...prev, [field]: next };
    });
  };

  const updateImage = (index, value) => {
    setForm((prev) => {
      const images = [...prev.images];
      images[index] = value;
      return { ...prev, images };
    });
  };

  const togglePrompt = (prompt) => {
    setProfilePrompts((prev) => {
      const exists = prev.find((item) => item.id === prompt.id);

      if (exists) {
        return prev.filter((item) => item.id !== prompt.id);
      }

      if (prev.length >= 3) return prev;

      return [
        ...prev,
        {
          id: prompt.id,
          question: prompt.question,
          answer: "",
        },
      ];
    });
  };

  const updatePromptAnswer = (id, value) => {
    setProfilePrompts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, answer: value } : item))
    );
  };

  const removePrompt = (id) => {
    setProfilePrompts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("peach_token");

      const payload = {
        name: form.name.trim(),
        age: form.age === "" ? null : Number(form.age),
        gender: form.gender,
        bio: form.bio.trim(),
        location: form.location.trim(),
        datingIntent: form.datingIntent,
        connectionPreference: form.connectionPreference,
        openToLongDistance: form.openToLongDistance,
        personalityTraits: form.personalityTraits,
        communicationStyle: form.communicationStyle,
        loveLanguage: form.loveLanguage,
        conflictStyle: form.conflictStyle,
        drinkHabit: form.drinkHabit,
        smokeHabit: form.smokeHabit,
        foodPreference: form.foodPreference,
        sleepStyle: form.sleepStyle,
        coreValues: form.coreValues,
        dealbreakers: form.dealbreakers,
        interests: form.interests,
        images: form.images
          .map((url) => url.trim())
          .filter(Boolean)
          .slice(0, 6),
        openingLine: currentOpeningLine.trim(),
        profilePrompts: profilePrompts
          .map((prompt) => ({
            id: prompt.id,
            question: prompt.question,
            answer: (prompt.answer || "").trim(),
          }))
          .filter((item) => hasText(item.answer)),
      };

      const response = await fetch(`${API_BASE}/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await readJsonSafe(response);
        throw new Error(body?.message || "Could not save profile");
      }

      navigate("/app/profile");
    } catch (err) {
      setError(err?.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-page">
        <div className="edit-profile-shell">
          <div className="edit-loading">Loading profile…</div>
        </div>
      </div>
    );
  }

  const activeCategory =
    PROMPT_CATEGORIES.find((cat) => cat.key === activePromptCategory) ||
    PROMPT_CATEGORIES[0];

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-shell">
        <form className="edit-profile-form" onSubmit={handleSubmit}>
          <header className="edit-topbar">
            <button
              type="button"
              className="edit-back-btn"
              onClick={() => navigate("/app/profile")}
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="edit-topbar__title">
              <span className="edit-kicker">Peach</span>
              <h1>Edit profile</h1>
              <p>Shape how you show up on the feed.</p>
            </div>

            <button className="edit-save-btn" type="submit" disabled={saving}>
              <Save size={16} />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </header>

          <div className="edit-completion-card">
            <div className="edit-completion-card__head">
              <div>
                <span className="edit-completion-card__kicker">
                  Profile completeness
                </span>
                <h2>{completion.percent}% complete</h2>
              </div>
              <strong>{completion.filledImages}/6 photos</strong>
            </div>

            <div className="edit-completion-bar">
              <span style={{ width: `${completion.percent}%` }} />
            </div>

            <div className="edit-completion-grid">
              <div>
                <span>Basic info</span>
                <strong>{completion.filledBasic}/15</strong>
              </div>
              <div>
                <span>Opening line</span>
                <strong>{completion.hasOpening}/1</strong>
              </div>
              <div>
                <span>Prompts</span>
                <strong>{completion.filledPrompts}/3</strong>
              </div>
              <div>
                <span>Photos</span>
                <strong>{completion.filledImages}/6</strong>
              </div>
            </div>
          </div>

          {error ? (
            <div className="edit-banner edit-banner--error">{error}</div>
          ) : null}

          <div className="edit-layout">
            <Section
              title="Basic info"
              icon={<User size={15} />}
              hint="The main details shown on your profile."
              span={6}
            >
              <div className="edit-fields-grid">
                <TextField
                  label="Name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Your name"
                />
                <TextField
                  label="Age"
                  type="number"
                  min="18"
                  max="99"
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="23"
                />
                <SelectField
                  label="Gender"
                  icon={<User size={14} />}
                  value={form.gender}
                  onChange={(e) => updateField("gender", e.target.value)}
                  options={GENDER_OPTIONS}
                />
                <TextField
                  label="Location"
                  icon={<MapPin size={14} />}
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Mumbai"
                />
                <div className="edit-field edit-field--full">
                  <TextAreaField
                    label="Bio"
                    icon={<Sparkles size={14} />}
                    value={form.bio}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="A short line that feels like you."
                    rows={4}
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Photos"
              icon={<ImageIcon size={15} />}
              hint="Paste up to 6 image URLs for now."
              span={6}
            >
              <div className="edit-photo-grid">
                {form.images.map((url, index) => (
                  <ImageSlot
                    key={index}
                    index={index}
                    value={url}
                    onChange={(value) => updateImage(index, value)}
                    onClear={() => updateImage(index, "")}
                  />
                ))}
              </div>
            </Section>

            <Section
              title="Opening line"
              icon={<MessageCircle size={15} />}
              hint="A small first impression for the feed."
              span={12}
            >
              <div className="edit-fields-grid">
                <SelectField
                  label="Pick a line"
                  icon={<Sparkles size={14} />}
                  value={openingLineChoice}
                  onChange={(e) => {
                    setOpeningLineChoice(e.target.value);
                    if (e.target.value !== "WRITE_MY_OWN") {
                      setOpeningLineCustom("");
                    }
                  }}
                  options={OPENING_LINE_OPTIONS}
                  placeholder="Select an opening line"
                />

                {openingLineChoice === "WRITE_MY_OWN" ? (
                  <div className="edit-field edit-field--full">
                    <TextAreaField
                      label="Write your own opening line"
                      hint="Keep it light, human, and a little flirty if you like."
                      value={openingLineCustom}
                      onChange={(e) => setOpeningLineCustom(e.target.value)}
                      placeholder="Type your own opening line…"
                      rows={3}
                    />
                  </div>
                ) : null}
              </div>
            </Section>

            <Section
              title="Three prompts that feel like me"
              icon={<Sparkles size={15} />}
              hint="Pick any 3. Write short, honest answers."
              span={12}
            >
              <div className="prompt-selected-list">
                {profilePrompts.length > 0 ? (
                  profilePrompts.map((prompt) => (
                    <article key={prompt.id} className="selected-prompt-card">
                      <div className="selected-prompt-card__head">
                        <div>
                          <span className="selected-prompt-card__question">
                            {prompt.question}
                          </span>
                          <p>Short answers feel best here.</p>
                        </div>

                        <button
                          type="button"
                          className="selected-prompt-card__remove"
                          onClick={() => removePrompt(prompt.id)}
                        >
                          <X size={14} />
                          Remove
                        </button>
                      </div>

                      <textarea
                        className="edit-input edit-textarea prompt-answer"
                        value={prompt.answer}
                        onChange={(e) =>
                          updatePromptAnswer(prompt.id, e.target.value)
                        }
                        placeholder="Write your answer…"
                        rows={3}
                      />
                    </article>
                  ))
                ) : (
                  <div className="selected-prompts-empty">
                    Pick up to 3 prompts below.
                  </div>
                )}
              </div>

              <div className="prompt-picker">
                <div className="prompt-picker__top">
                  <div className="prompt-tabs">
                    {PROMPT_CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        className={`prompt-tab ${
                          activePromptCategory === cat.key ? "is-active" : ""
                        }`}
                        onClick={() => setActivePromptCategory(cat.key)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="prompt-counter">
                    {profilePrompts.length}/3 selected
                  </div>
                </div>

                <div className="prompt-grid">
                  {activeCategory.prompts.map((prompt) => {
                    const active = profilePrompts.some(
                      (item) => item.id === prompt.id
                    );
                    const disabled = !active && profilePrompts.length >= 3;

                    return (
                      <div
                        key={prompt.id}
                        className={`prompt-card ${active ? "is-active" : ""}`}
                      >
                        <button
                          type="button"
                          className="prompt-card__toggle"
                          onClick={() => togglePrompt(prompt)}
                          disabled={disabled}
                        >
                          <span>{prompt.question}</span>
                          <span className="prompt-card__state">
                            {active
                              ? "Selected"
                              : disabled
                              ? "Limit reached"
                              : "Add"}
                          </span>
                        </button>

                        {active ? (
                          <textarea
                            className="edit-input edit-textarea prompt-answer"
                            value={
                              profilePrompts.find(
                                (item) => item.id === prompt.id
                              )?.answer || ""
                            }
                            onChange={(e) =>
                              updatePromptAnswer(prompt.id, e.target.value)
                            }
                            placeholder={prompt.placeholder}
                            rows={3}
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Section>

            <Section
              title="Dating preferences"
              icon={<Heart size={15} />}
              hint="How you want this to feel."
              span={6}
            >
              <div className="edit-fields-grid">
                <SelectField
                  label="What are you here for?"
                  value={form.datingIntent}
                  onChange={(e) => updateField("datingIntent", e.target.value)}
                  options={DATING_INTENT_OPTIONS}
                />
                <SelectField
                  label="Connection preference"
                  value={form.connectionPreference}
                  onChange={(e) =>
                    updateField("connectionPreference", e.target.value)
                  }
                  options={CONNECTION_OPTIONS}
                />
                <SelectField
                  label="Open to long distance"
                  value={form.openToLongDistance}
                  onChange={(e) =>
                    updateField("openToLongDistance", e.target.value)
                  }
                  options={LONG_DISTANCE_OPTIONS}
                />
                <SelectField
                  label="Communication style"
                  icon={<MessageCircle size={14} />}
                  value={form.communicationStyle}
                  onChange={(e) =>
                    updateField("communicationStyle", e.target.value)
                  }
                  options={COMMUNICATION_OPTIONS}
                />
                <SelectField
                  label="Love language"
                  icon={<Heart size={14} />}
                  value={form.loveLanguage}
                  onChange={(e) => updateField("loveLanguage", e.target.value)}
                  options={LOVE_LANGUAGE_OPTIONS}
                />
                <SelectField
                  label="Conflict style"
                  value={form.conflictStyle}
                  onChange={(e) => updateField("conflictStyle", e.target.value)}
                  options={CONFLICT_OPTIONS}
                />
              </div>
            </Section>

            <Section
              title="Lifestyle"
              icon={<Coffee size={15} />}
              hint="Everyday habits and preferences."
              span={6}
            >
              <div className="edit-fields-grid">
                <SelectField
                  label="Drink habit"
                  icon={<Martini size={14} />}
                  value={form.drinkHabit}
                  onChange={(e) => updateField("drinkHabit", e.target.value)}
                  options={DRINK_OPTIONS}
                />
                <SelectField
                  label="Smoke habit"
                  icon={<CigaretteOff size={14} />}
                  value={form.smokeHabit}
                  onChange={(e) => updateField("smokeHabit", e.target.value)}
                  options={SMOKE_OPTIONS}
                />
                <SelectField
                  label="Food preference"
                  icon={<Utensils size={14} />}
                  value={form.foodPreference}
                  onChange={(e) =>
                    updateField("foodPreference", e.target.value)
                  }
                  options={FOOD_OPTIONS}
                />
                <SelectField
                  label="Sleep style"
                  icon={<Moon size={14} />}
                  value={form.sleepStyle}
                  onChange={(e) => updateField("sleepStyle", e.target.value)}
                  options={SLEEP_OPTIONS}
                />
              </div>
            </Section>

            <Section
              title="What makes me, me"
              icon={<Sparkles size={15} />}
              hint="Choose any number of options."
              span={12}
            >
              <ChipGroup
                label="Personality traits"
                options={PERSONALITY_OPTIONS}
                value={form.personalityTraits}
                onToggle={(value) => toggleInArray("personalityTraits", value)}
                hint="Pick as many as feel right."
              />
            </Section>

            <Section
              title="Interests"
              icon={<Heart size={15} />}
              hint="Add more than the profile page shows."
              span={12}
            >
              <ChipGroup
                label="Interests"
                options={INTEREST_OPTIONS}
                value={form.interests}
                onToggle={(value) => toggleInArray("interests", value)}
                hint="These help the feed feel more personal."
              />
            </Section>

            <Section
              title="Core values"
              icon={<Globe size={15} />}
              hint="What you care about most."
              span={6}
            >
              <ChipGroup
                label="Core values"
                options={CORE_VALUE_OPTIONS}
                value={form.coreValues}
                onToggle={(value) => toggleInArray("coreValues", value)}
                hint="Choose any number of values."
              />
            </Section>

            <Section
              title="Dealbreakers"
              icon={<X size={15} />}
              hint="Things you do not want to ignore."
              span={6}
            >
              <ChipGroup
                label="Dealbreakers"
                options={DEALBREAKER_OPTIONS}
                value={form.dealbreakers}
                onToggle={(value) => toggleInArray("dealbreakers", value)}
                hint="Pick any number of dealbreakers."
              />
            </Section>
          </div>
        </form>
      </div>
    </div>
  );
}
