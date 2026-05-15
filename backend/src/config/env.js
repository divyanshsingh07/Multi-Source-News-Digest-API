import "../loadEnv.js";

export function validateEnv() {
  if (!(process.env.MONGO_URI || "").trim()) {
    throw new Error("MONGO_URI is required");
  }
}

export const env = {
  get port() {
    return Number(process.env.PORT) || 8000;
  },
  get mongoUri() {
    return (process.env.MONGO_URI || "").trim();
  },
  get openAiKey() {
    return process.env.OPENAI_API_KEY || "";
  },
  get frontendUrl() {
    return process.env.FRONTEND_URL || "http://localhost:5173";
  },
  get frontendOrigins() {
    const raw = process.env.FRONTEND_URL || "http://localhost:5173";
    return raw
      .split(",")
      .map((s) => s.trim().replace(/\/$/, ""))
      .filter(Boolean);
  },
  get apiKey() {
    return process.env.API_KEY || "";
  },
  get disableCron() {
    return String(process.env.DISABLE_CRON).toLowerCase() === "true";
  },
  get requireApiKey() {
    return Boolean((process.env.API_KEY || "").trim());
  },
};
