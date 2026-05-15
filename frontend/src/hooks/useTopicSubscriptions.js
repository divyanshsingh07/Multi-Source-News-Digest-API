import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "newsDigestTopicSubscriptions";

function readStored() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((t) => typeof t === "string" && t.trim()) : [];
  } catch {
    return [];
  }
}

function writeStored(list) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...new Set(list.map((t) => t.trim()).filter(Boolean))]));
}

export function useTopicSubscriptions() {
  const [subscribed, setSubscribed] = useState(readStored);

  useEffect(() => {
    writeStored(subscribed);
  }, [subscribed]);

  const isSubscribed = useCallback(
    (topic) => subscribed.some((t) => t.toLowerCase() === String(topic || "").toLowerCase()),
    [subscribed]
  );

  const toggle = useCallback((topic) => {
    const name = String(topic || "").trim();
    if (!name) return;
    setSubscribed((prev) => {
      const lower = name.toLowerCase();
      if (prev.some((t) => t.toLowerCase() === lower)) {
        return prev.filter((t) => t.toLowerCase() !== lower);
      }
      return [...prev, name];
    });
  }, []);

  const clearAll = useCallback(() => setSubscribed([]), []);

  return { subscribed, isSubscribed, toggle, clearAll };
}
