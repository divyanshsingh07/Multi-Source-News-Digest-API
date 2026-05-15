import axios from "axios";

const raw = (import.meta.env.VITE_API_URL || "http://localhost:8000").trim();
// Relative "/api" → same-origin proxy on Vercel (avoids HTTPS → HTTP mixed content)
const baseURL = raw.startsWith("/") ? raw.replace(/\/$/, "") : raw.replace(/\/$/, "");

export const api = axios.create({
  baseURL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const key = import.meta.env.VITE_API_KEY;
  if (key) {
    config.headers["X-API-Key"] = key;
  }
  return config;
});

export async function fetchDigest() {
  const { data } = await api.get("/digest");
  return data;
}

export async function fetchTopics() {
  const { data } = await api.get("/topics");
  return data;
}

export async function fetchTopicArticles(name) {
  const { data } = await api.get(`/topic/${encodeURIComponent(name)}`);
  return data;
}

export async function fetchArticle(id) {
  const { data } = await api.get(`/article/${encodeURIComponent(id)}`);
  return data;
}
