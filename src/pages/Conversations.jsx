import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageCircle,
  Sparkles,
  Users,
  Clock3,
  MapPin,
  Heart,
} from "lucide-react";

import { matchesApi } from "../api/client";
import { Avatar, EmptyState, Loader } from "../components/UI";
import { formatDateTime, getDisplayName, getUserId } from "../utils/format";
import "./conversations.css";

function normalizeMatches(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

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

function getOtherUser(match) {
  const otherMatchedUser =
    match?.otherUser || match?.matchedUser || match?.profile || match;
  return (
    otherMatchedUser?.user ||
    otherMatchedUser?.matchedUser ||
    otherMatchedUser?.profile ||
    otherMatchedUser
  );
}

function getMatchId(match) {
  return match?.matchId || match?.id || match?._id || "";
}

function getMatchIcon(match) {
  // console.log("in geticon method");
  // console.log(match);
  // console.log(match.images);
  // console.log(match.images[0]);
  if (match.images != null) return match.images[0];
  return null;
}

function getMatchedAt(match) {
  return match?.matchedAt || match?.createdAt || match?.updatedAt || "";
}

function getPreviewText(other, match) {
  const directPreview =
    match?.lastMessage?.content ||
    match?.lastMessage?.text ||
    match?.latestMessage?.content ||
    match?.latestMessage?.text ||
    match?.message ||
    match?.preview;

  if (hasText(directPreview)) return directPreview;

  if (hasText(other?.bio)) return other.bio;
  return "Tap to open chat";
}

function getInterestList(other) {
  const interests = Array.isArray(other?.interests) ? other.interests : [];
  return interests.slice(0, 3).map(humanize).filter(Boolean);
}

export default function Conversations() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const data = await matchesApi.list();
        if (mounted) setMatches(normalizeMatches(data));
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not load matches";
        if (mounted) setError(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => {
    console.log(matches);
    return [...matches]
      .map((match) => {
        const other = getOtherUser(match);
        const matchId = getMatchId(match);
        const userId = getUserId(other);
        const userIcon = getMatchIcon(other);

        return {
          raw: match,
          other,
          matchId,
          userId,
          matchedAt: getMatchedAt(match),
          preview: getPreviewText(other, match),
          interests: getInterestList(other),
          userIcon,
        };
      })
      .sort((a, b) => {
        const aTime = a.matchedAt ? new Date(a.matchedAt).getTime() : 0;
        const bTime = b.matchedAt ? new Date(b.matchedAt).getTime() : 0;
        return bTime - aTime;
      });
  }, [matches]);

  const recentCount = cards.length;
  const activeCount = cards.filter((item) => hasText(item.matchedAt)).length;

  if (loading) {
    return (
      <div className="conversations-page">
        <div className="conversations-shell conversations-shell--center">
          <Loader label="Loading matches" />
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="conversations-page">
        <div className="conversations-shell">
          <div className="conversations-hero">
            <div>
              <span className="conversations-kicker">Matches</span>
              <h1>Your connections</h1>
              <p>Once two people like each other, the chat appears here.</p>
            </div>
          </div>

          <div className="conversations-empty-wrap">
            <EmptyState
              title="No matches yet"
              description="When a match happens, you will see the conversation here."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="conversations-page">
      <div className="conversations-shell">
        <header className="conversations-hero">
          <div className="conversations-hero__copy">
            <span className="conversations-kicker">Matches</span>
            <h1>Your connections</h1>
            <p>
              A quieter space for the people you have already connected with.
            </p>
          </div>

          <div className="conversations-hero__stats">
            <div className="conversations-stat">
              <Users size={16} />
              <div>
                <strong>{recentCount}</strong>
                <span>Total matches</span>
              </div>
            </div>

            <div className="conversations-stat">
              <Sparkles size={16} />
              <div>
                <strong>{activeCount}</strong>
                <span>Recent chats</span>
              </div>
            </div>
          </div>
        </header>

        {error ? <div className="conversations-banner">{error}</div> : null}

        <section className="conversations-list">
          {cards.map((item) => {
            const other = item.other;
            const matchId = item.matchId;
            const userId = item.userId;
            const displayName = getDisplayName(other);
            const initial = displayName?.[0] || "U";
            const interests = item.interests;
            const location = other?.location || "Nearby";
            const matchedAt = item.matchedAt;
            const matchIcon = item.userIcon;
            console.log(matchIcon);
            return (
              <Link
                key={matchId || userId || displayName}
                to={`/app/chat/${matchId}`}
                className="conversation-card"
              >
                <div className="conversation-card__left">
                  {matchIcon == null ? (
                    <Avatar name={displayName || "U"} />
                  ) : (
                    <img
                      className="avatar"
                      src={matchIcon}
                      alt={displayName || "Match"}
                    />
                  )}
                </div>

                <div className="conversation-card__body">
                  <div className="conversation-card__top">
                    <div className="conversation-card__title-wrap">
                      <h2 className="conversation-card__title">
                        {displayName || "Unnamed"}
                        {hasText(other?.age) ? `, ${other.age}` : ""}
                      </h2>

                      <div className="conversation-card__meta">
                        <MapPin size={14} />
                        <span>{location}</span>
                      </div>
                    </div>

                    {hasText(matchedAt) ? (
                      <span className="conversation-card__time">
                        <Clock3 size={13} />
                        Peached {formatDateTime(matchedAt)}
                      </span>
                    ) : null}
                  </div>

                  <p className="conversation-card__preview">{item.preview}</p>

                  {/* {interests.length > 0 ? (
                    <div className="conversation-card__chips">
                      {interests.map((interest) => (
                        <span key={interest} className="conversation-chip">
                          {interest}
                        </span>
                      ))}
                    </div>
                  ) : null} */}

                  <div className="conversation-card__footer">
                    {/* <span className="conversation-card__badge">
                      <Heart size={13} />
                      Match ready
                    </span> */}

                    {/* <span className="conversation-card__cta">
                      Open chat
                      <ArrowRight size={15} />
                    </span> */}
                  </div>
                </div>

                <span className="conversation-card__arrow">›</span>
              </Link>
            );
          })}
        </section>
      </div>
    </div>
  );
}
