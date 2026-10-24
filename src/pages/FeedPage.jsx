import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Heart, Info, MapPin, MapPinOff, MessageCircle, Quote, RefreshCcw, SlidersHorizontal, UserRound, X } from "lucide-react";
import { getErrorMessage, profileApi, swipeApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useInbox } from "../context/InboxContext";
import { Avatar, Banner, Button, Chip, EmptyState, IconButton, Skeleton } from "../components/ui";
import Sheet from "../components/Sheet";
import ProfileView from "../components/profile/ProfileView";
import { formatDistance, hasText, humanize, initials } from "../utils/format";
import { getImages, getPrimaryImage, getProfileId, getTargetUserId } from "../utils/profile";
import { getCurrentLocation } from "../utils/location";
import { prefs } from "../utils/storage";
import "../styles/feed.css";

const FLY_MS = 360;
const SWIPE_THRESHOLD = 110;
const MIN_RADIUS = 5;
const MAX_RADIUS = 200;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function DistancePopover({ value, onChange, onApply, onClose }) {
  return (
    <div className="popover distance" role="dialog" aria-label="Distance">
      <div className="distance__head">
        <span className="eyebrow">Show people within</span>
        <strong key={value} className="distance__value display">
          {value}
          <small>km</small>
        </strong>
      </div>
      <input
        type="range"
        className="slider"
        min={MIN_RADIUS}
        max={MAX_RADIUS}
        step="5"
        value={value}
        style={{ "--fill": `${((value - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS)) * 100}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label="Maximum distance in kilometres"
      />
      <div className="distance__actions">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onApply}>Apply</Button>
      </div>
    </div>
  );
}

const BURST = Array.from({ length: 16 }, (_, i) => ({ a: (360 / 16) * i, d: 90 + (i % 3) * 30, delay: (i % 4) * 35, s: 12 + (i % 3) * 5 }));

function MatchMoment({ me, them, matchId, onClose, onMessage }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portal to <body> so it always covers the whole screen, sidebar included
  return createPortal(
    <div className="match-moment" role="dialog" aria-modal="true" aria-labelledby="match-title" onClick={onClose}>
      <div className="match-moment__inner" onClick={(e) => e.stopPropagation()}>
        <div className="match-moment__pair">
          <div className="match-moment__burst" aria-hidden="true">
            {BURST.map((b, i) => (
              <Heart key={i} size={b.s} fill="currentColor" style={{ "--a": `${b.a}deg`, "--d": `${b.d}px`, animationDelay: `${b.delay}ms` }} />
            ))}
          </div>
          <span className="match-moment__photo match-moment__photo--me">
            <Avatar name={me?.name} src={getImages(me)[0]} size={128} />
          </span>
          <span className="match-moment__photo match-moment__photo--them">
            <Avatar name={them?.name} src={getPrimaryImage(them)} size={128} />
          </span>
          <span className="match-moment__heart">
            <Heart size={22} fill="currentColor" />
          </span>
        </div>
        <h2 id="match-title" className="display">
          It's a <em>match</em>
        </h2>
        <p>You and {them?.name || "this person"} liked each other.</p>
        <div className="match-moment__actions">
          <Button size="lg" icon={<MessageCircle size={18} />} onClick={onMessage}>
            {matchId ? `Message ${them?.name || ""}`.trim() : "See your matches"}
          </Button>
          <Button size="lg" variant="ghost" onClick={onClose}>
            Keep browsing
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// The top card. Drag it, or tap the photo sides to flip through photos.
function Card({ profile, leaving, disabled, onSwipe, onDetails }) {
  const images = getImages(profile);
  const [photo, setPhoto] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const start = useRef(null);
  const moved = useRef(false);

  useEffect(() => {
    if (!leaving) setDrag((d) => (d.active ? { x: 0, y: 0, active: false } : d));
  }, [leaving]);

  const onPointerDown = (e) => {
    if (disabled || leaving || e.button !== 0 || e.target.closest("button")) return;
    start.current = { x: e.clientX, y: e.clientY, w: e.currentTarget.getBoundingClientRect() };
    moved.current = false;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDrag({ x: 0, y: 0, active: true });
  };
  const onPointerMove = (e) => {
    if (!start.current) return;
    const x = e.clientX - start.current.x;
    const y = e.clientY - start.current.y;
    if (Math.abs(x) > 6 || Math.abs(y) > 6) moved.current = true;
    setDrag({ x, y, active: true });
  };
  const onPointerUp = (e) => {
    if (!start.current) return;
    const rect = start.current.w;
    start.current = null;
    if (!moved.current) {
      setDrag({ x: 0, y: 0, active: false });
      const rel = (e.clientX - rect.left) / rect.width;
      if (images.length > 1 && rel < 0.33) setPhoto((p) => Math.max(0, p - 1));
      else if (images.length > 1 && rel > 0.67) setPhoto((p) => Math.min(images.length - 1, p + 1));
      else onDetails();
      return;
    }
    if (Math.abs(drag.x) > SWIPE_THRESHOLD) onSwipe(drag.x > 0 ? "LIKE" : "DISLIKE", drag);
    else setDrag({ x: 0, y: 0, active: false });
  };

  let style;
  if (leaving) {
    const dir = leaving.action === "LIKE" ? 1 : -1;
    style = {
      transform: `translate(${dir * 120}vw, ${(leaving.from?.y || 0) * 1.4 - 40}px) rotate(${dir * 24}deg)`,
      transition: `transform ${FLY_MS}ms cubic-bezier(.5,0,.75,0), opacity ${FLY_MS}ms ease`,
      opacity: 0,
    };
  } else if (drag.active) {
    style = { transform: `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${drag.x / 20}deg)`, transition: "none" };
  }
  const like = leaving ? +(leaving.action === "LIKE") : Math.max(0, Math.min(drag.x / SWIPE_THRESHOLD, 1));
  const nope = leaving ? +(leaving.action === "DISLIKE") : Math.max(0, Math.min(-drag.x / SWIPE_THRESHOLD, 1));
  const looking = [profile?.datingIntent, profile?.connectionPreference].filter(hasText).map(humanize);
  const prompt = (profile?.profilePrompts || []).find((p) => hasText(p?.answer));

  return (
    <article className={`fcard ${drag.active ? "is-dragging" : ""}`} style={style}>
      <div
        className="fcard__media"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="group"
        aria-label={`${profile?.name || "Profile"}. Drag right to like, left to pass.`}
      >
        {images.length ? (
          images.map((src, i) => <img key={src + i} src={src} alt="" draggable="false" className={i === photo ? "is-current" : ""} />)
        ) : (
          <span className="fcard__fallback">{initials(profile?.name)}</span>
        )}

        {images.length > 1 ? (
          <div className="gallery__bars" aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={i < photo ? "is-seen" : i === photo ? "is-current" : ""} />
            ))}
          </div>
        ) : null}

        <span className="fcard__stamp fcard__stamp--like" style={{ opacity: like, "--s": 0.6 + like * 0.4 }}>
          Like
        </span>
        <span className="fcard__stamp fcard__stamp--nope" style={{ opacity: nope, "--s": 0.6 + nope * 0.4 }}>
          Pass
        </span>
        <span className="fcard__tint fcard__tint--like" style={{ opacity: like * 0.5 }} />
        <span className="fcard__tint fcard__tint--nope" style={{ opacity: nope * 0.5 }} />

        <div className="fcard__overlay">
          <div className="fcard__name">
            <h2 className="display">
              {profile?.name || "Unnamed"} <span>{profile?.age || ""}</span>
            </h2>
            <p>
              <MapPin size={14} />
              {profile?.location || "Nearby"}
              {profile?.distance != null ? ` · ${formatDistance(profile.distance)}` : ""}
            </p>
            {looking.length ? (
              <div className="chip-row fcard__chips">
                {looking.map((l) => (
                  <Chip key={l} className="chip--glass">
                    {l}
                  </Chip>
                ))}
              </div>
            ) : null}
          </div>
          <IconButton label="More about them" variant="glass" className="fcard__info" onClick={onDetails}>
            <Info size={20} />
          </IconButton>
        </div>
      </div>

      {/* Desktop-only side: enough to decide without opening the full profile */}
      <div className="fcard__body">
        {hasText(profile?.bio) ? (
          <section>
            <span className="eyebrow">About</span>
            <p className="fcard__bio">{profile.bio}</p>
          </section>
        ) : null}
        {hasText(profile?.openingLine) ? (
          <blockquote className="fcard__opener">
            <Quote size={18} />
            <span>{profile.openingLine}</span>
          </blockquote>
        ) : null}
        {prompt ? (
          <section className="fcard__prompt">
            <span className="eyebrow">{prompt.question}</span>
            <p className="display">{prompt.answer}</p>
          </section>
        ) : null}
        {profile?.interests?.length ? (
          <section>
            <span className="eyebrow">Into</span>
            <div className="chip-row">
              {[...profile.interests].slice(0, 8).map((i) => (
                <Chip key={i}>{humanize(i)}</Chip>
              ))}
            </div>
          </section>
        ) : null}
        <button type="button" className="fcard__more" onClick={onDetails}>
          See full profile <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}

function FeedSkeleton() {
  return (
    <div className="deck">
      <div className="fcard fcard--skeleton" aria-busy="true">
        <div className="fcard__media">
          <Skeleton height="100%" radius={0} />
        </div>
        <div className="fcard__body">
          <Skeleton width="30%" height={12} />
          <Skeleton height={16} />
          <Skeleton width="80%" height={16} />
          <Skeleton height={80} radius={18} style={{ marginTop: 12 }} />
          <div className="chip-row">
            <Skeleton width={80} height={32} radius={99} />
            <Skeleton width={64} height={32} radius={99} />
            <Skeleton width={96} height={32} radius={99} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const navigate = useNavigate();
  const { me } = useAuth();
  const inbox = useInbox();
  const [profiles, setProfiles] = useState([]);
  const [status, setStatus] = useState("locating");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [leaving, setLeaving] = useState(null);
  const [match, setMatch] = useState(null);
  const [details, setDetails] = useState(null);
  const [radius, setRadius] = useState(prefs.getRadius());
  const [draft, setDraft] = useState(radius);
  const [showFilter, setShowFilter] = useState(false);
  const busy = useRef(false);

  const current = profiles[0] || null;
  const behind = useMemo(() => profiles.slice(1, 3), [profiles]);

  const load = useCallback(async (km, { fresh = false } = {}) => {
    setError("");
    setStatus("locating");
    try {
      const coords = await getCurrentLocation({ useCache: !fresh });
      setStatus("loading");
      setProfiles(shuffle(await profileApi.feed({ ...coords, range: km })));
      setStatus("ready");
    } catch (err) {
      setError(getErrorMessage(err, "Couldn't load people near you."));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    load(radius);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeRadius = (km) => {
    setShowFilter(false);
    setRadius(km);
    setDraft(km);
    prefs.setRadius(km);
    load(km);
  };

  const swipe = useCallback(
    async (action, from) => {
      if (!current || busy.current) return;
      busy.current = true;
      setActionError("");
      setLeaving({ action, from });
      try {
        const [result] = await Promise.all([swipeApi.send({ targetUserId: getTargetUserId(current), action }), wait(FLY_MS)]);
        if (result?.matchCreated) {
          setMatch({ profile: current, matchId: result.matchId || "" });
          inbox.refresh();
        }
        setProfiles((list) => list.slice(1));
      } catch (err) {
        setActionError(getErrorMessage(err, "That didn't go through. Try again."));
      } finally {
        setLeaving(null);
        busy.current = false;
      }
    },
    [current, inbox]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (match || details || showFilter || ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.key === "ArrowLeft") swipe("DISLIKE");
      if (e.key === "ArrowRight") swipe("LIKE");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe, match, details, showFilter]);

  // Desktop goes to the full page; phones get a sheet so you don't lose your place in the deck
  const openDetails = () => {
    if (!current) return;
    if (window.matchMedia("(min-width: 900px)").matches) navigate(`/app/profile/${getProfileId(current)}`);
    else setDetails(current);
  };

  return (
    <div className="feed">
      <header className="feed__bar">
        <div>
          <span className="eyebrow">{status === "ready" && profiles.length ? `${profiles.length} nearby` : "Nearby"}</span>
          <h1 className="display">Discover</h1>
        </div>
        <div className="popover-anchor">
          <Button
            variant="soft"
            icon={<SlidersHorizontal size={17} />}
            onClick={() => {
              setDraft(radius);
              setShowFilter((v) => !v);
            }}
            aria-expanded={showFilter}
          >
            {radius} km
          </Button>
          {showFilter ? <DistancePopover value={draft} onChange={setDraft} onApply={() => changeRadius(draft)} onClose={() => setShowFilter(false)} /> : null}
        </div>
      </header>

      <div className="feed__stage">
        {status === "locating" || status === "loading" ? (
          <FeedSkeleton />
        ) : status === "error" ? (
          <EmptyState
            icon={<MapPinOff size={26} />}
            title="Couldn't load your feed"
            description={error}
            action={
              <Button icon={<RefreshCcw size={18} />} onClick={() => load(radius, { fresh: true })}>
                Try again
              </Button>
            }
          />
        ) : !current ? (
          <EmptyState
            icon={<UserRound size={26} />}
            title="That's everyone nearby"
            description={radius < MAX_RADIUS ? "Widen the distance to see more people, or come back later." : "New people join all the time – check back later."}
            action={
              radius < MAX_RADIUS ? (
                <Button icon={<ArrowRight size={18} />} onClick={() => changeRadius(Math.min(radius + 50, MAX_RADIUS))}>
                  Search up to {Math.min(radius + 50, MAX_RADIUS)} km
                </Button>
              ) : (
                <Button variant="soft" icon={<RefreshCcw size={18} />} onClick={() => load(radius)}>
                  Refresh
                </Button>
              )
            }
          />
        ) : (
          <div className="deck">
            {behind
              .map((p, i) => (
                <div
                  key={getProfileId(p)}
                  className={`deck__ghost deck__ghost--${i + 1} ${leaving ? "is-advancing" : ""}`}
                  style={{ backgroundImage: getPrimaryImage(p) ? `url("${getPrimaryImage(p)}")` : undefined }}
                  aria-hidden="true"
                />
              ))
              .reverse()}
            <Card key={getProfileId(current)} profile={current} leaving={leaving} disabled={Boolean(match)} onSwipe={swipe} onDetails={openDetails} />

            <div className="dock">
              <IconButton label="Pass (←)" className="dock__btn dock__btn--nope" disabled={Boolean(leaving)} onClick={() => swipe("DISLIKE")}>
                <X size={26} strokeWidth={2.5} />
              </IconButton>
              <IconButton label="Like (→)" className="dock__btn dock__btn--like" disabled={Boolean(leaving)} onClick={() => swipe("LIKE")}>
                <Heart size={28} fill="currentColor" />
              </IconButton>
            </div>
          </div>
        )}
        <Banner tone="error">{actionError}</Banner>
      </div>

      <Sheet open={Boolean(details)} onClose={() => setDetails(null)} title={details?.name || "Profile"}>
        {details ? <ProfileView profile={details} variant="panel" /> : null}
      </Sheet>

      {match ? (
        <MatchMoment
          me={me}
          them={match.profile}
          matchId={match.matchId}
          onClose={() => setMatch(null)}
          onMessage={() => {
            const id = match.matchId;
            setMatch(null);
            navigate(id ? `/app/chat/${id}` : "/app/matches");
          }}
        />
      ) : null}
    </div>
  );
}
