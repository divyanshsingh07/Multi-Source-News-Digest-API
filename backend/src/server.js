import "./loadEnv.js";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { validateEnv, env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { buildSwaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiKeyMiddleware } from "./middleware/apiKey.js";
import newsRoutes from "./routes/newsRoutes.js";
import { startIngestCron } from "./cron/ingest.js";

validateEnv();

const app = express();
app.set("trust proxy", 1);

const corsOrigins = [
  ...env.frontendOrigins,
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https?:\/\/frontend(:\d+)?$/,
  /\.onrender\.com$/,
  /\.vercel\.app$/,
];

app.use(
  cors({
    origin: corsOrigins,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-API-Key"],
    credentials: false,
    optionsSuccessStatus: 204,
  })
);
app.use(express.json({ limit: "1mb" }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
});

function isNewsReadGet(req) {
  if (req.method !== "GET") return false;
  return (
    req.path === "/digest" ||
    req.path === "/topics" ||
    req.path.startsWith("/topic/") ||
    req.path.startsWith("/article/")
  );
}

function skipPublic(req) {
  if (req.path === "/" || req.path === "/health" || req.path.startsWith("/api-docs")) {
    return true;
  }
  if (!isNewsReadGet(req)) return false;

  const skipReadsFlag = String(process.env.SKIP_API_KEY_ON_GETS).toLowerCase() === "true";
  const forceReadsFlag = String(process.env.FORCE_API_KEY_ON_READS).toLowerCase() === "true";
  const isProd = process.env.NODE_ENV === "production";

  if (isProd) {
    return skipReadsFlag;
  }
  return !forceReadsFlag;
}

app.use((req, res, next) => {
  if (skipPublic(req)) return next();
  limiter(req, res, next);
});

app.use((req, res, next) => {
  if (skipPublic(req)) return next();
  apiKeyMiddleware(req, res, next);
});

const swaggerSpec = buildSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.json({
    name: "Multi-Source News Digest API",
    health: "/health",
    docs: "/api-docs",
    digest: "/digest",
    topics: "/topics",
    hint: env.requireApiKey
      ? process.env.NODE_ENV === "production"
        ? "Set X-API-Key header for read routes, or SKIP_API_KEY_ON_GETS=true in .env."
        : "Read routes skip API key in dev by default. Use FORCE_API_KEY_ON_READS=true to require X-API-Key, or clear API_KEY."
      : undefined,
  });
});

app.use(newsRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use(errorHandler);

async function boot() {
  if (process.env.DEBUG_MONGO === "1") {
    const u = env.mongoUri;
    const hostHint = u.includes("@") ? u.split("@")[1]?.split("/")[0] : "(hidden)";
    console.log("[DEBUG_MONGO] Resolved host part:", hostHint);
  }
  await connectDb();
  startIngestCron();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
    console.log(`Swagger UI: http://localhost:${env.port}/api-docs`);
  });
}

boot().catch((err) => {
  const msg = String(err?.message || err);
  const refused =
    err?.name === "MongooseServerSelectionError" ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("querySrv") ||
    msg.includes("ENOTFOUND");
  if (refused) {
    console.error("\nCould not reach MongoDB.");
    const u = env.mongoUri || "";
    if (/mongodb:\/\/.*(127\.0\.0\.1|localhost)/i.test(u)) {
      console.error("  MONGO_URI is targeting localhost. That requires MongoDB running on your machine.");
      console.error("  • Atlas: set MONGO_URI=mongodb+srv://... in backend/.env, save the file, then run: unset MONGO_URI");
      console.error("    (a value exported in your shell can override .env in some setups—loadEnv now forces backend/.env).");
      console.error("  • Local Mongo: from repo root run  docker compose up -d\n");
    } else {
      console.error("  • Local DB: from the repo root run  docker compose up -d");
      console.error("  • Atlas: check URI, database name, password, and Network Access allowlist for your IP.\n");
    }
  }
  console.error(err);
  process.exit(1);
});
