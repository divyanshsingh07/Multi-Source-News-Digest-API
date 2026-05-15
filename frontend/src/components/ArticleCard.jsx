import { Link } from "react-router-dom";

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const sentimentStyles = {
  positive: "bg-emerald-50 text-emerald-800 border-emerald-200",
  negative: "bg-rose-50 text-rose-800 border-rose-200",
  neutral: "bg-slate-50 text-slate-700 border-slate-200",
};

export function ArticleCard({ article, showTopicLink = true }) {
  const s = sentimentStyles[article.sentiment] || sentimentStyles.neutral;
  return (
    <article className="flex flex-col gap-2 rounded-2xl border border-digest-border bg-digest-card p-4 shadow-sm transition-shadow duration-200 hover:border-digest-accent/25 hover:shadow-md sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-medium text-digest-accent">{article.source}</span>
        <span className="text-digest-border">·</span>
        <time className="text-digest-muted">{formatTime(article.publishedAt)}</time>
        {article.topic && showTopicLink ? (
          <>
            <span className="text-digest-border">·</span>
            <Link
              to={`/topic/${encodeURIComponent(article.topic)}`}
              className="cursor-pointer rounded-full border border-digest-border bg-digest-canvas px-2.5 py-0.5 text-digest-muted transition-colors duration-200 hover:border-digest-cta/40 hover:text-digest-cta"
            >
              {article.topic}
            </Link>
          </>
        ) : article.topic ? (
          <>
            <span className="text-digest-border">·</span>
            <span className="rounded-full border border-digest-border bg-digest-canvas px-2.5 py-0.5 text-digest-muted">
              {article.topic}
            </span>
          </>
        ) : null}
        <span className={`ml-auto rounded-full border px-2 py-0.5 capitalize ${s}`}>
          {article.sentiment || "neutral"}
        </span>
      </div>
      <h3 className="font-heading text-base font-semibold leading-snug text-digest-ink sm:text-lg">
        {article.url ? (
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer transition-colors duration-200 hover:text-digest-accent"
          >
            {article.title}
          </a>
        ) : (
          article.title
        )}
      </h3>
      {article.summary && (
        <p className="font-body text-sm leading-relaxed text-digest-muted">{article.summary}</p>
      )}
      {article.id && (
        <div className="pt-1">
          <Link
            to={`/article/${article.id}`}
            className="cursor-pointer text-xs font-medium text-digest-cta transition-colors duration-200 hover:text-blue-900 hover:underline"
          >
            View details
          </Link>
        </div>
      )}
    </article>
  );
}
