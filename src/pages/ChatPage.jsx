import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MoreHorizontal,
  Phone,
  Video,
  Smile,
  Mic,
  Paperclip,
  SendHorizontal,
  CheckCheck,
} from "lucide-react";

import { matchesApi, messagesApi } from "../api/client";
import { Avatar, EmptyState, Loader } from "../components/UI";
import { formatDateTime, getDisplayName } from "../utils/format";

import "./chat.css";

function normalizeMessages(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.messages)) return data.messages;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeMatches(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.matches)) return data.matches;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function formatDay(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  const threadRef = useRef(null);
  const intervalRef = useRef(null);
  const prevLastIdRef = useRef(null);
  const audioRef = useRef(null);

  const match = useMemo(() => {
    return matches.find(
      (item) => (item.matchId || item.id || item._id) === matchId
    );
  }, [matches, matchId]);

  const otherUser =
    match?.user || match?.matchedUser || match?.profile || match;

  useEffect(() => {
    audioRef.current = new Audio("/message.mp3");
  }, []);

  const load = async () => {
    setLoading(true);

    try {
      const [messagesData, matchesData] = await Promise.all([
        messagesApi.list(matchId),
        matchesApi.list(),
      ]);

      const msgs = normalizeMessages(messagesData);

      setMessages(msgs);

      const last =
        msgs[msgs.length - 1]?.messageId || msgs[msgs.length - 1]?.id;

      prevLastIdRef.current = last;

      setMatches(normalizeMatches(matchesData));
    } catch (err) {
      setError("Could not load chat");
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = async () => {
    try {
      const data = await messagesApi.list(matchId);

      const nextMessages = normalizeMessages(data);

      const lastNew =
        nextMessages[nextMessages.length - 1]?.messageId ||
        nextMessages[nextMessages.length - 1]?.id;

      const lastPrev = prevLastIdRef.current;

      if (lastNew && lastNew !== lastPrev) {
        const lastMsg = nextMessages[nextMessages.length - 1];

        const sender = lastMsg.senderId || lastMsg.sender || lastMsg.fromUserId;

        const mineId = otherUser?.otherUser?.userId || otherUser?.userId;

        const isIncoming = mineId ? String(sender) === String(mineId) : false;

        if (isIncoming) {
          audioRef.current?.play().catch(() => {});

          setShowTyping(true);

          setTimeout(() => {
            setMessages(nextMessages);
            setShowTyping(false);
          }, 650);
        } else {
          setMessages(nextMessages);
        }

        prevLastIdRef.current = lastNew;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [matchId]);

  useEffect(() => {
    intervalRef.current = setInterval(pollMessages, 1000);

    return () => clearInterval(intervalRef.current);
  }, [matchId]);

  useEffect(() => {
    const el = threadRef.current;

    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, showTyping]);

  const handleSend = async (e) => {
    e.preventDefault();

    const text = content.trim();

    if (!text) return;

    setSending(true);

    const tempMsg = {
      messageId: Date.now(),
      content: text,
      sendAt: new Date().toISOString(),
      senderId: localStorage.peach_user_id,
    };

    setMessages((prev) => [...prev, tempMsg]);

    setContent("");

    try {
      await messagesApi.send({
        matchId,
        content: text,
      });
    } catch (err) {
      setError("Message failed");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <Loader label="Opening conversation" />
      </div>
    );
  }

  return (
    <div className="modern-chat-page">
      <div className="modern-chat-shell">
        <div className="modern-chat-sidebar-glow" />

        <div className="modern-chat-layout">
          <section className="modern-chat-main">
            <header className="modern-chat-header">
              <div className="modern-chat-header-left">
                <button className="icon-btn ghost" onClick={() => navigate(-1)}>
                  <ArrowLeft size={22} />
                </button>

                <Avatar
                  name={getDisplayName(otherUser?.otherUser || otherUser)}
                />

                <div className="modern-chat-user">
                  <h2>{getDisplayName(otherUser?.otherUser || otherUser)}</h2>

                  <p>
                    {otherUser?.otherUser?.location ||
                      otherUser?.location ||
                      "Online"}
                  </p>
                </div>

                <span className="online-dot" />
              </div>

              <div className="modern-chat-header-actions">
                <button className="icon-btn">
                  <Phone size={18} />
                </button>

                <button className="icon-btn">
                  <Video size={18} />
                </button>

                <button className="icon-btn">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </header>

            {error ? <div className="chat-error-banner">{error}</div> : null}

            <div ref={threadRef} className="modern-chat-thread">
              <div className="chat-thread-glow" />

              {!messages.length ? (
                <EmptyState
                  title="No messages yet"
                  description="Start the conversation ✨"
                />
              ) : (
                messages.map((msg, i) => {
                  const sender = msg.senderId || msg.sender || msg.fromUserId;

                  const mineId =
                    otherUser?.otherUser?.userId || otherUser?.userId;

                  const isMine = !(mineId
                    ? String(sender) !== String(mineId)
                    : true);

                  const previous = messages[i - 1];

                  const showDate =
                    !previous ||
                    !isSameDay(
                      previous.sendAt || previous.sentAt || previous.createdAt,
                      msg.sendAt || msg.sentAt || msg.createdAt
                    );

                  return (
                    <React.Fragment key={i}>
                      {showDate ? (
                        <div className="chat-day-divider">
                          <span>
                            {formatDay(
                              msg.sendAt || msg.sentAt || msg.createdAt
                            )}
                          </span>
                        </div>
                      ) : null}

                      <div
                        className={`modern-message-row ${
                          isMine ? "mine" : "theirs"
                        }`}
                      >
                        {!isMine && (
                          <Avatar
                            name={getDisplayName(
                              otherUser?.otherUser || otherUser
                            )}
                          />
                        )}

                        <div
                          className={`modern-bubble ${
                            isMine ? "mine" : "theirs"
                          }`}
                        >
                          <p>{msg.content}</p>

                          <div className="modern-bubble-meta">
                            <span>
                              {formatDateTime(
                                msg.sendAt || msg.sentAt || msg.createdAt
                              )}
                            </span>

                            {isMine ? <CheckCheck size={15} /> : null}
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}

              {showTyping ? (
                <div className="modern-message-row theirs">
                  <Avatar
                    name={getDisplayName(otherUser?.otherUser || otherUser)}
                  />

                  <div className="typing-bubble">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ) : null}
            </div>

            <form className="modern-chat-compose" onSubmit={handleSend}>
              <button type="button" className="compose-side-btn">
                <Paperclip size={20} />
              </button>

              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write a message..."
                className="modern-compose-input"
              />

              <div className="compose-actions">
                <button type="button" className="compose-icon-btn">
                  <Smile size={20} />
                </button>

                <button type="button" className="compose-icon-btn">
                  <Mic size={20} />
                </button>

                <button type="submit" disabled={sending} className="send-btn">
                  <SendHorizontal size={22} />
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
