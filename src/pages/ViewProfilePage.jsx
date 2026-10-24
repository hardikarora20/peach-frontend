import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MessageCircle, RefreshCcw } from "lucide-react";
import { getErrorMessage, profileApi } from "../api/client";
import { useInbox } from "../context/InboxContext";
import { Button, EmptyState, IconButton, Loader } from "../components/ui";
import ProfileView from "../components/profile/ProfileView";
import "../styles/profile.css";

export default function ViewProfilePage() {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const inbox = useInbox();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setProfile(await profileApi.byId(profileId));
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load this profile."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const goBack = () => (window.history.length > 1 ? navigate(-1) : navigate("/app/feed"));
  // If you've matched, offer a direct way into the chat
  const match = inbox.rows.find((r) => String(r.other?.profileId) === String(profileId));

  if (loading) {
    return (
      <div className="page-center page-center--inset">
        <Loader label="Loading profile" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="page-center page-center--inset">
        <EmptyState
          title="Couldn't load this profile"
          description={error || "This profile is no longer available."}
          action={
            <div className="row-gap">
              <Button variant="ghost" onClick={goBack}>
                Go back
              </Button>
              <Button icon={<RefreshCcw size={18} />} onClick={load}>
                Try again
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="page page--full">
      <ProfileView
        profile={profile}
        topBar={
          <div className="pv-topbar">
            <IconButton label="Back" variant="soft" onClick={goBack}>
              <ArrowLeft size={20} />
            </IconButton>
          </div>
        }
        actions={
          match ? (
            <Button icon={<MessageCircle size={18} />} onClick={() => navigate(`/app/chat/${match.matchId}`)}>
              Message
            </Button>
          ) : null
        }
      />
    </div>
  );
}
