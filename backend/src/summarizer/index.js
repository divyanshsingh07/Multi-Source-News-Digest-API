import OpenAI from "openai";
import { env } from "../config/env.js";
import { firstTwoSentences } from "../utils/text.js";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

let client = null;
function getClient() {
  if (!env.groqApiKey) return null;
  if (!client) {
    client = new OpenAI({
      apiKey: env.groqApiKey,
      baseURL: GROQ_BASE_URL,
    });
  }
  return client;
}

export async function summarizeArticle(title, content) {
  const body = `${title}\n\n${content || ""}`.trim();
  const c = getClient();
  if (!c) {
    return firstTwoSentences(content || title);
  }
  try {
    const res = await c.chat.completions.create({
      model: env.groqModel,
      messages: [
        {
          role: "system",
          content:
            "Write exactly two short sentences summarizing the news article for a digest. No bullet points, no preamble.",
        },
        { role: "user", content: body.slice(0, 12000) },
      ],
      max_tokens: 120,
      temperature: 0.3,
    });
    const text = res.choices[0]?.message?.content?.trim();
    if (text) return text;
  } catch (e) {
    console.warn("Groq summarize failed:", e.message);
  }
  return firstTwoSentences(content || title);
}
