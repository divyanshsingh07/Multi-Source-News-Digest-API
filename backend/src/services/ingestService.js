import { fetchAllFeeds } from "./rssService.js";
import { Article } from "../models/Article.js";
import { summarizeArticle } from "../summarizer/index.js";
import { labelSentiment } from "../utils/sentimentLabel.js";
import { clusterRecentArticles } from "../clustering/index.js";

export async function runIngest() {
  const items = await fetchAllFeeds();
  let newArticles = 0;

  for (const raw of items) {
    const exists = await Article.exists({ url: raw.url });
    if (exists) continue;

    const summary = await summarizeArticle(raw.title, raw.content);
    const sentiment = labelSentiment(`${raw.title} ${summary}`);

    await Article.create({
      title: raw.title,
      content: raw.content,
      url: raw.url,
      source: raw.source,
      topic: raw.topic,
      summary,
      sentiment,
      clusterId: "",
      publishedAt: raw.publishedAt,
    });
    newArticles += 1;
  }

  await clusterRecentArticles();

  return { fetched: items.length, newArticles };
}
