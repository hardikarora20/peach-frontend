import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, X, MapPin, Sparkles, ChevronRight } from "lucide-react";

import { profileApi, swipesApi } from "../api/client";

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

  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getImage(profile) {
  return (
    profile?.images?.[0] || profile?.profileImageUrl || profile?.imageUrl || ""
  );
}

export default function FeedPage() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const selectedProfile = useMemo(() => {
    return profiles.find(
      (profile) => String(profile.userId || profile.id) === String(selectedId)
    );
  }, [profiles, selectedId]);

  const loadFeed = async () => {
    setLoading(true);

    try {
      const data = await profileApi.feed();

      const nextProfiles = Array.isArray(data)
        ? data
        : data?.profiles || data?.data || [];

      setProfiles(nextProfiles);

      if (nextProfiles.length > 0) {
        setSelectedId(nextProfiles[0].userId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSwipe = async (action) => {
    if (!selectedProfile || actionLoading) return;

    setActionLoading(true);

    try {
      await swipesApi.swipe({
        targetUserId: selectedProfile.userId,
        action,
      });

      const remaining = profiles.filter(
        (p) => p.userId !== selectedProfile.userId
      );

      setProfiles(remaining);

      if (remaining.length > 0) {
        setSelectedId(remaining[0].userId);
      } else {
        setSelectedId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="feed-page">
        <div className="feed-loader">Loading nearby people…</div>
      </div>
    );
  }

  return (
    <div className="feed-page">
      <div className="feed-shell">
        {/* TOP BAR */}
        <div className="feed-topbar">
          <div>
            <span className="feed-eyebrow">Peach</span>
            <h1>Nearby</h1>
          </div>
        </div>

        {/* BUBBLE FIELD */}
        <section className="bubble-field">
          {profiles.map((profile, index) => {
            const active = String(profile.userId) === String(selectedId);

            return (
              <button
                key={profile.userId}
                className={`bubble bubble--${(index % 8) + 1} ${
                  active ? "bubble--active" : ""
                }`}
                onClick={() => setSelectedId(profile.userId)}
              >
                {getImage(profile) ? (
                  <img src={getImage(profile)} alt={profile.name} />
                ) : (
                  <span>{initials(profile.name)}</span>
                )}

                {active ? <div className="bubble-ring" /> : null}
              </button>
            );
          })}
        </section>

        {/* ACTIVE CARD */}
        {selectedProfile ? (
          <section className="focus-card">
            <div
              className="focus-card__image"
              onClick={() => navigate(`/app/profile/${selectedProfile.userId}`)}
            >
              {getImage(selectedProfile) ? (
                <img
                  src={getImage(selectedProfile)}
                  alt={selectedProfile.name}
                />
              ) : (
                <div className="focus-card__fallback">
                  {initials(selectedProfile.name)}
                </div>
              )}
            </div>

            <div className="focus-card__content">
              <div className="focus-card__head">
                <div>
                  <h2>
                    {selectedProfile.name}
                    {selectedProfile.age ? `, ${selectedProfile.age}` : ""}
                  </h2>

                  <div className="focus-card__meta">
                    <MapPin size={14} />
                    <span>{selectedProfile.location || "Nearby"}</span>
                  </div>
                </div>

                <button
                  className="view-profile-btn"
                  onClick={() =>
                    navigate(`/app/profile/${selectedProfile.userId}`)
                  }
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {hasText(selectedProfile.bio) ? (
                <p className="focus-card__bio">{selectedProfile.bio}</p>
              ) : null}

              {/* INTERESTS */}
              {selectedProfile.interests?.length ? (
                <div className="focus-pills">
                  {selectedProfile.interests.slice(0, 5).map((item) => (
                    <span key={item} className="focus-pill">
                      {humanize(item)}
                    </span>
                  ))}
                </div>
              ) : null}

              {/* QUICK DETAILS */}
              <div className="focus-quick">
                {hasText(selectedProfile.datingIntent) ? (
                  <div className="focus-quick__item">
                    <Sparkles size={14} />
                    <span>{humanize(selectedProfile.datingIntent)}</span>
                  </div>
                ) : null}

                {hasText(selectedProfile.communicationStyle) ? (
                  <div className="focus-quick__item">
                    <span>💬</span>
                    <span>{humanize(selectedProfile.communicationStyle)}</span>
                  </div>
                ) : null}
              </div>

              {/* ACTIONS */}
              <div className="feed-actions">
                <button
                  className="feed-action feed-action--pass"
                  onClick={() => handleSwipe("DISLIKE")}
                >
                  <X size={22} />
                </button>

                <button
                  className="feed-action feed-action--like"
                  onClick={() => handleSwipe("LIKE")}
                >
                  <Heart size={22} />
                </button>
              </div>
            </div>
          </section>
        ) : (
          <div className="feed-empty">
            <h2>No more profiles nearby</h2>
            <p>Check back later for new people.</p>
          </div>
        )}
      </div>
    </div>
  );
}
