import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";
import { Home, MessageCircle, Users, UserRound } from "lucide-react";

const navItems = [
  { to: "/app/feed", label: "Feed" },
  { to: "/app/conversations", label: "Conversations" },
  { to: "/app/matches", label: "Matches" },
  { to: "/app/profile", label: "Profile" },
  // { to: "/app/profile2", label: "ProfileTemp" },
];

export function AppShell({ children }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const title = location.pathname.includes("/feed")
    ? "Discover"
    : location.pathname.includes("/matches")
    ? "Matches"
    : location.pathname.includes("/chat")
    ? "Conversation"
    : "Profile";

  const navItems = [
    { to: "/app/feed", label: "Feed", icon: Home, end: true },
    { to: "/app/conversations", label: "Conversations", icon: MessageCircle },
    { to: "/app/matches", label: "Matches", icon: Users },
    { to: "/app/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Link to="/app/feed" className="dock-brand" aria-label="Go to feed">
          <span className="dock-brand__mark">🍑</span>
          {/* <span className="dock-brand__text">Peach</span> */}
        </Link>

        {/* <nav className="side-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `side-link ${isActive ? "active" : ""}`.trim()
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav> */}

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
                {/* <span className="dock-link__label">{item.label}</span> */}
              </NavLink>
            );
          })}
        </div>
      </aside>

      <main className="main-content">
        <div className="app-stage">{children}</div>
      </main>

      <nav className="mobile-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `mobile-nav-item ${isActive ? "active" : ""}`.trim()
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
