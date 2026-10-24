import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getErrorMessage, matchApi } from "../api/client";
import {
  getLastMessageAt, getLastMessagePreview, getMatchId, getMatchedAt, getOtherUser, getUnreadCount,
} from "../utils/profile";

// New in v3: one shared copy of /matches for the sidebar, Matches, Chats and the chat screen.
// Before, every screen fetched it separately.
const InboxContext = createContext(null);
const POLL_MS = 12000;

function toRow(m) {
  const lastAt = getLastMessageAt(m);
  const matchedAt = getMatchedAt(m);
  return {
    matchId: getMatchId(m),
    other: getOtherUser(m),
    matchedAt,
    lastAt,
    preview: getLastMessagePreview(m),
    unread: getUnreadCount(m),
    sortAt: new Date(lastAt || matchedAt || 0).getTime(),
  };
}

export function InboxProvider({ children }) {
  const [rows, setRows] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState("");
  const statusRef = useRef(status);
  statusRef.current = status;

  const refresh = useCallback(async () => {
    try {
      const list = await matchApi.list();
      setRows(list.map(toRow).filter((r) => r.matchId));
      setStatus("ready");
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load your matches."));
      if (statusRef.current !== "ready") setStatus("error");
    }
  }, []);

  useEffect(() => {
    refresh();
    const tick = () => document.visibilityState === "visible" && refresh();
    const id = setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  // Local updates so the sidebar reacts instantly without waiting for the next poll
  const markRead = useCallback((matchId) => {
    setRows((list) => list.map((r) => (r.matchId === String(matchId) && r.unread ? { ...r, unread: 0 } : r)));
  }, []);

  const noteSent = useCallback((matchId, content) => {
    const now = new Date().toISOString();
    setRows((list) =>
      list.map((r) => (r.matchId === String(matchId) ? { ...r, preview: content, lastAt: now, sortAt: Date.now() } : r))
    );
  }, []);

  const value = useMemo(() => {
    const sorted = [...rows].sort((a, b) => b.sortAt - a.sortAt);
    return {
      status,
      error,
      rows: sorted,
      conversations: sorted.filter((r) => r.lastAt),
      fresh: sorted.filter((r) => !r.lastAt), // matched but nobody has written yet
      unreadTotal: rows.reduce((n, r) => n + r.unread, 0),
      byId: (id) => rows.find((r) => r.matchId === String(id)),
      refresh,
      markRead,
      noteSent,
    };
  }, [rows, status, error, refresh, markRead, noteSent]);

  return <InboxContext.Provider value={value}>{children}</InboxContext.Provider>;
}

export function useInbox() {
  const ctx = useContext(InboxContext);
  if (!ctx) throw new Error("useInbox must be used inside InboxProvider");
  return ctx;
}
