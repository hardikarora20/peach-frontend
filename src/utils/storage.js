// All localStorage keys live here so we never typo a key in a page again.
const KEYS = {
  token: "peach_token",
  userId: "peach_user_id",
  theme: "peach_theme",
  radius: "peach_saved_radius",
  location: "peach_last_location",
};

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    if (value === null || value === undefined || value === "") {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(value));
    }
  } catch {
    // storage can be blocked (private mode) – the app still works for this session
  }
}

export const session = {
  getToken: () => read(KEYS.token) || "",
  getUserId: () => read(KEYS.userId) || "",
  save(token, userId) {
    write(KEYS.token, token);
    if (userId) write(KEYS.userId, userId);
  },
  // Only clear auth keys – the old code used localStorage.clear() which also wiped theme/radius.
  clear() {
    write(KEYS.token, null);
    write(KEYS.userId, null);
  },
};

export const prefs = {
  getTheme: () => read(KEYS.theme) || "system",
  setTheme: (mode) => write(KEYS.theme, mode),

  getRadius(fallback = 50) {
    const n = Number(read(KEYS.radius));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  },
  setRadius: (km) => write(KEYS.radius, km),

  getLocation() {
    try {
      return JSON.parse(read(KEYS.location) || "null");
    } catch {
      return null;
    }
  },
  setLocation: (loc) => write(KEYS.location, JSON.stringify(loc)),
};
