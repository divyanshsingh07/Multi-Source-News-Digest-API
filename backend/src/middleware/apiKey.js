import { env } from "../config/env.js";

export function apiKeyMiddleware(req, res, next) {
  if (!env.requireApiKey) {
    return next();
  }
  if (req.method === "OPTIONS") {
    return next();
  }
  const key = req.header("x-api-key") || req.query.apiKey;
  if (key !== env.apiKey) {
    return res.status(401).json({ error: "Invalid or missing API key" });
  }
  next();
}
