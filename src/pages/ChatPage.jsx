import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { matchesApi, messagesApi } from "../api/client";
import { Avatar, Button, EmptyState, Input, Loader } from "../components/UI";
import { formatDateTime, getDisplayName } from "../utils/format";

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

export default function ChatPage() {
  const { matchId } = useParams();
  const [messages, setMessages] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [showTyping, setShowTyping] = useState(false);

  const intervalRef = useRef(null);
  const threadRef = useRef(null);
  const prevLastIdRef = useRef(null);
  const audioRef = useRef(null);

  const match = useMemo(() => {
    return matches.find(
      (item) => (item.matchId || item.id || item._id) === matchId
    );
  }, [matches, matchId]);

  const otherUser =
    match?.user || match?.matchedUser || match?.profile || match;

  // 🔊 init sound
  useEffect(() => {
    audioRef.current = new Audio("/message.mp3");
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [messagesData, matchesData] = await Promise.all([
        messagesApi.list(matchId),
        matchesApi.list(),
      ]);
      const msgs = normalizeMessages(messagesData);
      setMessages(msgs);

      // set initial last id
      const last =
        msgs[msgs.length - 1]?.messageId || msgs[msgs.length - 1]?.id;
      prevLastIdRef.current = last;

      setMatches(normalizeMatches(matchesData));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Could not load chat";
      setError(msg);
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
          // 🔔 play sound
          audioRef.current?.play().catch(() => {});

          // 💬 show typing
          setShowTyping(true);

          setTimeout(() => {
            setMessages(nextMessages);
            setShowTyping(false);
          }, 700);
        } else {
          setMessages(nextMessages);
        }

        prevLastIdRef.current = lastNew;
      }
    } catch (err) {
      console.error("Polling error:", err);
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
    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(intervalRef.current);
      } else {
        pollMessages();
        intervalRef.current = setInterval(pollMessages, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [matchId]);

  // smooth scroll
  useEffect(() => {
    const el = threadRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;

    setSending(true);
    setError("");

    const tempMsg = {
      messageId: Date.now(),
      content: text,
      sendAt: new Date().toISOString(),
      senderId: "me",
    };

    setMessages((prev) => [...prev, tempMsg]);
    setContent("");

    try {
      await messagesApi.send({ matchId, content: text });
    } catch (err) {
      setError("Message failed");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="page-card">
        <Loader label="Opening conversation" />
      </div>
    );
  }

  return (
    <div
      className="chat-page"
      style={{
        height: "100%",
        windth: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <section
        className="chat-panel"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <div className="chat-head">
          <Avatar name={getDisplayName(otherUser?.otherUser || otherUser)} />
          <div>
            <strong>{getDisplayName(otherUser?.otherUser || otherUser)}</strong>
            <span>{otherUser?.otherUser?.location || "Chatting now"}</span>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div
          ref={threadRef}
          className="chat-thread"
          style={{ flex: 1, overflowY: "auto", padding: "12px" }}
        >
          {!messages.length ? (
            <EmptyState
              title="No messages yet"
              description="Say hello to start the conversation."
            />
          ) : (
            messages.map((msg, i) => {
              const sender = msg.senderId || msg.sender || msg.fromUserId;
              const mineId = otherUser?.otherUser?.userId || otherUser?.userId;

              const isMine = mineId ? String(sender) !== String(mineId) : true;

              return (
                <div
                  key={i}
                  className={`bubble-row ${isMine ? "mine" : "theirs"}`}
                >
                  <div className="bubble">
                    <p>{msg.content}</p>
                    <span>
                      {formatDateTime(
                        msg.sendAt || msg.sentAt || msg.createdAt
                      )}
                    </span>
                  </div>
                </div>
              );
            })
          )}

          {/* 💬 typing indicator */}
          {showTyping && (
            <div className="bubble-row theirs">
              <div className="bubble" style={{ opacity: 0.6 }}>
                typing...
              </div>
            </div>
          )}
        </div>

        <form className="chat-compose" onSubmit={handleSend}>
          <Input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write a message…"
          />
          <Button type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </form>
      </section>
    </div>
  );
}
