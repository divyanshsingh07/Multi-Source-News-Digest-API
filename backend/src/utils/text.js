import natural from "natural";

const tokenizer = new natural.WordTokenizer();

export function tokenizeAndStem(text) {
  if (!text || typeof text !== "string") return [];
  const raw = tokenizer.tokenize(text.toLowerCase()) || [];
  return raw
    .map((t) => natural.PorterStemmer.stem(t))
    .filter((t) => t.length > 2);
}

export function slugifyId(text, maxLen = 48) {
  const s = (text || "cluster")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, maxLen);
  return s || "cluster";
}

export function firstTwoSentences(text) {
  if (!text) return "";
  const parts = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const two = parts.slice(0, 2).join(" ");
  return two.trim() || text.slice(0, 280).trim();
}
