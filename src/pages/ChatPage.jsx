import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, CheckCheck, CircleAlert, MessageCircle, PanelRight, RotateCw, SendHorizontal, Smile, X } from "lucide-react";
import { getErrorMessage, messageApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useInbox } from "../context/InboxContext";
import { Avatar, Banner, Button, EmptyState, IconButton, Skeleton } from "../components/ui";
import ProfileView from "../components/profile/ProfileView";
import { displayName, formatDay, formatTime, hasText, humanize, isSameDay } from "../utils/format";
import { getMessageId, getMessageSender, getMessageTime, getPrimaryImage, getUserId } from "../utils/profile";
import "../styles/chat.css";

const POLL_MS = 3000;
const QUICK_EMOJIS = ["❤️", "😂", "😊", "🥺", "🔥", "👀", "👍", "✨"];
const MAX_LENGTH = 1000;

// Conversation starters built from their own profile
function starters(other) {
  const out = [];
  (other?.profilePrompts || [])
    .filter((p) => hasText(p?.answer))
    .slice(0, 2)
    .forEach((p) => out.push(`"${p.answer}" – tell me more about that`));
  const interest = [...(other?.interests || [])][0];
  if (interest) out.push(`How did you get into ${humanize(interest).toLowerCase()}?`);
  if (hasText(other?.openingLine)) out.push(`You said "${other.openingLine}" – so here I am 👋`);
  return out.slice(0, 3);
}

function ThreadSkeleton() {
  return (
    <div className="thread-skeleton" aria-busy="true">
      {[60, 40, 72, 35, 55].map((w, i) => (
        <Skeleton key={i} width={`${w}%`} height={40} radius={20} style={{ alignSelf: i % 2 ? "flex-end" : "flex-start" }} />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { userId: myUserId } = useAuth();
  const inbox = useInbox();
  const row = inbox.byId(matchId);
  const other = row?.other || null;

  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false); // only matters when the panel isn't shown inline
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(0);

  const threadRef = useRef(null);
  const inputRef = useRef(null);
  const stick = useRef(true);
  const lastCount = useRef(0);

  const otherName = displayName(other);
  const otherImage = getPrimaryImage(other);
  const otherUserId = getUserId(other);

  const isMine = useCallback(
    (msg) => {
      const sender = String(getMessageSender(msg) ?? "");
      if (myUserId) return sender === String(myUserId);
      return otherUserId ? sender !== String(otherUserId) : false;
    },
    [myUserId, otherUserId]
  );

  const fetchMessages = useCallback(async () => {
    const list = await messageApi.list(matchId);
    setMessages((prev) =>
      prev.length === list.length && getMessageId(prev[prev.length - 1]) === getMessageId(list[list.length - 1]) ? prev : list
    );
  }, [matchId]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setPending([]);
    setPanelOpen(false);
    stick.current = true;
    fetchMessages()
      .then(() => alive && inbox.markRead(matchId))
      .catch((err) => alive && setError(getErrorMessage(err, "Couldn't open this chat.")))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  // The inbox may load after the messages – clear the unread badge whenever it shows up for this chat
  useEffect(() => {
    if (!loading && row?.unread) inbox.markRead(matchId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, row?.unread, matchId]);

  useEffect(() => {
    if (loading) return undefined;
    const tick = () => document.visibilityState === "visible" && fetchMessages().catch(() => {});
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [fetchMessages, loading]);

  useEffect(() => {
    const close = () => setShowEmoji(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  useEffect(() => {
    if (!panelOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setPanelOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  const onScroll = () => {
    const el = threadRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stick.current = near;
    setAtBottom(near);
    if (near) setUnseen(0);
  };

  const scrollToBottom = (smooth = true) => {
    const el = threadRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  // Follow new messages only if you're already at the bottom; otherwise count them on the jump button
  useLayoutEffect(() => {
    const total = messages.length + pending.length;
    const added = total - lastCount.current;
    lastCount.current = total;
    if (stick.current) scrollToBottom(!loading && added > 0);
    else if (added > 0) setUnseen((n) => n + added);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, pending.length, loading]);

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const deliver = async (item) => {
    setPending((list) => list.map((p) => (p.tempId === item.tempId ? { ...p, status: "sending" } : p)));
    try {
      await messageApi.send({ matchId, content: item.content });
      await fetchMessages();
      inbox.noteSent(matchId, item.content);
      setPending((list) => list.filter((p) => p.tempId !== item.tempId));
    } catch {
      setPending((list) => list.map((p) => (p.tempId === item.tempId ? { ...p, status: "failed" } : p)));
    }
  };

  const send = (e, preset) => {
    e?.preventDefault();
    const content = (preset ?? text).trim();
    if (!content) return;
    const item = { tempId: `tmp-${Date.now()}`, content, sendAt: new Date().toISOString(), status: "sending" };
    stick.current = true;
    setPending((list) => [...list, item]);
    if (!preset) setText("");
    setShowEmoji(false);
    deliver(item);
    inputRef.current?.focus();
  };

  const all = useMemo(
    () => [...messages.map((m) => ({ ...m, _mine: isMine(m) })), ...pending.map((p) => ({ ...p, _mine: true }))],
    [messages, pending, isMine]
  );
  const ideas = useMemo(() => starters(other), [other]);

  if (inbox.status !== "loading" && !row) {
    return (
      <div className="page-center page-center--inset">
        <EmptyState
          icon={<MessageCircle size={26} />}
          title="Chat not found"
          description="This match may have been removed."
          action={<Button onClick={() => navigate("/app/conversations")}>Back to chats</Button>}
        />
      </div>
    );
  }

  return (
    <div className={`chat ${panelOpen ? "is-panel-open" : ""}`}>
      <section className="chat__main">
        <header className="chat__bar">
          <IconButton label="Back to chats" className="chat__back" onClick={() => navigate("/app/conversations")}>
            <ArrowLeft size={22} />
          </IconButton>
          <div className="chat__peer">
            <Avatar name={otherName} src={otherImage} size={42} ring />
            <span>
              <strong>{other ? otherName : <Skeleton width={120} height={14} />}</strong>
              <small>{other?.location || (other ? "" : " ")}</small>
            </span>
          </div>
          {/* Only shown when the profile panel isn't already on screen (CSS hides it on wide screens) */}
          <IconButton label="Show profile" variant="soft" className="chat__panel-toggle" onClick={() => setPanelOpen(true)}>
            <PanelRight size={20} />
          </IconButton>
        </header>

        {error ? (
          <div className="chat__banner">
            <Banner tone="error">{error}</Banner>
          </div>
        ) : null}

        <div className="chat__thread" ref={threadRef} onScroll={onScroll}>
          {loading ? (
            <ThreadSkeleton />
          ) : !all.length ? (
            <div className="chat__intro">
              <div className="chat__intro-photo">
                <Avatar name={otherName} src={otherImage} size={96} ring />
              </div>
              <h2 className="display">You matched with {otherName}</h2>
              <p>{other?.openingLine ? `Their opening line: “${other.openingLine}”` : "Say hello – something from their profile is a good place to start."}</p>
              {ideas.length ? (
                <div className="chat__ideas">
                  <span className="eyebrow">Tap to send</span>
                  {ideas.map((idea) => (
                    <button key={idea} type="button" className="idea" onClick={(e) => send(e, idea)}>
                      {idea}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            all.map((msg, i) => {
              const time = getMessageTime(msg);
              const prev = all[i - 1];
              const next = all[i + 1];
              const showDay = !prev || !isSameDay(getMessageTime(prev), time);
              const first = !prev || prev._mine !== msg._mine || showDay;
              const last = !next || next._mine !== msg._mine || !isSameDay(getMessageTime(next), time);
              return (
                <React.Fragment key={msg.tempId || getMessageId(msg) || i}>
                  {showDay ? (
                    <div className="chat__day">
                      <span>{formatDay(time)}</span>
                    </div>
                  ) : null}
                  <div className={`msg ${msg._mine ? "msg--mine" : "msg--theirs"} ${first ? "is-first" : ""} ${last ? "is-last" : ""}`}>
                    {!msg._mine ? <span className="msg__avatar">{last ? <Avatar name={otherName} src={otherImage} size={28} /> : null}</span> : null}
                    <div className={`msg__bubble ${msg.status === "failed" ? "is-failed" : ""} ${msg.status === "sending" ? "is-sending" : ""}`}>
                      <p>{msg.content}</p>
                      <span className="msg__meta">
                        {msg.status === "failed" ? (
                          <>
                            <CircleAlert size={12} /> Not sent
                          </>
                        ) : (
                          <>
                            {formatTime(time)}
                            {msg._mine ? msg.status === "sending" ? <Check size={13} /> : <CheckCheck size={13} /> : null}
                          </>
                        )}
                      </span>
                    </div>
                    {msg.status === "failed" ? (
                      <IconButton label="Retry sending" size="sm" onClick={() => deliver(msg)}>
                        <RotateCw size={15} />
                      </IconButton>
                    ) : null}
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>

        {!atBottom ? (
          <button type="button" className="jump" onClick={() => scrollToBottom()}>
            <ArrowDown size={16} />
            {unseen ? `${unseen} new` : "Latest"}
          </button>
        ) : null}

        <form className="composer" onSubmit={send}>
          <div className="popover-anchor" onClick={(e) => e.stopPropagation()}>
            <IconButton label="Add emoji" onClick={() => setShowEmoji((v) => !v)} aria-expanded={showEmoji}>
              <Smile size={22} />
            </IconButton>
            {showEmoji ? (
              <div className="emoji-pop" role="menu">
                {QUICK_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="emoji-pop__btn"
                    onClick={() => {
                      setText((t) => (t + emoji).slice(0, MAX_LENGTH));
                      inputRef.current?.focus();
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <textarea
            ref={inputRef}
            className="composer__input"
            rows={1}
            maxLength={MAX_LENGTH}
            placeholder={other ? `Message ${otherName}` : "Message"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && send(e)}
            aria-label="Message"
          />
          <IconButton type="submit" label="Send" variant="primary" className={`composer__send ${text.trim() ? "is-ready" : ""}`} disabled={!text.trim()}>
            <SendHorizontal size={20} />
          </IconButton>
        </form>
      </section>

      {/* Right panel: always visible on wide screens, slide-over / sheet below that */}
      <div className="chat__scrim" onClick={() => setPanelOpen(false)} aria-hidden="true" />
      <aside className="chat__panel" aria-label={`${otherName}'s profile`}>
        <div className="chat__panel-head">
          <span className="eyebrow">Profile</span>
          {other?.profileId ? (
            <Link to={`/app/profile/${other.profileId}`} className="chat__panel-link">
              Open <ArrowUpRight size={14} />
            </Link>
          ) : null}
          <IconButton label="Close profile" size="sm" className="chat__panel-close" onClick={() => setPanelOpen(false)}>
            <X size={18} />
          </IconButton>
        </div>
        <div className="chat__panel-body">
          {other ? (
            <ProfileView profile={other} variant="panel" />
          ) : (
            <div className="panel-skeleton">
              <Skeleton height={320} radius={22} />
              <Skeleton width="60%" height={28} />
              <Skeleton width="40%" height={14} />
              <Skeleton height={90} radius={18} />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
