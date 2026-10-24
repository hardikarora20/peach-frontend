<<<<<<< HEAD
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  UserRound,
  MapPin,
  Heart,
  Loader2,
  Sparkles,
} from "lucide-react";
import "./matches.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
  if (!hasText(name)) return "U";
  return String(name)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatMatchedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function normalizeMatches(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getMatchId(match) {
  return match?.matchId || match?.id || match?._id || "";
}

function getOtherUser(match) {
  return (
    match?.user ||
    match?.matchedUser ||
    match?.profile ||
    match?.otherUser ||
    match
  );
}

function getUserId(user) {
  return user?.userId || user?.id || user?._id || user?.profileId || "";
}

function getImage(user) {
  return (
    user?.images?.[0] ||
    user?.profileImageUrl ||
    user?.avatarUrl ||
    user?.photoUrl ||
    user?.imageUrl ||
    ""
  );
}

function getPrimaryLine(user) {
  const bits = [
    user?.datingIntent,
    user?.communicationStyle,
    user?.loveLanguage,
  ]
    .filter(Boolean)
    .map(humanize);

  return bits.join(" • ");
}

export default function MatchesPage() {
  const navigate = useNavigate();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openingProfileId, setOpeningProfileId] = useState("");

  const loadMatches = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("peach_token");

      const res = await fetch(`${API_BASE}/matches`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Could not load matches");
      }

      const data = await res.json();
      setMatches(normalizeMatches(data));
    } catch (err) {
      setError(err?.message || "Could not load matches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const cards = useMemo(() => {
    console.log(matches);
    return matches
      .map((match) => {
        const user = getOtherUser(match);
        const matchId = getMatchId(match);
        const userId = getUserId(user);

        return {
          matchId,
          userId,
          user,
          matchedAt: match?.matchedAt || match?.createdAt || "",
          profileId: match?.profileId || user?.profileId || "",
        };
      })
      .filter((item) => hasText(item.matchId) || hasText(item.userId));
  }, [matches]);

  const handleOpenChat = (matchId) => {
    if (!matchId) return;
    navigate(`/app/chat/${matchId}`);
  };

  const resolveProfileIdByUserId = async (userId, fallbackProfileId = "") => {
    if (hasText(fallbackProfileId)) return fallbackProfileId;
    if (!hasText(userId)) return "";

    const token = localStorage.getItem("peach_token");

    // Adjust this path if your backend route is slightly different.
    const res = await fetch(`${API_BASE}/profile/getId/${userId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.message || "Could not load profile id");
    }

    const data = await res.json().catch(() => ({}));
    return data?.profileId || data?.data?.profileId || data?.id || "";
  };

  const handleViewProfile = async (userId, fallbackProfileId = "") => {
    // console.log(userId);
    // console.log(profileId);
    try {
      setOpeningProfileId(userId || fallbackProfileId || "loading");
      const profileId = await resolveProfileIdByUserId(
        userId,
        fallbackProfileId
      );

      if (!profileId) {
        throw new Error("Profile id not found");
      }

      navigate(`/app/profile/${profileId}`);
    } catch (err) {
      setError(err?.message || "Could not open profile");
    } finally {
      setOpeningProfileId("");
    }
  };

  if (loading) {
    return (
      <div className="matches-page">
        <div className="matches-shell">
          <div className="matches-loader">
            <Loader2 size={20} className="spin" />
            <span>Loading your matches…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="matches-page">
      <div className="matches-shell">
        <div className="matches-topbar">
          <div>
            <span className="matches-kicker">Peach</span>
            <h1>Matches</h1>
            <p>People you have already connected with.</p>
          </div>

          <button
            className="matches-refresh"
            type="button"
            onClick={loadMatches}
          >
            Refresh
          </button>
        </div>

        {error ? (
          <div className="matches-banner matches-banner--error">{error}</div>
        ) : null}

        {!cards.length ? (
          <div className="matches-empty">
            <div className="matches-empty__icon">
              <Heart size={26} />
            </div>
            <h2>No matches yet</h2>
            <p>Once someone matches with you, they will show up here.</p>
          </div>
        ) : (
          <div className="matches-grid">
            {cards.map(({ matchId, userId, user, matchedAt, profileId }) => {
              const image = getImage(user);
              const vibe = getPrimaryLine(user);
              const isOpening = openingProfileId === (userId || profileId);

              return (
                <article className="match-card" key={matchId || userId}>
                  <button
                    type="button"
                    className="match-card__photo"
                    onClick={() => handleViewProfile(userId, profileId)}
                    disabled={isOpening}
                  >
                    {image ? (
                      <img src={image} alt={user?.name || "Match"} />
                    ) : (
                      <div className="match-card__fallback">
                        {initials(user?.name)}
                      </div>
                    )}

                    {hasText(matchedAt) ? (
                      <span className="match-card__badge">
                        Matched {formatMatchedAt(matchedAt)}
                      </span>
                    ) : null}
                  </button>

                  <div className="match-card__body">
                    <div className="match-card__head">
                      <div>
                        <h2>
                          {user?.name || "Unnamed"}
                          {hasText(user?.age) ? `, ${user.age}` : ""}
                        </h2>

                        <div className="match-card__meta">
                          <MapPin size={14} />
                          <span>{user?.location || "Nearby"}</span>
                        </div>
                      </div>

                      {/* <button
                        type="button"
                        className="match-card__profile-btn"
                        onClick={() => handleViewProfile(userId, profileId)}
                        aria-label="View profile"
                        disabled={isOpening}
                      >
                        <UserRound size={18} />
                      </button> */}
                    </div>

                    {hasText(vibe) ? (
                      <div className="match-card__vibe">
                        <Sparkles size={14} />
                        <span>{vibe}</span>
                      </div>
                    ) : null}

                    {hasText(user?.bio) ? (
                      <p className="match-card__bio">{user.bio}</p>
                    ) : null}

                    {Array.isArray(user?.interests) && user.interests.length ? (
                      <div className="match-card__pills">
                        {user.interests.slice(0, 4).map((item) => (
                          <span key={item} className="match-pill">
                            {humanize(item)}
                          </span>
                        ))}
                        {user.interests.length > 4 ? (
                          <span className="match-pill match-pill--more">
                            +{user.interests.length - 4}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="match-card__actions">
                      <button
                        type="button"
                        className="match-action match-action--message"
                        onClick={() => handleOpenChat(matchId)}
                        disabled={!matchId || isOpening}
                      >
                        <MessageCircle size={18} />
                        Message
                      </button>

                      <button
                        type="button"
                        className="match-action match-action--view"
                        onClick={() => handleViewProfile(userId, profileId)}
                        disabled={!userId || isOpening}
                      >
                        <UserRound size={18} />
                        {isOpening ? "Opening…" : "View profile"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
=======
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Compass, Heart, MapPin, MessageCircle, UserRound } from "lucide-react";
import { useInbox } from "../context/InboxContext";
import { Banner, Button, EmptyState, IconButton, PageHeader, Segmented, Skeleton } from "../components/ui";
import { displayName, formatShortStamp, hasText, humanize, initials } from "../utils/format";
import { getPrimaryImage } from "../utils/profile";
import "../styles/matches.css";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "talking", label: "Talking" },
];

export default function MatchesPage() {
  const navigate = useNavigate();
  const inbox = useInbox();
  const [filter, setFilter] = useState("all");

  const cards = useMemo(() => {
    const list = filter === "new" ? inbox.fresh : filter === "talking" ? inbox.conversations : inbox.rows;
    return [...list].sort((a, b) => new Date(b.matchedAt || 0) - new Date(a.matchedAt || 0));
  }, [inbox.rows, inbox.fresh, inbox.conversations, filter]);

  return (
    <div className="page page--wide matches">
      <PageHeader
        eyebrow="Mutual likes"
        title="Matches"
        subtitle={inbox.rows.length ? `${inbox.rows.length} ${inbox.rows.length === 1 ? "person" : "people"} liked you back` : " "}
        actions={inbox.rows.length ? <Segmented label="Filter matches" options={FILTERS} value={filter} onChange={setFilter} /> : null}
      />
      <Banner tone="error">{inbox.status === "error" ? inbox.error : ""}</Banner>

      {inbox.status === "loading" ? (
        <div className="match-grid">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} height="auto" radius={24} style={{ aspectRatio: "3 / 4" }} />
          ))}
        </div>
      ) : !inbox.rows.length ? (
        <EmptyState
          icon={<Heart size={26} />}
          title="No matches yet"
          description="When someone you liked likes you back, they'll show up here."
          action={
            <Button icon={<Compass size={18} />} onClick={() => navigate("/app/feed")}>
              Go to Discover
            </Button>
          }
        />
      ) : !cards.length ? (
        <p className="muted-note">{filter === "new" ? "You've messaged all your matches." : "No conversations yet."}</p>
      ) : (
        <ul className="match-grid">
          {cards.map((r) => {
            const u = r.other;
            const image = getPrimaryImage(u);
            return (
              <li key={r.matchId} className="mcard">
                <button type="button" className="mcard__media" onClick={() => navigate(`/app/chat/${r.matchId}`)} aria-label={`Open chat with ${displayName(u)}`}>
                  {image ? <img src={image} alt="" loading="lazy" /> : <span className="mcard__fallback">{initials(displayName(u))}</span>}
                  {!r.lastAt ? <span className="mcard__tag">New</span> : r.unread ? <span className="mcard__tag mcard__tag--unread">{r.unread} unread</span> : null}
                  <div className="mcard__overlay">
                    <h2 className="display">
                      {displayName(u)} <span>{u?.age || ""}</span>
                    </h2>
                    <p>
                      <MapPin size={13} /> {u?.location || "Nearby"}
                    </p>
                    {hasText(u?.datingIntent) ? <p className="mcard__intent">{humanize(u.datingIntent)}</p> : null}
                    <p className="mcard__when">Matched {formatShortStamp(r.matchedAt)}</p>
                  </div>
                </button>
                <div className="mcard__actions">
                  <IconButton label="Message" variant="primary" onClick={() => navigate(`/app/chat/${r.matchId}`)}>
                    <MessageCircle size={18} />
                  </IconButton>
                  {u?.profileId ? (
                    <IconButton label="View profile" variant="glass" onClick={() => navigate(`/app/profile/${u.profileId}`)}>
                      <UserRound size={18} />
                    </IconButton>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
>>>>>>> 8a08bf3 (updated ui)
    </div>
  );
}
