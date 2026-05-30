import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  X,
  Eye,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  PartyPopper,
  ArrowRight,
  RefreshCcw,
} from "lucide-react";
import "./feed.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const swipesApi = {
  swipe: async (payload) => {
    const token = localStorage.getItem("peach_token");

    const response = await fetch(`${API_BASE}/swipes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || "Swipe failed");
    }

    return data;
  },
};

function hasText(value) {
  return (
    value !== null && value !== undefined && String(value).trim().length > 0
  );
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

function getProfileId(profile) {
  return String(profile?.profileId || profile?.id || profile?.userId || "");
}

function getTargetUserId(profile) {
  return profile?.userId || profile?.id || profile?.profileId || "";
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requestCurrentLocation() {
  return new Promise((resolve, reject) => {
    const cached = localStorage.getItem("peach_last_location");

    if (cached) {
      try {
        const parsed = JSON.parse(cached);

        const FIVE_MINUTES = 5 * 60 * 1000;

        const isFresh = Date.now() - parsed.timestamp < FIVE_MINUTES;

        if (isFresh && parsed.latitude && parsed.longitude) {
          console.log("Using cached location");

          resolve({
            latitude: parsed.latitude,
            longitude: parsed.longitude,
          });

          return;
        }
      } catch (err) {
        console.error("Failed to parse cached location");
      }
    }

    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        localStorage.setItem(
          "peach_last_location",
          JSON.stringify({
            ...nextLocation,
            timestamp: Date.now(),
          })
        );

        console.log("Using fresh location");

        resolve(nextLocation);
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 60000,
      }
    );
  });
}

function formatDistance(distance) {
  if (distance == null || distance === "") return "";
  const n = Number(distance);
  if (Number.isNaN(n)) return String(distance);
  return `${Math.round(n)} km away`;
}

function PeachLoader({ stage = "locating", errorMessage = "" }) {
  const title =
    stage === "locating" ? "Finding people near you" : "Loading nearby people";

  const subtitle =
    stage === "locating"
      ? "We need your location to show the right matches."
      : "Just a moment while we prepare your feed.";

  return (
    <div className="peach-loader-wrap" aria-label={title}>
      <div className="peach-loader">
        <div className="peach-loader__orbit peach-loader__orbit--1" />
        <div className="peach-loader__orbit peach-loader__orbit--2" />
        <div className="peach-loader__spark peach-loader__spark--1" />
        <div className="peach-loader__spark peach-loader__spark--2" />
        <div className="peach-loader__spark peach-loader__spark--3" />

        <div className="peach-loader__peach">
          <span className="peach-loader__leaf" />
          <span className="peach-loader__shine" />
          <span className="peach-loader__core">🍑</span>
        </div>
      </div>

      <div className="peach-loader__text">
        <strong>{title}</strong>
        <span>{subtitle}</span>

        {errorMessage ? (
          <div className="peach-loader__error">{errorMessage}</div>
        ) : null}
      </div>
    </div>
  );
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
        <span className="ambient-bubble__distance">{}</span>
      ) : null}
    </div>
  );
}

function MatchModal({ profile, matchId, onClose, onViewMatches }) {
  if (!profile) return null;

  return (
    <div className="match-modal-backdrop" role="dialog" aria-modal="true">
      <div className="match-heartscape" aria-hidden="true">
        <span className="match-heart match-heart--1" />
        <span className="match-heart match-heart--2" />
        <span className="match-heart match-heart--3" />
        <span className="match-heart match-heart--4" />
        <span className="match-heart match-heart--5" />

        <span className="match-sparkle match-sparkle--1">✦</span>
        <span className="match-sparkle match-sparkle--2">✦</span>
        <span className="match-sparkle match-sparkle--3">✦</span>
        <span className="match-sparkle match-sparkle--4">✦</span>
        <span className="match-sparkle match-sparkle--5">✦</span>
        <span className="match-sparkle match-sparkle--6">✦</span>
      </div>

      <div className="match-modal">
        <button
          type="button"
          className="match-modal__close"
          onClick={onClose}
          aria-label="Close match dialog"
        >
          <X size={18} />
        </button>

        <div className="match-modal__icon">
          <PartyPopper size={30} />
        </div>

        <div className="match-modal__eyebrow">It is a match</div>

        <h2>You and {profile.name || "this person"} liked each other.</h2>

        <p>
          This match is now in your Matches tab. You can open it there and start
          chatting when you are ready.
        </p>

        <div className="match-modal__actions">
          <button
            type="button"
            className="match-modal__primary"
            onClick={onViewMatches}
          >
            View matches
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="match-modal__secondary"
            onClick={onClose}
          >
            Keep browsing
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState("locating");
  const [loadingError, setLoadingError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [swipeState, setSwipeState] = useState(null);
  const [matchModal, setMatchModal] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [range, setRange] = useState(50);

  const bootstrapOnceRef = useRef(false);

  const activeProfile = profiles[activeIndex] || null;
  const activeImage = getImage(activeProfile);
  const activeProfileId = getProfileId(activeProfile);
  const vibeText = activeProfile ? getVibeText(activeProfile) : "";

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
    const token = localStorage.getItem("peach_token");

    setLoadingStage("locating");
    const coords = await requestCurrentLocation();
    console.log("User coordinates:", coords.latitude, coords.longitude);

    setLoadingStage("fetching");

    const response = await fetch(`${API_BASE}/profile/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        xCoordinate: coords.longitude,
        yCoordinate: coords.latitude,
        range: range,
      }),
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      throw new Error(data?.message || "Could not load feed");
    }

    const nextProfiles = Array.isArray(data)
      ? data
      : data?.profiles || data?.data || [];

    setProfiles(shuffle(nextProfiles));
    setActiveIndex(0);
  };

  useEffect(() => {
    if (bootstrapOnceRef.current) return;
    bootstrapOnceRef.current = true;

    let mounted = true;

    const bootstrapFeed = async () => {
      setLoading(true);
      setLoadingError("");

      try {
        await loadFeed();
      } catch (err) {
        console.error("Feed load failed:", err);

        if (!mounted) return;

        const msg =
          err?.message || "Location access is required to find nearby matches.";

        if (
          msg.toLowerCase().includes("geolocation") ||
          msg.toLowerCase().includes("permission") ||
          msg.toLowerCase().includes("location")
        ) {
          setLoadingError(
            "Location access is required to find matches nearby. Please enable location and try again."
          );
        } else {
          setLoadingError(msg);
        }

        setProfiles([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrapFeed();

    return () => {
      mounted = false;
    };
  }, [retryKey]);

  const handleRetry = () => {
    bootstrapOnceRef.current = false;
    setRetryKey((n) => n + 1);
  };

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
    setSwipeState({ action });

    try {
      const result = await swipesApi.swipe({
        targetUserId: getTargetUserId(activeProfile),
        action,
      });

      const swipeResult = result?.data ?? result ?? {};
      const matchCreated = Boolean(swipeResult?.matchCreated);
      const matchId = swipeResult?.matchId || "";

      await sleep(760);

      if (matchCreated) {
        setMatchModal({
          profile: activeProfile,
          matchId,
        });
      }

      const remaining = profiles.filter((_, index) => index !== activeIndex);
      advanceToNext(remaining);
    } catch (err) {
      console.error("Swipe failed:", err);
    } finally {
      setSwipeState(null);
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="feed-page">
        <div className="feed-shell">
          <PeachLoader stage={loadingStage} errorMessage={loadingError} />
        </div>
      </div>
    );
  }

  if (loadingError && !profiles.length) {
    return (
      <div className="feed-page">
        <div className="feed-shell">
          <div className="feed-error-state">
            <div className="feed-error-state__icon">🍑</div>
            <h2>Location needed</h2>
            <p>{loadingError}</p>
            <button
              type="button"
              className="feed-error-state__btn"
              onClick={handleRetry}
            >
              <RefreshCcw size={16} />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-shell">
        <header className="feed-hero">
          <div className="feed-filters-wrap">
            <button
              className="feed-icon-btn"
              type="button"
              aria-label="Filters"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal size={20} />
              <span>Filters</span>
            </button>

            {showFilters && (
              <div className="feed-filters-panel">
                <div className="feed-filters-panel__top">
                  <h4>Discovery Radius</h4>
                  <span>{range} km</span>
                </div>

                <input
                  type="range"
                  min="5"
                  max="200"
                  step="5"
                  value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                  className="feed-range-slider"
                />

                <div className="feed-range-labels">
                  <span>5 km</span>
                  <span>200 km</span>
                </div>

                <button
                  className="feed-apply-btn"
                  onClick={async () => {
                    setShowFilters(false);
                    setLoading(true);

                    try {
                      await loadFeed();
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Apply Filters
                </button>
              </div>
            )}
          </div>
        </header>

        <section className="feed-stage">
          <div className="feed-stage__ring feed-stage__ring--1" />
          <div className="feed-stage__ring feed-stage__ring--2" />
          <div className="feed-stage__ring feed-stage__ring--3" />
          <div className="feed-stage__glow" />

          {ambientProfiles.map((profile, index) => (
            <Bubble
              key={
                getProfileId(profile) || `${profile?.name || "bubble"}-${index}`
              }
              profile={profile}
              slot={ambientSlots[index % ambientSlots.length]}
              variant={(index % 4) + 1}
            />
          ))}

          {activeProfile ? (
            <article
              className={`focus-card ${
                swipeState?.action === "LIKE"
                  ? "is-swipe-like"
                  : swipeState?.action === "DISLIKE"
                  ? "is-swipe-dislike"
                  : ""
              }`}
              key={activeProfileId || activeIndex}
            >
              <button
                className="focus-card__menu"
                type="button"
                aria-label="View profile"
                onClick={() => navigate(`/app/profile/${activeProfileId}`)}
              >
                <Eye size={18} />
              </button>

              {swipeState?.action ? (
                <div
                  className={`focus-card__swipe-overlay focus-card__swipe-overlay--${String(
                    swipeState.action
                  ).toLowerCase()}`}
                  aria-hidden="true"
                >
                  {swipeState.action === "LIKE" ? (
                    <>
                      <Heart size={58} fill="currentColor" />
                      <span>Liked</span>
                    </>
                  ) : (
                    <>
                      <X size={58} />
                      <span>Passed</span>
                    </>
                  )}
                </div>
              ) : null}

              <button
                className="focus-card__image"
                type="button"
                onClick={() => navigate(`/app/profile/${activeProfileId}`)}
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

                {activeProfile?.distance !== undefined ? (
                  <span className="distance-pill distance-pill--image">
                    <MapPin size={13} />
                    {formatDistance(activeProfile.distance)}
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

                {hasText(vibeText) ? (
                  <div className="focus-quick">
                    <div className="focus-quick__item">
                      <Sparkles size={14} />
                      <span>{vibeText}</span>
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
      </div>

      {matchModal ? (
        <MatchModal
          profile={matchModal.profile}
          matchId={matchModal.matchId}
          onClose={() => setMatchModal(null)}
          onViewMatches={() => {
            setMatchModal(null);
            navigate("/app/matches");
          }}
        />
      ) : null}
    </div>
  );
}
