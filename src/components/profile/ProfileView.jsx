import React from "react";
import {
  Cake, CigaretteOff, Globe, Heart, MapPin, Martini, MessageCircle, Moon, Navigation, Quote, Sparkles, User, Utensils, Users, Zap,
} from "lucide-react";
import PhotoGallery from "../PhotoGallery";
import { Chip } from "../ui";
import { formatDistance, hasText, humanize, toArray } from "../../utils/format";
import { getImages } from "../../utils/profile";

// One profile layout everywhere:
//  variant="page"  → two columns (sticky photos | story) for profile pages
//  variant="panel" → single column for the chat side panel and the phone sheet

function Tiles({ rows }) {
  const visible = rows.filter((r) => hasText(r.value));
  if (!visible.length) return null;
  return (
    <div className="tiles">
      {visible.map((r) => (
        <div key={r.label} className="tile">
          <span className="tile__icon">{r.icon}</span>
          <span className="tile__label">{r.label}</span>
          <strong className="tile__value">{r.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ChipBlock({ title, items, tone }) {
  const list = toArray(items).map(humanize).filter(Boolean);
  if (!list.length) return null;
  return (
    <section className="pv-block">
      <h3 className="pv-block__title">{title}</h3>
      <div className="chip-row">
        {list.map((item) => (
          <Chip key={item} className={tone ? `chip--${tone}` : ""}>
            {item}
          </Chip>
        ))}
      </div>
    </section>
  );
}

export default function ProfileView({ profile, variant = "page", actions, topBar, children }) {
  const images = getImages(profile);
  const prompts = Array.isArray(profile?.profilePrompts) ? profile.profilePrompts.filter((p) => hasText(p?.answer)).slice(0, 3) : [];

  const looking = [
    { label: "Looking for", value: humanize(profile?.datingIntent), icon: <Heart size={16} /> },
    { label: "Connection", value: humanize(profile?.connectionPreference), icon: <Sparkles size={16} /> },
    { label: "Long distance", value: humanize(profile?.openToLongDistance), icon: <Globe size={16} /> },
    { label: "Texting", value: humanize(profile?.communicationStyle), icon: <MessageCircle size={16} /> },
    { label: "Love language", value: humanize(profile?.loveLanguage), icon: <Zap size={16} /> },
    { label: "In a disagreement", value: humanize(profile?.conflictStyle), icon: <Users size={16} /> },
  ];
  const lifestyle = [
    { label: "Drinks", value: humanize(profile?.drinkHabit), icon: <Martini size={16} /> },
    { label: "Smokes", value: humanize(profile?.smokeHabit), icon: <CigaretteOff size={16} /> },
    { label: "Diet", value: humanize(profile?.foodPreference), icon: <Utensils size={16} /> },
    { label: "Sleep", value: humanize(profile?.sleepStyle), icon: <Moon size={16} /> },
  ];
  const basics = [
    { label: "Age", value: profile?.age ? String(profile.age) : "", icon: <Cake size={16} /> },
    { label: "Gender", value: humanize(profile?.gender), icon: <User size={16} /> },
    { label: "City", value: profile?.location, icon: <MapPin size={16} /> },
  ];

  // Spread prompts between other sections so the profile reads like a story, not a form
  const [p1, p2, p3] = prompts;
  const promptCard = (p) =>
    p ? (
      <section key={p.id || p.question} className="pv-prompt">
        <span className="pv-prompt__q">{p.question}</span>
        <p className="pv-prompt__a">{p.answer}</p>
      </section>
    ) : null;

  const story = (
    <div className="pv-story">
      {hasText(profile?.bio) ? (
        <section className="pv-block">
          <h3 className="pv-block__title">About</h3>
          <p className="pv-bio">{profile.bio}</p>
        </section>
      ) : null}

      {hasText(profile?.openingLine) ? (
        <section className="pv-opener">
          <Quote size={22} />
          <p>{profile.openingLine}</p>
          <span className="pv-opener__tag">Opening line</span>
        </section>
      ) : null}

      {promptCard(p1)}

      {looking.some((r) => hasText(r.value)) ? (
        <section className="pv-block">
          <h3 className="pv-block__title">What they're after</h3>
          <Tiles rows={looking} />
        </section>
      ) : null}

      {promptCard(p2)}
      <ChipBlock title="Interests" items={profile?.interests} />
      <ChipBlock title="Personality" items={profile?.personalityTraits} tone="accent" />

      {lifestyle.some((r) => hasText(r.value)) ? (
        <section className="pv-block">
          <h3 className="pv-block__title">Lifestyle</h3>
          <Tiles rows={lifestyle} />
        </section>
      ) : null}

      {promptCard(p3)}
      <ChipBlock title="Values" items={profile?.coreValues} tone="soft" />
      <ChipBlock title="Dealbreakers" items={profile?.dealbreakers} tone="danger" />

      <section className="pv-block">
        <h3 className="pv-block__title">Basics</h3>
        <Tiles rows={basics} />
      </section>
      {children}
    </div>
  );

  const header = (
    <header className="pv-head">
      <h1 className="pv-name display">
        {profile?.name || "Unnamed"}
        {profile?.age ? <span className="pv-age">{profile.age}</span> : null}
      </h1>
      <p className="pv-meta">
        <MapPin size={15} />
        {profile?.location || "City not added"}
        {profile?.distance !== undefined && profile?.distance !== null ? (
          <>
            <span className="pv-meta__sep" />
            <Navigation size={14} />
            {formatDistance(profile.distance)}
          </>
        ) : null}
      </p>
      {hasText(profile?.datingIntent) ? (
        <div className="chip-row">
          <Chip className="chip--accent" icon={<Heart size={13} />}>
            {humanize(profile.datingIntent)}
          </Chip>
        </div>
      ) : null}
      {actions ? <div className="pv-actions">{actions}</div> : null}
    </header>
  );

  if (variant === "panel") {
    return (
      <div className="pv pv--panel">
        <PhotoGallery images={images} name={profile?.name} variant="panel" />
        <div className="pv-panel-body">
          {header}
          {story}
        </div>
      </div>
    );
  }

  return (
    <div className="pv pv--page">
      {topBar}
      <div className="pv-grid">
        <div className="pv-media">
          <PhotoGallery images={images} name={profile?.name} variant="hero" />
        </div>
        <div className="pv-content">
          {header}
          {story}
        </div>
      </div>
    </div>
  );
}
