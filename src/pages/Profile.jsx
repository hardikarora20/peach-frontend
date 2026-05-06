import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cake,
  MapPin,
  Heart,
  MessageCircle,
  Moon,
  Sparkles,
  Users,
  Utensils,
  Martini,
  CigaretteOff,
  Globe,
  Coffee,
  Image as PhotoIcon,
  User,
  X,
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
  const [heroFailed, setHeroFailed] = useState(false);

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

  useEffect(() => {
    setHeroFailed(false);
  }, [profile]);

  const images = (profile?.images || []).slice(0, MAX_IMAGES);
  const heroImage =
    images[0] ||
    profile?.profileImageUrl ||
    profile?.avatarUrl ||
    profile?.photoUrl ||
    profile?.imageUrl ||
    "";
  const galleryImages = images.slice(1, 6);

  const firstTrait = toArray(profile?.personalityTraits)[0];

  const heroLeftChips = useMemo(() => {
    return [
      hasText(profile?.age)
        ? { text: String(profile.age), icon: <Cake size={14} /> }
        : null,
      hasText(profile?.sleepStyle)
        ? { text: humanize(profile.sleepStyle), icon: <Moon size={14} /> }
        : null,
      hasText(profile?.gender)
        ? { text: humanize(profile.gender), icon: <Users size={14} /> }
        : null,
    ].filter(Boolean);
  }, [profile]);

  const heroRightChips = useMemo(() => {
    return [
      hasText(profile?.datingIntent)
        ? { text: humanize(profile.datingIntent), icon: <Heart size={14} /> }
        : null,
      hasText(profile?.location)
        ? { text: profile.location, icon: <MapPin size={14} /> }
        : null,
      hasText(firstTrait)
        ? { text: humanize(firstTrait), icon: <Sparkles size={14} /> }
        : null,
    ].filter(Boolean);
  }, [profile, firstTrait]);

  const quickInfo = useMemo(() => {
    return [
      {
        label: "Intent",
        value: humanize(profile?.datingIntent),
        icon: <Heart size={14} />,
      },
      {
        label: "Love language",
        value: humanize(profile?.loveLanguage),
        icon: <Sparkles size={14} />,
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
        icon: <Coffee size={14} />,
      },
      {
        label: "Communication",
        value: humanize(profile?.communicationStyle),
        icon: <MessageCircle size={14} />,
      },
      {
        label: "Dealbreakers",
        value: joinHuman(profile?.dealbreakers, ", "),
        icon: <X size={14} />,
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
      ? {
          label: "Gender",
          value: humanize(profile.gender),
          icon: <Users size={14} />,
        }
      : null,
    hasText(profile?.age)
      ? { label: "Age", value: String(profile.age), icon: <Cake size={14} /> }
      : null,
    hasText(profile?.location)
      ? {
          label: "Location",
          value: profile.location,
          icon: <MapPin size={14} />,
        }
      : null,
  ].filter(Boolean);

  const detailsRows = [
    hasText(profile?.communicationStyle)
      ? {
          label: "Communication style",
          value: humanize(profile.communicationStyle),
          icon: <MessageCircle size={14} />,
        }
      : null,
    hasText(profile?.loveLanguage)
      ? {
          label: "Love language",
          value: humanize(profile.loveLanguage),
          icon: <Heart size={14} />,
        }
      : null,
    hasText(profile?.conflictStyle)
      ? {
          label: "Conflict style",
          value: humanize(profile.conflictStyle),
          icon: <Sparkles size={14} />,
        }
      : null,
    hasText(profile?.openToLongDistance)
      ? {
          label: "Open to long distance",
          value: humanize(profile.openToLongDistance),
          icon: <Globe size={14} />,
        }
      : null,
    hasText(profile?.foodPreference)
      ? {
          label: "Food preference",
          value: humanize(profile.foodPreference),
          icon: <Utensils size={14} />,
        }
      : null,
    hasText(profile?.sleepStyle)
      ? {
          label: "Sleep style",
          value: humanize(profile.sleepStyle),
          icon: <Moon size={14} />,
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
  const showPhotos = galleryImages.length > 0;

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
        </div>

        <div className="profile-hero">
          <div className="profile-hero__row">
            <div className="hero-side hero-side--left">
              {heroLeftChips.map((chip, index) => (
                <div
                  key={`${chip.text}-${index}`}
                  className={`hero-chip hero-chip--${(index % 3) + 1}`}
                  style={{
                    animationDelay: `${index * 0.25}s`,
                    ["--duration"]: `${6.2 + index * 0.7}s`,
                  }}
                >
                  <span className="hero-chip__icon">{chip.icon}</span>
                  <span>{chip.text}</span>
                </div>
              ))}
            </div>

            <div className="hero-center">
              <div className="hero-avatar">
                {heroImage && !heroFailed ? (
                  <img
                    src={heroImage}
                    alt={profile?.name || "Profile"}
                    onError={() => setHeroFailed(true)}
                  />
                ) : (
                  <span>{initials(profile?.name)}</span>
                )}
              </div>
            </div>

            <div className="hero-side hero-side--right">
              {heroRightChips.map((chip, index) => (
                <div
                  key={`${chip.text}-${index}`}
                  className={`hero-chip hero-chip--${(index % 3) + 4}`}
                  style={{
                    animationDelay: `${index * 0.25}s`,
                    ["--duration"]: `${6.8 + index * 0.7}s`,
                  }}
                >
                  <span className="hero-chip__icon">{chip.icon}</span>
                  <span>{chip.text}</span>
                </div>
              ))}
            </div>
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

        {showPhotos ? (
          <Section title="Photos" icon={<PhotoIcon size={14} />}>
            <div
              className={`photo-mosaic count-${Math.min(
                galleryImages.length,
                5
              )}`}
            >
              {galleryImages.map((img, index) => (
                <div
                  className={`photo-tile photo-tile--${index}`}
                  key={img + index}
                >
                  <img
                    src={img}
                    alt={`${profile?.name || "Profile"} photo ${index + 2}`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.parentElement.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          </Section>
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
              <Section title="About me" icon={<User size={14} />}>
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
                      icon={<Heart size={14} />}
                    />
                  ) : null}
                  {hasText(profile?.connectionPreference) ? (
                    <StatCard
                      label="Connection"
                      value={humanize(profile.connectionPreference)}
                      icon={<span>◎</span>}
                    />
                  ) : null}
                  {hasText(profile?.openToLongDistance) ? (
                    <StatCard
                      label="Long distance"
                      value={humanize(profile.openToLongDistance)}
                      icon={<Globe size={14} />}
                    />
                  ) : null}
                  {coreValues.length > 0 ? (
                    <StatCard
                      label="Core values"
                      value={coreValues.join(" • ")}
                      icon={<span>✦</span>}
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
                      icon={<Martini size={14} />}
                      label="Drinks"
                      value={humanize(profile.drinkHabit)}
                    />
                  ) : null}
                  {hasText(profile?.smokeHabit) ? (
                    <InfoRow
                      icon={<CigaretteOff size={14} />}
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
