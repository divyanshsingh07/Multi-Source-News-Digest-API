import { useParams, Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync.js";
import { useTopicSubscriptions } from "../hooks/useTopicSubscriptions.js";
import { fetchTopicArticles } from "../services/api.js";
import { ArticleCard } from "../components/ArticleCard.jsx";
import { TopicSubscribeButton } from "../components/TopicSubscribeButton.jsx";
import { IconChevronRight } from "../components/icons.jsx";

export function Topic() {
  const { name } = useParams();
  const { data, loading, error } = useAsync(() => fetchTopicArticles(name), [name]);
  const { isSubscribed, toggle } = useTopicSubscriptions();
  const topicLabel = decodeURIComponent(name || "");

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-24">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-digest-border border-t-digest-accent motion-reduce:animate-none"
          aria-hidden
        />
        <p className="text-sm font-medium text-digest-muted">Loading topic…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900 sm:px-6">
        <p className="font-heading font-semibold">Could not load topic</p>
        <p className="mt-2 text-sm leading-relaxed text-rose-800/90">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <Link
        to="/"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-digest-cta transition-colors duration-200 hover:text-blue-900"
      >
        <IconChevronRight className="h-4 w-4 rotate-180" aria-hidden />
        Back to digest
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-digest-accent">Topic</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-digest-ink sm:text-4xl">
            {topicLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start rounded-2xl border border-digest-border bg-white px-3 py-2 shadow-sm sm:self-center">
          <span className="text-sm text-digest-muted">Save</span>
          <TopicSubscribeButton topic={topicLabel} isSubscribed={isSubscribed(topicLabel)} onToggle={toggle} />
        </div>
      </div>

      {!data?.length ? (
        <p className="text-digest-muted">No articles for this topic.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((a) => (
            <ArticleCard key={a.id} article={a} showTopicLink={false} />
          ))}
        </div>
      )}
    </div>
  );
}
