import { Link, useParams } from "react-router-dom";
import { useAsync } from "../hooks/useAsync.js";
import { fetchArticle } from "../services/api.js";
import { IconChevronRight } from "../components/icons.jsx";

export function ArticleDetail() {
  const { id } = useParams();
  const { data, loading, error } = useAsync(() => fetchArticle(id), [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-24">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-digest-border border-t-digest-accent motion-reduce:animate-none"
          aria-hidden
        />
        <p className="text-sm font-medium text-digest-muted">Loading article…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900 sm:px-6">
        <p className="font-heading font-semibold">Could not load article</p>
        <p className="mt-2 text-sm leading-relaxed text-rose-800/90">{error}</p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Link
        to="/"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-digest-cta transition-colors duration-200 hover:text-blue-900"
      >
        <IconChevronRight className="h-4 w-4 rotate-180" aria-hidden />
        Back to digest
      </Link>

      <div className="flex flex-wrap gap-2 text-sm text-digest-muted">
        <span className="font-medium text-digest-accent">{data.source}</span>
        <span aria-hidden>·</span>
        <time dateTime={data.publishedAt || undefined}>
          {data.publishedAt ? new Date(data.publishedAt).toLocaleString() : ""}
        </time>
        {data.topic && (
          <>
            <span aria-hidden>·</span>
            <Link
              className="cursor-pointer font-medium text-digest-cta transition-colors duration-200 hover:text-blue-900 hover:underline"
              to={`/topic/${encodeURIComponent(data.topic)}`}
            >
              {data.topic}
            </Link>
          </>
        )}
      </div>

      <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-digest-ink sm:text-4xl md:text-5xl">
        {data.title}
      </h1>

      {data.url && (
        <a
          href={data.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-digest-border bg-white px-4 py-2 text-sm font-medium text-digest-cta shadow-sm transition-colors duration-200 hover:border-digest-cta/40 hover:bg-red-50/50"
        >
          Open original source
          <IconChevronRight className="h-4 w-4" aria-hidden />
        </a>
      )}

      <p className="font-body text-lg leading-relaxed text-digest-muted sm:text-xl">{data.summary}</p>

      {data.content && (
        <div className="border-t border-digest-border pt-8">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-digest-ink/90 sm:text-base">{data.content}</p>
        </div>
      )}
    </article>
  );
}
