import Parser from "rss-parser";
import axios from "axios";
import { RSS_FEEDS } from "../config/feeds.js";

const parser = new Parser({
  timeout: 20000,
  headers: {
    "User-Agent": "NewsDigestBot/1.0 (educational project)",
  },
});

function guessTopic(categories, title, content) {
  const cat = (categories && categories[0]) || "";
  if (cat && typeof cat === "string" && cat.length < 80) {
    return cat.replace(/^.*\//, "").trim() || "General";
  }
  const blob = `${title} ${content}`.toLowerCase();
  const rules = [
    ["Technology", ["tech", "ai", "software", "apple", "google", "cyber", "chip", "data"]],
    ["Business", ["business", "economy", "market", "stock", "trade", "bank", "ceo"]],
    ["Politics", ["politic", "election", "parliament", "minister", "government", "vote"]],
    ["Science", ["science", "space", "climate", "research", "study", "nasa"]],
    ["Health", ["health", "medical", "hospital", "disease", "covid", "drug"]],
    ["Sports", ["sport", "football", "cricket", "olympic", "tennis", "rugby", "nba"]],
  ];
  for (const [topic, keys] of rules) {
    if (keys.some((k) => blob.includes(k))) return topic;
  }
  return "General";
}

function normalizeItem(item, source) {
  const title = (item.title || "").trim();
  const url = item.link || item.guid || "";
  const content =
    item["content:encoded"] ||
    item.contentSnippet ||
    item.content ||
    item.summary ||
    "";
  const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();
  const categories = item.categories || [];
  const topic = guessTopic(categories, title, content);
  return { title, url: String(url).trim(), content, source, topic, publishedAt };
}

export async function fetchAllFeeds() {
  const out = [];
  for (const { url, source } of RSS_FEEDS) {
    try {
      const { data } = await axios.get(url, {
        timeout: 25000,
        responseType: "text",
        headers: { "User-Agent": "NewsDigestBot/1.0 (educational project)" },
      });
      const feed = await parser.parseString(data);
      for (const item of feed.items || []) {
        const n = normalizeItem(item, source);
        if (n.title && n.url) out.push(n);
      }
    } catch (e) {
      console.error(`RSS fetch failed for ${source} (${url}):`, e.message);
    }
  }
  return out;
}
