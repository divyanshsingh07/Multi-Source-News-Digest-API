import { tokenizeAndStem } from "./text.js";

export function buildCorpusVectors(docs) {
  const tokenized = docs.map((d) => tokenizeAndStem(d));
  const N = tokenized.length || 1;
  const df = new Map();
  for (const toks of tokenized) {
    const seen = new Set(toks);
    for (const t of seen) {
      df.set(t, (df.get(t) || 0) + 1);
    }
  }
  const idf = new Map();
  for (const [t, d] of df) {
    idf.set(t, Math.log(1 + N / d));
  }
  const vectors = tokenized.map((toks) => {
    const tf = new Map();
    for (const t of toks) {
      tf.set(t, (tf.get(t) || 0) + 1);
    }
    const len = toks.length || 1;
    const vec = new Map();
    for (const [t, c] of tf) {
      if (idf.has(t)) {
        vec.set(t, (c / len) * idf.get(t));
      }
    }
    return vec;
  });
  return vectors;
}

export function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const v of a.values()) na += v * v;
  for (const v of b.values()) nb += v * v;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const [t, va] of small) {
    if (large.has(t)) dot += va * large.get(t);
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom ? dot / denom : 0;
}
