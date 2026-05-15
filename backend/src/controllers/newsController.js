import mongoose from "mongoose";
import { Article } from "../models/Article.js";

function articlePublic(doc) {
  if (!doc) return null;
  const o = typeof doc.toObject === "function" ? doc.toObject() : doc;
  return {
    id: String(o._id),
    title: o.title,
    summary: o.summary,
    source: o.source,
    topic: o.topic,
    sentiment: o.sentiment,
    url: o.url,
    publishedAt: o.publishedAt,
    clusterId: o.clusterId,
    content: o.content,
    createdAt: o.createdAt,
  };
}

export async function getDigest(_req, res, next) {
  try {
    const recent = await Article.find({})
      .sort({ publishedAt: -1 })
      .limit(300)
      .lean();

    const map = new Map();
    for (const a of recent) {
      const key = a.clusterId || `single-${String(a._id)}`;
      if (!map.has(key)) {
        map.set(key, {
          clusterId: a.clusterId || String(a._id),
          topic: a.topic || "General",
          articles: [],
        });
      }
      map.get(key).articles.push({
        id: String(a._id),
        title: a.title,
        summary: a.summary,
        source: a.source,
        sentiment: a.sentiment,
        topic: a.topic,
        url: a.url,
        publishedAt: a.publishedAt,
      });
    }

    const payload = [...map.values()]
      .sort(
        (x, y) => new Date(y.articles[0]?.publishedAt || 0) - new Date(x.articles[0]?.publishedAt || 0)
      )
      .map((cl) => ({
        topic: cl.topic,
        label:
          cl.articles.length === 1
            ? cl.articles[0].title
            : cl.topic || "General",
        articles: cl.articles,
      }));
    res.json(payload);
  } catch (e) {
    next(e);
  }
}

export async function getTopics(_req, res, next) {
  try {
    const topics = await Article.distinct("topic");
    res.json(topics.filter(Boolean).sort());
  } catch (e) {
    next(e);
  }
}

export async function getTopicByName(req, res, next) {
  try {
    const name = decodeURIComponent(req.params.name || "").trim();
    if (!name) {
      return res.status(400).json({ error: "Topic name required" });
    }
    const rx = new RegExp(`^${escapeRegex(name)}$`, "i");
    const articles = await Article.find({ topic: rx }).sort({ publishedAt: -1 }).limit(100).lean();
    res.json(
      articles.map((a) => ({
        id: String(a._id),
        title: a.title,
        summary: a.summary,
        source: a.source,
        topic: a.topic,
        sentiment: a.sentiment,
        url: a.url,
        publishedAt: a.publishedAt,
        clusterId: a.clusterId,
      }))
    );
  } catch (e) {
    next(e);
  }
}

export async function getArticleById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid article id" });
    }
    const doc = await Article.findById(id);
    if (!doc) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(articlePublic(doc));
  } catch (e) {
    next(e);
  }
}

export async function getHealth(_req, res, next) {
  try {
    const dbOk = mongoose.connection.readyState === 1;
    res.json({
      status: dbOk ? "ok" : "degraded",
      db: dbOk ? "connected" : "disconnected",
      uptime: process.uptime(),
    });
  } catch (e) {
    next(e);
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
