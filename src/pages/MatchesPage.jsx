import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { matchesApi } from "../api/client";
import { Avatar, EmptyState, Loader } from "../components/UI";
import { formatDateTime, getDisplayName, getUserId } from "../utils/format";

function normalizeMatches(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function MatchesPage() {
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

  if (loading)
    return (
      <div className="page-card">
        <Loader label="Loading matches" />
      </div>
    );

  if (!matches.length) {
    return (
      <div className="page-card">
        <EmptyState
          title="No matches yet"
          description="Once two people like each other, they will appear here."
        />
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="section-head">
        <div>
          <span className="eyebrow">Matches</span>
          <h2>Your connections</h2>
        </div>
        <div className="pill">{matches.length} total</div>
      </div>

      {error ? <div className="form-error">{error}</div> : null}

      <div className="match-list">
        {matches.map((match) => {
          // console.log(matches);
          // console.log(match.otherUser);
          const otherMatchedUser = match.otherUser;
          const other =
            otherMatchedUser.user ||
            otherMatchedUser.matchedUser ||
            otherMatchedUser.profile ||
            otherMatchedUser;
          const matchId = match.matchId || match.id || match._id;
          const userId = getUserId(other);
          return (
            <Link
              key={matchId || userId || getDisplayName(other)}
              to={`/app/chat/${matchId}`}
              className="match-item"
            >
              <Avatar name={getDisplayName(other)} />
              <div className="match-body">
                <div className="match-head">
                  <strong>{getDisplayName(other) + " | " + other.age}</strong>
                  <span>
                    {"Peached at: " + formatDateTime(match.matchedAt)}
                  </span>
                </div>
                <p>{other.bio || "Tap to open chat"}</p>
              </div>
              <span className="match-arrow">›</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
