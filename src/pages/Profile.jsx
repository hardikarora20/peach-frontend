import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Cake,
  MapPin,
  Heart,
  MessageCircle,
  Moon,
  Sparkles,
  Coffee,
  X,
  User,
  Globe,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const MAX_IMAGES = 6;

function hasText(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function humanize(value) {
  if (!hasText(value)) return "";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name) {
  if (!hasText(name)) return "U";
  const parts = String(name).trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function joinHuman(values, separator = " • ") {
  return toArray(values).map(humanize).filter(Boolean).join(separator);
}

function Section({ title, icon, children }) {
  return (
    <section className="profile-section">
      <div className="profile-section__head">
        <div className="profile-section__title">
          {icon ? <span className="profile-section__icon">{icon}</span> : null}
          <h3>{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-card__top">
        {icon ? <span className="stat-card__icon">{icon}</span> : null}
        <span className="stat-card__label">{label}</span>
      </div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}

function Pill({ children }) {
  return <span className="profile-pill">{children}</span>;
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="details-row">
      <div className="details-row__head">
        {icon ? <span className="details-row__icon">{icon}</span> : null}
        <span className="details-row__label">{label}</span>
      </div>
      <strong className="details-row__value">{value}</strong>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("peach_token");

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

  const images = (profile.images || []).slice(0, MAX_IMAGES);
  const mainImage = images[0];
  const restImages = images.slice(1);

  const heroImage =
    profile?.profileImageUrl ||
    profile?.avatarUrl ||
    profile?.photoUrl ||
    profile?.imageUrl ||
    "";

  const heroChips = useMemo(() => {
    const chips = [
      hasText(profile?.age)
        ? { text: profile.age, icon: <Cake size={14} /> }
        : null,
      hasText(profile?.location)
        ? { text: profile.location, icon: <MapPin size={14} /> }
        : null,
      hasText(profile?.gender)
        ? { text: humanize(profile.gender), icon: "◌" }
        : null,
      hasText(profile?.datingIntent)
        ? { text: humanize(profile.datingIntent), icon: <Heart size={14} /> }
        : null,
      hasText(profile?.sleepStyle)
        ? { text: humanize(profile.sleepStyle), icon: "☾" }
        : null,
      toArray(profile?.personalityTraits)[0]
        ? { text: humanize(toArray(profile.personalityTraits)[0]), icon: "☺" }
        : null,
      hasText(profile?.loveLanguage)
        ? { text: humanize(profile.loveLanguage), icon: "♥" }
        : null,
      hasText(profile?.communicationStyle)
        ? {
            text: humanize(profile.communicationStyle),
            icon: <MessageCircle size={14} />,
          }
        : null,
    ];

    return chips.filter(Boolean).slice(0, 6);
  }, [profile]);

  const quickInfo = useMemo(() => {
    return [
      {
        label: "Intent",
        value: humanize(profile?.datingIntent),
        icon: "❤",
      },
      {
        label: "Love language",
        value: humanize(profile?.loveLanguage),
        icon: "♥",
      },
      {
        label: "Lifestyle",
        value: [
          humanize(profile?.drinkHabit),
          humanize(profile?.smokeHabit),
          humanize(profile?.foodPreference),
        ]
          .filter(Boolean)
          .join(" • "),
        icon: "☕",
      },
      {
        label: "Communication",
        value: humanize(profile?.communicationStyle),
        icon: "💬",
      },
      {
        label: "Dealbreakers",
        value: joinHuman(profile?.dealbreakers, ", "),
        icon: "✕",
      },
    ].filter((item) => hasText(item.value));
  }, [profile]);

  const highlights = useMemo(() => {
    const items = [
      {
        title: "My vibe is…",
        icon: "✦",
        text: joinHuman(profile?.personalityTraits, ", "),
      },
      {
        title: "I value…",
        icon: "◎",
        text: joinHuman(profile?.coreValues, ", "),
      },
      {
        title: "We will not work if…",
        icon: "✕",
        text: joinHuman(profile?.dealbreakers, ", "),
      },
    ];

    return items.filter((item) => hasText(item.text));
  }, [profile]);

  const aboutMeta = [
    hasText(profile?.gender)
      ? { label: "Gender", value: humanize(profile.gender), icon: "⚪" }
      : null,
    hasText(profile?.age)
      ? { label: "Age", value: String(profile.age), icon: "🎂" }
      : null,
    hasText(profile?.location)
      ? { label: "Location", value: profile.location, icon: "📍" }
      : null,
  ].filter(Boolean);

  const detailsRows = [
    hasText(profile?.communicationStyle)
      ? {
          label: "Communication style",
          value: humanize(profile.communicationStyle),
          icon: "💬",
        }
      : null,
    hasText(profile?.loveLanguage)
      ? {
          label: "Love language",
          value: humanize(profile.loveLanguage),
          icon: "♥",
        }
      : null,
    hasText(profile?.conflictStyle)
      ? {
          label: "Conflict style",
          value: humanize(profile.conflictStyle),
          icon: "🕊",
        }
      : null,
    hasText(profile?.openToLongDistance)
      ? {
          label: "Open to long distance",
          value: humanize(profile.openToLongDistance),
          icon: "🌍",
        }
      : null,
    hasText(profile?.foodPreference)
      ? {
          label: "Food preference",
          value: humanize(profile.foodPreference),
          icon: "🍽",
        }
      : null,
    hasText(profile?.sleepStyle)
      ? {
          label: "Sleep style",
          value: humanize(profile.sleepStyle),
          icon: "☾",
        }
      : null,
  ].filter(Boolean);

  const interests = toArray(profile?.interests).map(humanize).filter(Boolean);
  const coreValues = toArray(profile?.coreValues).map(humanize).filter(Boolean);
  const dealbreakers = toArray(profile?.dealbreakers)
    .map(humanize)
    .filter(Boolean);

  const showAbout =
    hasText(profile?.bio) || aboutMeta.length > 0 || hasText(profile?.name);
  const showDetails = detailsRows.length > 0;
  const showInterests = interests.length > 0;
  const showLifestyle =
    hasText(profile?.drinkHabit) || hasText(profile?.smokeHabit);
  const showPreferences =
    hasText(profile?.datingIntent) ||
    hasText(profile?.connectionPreference) ||
    hasText(profile?.openToLongDistance) ||
    coreValues.length > 0;
  const showDealbreakers = dealbreakers.length > 0;
  const showHighlights = highlights.length > 0;

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

          {/* <div className="profile-topbar__title">
            <span className="eyebrow">Profile</span>
            <h1>{profile?.name || "Your profile"}</h1>
          </div> */}

          {/* <button className="profile-menu" type="button">
            ⋯
          </button> */}
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

            {heroChips.map((chip, index) => (
              <div
                key={`${chip.text}-${index}`}
                className={`hero-chip hero-chip--${(index % 6) + 1}`}
              >
                <span className="hero-chip__icon">{chip.icon}</span>
                <span>{chip.text}</span>
              </div>
            ))}
          </div>

          <div className="profile-nameblock">
            <h2>
              {profile?.name || "Unnamed"}
              {hasText(profile?.age) ? `, ${profile.age}` : ""}
            </h2>
            <div className="profile-subline">
              {profile?.location || "Location not shared"}
            </div>
            {hasText(profile?.bio) ? (
              <p className="profile-bio">{profile.bio}</p>
            ) : null}
          </div>
        </div>

        {quickInfo.length > 0 ? (
          <div className="quick-strip">
            {quickInfo.map((item) => (
              <StatCard
                key={item.label}
                label={item.label}
                value={item.value}
                icon={item.icon}
              />
            ))}
          </div>
        ) : null}

        {showHighlights ? (
          <section className="highlights-wrap">
            <div className="profile-section__head profile-section__head--plain">
              <div className="profile-section__title">
                <span className="profile-section__icon">✦</span>
                <h3>What makes me, me</h3>
              </div>
            </div>

            <div className="highlights-grid">
              {highlights.map((item) => (
                <article key={item.title} className="highlight-card">
                  <div className="highlight-card__badge">{item.icon}</div>
                  <div className="highlight-card__label">{item.title}</div>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <div className="profile-columns">
          <div className="profile-column">
            {showAbout ? (
              <Section title="About me" icon="👤">
                <div className="about-box">
                  {hasText(profile?.bio) ? <p>{profile.bio}</p> : null}

                  {aboutMeta.length > 0 ? (
                    <div className="about-mini">
                      {aboutMeta.map((item) => (
                        <div key={item.label} className="about-mini__item">
                          <span className="about-mini__icon">{item.icon}</span>
                          <div>
                            <span className="about-mini__label">
                              {item.label}
                            </span>
                            <strong>{item.value}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : null}

            {showInterests ? (
              <Section title="Interests" icon="♡">
                <div className="pill-wrap">
                  {interests.map((item) => (
                    <Pill key={item}>{item}</Pill>
                  ))}
                </div>
              </Section>
            ) : null}

            {showPreferences ? (
              <Section title="Preferences" icon="⚙">
                <div className="preferences-grid">
                  {hasText(profile?.datingIntent) ? (
                    <StatCard
                      label="Looking for"
                      value={humanize(profile.datingIntent)}
                      icon="❤"
                    />
                  ) : null}
                  {hasText(profile?.connectionPreference) ? (
                    <StatCard
                      label="Connection"
                      value={humanize(profile.connectionPreference)}
                      icon="◎"
                    />
                  ) : null}
                  {hasText(profile?.openToLongDistance) ? (
                    <StatCard
                      label="Long distance"
                      value={humanize(profile.openToLongDistance)}
                      icon="🌍"
                    />
                  ) : null}
                  {coreValues.length > 0 ? (
                    <StatCard
                      label="Core values"
                      value={coreValues.join(" • ")}
                      icon="✦"
                    />
                  ) : null}
                </div>
              </Section>
            ) : null}
          </div>

          <div className="profile-column">
            {showDetails ? (
              <Section title="Details" icon="i">
                <div className="details-list">
                  {detailsRows.map((row) => (
                    <InfoRow
                      key={row.label}
                      icon={row.icon}
                      label={row.label}
                      value={row.value}
                    />
                  ))}
                </div>
              </Section>
            ) : null}

            {showLifestyle ? (
              <Section title="Lifestyle" icon="☾">
                <div className="details-list details-list--two">
                  {hasText(profile?.drinkHabit) ? (
                    <InfoRow
                      icon="🍸"
                      label="Drinks"
                      value={humanize(profile.drinkHabit)}
                    />
                  ) : null}
                  {hasText(profile?.smokeHabit) ? (
                    <InfoRow
                      icon="🚭"
                      label="Smokes"
                      value={humanize(profile.smokeHabit)}
                    />
                  ) : null}
                </div>
              </Section>
            ) : null}

            {showDealbreakers ? (
              <Section title="Dealbreakers" icon="✕">
                <div className="pill-wrap">
                  {dealbreakers.map((item) => (
                    <Pill key={item}>{item}</Pill>
                  ))}
                </div>
              </Section>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
