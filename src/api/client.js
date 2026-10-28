import axios from "axios";
import { session } from "../utils/storage";
import { toList, toObject } from "../utils/profile";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
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
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    // 401/403 = JWT missing or expired (backend tokens live 1 hour). Login/register errors are just form errors.
    if ((status === 401 || status === 403) && !url.startsWith("/users")) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);

const body = (res) => res?.data;

export function getErrorMessage(
  err,
  fallback = "Something went wrong. Please try again."
) {
  if (err?.code === "ECONNABORTED")
    return "The server took too long to respond.";
  if (err?.message === "Network Error")
    return "Can't reach the server. Check that the backend is running.";
  const serverMsg = err?.response?.data?.message;
  // GlobalExceptionHandler hides real errors behind "Something went wrong" – the page's own text is clearer
  if (serverMsg && serverMsg !== "Something went wrong") return serverMsg;
  if (err?.response) return fallback;
  return err?.message || fallback;
}

export const authApi = {
  login: (email, password) =>
    api.post("/users/login", { email, password }).then(body),

  // Step 1: save the pending sign-up and email a 6-digit code
  requestOtp: (email, password) =>
    api.post("/users/register/request-otp", { email, password }).then(body),

  // Get a new code (the backend enforces a 60 s cooldown)
  resendOtp: (email) =>
    api.post("/users/register/resend", { email }).then(body),

  // Step 2: check the code → { token, userId }
  verifyOtp: (email, otp) =>
    api.post("/users/register/verify", { email, otp }).then(body),
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
  byId: (profileId) =>
    api
      .get(`/profile/${encodeURIComponent(profileId)}`)
      .then(body)
      .then(toObject),

  // ProfileService.calculateDistance is a Haversine that reads xCoordinate as LATITUDE
  // and yCoordinate as LONGITUDE, so send them in that order.
  feed: ({ latitude, longitude, range }) =>
    api
      .post("/profile/feed", {
        xCoordinate: latitude,
        yCoordinate: longitude,
        range,
      })
      .then(body)
      .then((data) => toList(data, "profiles")),

  async profileIdForUser(userId) {
    const data = await api
      .get(`/profile/getId/${encodeURIComponent(userId)}`)
      .then(body);
    return data?.profileId || "";
  },
};

export const swipeApi = {
  // → { liked, matchCreated, matchId }
  send: ({ targetUserId, action }) =>
    api
      .post("/swipes", { targetUserId, action })
      .then(body)
      .then((d) => d || {}),
};

export const matchApi = {
  // → [{ matchId, matchedAt, otherUser (full public profile), lastMessageAt, lastMessagePreview, unreadCount }]
  list: () =>
    api
      .get("/matches")
      .then(body)
      .then((d) => toList(d, "matches")),
};

export const messageApi = {
  list: (matchId) =>
    api
      .get(`/messages/${encodeURIComponent(matchId)}`, {
        params: { markRead: true },
      })
      .then(body)
      .then((d) => toList(d, "messages")),
  send: ({ matchId, content }) =>
    api.post("/messages", { matchId, content }).then(body),
};

export default api;
