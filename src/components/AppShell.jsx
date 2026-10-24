import React, { useContext, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, UNSAFE_NavigationContext, useLocation } from "react-router-dom";
import { Compass, Heart, MessageCircle, UserRound } from "lucide-react";
import { Logo } from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { Avatar } from "./ui";
import { InboxProvider, useInbox } from "../context/InboxContext";
import { useAuth } from "../context/AuthContext";
import { displayName, formatShortStamp } from "../utils/format";
import { getImages, getPrimaryImage } from "../utils/profile";
import { isTransitionTarget, pageCommitted, runPageTransition } from "../utils/pageTransition";

const NAV_ITEMS = [
  { to: "/app/feed", label: "Discover", icon: Compass },
  { to: "/app/matches", label: "Matches", icon: Heart },
  { to: "/app/conversations", label: "Chats", icon: MessageCircle, badge: true },
  { to: "/app/profile", label: "Profile", icon: UserRound, end: true },
];

function isActive(item, pathname) {
  if (item.to === "/app/conversations") return pathname.startsWith("/app/conversations") || pathname.startsWith("/app/chat/");
  return item.end ? pathname === item.to : pathname.startsWith(item.to);
}

// New: every Link, NavLink and navigate() inside the app goes through this, so all page changes
// animate without touching each page. It wraps React Router's navigator and runs the push/replace
// inside a view transition.
function TransitionNavigation({ children }) {
  const ctx = useContext(UNSAFE_NavigationContext);
  const { pathname } = useLocation();
  const current = useRef(pathname);
  current.current = pathname;

  const value = useMemo(() => {
    const base = ctx.navigator;
    // Object.create keeps the original navigator's live getters (location, action) working
    const navigator = Object.create(base, {
      push: { value: (to, state, opts) => runPageTransition(current.current, to, () => base.push(to, state, opts)) },
      replace: { value: (to, state, opts) => runPageTransition(current.current, to, () => base.replace(to, state, opts)) },
    });
    return { ...ctx, navigator };
  }, [ctx]);

  return <UNSAFE_NavigationContext.Provider value={value}>{children}</UNSAFE_NavigationContext.Provider>;
}

// Desktop left panel: navigation + every conversation, so you can jump between chats from anywhere.
function Sidebar() {
  const { pathname } = useLocation();
  const { me } = useAuth();
  const inbox = useInbox();
  const navRef = useRef(null);
  const [pill, setPill] = useState(null);

  const activeIndex = NAV_ITEMS.findIndex((i) => isActive(i, pathname));

  // One highlight that slides between items instead of each item lighting up on its own
  useLayoutEffect(() => {
    const el = navRef.current?.children[activeIndex];
    setPill(el ? { top: el.offsetTop, height: el.offsetHeight } : null);
  }, [activeIndex]);

  return (
    <aside className="sidebar" aria-label="Main navigation">
      <Link to="/app/feed" className="sidebar__brand" aria-label="Peach home">
        <Logo size={30} />
      </Link>

      <nav className="sidebar__nav" ref={navRef}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const count = item.badge ? inbox.unreadTotal : 0;
          return (
            <NavLink key={item.to} to={item.to} end={item.end} className={`side-link ${isActive(item, pathname) ? "is-active" : ""}`}>
              <Icon size={20} className="side-link__icon" />
              <span>{item.label}</span>
              {count ? <span className="count-badge">{count > 9 ? "9+" : count}</span> : null}
            </NavLink>
          );
        })}
        {pill ? <span className="sidebar__pill" style={{ transform: `translateY(${pill.top}px)`, height: pill.height }} aria-hidden="true" /> : null}
      </nav>

      <div className="sidebar__section">
        <div className="sidebar__section-head">
          <span className="eyebrow">Messages</span>
          {inbox.rows.length ? <span className="sidebar__count">{inbox.rows.length}</span> : null}
        </div>

        <div className="sidebar__threads">
          {inbox.status === "loading" ? (
            Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="thread thread--skeleton">
                <span className="skeleton" style={{ width: 40, height: 40, borderRadius: 99 }} />
                <span className="thread__text">
                  <span className="skeleton" style={{ width: "60%", height: 12 }} />
                  <span className="skeleton" style={{ width: "85%", height: 10, marginTop: 6 }} />
                </span>
              </div>
            ))
          ) : inbox.rows.length ? (
            inbox.rows.map((r) => {
              const active = pathname === `/app/chat/${r.matchId}`;
              return (
                <Link key={r.matchId} to={`/app/chat/${r.matchId}`} className={`thread ${active ? "is-active" : ""} ${r.unread ? "is-unread" : ""}`}>
                  <span className="thread__avatar">
                    <Avatar name={displayName(r.other)} src={getPrimaryImage(r.other)} size={40} />
                    {r.unread ? <span className="thread__dot" /> : null}
                  </span>
                  <span className="thread__text">
                    <span className="thread__top">
                      <strong>{displayName(r.other)}</strong>
                      <time>{formatShortStamp(r.lastAt || r.matchedAt)}</time>
                    </span>
                    <span className="thread__preview">{r.preview || <em className="new-tag">New match</em>}</span>
                  </span>
                </Link>
              );
            })
          ) : (
            <p className="sidebar__empty">Your matches and chats will show up here.</p>
          )}
        </div>
      </div>

      <div className="sidebar__foot">
        <Link to="/app/profile" className="me-chip">
          <Avatar name={me?.name} src={getImages(me)[0]} size={34} />
          <span>
            <strong>{me?.name || "You"}</strong>
            <small>View profile</small>
          </span>
        </Link>
        <ThemeToggle />
      </div>
    </aside>
  );
}

// Phone navigation: floating pill at the bottom, hidden inside a chat
function BottomNav() {
  const { pathname } = useLocation();
  const { unreadTotal } = useInbox();
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item, pathname);
        const count = item.badge ? unreadTotal : 0;
        return (
          <NavLink key={item.to} to={item.to} end={item.end} className={`bottom-nav__item ${active ? "is-active" : ""}`} aria-label={item.label}>
            <span className="bottom-nav__icon">
              <Icon size={22} />
              {count ? <span className="dot-badge" /> : null}
            </span>
            <span className="bottom-nav__label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AppShell() {
  const { pathname } = useLocation();
  const inChat = pathname.startsWith("/app/chat/");

  // Decide once per page: did a view transition bring us here (it already animates), or should
  // the CSS fallback play (first load, browser back/forward, browsers without the API)?
  const mode = useRef({ path: null, animated: false });
  if (mode.current.path !== pathname) {
    mode.current = { path: pathname, animated: isTransitionTarget(pathname) };
  }

  // Tell the running transition the new page is on screen so it can start sliding
  useLayoutEffect(() => {
    pageCommitted(pathname);
  }, [pathname]);

  return (
    <InboxProvider>
      <TransitionNavigation>
        <div className={`app ${inChat ? "app--chat" : ""}`}>
          <Sidebar />
          <main className="app__main" id="main">
            {/* keyed so each screen remounts and its components play their entrance */}
            <div key={pathname} className={`route ${mode.current.animated ? "" : "route--enter"}`}>
              <Outlet />
            </div>
          </main>
          <BottomNav />
        </div>
      </TransitionNavigation>
    </InboxProvider>
  );
}
