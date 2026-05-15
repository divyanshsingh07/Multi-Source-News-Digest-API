import { connectDb, disconnectDb } from "../config/db.js";
import { validateEnv } from "../config/env.js";
import { runIngest } from "../services/ingestService.js";

async function main() {
  validateEnv();
  await connectDb();
  try {
    const r = await runIngest();
    console.log(JSON.stringify(r, null, 2));
  } finally {
    await disconnectDb();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
