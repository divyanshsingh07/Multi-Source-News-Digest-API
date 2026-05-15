import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    url: { type: String, required: true, unique: true },
    source: { type: String, required: true },
    topic: { type: String, default: "General" },
    summary: { type: String, default: "" },
    sentiment: { type: String, enum: ["positive", "neutral", "negative"], default: "neutral" },
    clusterId: { type: String, default: "" },
    publishedAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: false } }
);

articleSchema.index({ clusterId: 1 });
articleSchema.index({ topic: 1 });
articleSchema.index({ publishedAt: -1 });

export const Article = mongoose.model("Article", articleSchema);
