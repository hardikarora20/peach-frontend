import { hasText } from "./format";
import { MAX_IMAGES, OPENING_LINE_OPTIONS, WRITE_MY_OWN } from "../data/profileOptions";

/* ---------- reading API objects ---------- */

// The backend isn't consistent about list envelopes, so accept [..], {matches:[..]}, {profiles:[..]} or {data:[..]}.
export function toList(data, ...keys) {
  if (Array.isArray(data)) return data;
  for (const key of [...keys, "data"]) {
    if (Array.isArray(data?.[key])) return data[key];
  }
  return [];
}

// Same idea for single objects: {data:{..}}, {profile:{..}} or the object itself.
export function toObject(data) {
  return data?.data ?? data?.profile ?? data ?? null;
}

export const getProfileId = (p) => String(p?.profileId || p?.id || p?._id || "");
export const getUserId = (p) => p?.userId || p?.id || p?._id || p?.targetUserId || "";
export const getTargetUserId = (p) => p?.userId || p?.id || p?.profileId || "";

export function getImages(p) {
  const list = Array.isArray(p?.images) ? p.images.filter(Boolean) : [];
  const legacy = [p?.profileImageUrl, p?.avatarUrl, p?.photoUrl, p?.imageUrl].filter(Boolean);
  return [...new Set([...list, ...legacy])].slice(0, MAX_IMAGES);
}

export const getPrimaryImage = (p) => getImages(p)[0] || "";

// A match payload can nest the other person under different keys
export function getOtherUser(match) {
  const outer = match?.otherUser || match?.matchedUser || match?.user || match?.profile || match;
  return outer?.user || outer?.matchedUser || outer?.profile || outer || {};
}

export const getMatchId = (m) => String(m?.matchId || m?.id || m?._id || "");
export const getMatchedAt = (m) => m?.matchedAt || m?.createdAt || m?.updatedAt || "";
export const getLastMessageAt = (m) => m?.lastMessageAt || m?.lastMessage?.sentAt || m?.lastMessage?.sendAt || "";

export function getLastMessagePreview(m) {
  return (
    m?.lastMessagePreview ||
    m?.lastMessage?.content ||
    m?.lastMessage?.text ||
    m?.latestMessage?.content ||
    m?.latestMessage?.text ||
    ""
  );
}

export function getUnreadCount(m) {
  const n = Number(m?.unreadCount || 0);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/* ---------- messages ---------- */

export const getMessageId = (msg) => msg?.messageId || msg?.id || msg?._id;
export const getMessageTime = (msg) => msg?.sendAt || msg?.sentAt || msg?.createdAt;
export const getMessageSender = (msg) => msg?.senderId || msg?.sender || msg?.fromUserId;

/* ---------- profile form helpers ---------- */

export function normalizeEnum(value) {
  if (!hasText(value)) return "";
  return String(value).trim().replace(/[\s-]+/g, "_").replace(/[^\w]/g, "").toUpperCase();
}

const normalizeArray = (v) => (Array.isArray(v) ? v.map(normalizeEnum).filter(Boolean) : []);

export function emptyForm() {
  return {
    name: "",
    age: "",
    gender: "",
    bio: "",
    location: "",
    datingIntent: "",
    connectionPreference: "",
    openToLongDistance: "",
    personalityTraits: [],
    communicationStyle: "",
    loveLanguage: "",
    conflictStyle: "",
    drinkHabit: "",
    smokeHabit: "",
    foodPreference: "",
    sleepStyle: "",
    coreValues: [],
    dealbreakers: [],
    interests: [],
    images: Array.from({ length: MAX_IMAGES }, () => ""),
  };
}

export function profileToForm(profile = {}) {
  const images = getImages(profile);
  return {
    name: profile?.name || "",
    age: profile?.age ?? "",
    gender: normalizeEnum(profile?.gender),
    bio: profile?.bio || "",
    location: profile?.location || "",
    datingIntent: normalizeEnum(profile?.datingIntent),
    connectionPreference: normalizeEnum(profile?.connectionPreference),
    openToLongDistance: normalizeEnum(profile?.openToLongDistance),
    personalityTraits: normalizeArray(profile?.personalityTraits),
    communicationStyle: normalizeEnum(profile?.communicationStyle),
    loveLanguage: normalizeEnum(profile?.loveLanguage),
    conflictStyle: normalizeEnum(profile?.conflictStyle),
    drinkHabit: normalizeEnum(profile?.drinkHabit),
    smokeHabit: normalizeEnum(profile?.smokeHabit),
    foodPreference: normalizeEnum(profile?.foodPreference),
    sleepStyle: normalizeEnum(profile?.sleepStyle),
    coreValues: normalizeArray(profile?.coreValues),
    dealbreakers: normalizeArray(profile?.dealbreakers),
    interests: normalizeArray(profile?.interests),
    images: Array.from({ length: MAX_IMAGES }, (_, i) => images[i] || ""),
  };
}

export function promptsFromProfile(profile) {
  const raw = Array.isArray(profile?.profilePrompts) ? profile.profilePrompts : [];
  return raw.slice(0, 3).map((p, i) => ({
    id: p?.id || `prompt_${i}`,
    question: p?.question || "",
    answer: p?.answer || "",
  }));
}

// Split a saved opening line back into "picked from list" vs "custom text"
export function resolveOpeningLine(line) {
  const value = String(line || "").trim();
  if (!value) return { choice: "", custom: "" };
  const known = OPENING_LINE_OPTIONS.some((o) => o.value === value);
  return known ? { choice: value, custom: "" } : { choice: WRITE_MY_OWN, custom: value };
}

export function buildPayload(form, openingLine, prompts) {
  return {
    name: form.name.trim(),
    age: form.age === "" ? null : Number(form.age),
    gender: form.gender,
    bio: form.bio.trim(),
    location: String(form.location || "").trim(),
    datingIntent: form.datingIntent,
    connectionPreference: form.connectionPreference,
    openToLongDistance: form.openToLongDistance,
    personalityTraits: form.personalityTraits,
    communicationStyle: form.communicationStyle,
    loveLanguage: form.loveLanguage,
    conflictStyle: form.conflictStyle,
    drinkHabit: form.drinkHabit,
    smokeHabit: form.smokeHabit,
    foodPreference: form.foodPreference,
    sleepStyle: form.sleepStyle,
    coreValues: form.coreValues,
    dealbreakers: form.dealbreakers,
    interests: form.interests,
    images: form.images.map((u) => u.trim()).filter(Boolean).slice(0, MAX_IMAGES),
    openingLine: String(openingLine || "").trim(),
    profilePrompts: prompts
      .map((p) => ({ id: p.id, question: p.question, answer: (p.answer || "").trim() }))
      .filter((p) => hasText(p.answer)),
  };
}

// The backend treats these five as required before the feed unlocks
export function getMissingBasics(form) {
  const missing = [];
  if (!hasText(form.name)) missing.push("name");
  const age = Number(form.age);
  if (!form.age || !Number.isFinite(age) || age < 18) missing.push("age (18+)");
  if (!hasText(form.gender)) missing.push("gender");
  if (!hasText(form.location)) missing.push("city");
  if (!hasText(form.bio)) missing.push("bio");
  return missing;
}

export function calculateCompletion(form, openingLine, prompts) {
  const basics = [
    form.name, form.age, form.gender, form.bio, form.location, form.datingIntent,
    form.connectionPreference, form.openToLongDistance, form.communicationStyle,
    form.loveLanguage, form.conflictStyle, form.drinkHabit, form.smokeHabit,
    form.foodPreference, form.sleepStyle,
  ];
  const filledBasic = basics.filter(hasText).length;
  const filledMulti = [form.personalityTraits, form.coreValues, form.dealbreakers, form.interests].filter(
    (v) => v.length > 0
  ).length;
  const filledImages = form.images.filter(hasText).length;
  const filledPrompts = prompts.filter((p) => hasText(p.answer)).length;
  const hasOpening = hasText(openingLine) ? 1 : 0;

  const total = basics.length + 4 + MAX_IMAGES + 3 + 1;
  const score = filledBasic + filledMulti + filledImages + filledPrompts + hasOpening;

  return {
    percent: Math.round((score / total) * 100),
    filledBasic,
    totalBasic: basics.length,
    filledImages,
    filledPrompts,
    hasOpening,
  };
}
