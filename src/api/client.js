import axios from "axios";
<<<<<<< HEAD
import { tokenStorage } from "../utils/storage";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
=======
import { session } from "../utils/storage";
import { toList, toObject } from "../utils/profile";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
export const UNAUTHORIZED_EVENT = "peach:unauthorized";

// One axios instance for every call.
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
>>>>>>> 8a08bf3 (updated ui)
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
<<<<<<< HEAD
    if (status === 401) {
      tokenStorage.remove();
      window.dispatchEvent(new Event("peach:unauthorized"));
=======
    const url = error?.config?.url || "";
    // 401/403 = JWT missing or expired (backend tokens live 1 hour). Login/register errors are just form errors.
    if ((status === 401 || status === 403) && !url.startsWith("/users")) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
>>>>>>> 8a08bf3 (updated ui)
    }
    return Promise.reject(error);
  }
);

<<<<<<< HEAD
const unwrap = (response) => response?.data;

export const authApi = {
  login: (email, password) =>
    api.post("/users/login", { email, password }).then(unwrap),
  register: (email, password) =>
    api.post("/users", { email, password }).then(unwrap),
};

export const profileApi = {
  me: () => api.get("/profile/me").then(unwrap),
  saveMe: (payload) => api.put("/profile/me", payload).then(unwrap),
  feed: (payload) => api.put("/profile/feed").then(unwrap),
  byId: (userId) => api.get(`/profile/${userId}`).then(unwrap),
};

export const swipesApi = {
  send: ({ targetUserId, action }) =>
    api.post("/swipes", { targetUserId, action }).then(unwrap),
};

export const matchesApi = {
  list: () => api.get("/matches").then(unwrap),
};

export const messagesApi = {
  list: (matchId) => api.get(`/messages/${matchId}?markRead=true`).then(unwrap),
  send: ({ matchId, content }) =>
    api.post("/messages", { matchId, content }).then(unwrap),
=======
const body = (res) => res?.data;

export function getErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  if (err?.code === "ECONNABORTED") return "The server took too long to respond.";
  if (err?.message === "Network Error") return "Can't reach the server. Check that the backend is running.";
  const serverMsg = err?.response?.data?.message;
  // GlobalExceptionHandler hides real errors behind "Something went wrong" – the page's own text is clearer
  if (serverMsg && serverMsg !== "Something went wrong") return serverMsg;
  if (err?.response) return fallback;
  return err?.message || fallback;
}

export const authApi = {
  login: (email, password) => api.post("/users/login", { email, password }).then(body),
  // UserController answers 404 when the email is already registered
  register: (email, password) =>
    api
      .post("/users", { email, password })
      .then(body)
      .catch((err) => {
        if (err?.response?.status === 404) throw new Error("An account with this email already exists. Try signing in.");
        throw err;
      }),
};

export const profileApi = {
  async exists() {
    const data = await api.get("/profile/me/exists").then(body);
    return typeof data === "boolean" ? data : Boolean(data?.exists);
  },
  // 404 just means "no profile yet"
  async me() {
    try {
      return toObject(await api.get("/profile/me").then(body));
    } catch (err) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },
  saveMe: (payload) => api.put("/profile/me", payload).then(body),
  byId: (profileId) => api.get(`/profile/${encodeURIComponent(profileId)}`).then(body).then(toObject),

  // ProfileService.calculateDistance is a Haversine that reads xCoordinate as LATITUDE
  // and yCoordinate as LONGITUDE, so send them in that order.
  feed: ({ latitude, longitude, range }) =>
    api
      .post("/profile/feed", { xCoordinate: latitude, yCoordinate: longitude, range })
      .then(body)
      .then((data) => toList(data, "profiles")),

  async profileIdForUser(userId) {
    const data = await api.get(`/profile/getId/${encodeURIComponent(userId)}`).then(body);
    return data?.profileId || "";
  },
};

export const swipeApi = {
  // → { liked, matchCreated, matchId }
  send: ({ targetUserId, action }) => api.post("/swipes", { targetUserId, action }).then(body).then((d) => d || {}),
};

export const matchApi = {
  // → [{ matchId, matchedAt, otherUser (full public profile), lastMessageAt, lastMessagePreview, unreadCount }]
  list: () => api.get("/matches").then(body).then((d) => toList(d, "matches")),
};

export const messageApi = {
  list: (matchId) =>
    api
      .get(`/messages/${encodeURIComponent(matchId)}`, { params: { markRead: true } })
      .then(body)
      .then((d) => toList(d, "messages")),
  send: ({ matchId, content }) => api.post("/messages", { matchId, content }).then(body),
>>>>>>> 8a08bf3 (updated ui)
};

export default api;
