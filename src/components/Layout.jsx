import React from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Home,
  CircleOff,
  Heart,
  MessageCircle,
  UserRound,
  Users,
} from "lucide-react";
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

  const dockItems = [
    { to: "/app/feed", label: "Feed", icon: Home, end: true, brand: true },
    { to: "/app/conversations", label: "Explore", icon: CircleOff },
    { to: "/app/matches", label: "Matches", icon: Heart },
    { to: "/app/conversations", label: "Chat", icon: MessageCircle },
    { to: "/app/profile", label: "Profile", icon: UserRound },
  ];

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

      <nav className="peach-dock" aria-label="Primary navigation">
        <Link
          to="/app/feed"
          className="peach-dock__brand"
          aria-label="Go to feed"
        >
          <span className="peach-dock__brand-icon">🍑</span>
        </Link>

        <div className="peach-dock__items">
          {dockItems.slice(1).map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `peach-dock__item ${isActive ? "is-active" : ""}`.trim()
                }
              >
                <span className="peach-dock__icon">
                  <Icon size={20} />
                </span>

                <span className="peach-dock__label">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
