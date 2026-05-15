import cron from "node-cron";
import { env } from "../config/env.js";
import { runIngest } from "../services/ingestService.js";

export function startIngestCron() {
  if (env.disableCron) {
    console.log("Cron disabled (DISABLE_CRON=true)");
    return;
  }
  cron.schedule("*/30 * * * *", async () => {
    try {
      const r = await runIngest();
      console.log(`[cron] ingest done: fetched=${r.fetched} new=${r.newArticles}`);
    } catch (e) {
      console.error("[cron] ingest failed:", e);
    }
  });
  console.log("RSS ingest scheduled every 30 minutes");
}
