import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, PencilLine, RefreshCcw } from "lucide-react";
import { getErrorMessage, profileApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Button, EmptyState, Loader } from "../components/ui";
import { ThemePicker } from "../components/ThemeToggle";
import ProfileView from "../components/profile/ProfileView";
import { calculateCompletion, profileToForm, promptsFromProfile } from "../utils/profile";
import "../styles/profile.css";

function Ring({ percent }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  return (
    <span className="ring" aria-label={`${percent}% complete`}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} className="ring__track" />
        <circle cx="28" cy="28" r={r} className="ring__fill" strokeDasharray={c} strokeDashoffset={c - (c * percent) / 100} />
      </svg>
      <strong>{percent}%</strong>
    </span>
  );
}

export default function MyProfilePage() {
  const navigate = useNavigate();
  const { logout, setMe } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const p = await profileApi.me();
      setProfile(p);
      setMe(p);
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load your profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="page-center page-center--inset">
        <Loader label="Loading your profile" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-center page-center--inset">
        <EmptyState
          title="Couldn't load your profile"
          description={error || "Your profile wasn't found."}
          action={
            <Button icon={<RefreshCcw size={18} />} onClick={load}>
              Try again
            </Button>
          }
        />
      </div>
    );
  }

  const completion = calculateCompletion(profileToForm(profile), profile.openingLine, promptsFromProfile(profile));

  return (
    <div className="page page--full">
      <ProfileView
        profile={profile}
        topBar={
          <div className="pv-topbar">
            <span className="eyebrow">This is how others see you</span>
            <div className="pv-topbar__actions">
              <ThemePicker />
              <Button
                variant="ghost"
                icon={<LogOut size={18} />}
                onClick={() => {
                  logout();
                  navigate("/auth", { replace: true });
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        }
        actions={
          <>
            <Button icon={<PencilLine size={18} />} onClick={() => navigate("/app/editprofile")}>
              Edit profile
            </Button>
            {completion.percent < 100 ? (
              <button type="button" className="strength" onClick={() => navigate("/app/editprofile")}>
                <Ring percent={completion.percent} />
                <span>
                  <strong>Profile strength</strong>
                  <small>Photos, prompts and an opening line help people say hi.</small>
                </span>
              </button>
            ) : null}
          </>
        }
      />
    </div>
  );
}
