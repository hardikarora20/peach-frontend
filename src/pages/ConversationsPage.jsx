import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Compass, MessageCircle, Search } from "lucide-react";
import { useInbox } from "../context/InboxContext";
import { Avatar, Banner, Button, EmptyState, PageHeader, Skeleton } from "../components/ui";
import { displayName, formatShortStamp } from "../utils/format";
import { getPrimaryImage } from "../utils/profile";
import "../styles/chat.css";

export default function ConversationsPage() {
  const navigate = useNavigate();
  const inbox = useInbox();
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inbox.conversations.filter((r) => !q || displayName(r.other).toLowerCase().includes(q));
  }, [inbox.conversations, query]);

  const subtitle = inbox.unreadTotal ? `${inbox.unreadTotal} unread` : inbox.rows.length ? "You're all caught up" : " ";

  return (
    <div className="page chats">
      <PageHeader eyebrow="Inbox" title="Chats" subtitle={subtitle} />
      <Banner tone="error">{inbox.status === "error" ? inbox.error : ""}</Banner>

      {inbox.status === "loading" ? (
        <div className="convo-list">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="convo">
              <Skeleton width={56} height={56} radius={99} />
              <span className="convo__text">
                <Skeleton width="40%" height={14} />
                <Skeleton width="70%" height={12} />
              </span>
            </div>
          ))}
        </div>
      ) : !inbox.rows.length ? (
        <EmptyState
          icon={<MessageCircle size={26} />}
          title="No chats yet"
          description="When you and someone like each other, you can start talking here."
          action={
            <Button icon={<Compass size={18} />} onClick={() => navigate("/app/feed")}>
              Start discovering
            </Button>
          }
        />
      ) : (
        <>
          {inbox.fresh.length ? (
            <section className="fresh">
              <h2 className="section-title">
                New matches <span>{inbox.fresh.length}</span>
              </h2>
              <div className="fresh__row">
                {inbox.fresh.map((r) => (
                  <Link key={r.matchId} to={`/app/chat/${r.matchId}`} className="fresh__item">
                    <Avatar name={displayName(r.other)} src={getPrimaryImage(r.other)} size={72} ring />
                    <span>{displayName(r.other)}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <div className="chats__head">
              <h2 className="section-title">Conversations</h2>
              <label className="input-shell search">
                <Search size={17} className="input-shell__icon" />
                <input className="input-shell__input" type="search" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search chats" />
              </label>
            </div>
            {list.length ? (
              <ul className="convo-list">
                {list.map((r) => (
                  <li key={r.matchId}>
                    <Link to={`/app/chat/${r.matchId}`} className={`convo ${r.unread ? "is-unread" : ""}`}>
                      <Avatar name={displayName(r.other)} src={getPrimaryImage(r.other)} size={56} />
                      <span className="convo__text">
                        <span className="convo__top">
                          <strong>{displayName(r.other)}</strong>
                          <time>{formatShortStamp(r.lastAt)}</time>
                        </span>
                        <span className="convo__bottom">
                          <span className="convo__preview">{r.preview}</span>
                          {r.unread ? <span className="count-badge">{r.unread > 9 ? "9+" : r.unread}</span> : null}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted-note">{query ? `Nobody called “${query}” yet.` : "No conversations yet – say hi to one of your new matches."}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
