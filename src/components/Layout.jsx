import React from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UI";

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

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Link to="/app/feed" className="brand">
          <div className="brand-mark">🍑</div>
          <div>
            <strong>Peach</strong>
            {/* <span>Modern dating</span> */}
          </div>
        </Link>

        <nav className="side-nav">
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
        </nav>

        <div className="sidebar-card">
          {/* <div className="sidebar-user">
            <Avatar name={profile?.name || "P"} />
            <div>
              <strong>{profile?.name || "Your profile"}</strong>
              <span>
                {profile?.location || "Set your profile to get better matches"}
              </span>
            </div>
          </div> */}
          <button
            className="btn btn-ghost"
            onClick={() => {
              navigate("/app/editprofile", { replace: true });
            }}
          >
            Edit profile
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate("/auth", { replace: true });
            }}
          >
            Log out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="eyebrow">Peach</span>
            <h1>{title}</h1>
          </div>
          <div className="topbar-profile">
            <Avatar name={profile?.name || "P"} />
            <div className="topbar-profile-text">
              <strong>{profile?.name || "Guest"}</strong>
              <span>{profile?.gender || "No profile yet"}</span>
              {/* <button
                onClick={() => {
                  const current =
                    document.documentElement.getAttribute("data-theme");
                  document.documentElement.setAttribute(
                    "data-theme",
                    current === "dark" ? "light" : "dark"
                  );
                }}
              >
                Toggle Theme
              </button> */}
            </div>
          </div>
        </header>

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
