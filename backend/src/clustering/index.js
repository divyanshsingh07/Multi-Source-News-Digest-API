import { Article } from "../models/Article.js";
import { buildCorpusVectors, cosineSimilarity } from "../utils/tfidf.js";
import { slugifyId } from "../utils/text.js";

const CLUSTER_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const SIM_THRESHOLD = 0.28;
const MAX_DOCS = 400;

export async function clusterRecentArticles() {
  const since = new Date(Date.now() - CLUSTER_WINDOW_MS);
  const articles = await Article.find({ publishedAt: { $gte: since } })
    .sort({ publishedAt: -1 })
    .limit(MAX_DOCS)
    .lean();

  if (!articles.length) return;

  const docs = articles.map((a) => `${a.title} ${a.summary || ""} ${(a.content || "").slice(0, 500)}`);
  const vectors = buildCorpusVectors(docs);

  const clusters = [];

  for (let i = 0; i < articles.length; i++) {
    let best = -1;
    let bestSim = SIM_THRESHOLD;
    for (let c = 0; c < clusters.length; c++) {
      const rep = clusters[c].repIndex;
      const sim = cosineSimilarity(vectors[i], vectors[rep]);
      if (sim > bestSim) {
        bestSim = sim;
        best = c;
      }
    }
    if (best >= 0) {
      clusters[best].ids.push(articles[i]._id);
    } else {
      clusters.push({ ids: [articles[i]._id], repIndex: i });
    }
  }

  const bulk = [];
  for (const cl of clusters) {
    const repArticle = articles[cl.repIndex];
    const clusterId = `${slugifyId(repArticle.title)}-${String(repArticle._id).slice(-6)}`;
    for (const id of cl.ids) {
      bulk.push({
        updateOne: {
          filter: { _id: id },
          update: { $set: { clusterId } },
        },
      });
    }
  }

  if (bulk.length) {
    await Article.bulkWrite(bulk);
  }
}
