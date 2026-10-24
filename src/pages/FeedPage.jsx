<<<<<<< HEAD
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
=======
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Heart, Info, MapPin, MapPinOff, MessageCircle, Quote, RefreshCcw, SlidersHorizontal, UserRound, X } from "lucide-react";
import { getErrorMessage, profileApi, swipeApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useInbox } from "../context/InboxContext";
import { Avatar, Banner, Button, Chip, EmptyState, IconButton, Skeleton } from "../components/ui";
import Sheet from "../components/Sheet";
import ProfileView from "../components/profile/ProfileView";
import { formatDistance, hasText, humanize, initials } from "../utils/format";
import { getImages, getPrimaryImage, getProfileId, getTargetUserId } from "../utils/profile";
import { getCurrentLocation } from "../utils/location";
import { prefs } from "../utils/storage";
import "../styles/feed.css";

const FLY_MS = 360;
const SWIPE_THRESHOLD = 110;
const MIN_RADIUS = 5;
const MAX_RADIUS = 200;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function shuffle(list) {
  const copy = [...list];
>>>>>>> 8a08bf3 (updated ui)
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

<<<<<<< HEAD
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
=======
function DistancePopover({ value, onChange, onApply, onClose }) {
  return (
    <div className="popover distance" role="dialog" aria-label="Distance">
      <div className="distance__head">
        <span className="eyebrow">Show people within</span>
        <strong key={value} className="distance__value display">
          {value}
          <small>km</small>
        </strong>
      </div>
      <input
        type="range"
        className="slider"
        min={MIN_RADIUS}
        max={MAX_RADIUS}
        step="5"
        value={value}
        style={{ "--fill": `${((value - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Maximum distance in kilometres"
      />
      <div className="distance__actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
}

const BURST = Array.from({ length: 16 }, (_, i) => ({ a: (360 / 16) * i, d: 90 + (i % 3) * 30, delay: (i % 4) * 35, s: 12 + (i % 3) * 5 }));

function MatchMoment({ me, them, matchId, onClose, onMessage }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portal to <body> so it always covers the whole screen, sidebar included
  return createPortal(
    <div className="match-moment" role="dialog" aria-modal="true" aria-labelledby="match-title" onClick={onClose}>
      <div className="match-moment__inner" onClick={(e) => e.stopPropagation()}>
        <div className="match-moment__pair">
          <div className="match-moment__burst" aria-hidden="true">
            {BURST.map((b, i) => (
              <Heart key={i} size={b.s} fill="currentColor" style={{ "--a": `${b.a}deg`, "--d": `${b.d}px`, animationDelay: `${b.delay}ms` }} />
            ))}
          </div>
          <span className="match-moment__photo match-moment__photo--me">
            <Avatar name={me?.name} src={getImages(me)[0]} size={128} />
          </span>
          <span className="match-moment__photo match-moment__photo--them">
            <Avatar name={them?.name} src={getPrimaryImage(them)} size={128} />
          </span>
          <span className="match-moment__heart">
            <Heart size={22} fill="currentColor" />
          </span>
        </div>
        <h2 id="match-title" className="display">
          It's a <em>match</em>
        </h2>
        <p>You and {them?.name || "this person"} liked each other.</p>
        <div className="match-moment__actions">
          <Button size="lg" icon={<MessageCircle size={18} />} onClick={onMessage}>
            {matchId ? `Message ${them?.name || ""}`.trim() : "See your matches"}
          </Button>
          <Button size="lg" variant="ghost" onClick={onClose}>
            Keep browsing
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// The top card. Drag it, or tap the photo sides to flip through photos.
function Card({ profile, leaving, disabled, onSwipe, onDetails }) {
  const images = getImages(profile);
  const [photo, setPhoto] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const start = useRef(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!leaving) setDrag((d) => (d.active ? { x: 0, y: 0, active: false } : d));
  }, [leaving]);

  const onPointerDown = (e) => {
    if (disabled || leaving || e.button !== 0 || e.target.closest("button")) return;
    start.current = { x: e.clientX, y: e.clientY, w: e.currentTarget.getBoundingClientRect() };
    moved.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    if (Math.abs(x) > 6 || Math.abs(y) > 6) moved.current = true;
    setDrag({ x, y, active: true });
  };
  const onPointerUp = (e) => {
    if (!start.current) return;
    const rect = start.current.w;
    start.current = null;
    if (!moved.current) {
      setDrag({ x: 0, y: 0, active: false });
      const rel = (e.clientX - rect.left) / rect.width;
      if (images.length > 1 && rel < 0.33) setPhoto((p) => Math.max(0, p - 1));
      else if (images.length > 1 && rel > 0.67) setPhoto((p) => Math.min(images.length - 1, p + 1));
      else onDetails();
      return;
    }
    if (Math.abs(drag.x) > SWIPE_THRESHOLD) onSwipe(drag.x > 0 ? "LIKE" : "DISLIKE", drag);
    else setDrag({ x: 0, y: 0, active: false });
  };

  let style;
  if (leaving) {
    const dir = leaving.action === "LIKE" ? 1 : -1;
    style = {
      transform: `translate(${dir * 120}vw, ${(leaving.from?.y || 0) * 1.4 - 40}px) rotate(${dir * 24}deg)`,
      transition: `transform ${FLY_MS}ms cubic-bezier(.5,0,.75,0), opacity ${FLY_MS}ms ease`,
      opacity: 0,
    };
  } else if (drag.active) {
    style = { transform: `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${drag.x / 20}deg)`, transition: "none" };
  }
  const like = leaving ? +(leaving.action === "LIKE") : Math.max(0, Math.min(drag.x / SWIPE_THRESHOLD, 1));
  const nope = leaving ? +(leaving.action === "DISLIKE") : Math.max(0, Math.min(-drag.x / SWIPE_THRESHOLD, 1));
  const looking = [profile?.datingIntent, profile?.connectionPreference].filter(hasText).map(humanize);
  const prompt = (profile?.profilePrompts || []).find((p) => hasText(p?.answer));

  return (
    <article className={`fcard ${drag.active ? "is-dragging" : ""}`} style={style}>
      <div
        className="fcard__media"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label={`${profile?.name || "Profile"}. Drag right to like, left to pass.`}
      >
        {images.length ? (
          images.map((src, i) => <img key={src + i} src={src} alt="" draggable="false" className={i === photo ? "is-current" : ""} />)
        ) : (
          <span className="fcard__fallback">{initials(profile?.name)}</span>
        )}

        {images.length > 1 ? (
          <div className="gallery__bars" aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={i < photo ? "is-seen" : i === photo ? "is-current" : ""} />
            ))}
          </div>
        ) : null}

        <span className="fcard__stamp fcard__stamp--like" style={{ opacity: like, "--s": 0.6 + like * 0.4 }}>
          Like
        </span>
        <span className="fcard__stamp fcard__stamp--nope" style={{ opacity: nope, "--s": 0.6 + nope * 0.4 }}>
          Pass
        </span>
        <span className="fcard__tint fcard__tint--like" style={{ opacity: like * 0.5 }} />
        <span className="fcard__tint fcard__tint--nope" style={{ opacity: nope * 0.5 }} />

        <div className="fcard__overlay">
          <div className="fcard__name">
            <h2 className="display">
              {profile?.name || "Unnamed"} <span>{profile?.age || ""}</span>
            </h2>
            <p>
              <MapPin size={14} />
              {profile?.location || "Nearby"}
              {profile?.distance != null ? ` · ${formatDistance(profile.distance)}` : ""}
            </p>
            {looking.length ? (
              <div className="chip-row fcard__chips">
                {looking.map((l) => (
                  <Chip key={l} className="chip--glass">
                    {l}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>
          <IconButton label="More about them" variant="glass" className="fcard__info" onClick={onDetails}>
            <Info size={20} />
          </IconButton>
        </div>
      </div>

      {/* Desktop-only side: enough to decide without opening the full profile */}
      <div className="fcard__body">
        {hasText(profile?.bio) ? (
          <section>
            <span className="eyebrow">About</span>
            <p className="fcard__bio">{profile.bio}</p>
          </section>
        ) : null}
        {hasText(profile?.openingLine) ? (
          <blockquote className="fcard__opener">
            <Quote size={18} />
            <span>{profile.openingLine}</span>
          </blockquote>
        ) : null}
        {prompt ? (
          <section className="fcard__prompt">
            <span className="eyebrow">{prompt.question}</span>
            <p className="display">{prompt.answer}</p>
          </section>
        ) : null}
        {profile?.interests?.length ? (
          <section>
            <span className="eyebrow">Into</span>
            <div className="chip-row">
              {[...profile.interests].slice(0, 8).map((i) => (
                <Chip key={i}>{humanize(i)}</Chip>
              ))}
            </div>
          </section>
        ) : null}
        <button type="button" className="fcard__more" onClick={onDetails}>
          See full profile <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div className="deck">
      <div className="fcard fcard--skeleton" aria-busy="true">
        <div className="fcard__media">
          <Skeleton height="100%" radius={0} />
        </div>
        <div className="fcard__body">
          <Skeleton width="30%" height={12} />
          <Skeleton height={16} />
          <Skeleton width="80%" height={16} />
          <Skeleton height={80} radius={18} style={{ marginTop: 12 }} />
          <div className="chip-row">
            <Skeleton width={80} height={32} radius={99} />
            <Skeleton width={64} height={32} radius={99} />
            <Skeleton width={96} height={32} radius={99} />
          </div>
>>>>>>> 8a08bf3 (updated ui)
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();
<<<<<<< HEAD

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

    const lastSavedRadius = localStorage.getItem("peach_saved_radius");
    if (lastSavedRadius != null) setRange(lastSavedRadius);
    const response = await fetch(`${API_BASE}/profile/feed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        xCoordinate: coords.longitude,
        yCoordinate: coords.latitude,
        range: lastSavedRadius == null ? range : lastSavedRadius,
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
                  onChange={(e) => {
                    setRange(Number(e.target.value));
                    localStorage.setItem("peach_saved_radius", e.target.value);
                  }}
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
=======
  const { me } = useAuth();
  const inbox = useInbox();
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState("locating");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [leaving, setLeaving] = useState(null);
  const [match, setMatch] = useState(null);
  const [details, setDetails] = useState(null);
  const [radius, setRadius] = useState(prefs.getRadius());
  const [draft, setDraft] = useState(radius);
  const [showFilter, setShowFilter] = useState(false);
  const busy = useRef(false);

  const current = profiles[0] || null;
  const behind = useMemo(() => profiles.slice(1, 3), [profiles]);

  const load = useCallback(async (km, { fresh = false } = {}) => {
    setError("");
    setStatus("locating");
    try {
      const coords = await getCurrentLocation({ useCache: !fresh });
      setStatus("loading");
      setProfiles(shuffle(await profileApi.feed({ ...coords, range: km })));
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load people near you."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRadius = (km) => {
    setShowFilter(false);
    setRadius(km);
    setDraft(km);
    prefs.setRadius(km);
    load(km);
  };

  const swipe = useCallback(
    async (action, from) => {
      if (!current || busy.current) return;
      busy.current = true;
      setActionError("");
      setLeaving({ action, from });
      try {
        const [result] = await Promise.all([swipeApi.send({ targetUserId: getTargetUserId(current), action }), wait(FLY_MS)]);
        if (result?.matchCreated) {
          setMatch({ profile: current, matchId: result.matchId || "" });
          inbox.refresh();
        }
        setProfiles((list) => list.slice(1));
      } catch (err) {
        setActionError(getErrorMessage(err, "That didn't go through. Try again."));
      } finally {
        setLeaving(null);
        busy.current = false;
      }
    },
    [current, inbox]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (match || details || showFilter || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowLeft") swipe("DISLIKE");
      if (e.key === "ArrowRight") swipe("LIKE");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe, match, details, showFilter]);

  // Desktop goes to the full page; phones get a sheet so you don't lose your place in the deck
  const openDetails = () => {
    if (!current) return;
    if (window.matchMedia("(min-width: 900px)").matches) navigate(`/app/profile/${getProfileId(current)}`);
    else setDetails(current);
  };

  return (
    <div className="feed">
      <header className="feed__bar">
        <div>
          <span className="eyebrow">{status === "ready" && profiles.length ? `${profiles.length} nearby` : "Nearby"}</span>
          <h1 className="display">Discover</h1>
        </div>
        <div className="popover-anchor">
          <Button
            variant="soft"
            icon={<SlidersHorizontal size={17} />}
            onClick={() => {
              setDraft(radius);
              setShowFilter((v) => !v);
            }}
            aria-expanded={showFilter}
          >
            {radius} km
          </Button>
          {showFilter ? <DistancePopover value={draft} onChange={setDraft} onApply={() => changeRadius(draft)} onClose={() => setShowFilter(false)} /> : null}
        </div>
      </header>

      <div className="feed__stage">
        {status === "locating" || status === "loading" ? (
          <FeedSkeleton />
        ) : status === "error" ? (
          <EmptyState
            icon={<MapPinOff size={26} />}
            title="Couldn't load your feed"
            description={error}
            action={
              <Button icon={<RefreshCcw size={18} />} onClick={() => load(radius, { fresh: true })}>
                Try again
              </Button>
            }
          />
        ) : !current ? (
          <EmptyState
            icon={<UserRound size={26} />}
            title="That's everyone nearby"
            description={radius < MAX_RADIUS ? "Widen the distance to see more people, or come back later." : "New people join all the time – check back later."}
            action={
              radius < MAX_RADIUS ? (
                <Button icon={<ArrowRight size={18} />} onClick={() => changeRadius(Math.min(radius + 50, MAX_RADIUS))}>
                  Search up to {Math.min(radius + 50, MAX_RADIUS)} km
                </Button>
              ) : (
                <Button variant="soft" icon={<RefreshCcw size={18} />} onClick={() => load(radius)}>
                  Refresh
                </Button>
              )
            }
          />
        ) : (
          <div className="deck">
            {behind
              .map((p, i) => (
                <div
                  key={getProfileId(p)}
                  className={`deck__ghost deck__ghost--${i + 1} ${leaving ? "is-advancing" : ""}`}
                  style={{ backgroundImage: getPrimaryImage(p) ? `url("${getPrimaryImage(p)}")` : undefined }}
                  aria-hidden="true"
                />
              ))
              .reverse()}
            <Card key={getProfileId(current)} profile={current} leaving={leaving} disabled={Boolean(match)} onSwipe={swipe} onDetails={openDetails} />

            <div className="dock">
              <IconButton label="Pass (←)" className="dock__btn dock__btn--nope" disabled={Boolean(leaving)} onClick={() => swipe("DISLIKE")}>
                <X size={26} strokeWidth={2.5} />
              </IconButton>
              <IconButton label="Like (→)" className="dock__btn dock__btn--like" disabled={Boolean(leaving)} onClick={() => swipe("LIKE")}>
                <Heart size={28} fill="currentColor" />
              </IconButton>
            </div>
          </div>
        )}
        <Banner tone="error">{actionError}</Banner>
      </div>

      <Sheet open={Boolean(details)} onClose={() => setDetails(null)} title={details?.name || "Profile"}>
        {details ? <ProfileView profile={details} variant="panel" /> : null}
      </Sheet>

      {match ? (
        <MatchMoment
          me={me}
          them={match.profile}
          matchId={match.matchId}
          onClose={() => setMatch(null)}
          onMessage={() => {
            const id = match.matchId;
            setMatch(null);
            navigate(id ? `/app/chat/${id}` : "/app/matches");
>>>>>>> 8a08bf3 (updated ui)
          }}
        />
      ) : null}
    </div>
  );
}
