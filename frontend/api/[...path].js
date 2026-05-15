/**
 * Proxies /api/* to BACKEND_URL (server-side) so HTTPS Vercel can reach HTTP EC2
 * without browser mixed-content blocking.
 *
 * Vercel env: BACKEND_URL=http://44.192.246.119:8000
 * Frontend env: VITE_API_URL=/api
 */
export default async function handler(req, res) {
  const backend = (process.env.BACKEND_URL || "").replace(/\/$/, "");
  if (!backend) {
    res.status(500).json({
      error: "BACKEND_URL is not set on Vercel (e.g. http://your-ec2-ip:8000)",
    });
    return;
  }

  const segments = req.query.path;
  const path = Array.isArray(segments) ? segments.join("/") : segments || "";
  const qs = req.url?.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const target = `${backend}/${path}${qs}`;

  const headers = { Accept: "application/json" };
  const apiKey = req.headers["x-api-key"];
  if (apiKey) headers["X-API-Key"] = apiKey;

  try {
    const upstream = await fetch(target, { method: req.method, headers });
    const contentType = upstream.headers.get("content-type") || "application/json";
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", contentType);
    res.send(body);
  } catch (err) {
    res.status(502).json({
      error: "Backend unreachable",
      detail: err.message,
      target,
    });
  }
}
