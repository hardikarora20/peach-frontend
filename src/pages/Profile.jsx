import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function humanize(value) {
  if (!value) return "";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function joinHuman(values, separator = " • ") {
  return toArray(values).map(humanize).filter(Boolean).join(separator);
}

function initials(name) {
  if (!name) return "U";
  const parts = String(name).trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

function Section({ title, children, action }) {
  return (
    <section className="profile-section">
      <div className="profile-section__head">
        <h3>{title}</h3>
        {action ? (
          <div className="profile-section__action">{action}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, muted }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div className={`stat-card__value ${muted ? "muted" : ""}`}>{value}</div>
    </div>
  );
}

function Pill({ children }) {
  return <span className="profile-pill">{children}</span>;
}

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("peach_token");
      //   console.log(token);
      const res = await fetch(`${API_BASE}/profile/me`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Could not load profile");
      }

      const data = await res.json();
      const nextProfile = data?.data ?? data?.profile ?? data;
      setProfile(nextProfile);
    } catch (err) {
      setError(err?.message || "Could not load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const heroImage =
    profile?.profileImageUrl ||
    profile?.avatarUrl ||
    profile?.photoUrl ||
    profile?.imageUrl ||
    "";

  const heroChips = useMemo(() => {
    return [
      profile?.age ? `${profile.age}` : null,
      humanize(profile?.gender),
      profile?.location,
      toArray(profile?.personalityTraits)[0]
        ? humanize(toArray(profile.personalityTraits)[0])
        : null,
      humanize(profile?.sleepStyle),
      humanize(profile?.datingIntent),
      humanize(profile?.communicationStyle),
      humanize(profile?.loveLanguage),
    ].filter(Boolean);
  }, [profile]);

  const quickInfo = useMemo(() => {
    const drink = humanize(profile?.drinkHabit);
    const smoke = humanize(profile?.smokeHabit);
    const food = humanize(profile?.foodPreference);
    return [
      {
        label: "Intent",
        value: humanize(profile?.datingIntent) || "Not shared",
      },
      {
        label: "Love language",
        value: humanize(profile?.loveLanguage) || "Not shared",
      },
      {
        label: "Lifestyle",
        value: [drink, smoke, food].filter(Boolean).join(" • ") || "Not shared",
      },
      {
        label: "Communication",
        value: humanize(profile?.communicationStyle) || "Not shared",
      },
      {
        label: "Dealbreakers",
        value: joinHuman(profile?.dealbreakers, ", ") || "Not shared",
      },
    ];
  }, [profile]);

  const highlights = useMemo(() => {
    const traits = joinHuman(profile?.personalityTraits, ", ");
    const values = joinHuman(profile?.coreValues, ", ");
    const dealbreakers = joinHuman(profile?.dealbreakers, ", ");
    return [
      {
        title: "My vibe is...",
        text:
          traits ||
          "A mix of personality traits that help people get a quick feel for me.",
      },
      {
        title: "I value...",
        text:
          values ||
          "Honesty, growth, and the kind of connection that feels easy and real.",
      },
      {
        title: "We will not work if...",
        text:
          dealbreakers ||
          "There are no dealbreakers listed yet, but boundaries matter a lot here.",
      },
    ];
  }, [profile]);

  const interests = toArray(profile?.interests).map(humanize);
  const coreValues = toArray(profile?.coreValues).map(humanize);
  const dealbreakers = toArray(profile?.dealbreakers).map(humanize);

  if (loading) {
    return (
      <div className="profile-page profile-page--loading">
        <div className="profile-loader">Loading profile…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <h2>Could not load profile</h2>
          <p>{error}</p>
          <button className="profile-btn" onClick={loadProfile}>
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-shell">
        <div className="profile-topbar">
          <button
            className="profile-back"
            onClick={() => navigate("/app/matches")}
          >
            ← Back to matches
          </button>

          <div className="profile-topbar__title">
            <span className="eyebrow">Profile</span>
            <h1>{profile?.name || "Your profile"}</h1>
          </div>

          <button className="profile-menu" type="button">
            ⋯
          </button>
        </div>

        <div className="profile-hero">
          <div className="profile-orbit">
            <div className="hero-avatar">
              {heroImage ? (
                <img src={heroImage} alt={profile?.name || "Profile"} />
              ) : (
                <span>{initials(profile?.name)}</span>
              )}
            </div>

            {heroChips.slice(0, 6).map((chip, index) => (
              <div
                key={`${chip}-${index}`}
                className={`hero-chip hero-chip--${(index % 6) + 1}`}
              >
                {chip}
              </div>
            ))}
          </div>

          <div className="profile-nameblock">
            <h2>
              {profile?.name || "Unnamed"}
              {profile?.age ? `, ${profile.age}` : ""}
            </h2>
            <div className="profile-subline">
              {profile?.location || "Location not shared"}
            </div>
            <p className="profile-bio">
              {profile?.bio ||
                "Add a short bio to describe your vibe in one line."}
            </p>
          </div>
        </div>

        <div className="quick-strip">
          {quickInfo.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              muted={!item.value || item.value === "Not shared"}
            />
          ))}
        </div>

        <div className="highlights-grid">
          {highlights.map((item) => (
            <article key={item.title} className="highlight-card">
              <div className="highlight-card__label">{item.title}</div>
              <p>{item.text}</p>
            </article>
          ))}
        </div>

        <div className="profile-grid">
          <Section title="About me">
            <div className="about-box">
              <p>
                {profile?.bio ||
                  "This section is a good place for a fuller bio, a natural introduction, and the kind of person you are."}
              </p>

              <div className="about-mini">
                <div>
                  <span className="about-mini__label">Gender</span>
                  <strong>{humanize(profile?.gender) || "Not shared"}</strong>
                </div>
                <div>
                  <span className="about-mini__label">Age</span>
                  <strong>{profile?.age || "Not shared"}</strong>
                </div>
                <div>
                  <span className="about-mini__label">Location</span>
                  <strong>{profile?.location || "Not shared"}</strong>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Details">
            <div className="details-list">
              <div className="details-row">
                <span>Communication style</span>
                <strong>
                  {humanize(profile?.communicationStyle) || "Not shared"}
                </strong>
              </div>
              <div className="details-row">
                <span>Love language</span>
                <strong>
                  {humanize(profile?.loveLanguage) || "Not shared"}
                </strong>
              </div>
              <div className="details-row">
                <span>Conflict style</span>
                <strong>
                  {humanize(profile?.conflictStyle) || "Not shared"}
                </strong>
              </div>
              <div className="details-row">
                <span>Open to long distance</span>
                <strong>
                  {humanize(profile?.openToLongDistance) || "Not shared"}
                </strong>
              </div>
              <div className="details-row">
                <span>Food preference</span>
                <strong>
                  {humanize(profile?.foodPreference) || "Not shared"}
                </strong>
              </div>
              <div className="details-row">
                <span>Sleep style</span>
                <strong>{humanize(profile?.sleepStyle) || "Not shared"}</strong>
              </div>
            </div>
          </Section>

          <Section title="Interests">
            <div className="pill-wrap">
              {interests.length ? (
                interests.map((item) => <Pill key={item}>{item}</Pill>)
              ) : (
                <span className="muted-text">No interests added yet.</span>
              )}
            </div>
          </Section>

          <Section title="Lifestyle">
            <div className="details-list details-list--two">
              <div className="details-row">
                <span>Drinks</span>
                <strong>{humanize(profile?.drinkHabit) || "Not shared"}</strong>
              </div>
              <div className="details-row">
                <span>Smokes</span>
                <strong>{humanize(profile?.smokeHabit) || "Not shared"}</strong>
              </div>
            </div>
          </Section>

          <Section title="Preferences">
            <div className="preferences-grid">
              <StatCard
                label="Looking for"
                value={humanize(profile?.datingIntent) || "Not shared"}
              />
              <StatCard
                label="Connection"
                value={humanize(profile?.connectionPreference) || "Not shared"}
              />
              <StatCard
                label="Long distance"
                value={humanize(profile?.openToLongDistance) || "Not shared"}
              />
              <StatCard
                label="Core values"
                value={
                  coreValues.length ? coreValues.join(" • ") : "Not shared"
                }
              />
            </div>
          </Section>

          <Section title="Dealbreakers">
            <div className="pill-wrap">
              {dealbreakers.length ? (
                dealbreakers.map((item) => <Pill key={item}>{item}</Pill>)
              ) : (
                <span className="muted-text">No dealbreakers added yet.</span>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
