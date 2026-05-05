import axios from "axios";
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
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      tokenStorage.remove();
      window.dispatchEvent(new Event("peach:unauthorized"));
    }
    return Promise.reject(error);
  }
);

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
  feed: () => api.get("/profile/feed").then(unwrap),
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
  list: (matchId) => api.get(`/messages/${matchId}`).then(unwrap),
  send: ({ matchId, content }) =>
    api.post("/messages", { matchId, content }).then(unwrap),
};

export default api;
