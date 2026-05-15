import Sentiment from "sentiment";

const analyzer = new Sentiment();

export function labelSentiment(text) {
  const score = analyzer.analyze(text || "").comparative;
  if (score > 0.05) return "positive";
  if (score < -0.05) return "negative";
  return "neutral";
}
