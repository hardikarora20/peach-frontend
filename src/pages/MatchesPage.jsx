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
    </div>
  );
}
