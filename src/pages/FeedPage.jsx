import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  X,
  Eye,
  Menu,
  SlidersHorizontal,
  MapPin,
  ChevronUp,
  MessageCircle,
  Sparkles,
  Bell,
  UserCircle2,
} from "lucide-react";
import { profileApi, swipesApi } from "../api/client";
import "./feed.css";

function hasText(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function humanize(value) {
  if (!hasText(value)) return "";
  return String(value)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function initials(name) {
  if (!name) return "U";
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getId(profile) {
  return String(profile?.userId || profile?.id || profile?.profileId || "");
}

function getImage(profile) {
  return (
    profile?.images?.[0] || profile?.profileImageUrl || profile?.imageUrl || ""
  );
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getVibeText(profile) {
  const bits = [
    profile?.datingIntent,
    profile?.communicationStyle,
    profile?.loveLanguage,
  ]
    .filter(Boolean)
    .map(humanize);

  return bits.join(" • ");
}

function Bubble({ profile, slot, variant = 1 }) {
  const img = getImage(profile);

  return (
    <div
      className={`ambient-bubble ambient-bubble--${variant}`}
      style={slot}
      aria-hidden="true"
    >
      <span className="ambient-bubble__halo" />
      <span className="ambient-bubble__shine" />

      {img ? (
        <img className="ambient-bubble__img" src={img} alt="" loading="lazy" />
      ) : (
        <span className="ambient-bubble__initials">
          {initials(profile?.name)}
        </span>
      )}

      {hasText(profile?.distance) ? (
        <span className="ambient-bubble__distance">{profile.distance}</span>
      ) : null}
    </div>
  );
}

function BottomNav() {
  return (
    <nav className="feed-bottom-nav" aria-label="Primary">
      <button className="feed-bottom-nav__item is-active" type="button">
        <Heart size={20} />
      </button>
      <button className="feed-bottom-nav__item" type="button">
        <MessageCircle size={20} />
      </button>
      <button className="feed-bottom-nav__item" type="button">
        <Sparkles size={20} />
      </button>
      <button className="feed-bottom-nav__item" type="button">
        <Bell size={20} />
      </button>
      <button className="feed-bottom-nav__item" type="button">
        <UserCircle2 size={20} />
      </button>
    </nav>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const activeProfile = profiles[activeIndex] || null;
  const activeImage = getImage(activeProfile);

  const ambientSlots = useMemo(
    () => [
      { top: "14%", left: "7%", ["--dur"]: "8.5s", ["--delay"]: "0s" },
      { top: "9%", left: "24%", ["--dur"]: "10s", ["--delay"]: "0.2s" },
      { top: "18%", right: "11%", ["--dur"]: "9.2s", ["--delay"]: "0.35s" },
      { top: "31%", left: "4%", ["--dur"]: "11s", ["--delay"]: "0.5s" },
      { top: "30%", right: "3%", ["--dur"]: "8.8s", ["--delay"]: "0.15s" },
      { bottom: "24%", left: "10%", ["--dur"]: "10.8s", ["--delay"]: "0.25s" },
      { bottom: "14%", left: "29%", ["--dur"]: "9.8s", ["--delay"]: "0.4s" },
      { bottom: "20%", right: "10%", ["--dur"]: "11.2s", ["--delay"]: "0.55s" },
      { bottom: "8%", right: "4%", ["--dur"]: "9.6s", ["--delay"]: "0.1s" },
      { top: "46%", left: "11%", ["--dur"]: "12s", ["--delay"]: "0.3s" },
    ],
    []
  );

  const ambientProfiles = useMemo(() => {
    return profiles.filter((_, index) => index !== activeIndex).slice(0, 10);
  }, [profiles, activeIndex]);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await profileApi.feed();

      const nextProfiles = Array.isArray(data)
        ? data
        : data?.profiles || data?.data || [];

      setProfiles(shuffle(nextProfiles));
      setActiveIndex(0);
    } catch (err) {
      console.error("Feed load failed:", err);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const advanceToNext = (remaining) => {
    if (!remaining.length) {
      setProfiles([]);
      setActiveIndex(0);
      return;
    }

    setProfiles(shuffle(remaining));
    setActiveIndex(0);
  };

  const handleSwipe = async (action) => {
    if (!activeProfile || actionLoading) return;

    setActionLoading(true);
    try {
      await swipesApi.swipe({
        targetUserId:
          activeProfile.userId || activeProfile.id || activeProfile.profileId,
        action,
      });

      const remaining = profiles.filter((_, index) => index !== activeIndex);
      advanceToNext(remaining);
    } catch (err) {
      console.error("Swipe failed:", err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="feed-page">
        <div className="feed-shell">
          <div className="feed-loader">Loading nearby people…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-shell">
        {/* <header className="feed-topbar"></header> */}
        <section className="feed-stage">
          <button className="feed-icon-btn" type="button" aria-label="Filters">
            <SlidersHorizontal size={20} />
          </button>
          <div className="feed-stage__ring feed-stage__ring--1" />
          <div className="feed-stage__ring feed-stage__ring--2" />
          <div className="feed-stage__ring feed-stage__ring--3" />
          <div className="feed-stage__glow" />

          {ambientProfiles.map((profile, index) => (
            <Bubble
              key={getId(profile) || `${profile?.name || "bubble"}-${index}`}
              profile={profile}
              slot={ambientSlots[index % ambientSlots.length]}
              variant={(index % 4) + 1}
            />
          ))}

          {activeProfile ? (
            <article className="focus-card" key={getId(activeProfile)}>
              <button
                className="focus-card__image"
                type="button"
                onClick={() =>
                  navigate(
                    `/app/profile/${
                      activeProfile.userId ||
                      activeProfile.id ||
                      activeProfile.profileId
                    }`
                  )
                }
              >
                {activeImage ? (
                  <img
                    src={activeImage}
                    alt={activeProfile?.name || "Profile"}
                  />
                ) : (
                  <div className="focus-card__fallback">
                    {initials(activeProfile?.name)}
                  </div>
                )}

                {activeProfile?.distance ? (
                  <span className="distance-pill distance-pill--image">
                    <MapPin size={13} />
                    {activeProfile.distance}
                  </span>
                ) : null}
              </button>

              <div className="focus-card__body">
                <div className="focus-card__head">
                  <div>
                    <h2 className="focus-card__name">
                      {activeProfile.name}
                      {activeProfile.age ? `, ${activeProfile.age}` : ""}
                    </h2>

                    <div className="focus-card__meta">
                      <MapPin size={14} />
                      <span>{activeProfile.location || "Nearby"}</span>
                    </div>
                  </div>

                  <button
                    className="view-profile-btn"
                    type="button"
                    onClick={() =>
                      navigate(
                        `/app/profile/${
                          activeProfile.userId ||
                          activeProfile.id ||
                          activeProfile.profileId
                        }`
                      )
                    }
                    aria-label="View profile"
                  >
                    <Eye size={18} />
                  </button>
                </div>

                <p className="focus-card__bio">
                  {activeProfile.bio || "No bio added yet."}
                </p>

                {activeProfile.interests?.length ? (
                  <div className="focus-pills">
                    {activeProfile.interests.slice(0, 4).map((item) => (
                      <span key={item} className="focus-pill">
                        {humanize(item)}
                      </span>
                    ))}
                    {activeProfile.interests.length > 4 ? (
                      <span className="focus-pill focus-pill--more">
                        +{activeProfile.interests.length - 4}
                      </span>
                    ) : null}
                  </div>
                ) : null}

                {hasText(getVibeText(activeProfile)) ? (
                  <div className="focus-quick">
                    <div className="focus-quick__item">
                      <Sparkles size={14} />
                      <span>{getVibeText(activeProfile)}</span>
                    </div>
                  </div>
                ) : null}

                <div className="feed-actions">
                  <button
                    className="feed-action feed-action--pass"
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSwipe("DISLIKE")}
                    aria-label="Pass"
                  >
                    <X size={22} />
                  </button>

                  <button
                    className="feed-action feed-action--like"
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleSwipe("LIKE")}
                    aria-label="Like"
                  >
                    <Heart size={22} />
                  </button>
                </div>
              </div>
            </article>
          ) : (
            <div className="feed-empty">
              <h2>No more profiles nearby</h2>
              <p>Check back later for new people.</p>
            </div>
          )}
        </section>

        {/* <div className="feed-hint">
          <ChevronUp size={18} />
          <span>Swipe to like or pass</span>
        </div> */}

        {/* <BottomNav /> */}
      </div>
    </div>
  );
}
