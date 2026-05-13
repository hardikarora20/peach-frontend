import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, Users, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";

const navItems = [
  { to: "/app/feed", label: "Feed", icon: Home, end: true },
  { to: "/app/conversations", label: "Conversations", icon: MessageCircle },
  { to: "/app/matches", label: "Matches", icon: Users },
  { to: "/app/profile", label: "Profile", icon: UserRound },
];

export function AppShell({ children }) {
  const { profile } = useAuth();
  const location = useLocation();

  const title = location.pathname.includes("/feed")
    ? "Discover"
    : location.pathname.includes("/conversations") ||
      location.pathname.includes("/messages")
    ? "Conversations"
    : location.pathname.includes("/matches")
    ? "Matches"
    : location.pathname.includes("/editprofile")
    ? "Edit profile"
    : "Profile";

  return (
    <div className="app-shell">
      <main className="main-content">
        {/* <header className="topbar">
          <div>
            <span className="eyebrow">Peach</span>
            <h1>{title}</h1>
          </div>

          <div className="topbar-profile">
            <Avatar name={profile?.name || "P"} />
            <div className="topbar-profile-text">
              <strong>{profile?.name || "Guest"}</strong>
              <span>{profile?.gender || "No profile yet"}</span>
            </div>
          </div>
        </header> */}

        <div className="app-stage">{children}</div>
      </main>

      <nav className="bottom-dock" aria-label="Main navigation">
        <Link to="/app/feed" className="dock-brand" aria-label="Go to feed">
          <span className="dock-brand__mark">🍑</span>
          <span className="dock-brand__text">Peach</span>
        </Link>

        <div className="dock-links">
          {navItems.slice(1).map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `dock-link ${isActive ? "active" : ""}`.trim()
                }
                aria-label={item.label}
              >
                <span className="dock-link__icon">
                  <Icon size={18} />
                </span>
                <span className="dock-link__label">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
