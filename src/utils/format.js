export function hasText(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value)) return value.length > 0;
  return String(value).trim().length > 0;
}

export function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// "SERIOUS_RELATIONSHIP" -> "Serious relationship" (sentence case reads more naturally than Title Case)
export function humanize(value) {
  if (!hasText(value)) return "";
  const text = String(value).replace(/_/g, " ").toLowerCase().trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function joinHuman(values, separator = ", ") {
  return toArray(values).map(humanize).filter(Boolean).join(separator);
}

export function initials(name = "") {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

export function displayName(user = {}) {
  return user?.name || user?.fullName || user?.username || "Unknown";
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function formatTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat(undefined, { timeStyle: "short" }).format(d);
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d) return "";
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(d);
}

export function isSameDay(a, b) {
  const da = toDate(a);
  const db = toDate(b);
  return Boolean(da && db && da.toDateString() === db.toDateString());
}

// Chat day divider: "Today", "Yesterday" or a short date
export function formatDay(value) {
  const d = toDate(value);
  if (!d) return "";
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(d);
}

// Chat list timestamp: time for today, weekday for this week, date otherwise
export function formatShortStamp(value) {
  const d = toDate(value);
  if (!d) return "";
  const now = new Date();
  const diffDays = (now - d) / 86400000;
  if (d.toDateString() === now.toDateString()) return formatTime(d);
  if (diffDays < 7) return new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(d);
  return new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" }).format(d);
}

export function formatDistance(distance) {
  if (distance === null || distance === undefined || distance === "") return "";
  const n = Number(distance);
  if (Number.isNaN(n)) return String(distance);
  if (n < 1) return "Less than 1 km away";
  return `${Math.round(n)} km away`;
}
