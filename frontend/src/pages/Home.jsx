import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAsync } from "../hooks/useAsync.js";
import { useTopicSubscriptions } from "../hooks/useTopicSubscriptions.js";
import { fetchDigest, fetchTopics } from "../services/api.js";
import { ArticleCard } from "../components/ArticleCard.jsx";
import { TopicSubscribeButton } from "../components/TopicSubscribeButton.jsx";
import { LandingHero } from "../components/LandingHero.jsx";

export function Home() {
  const digest = useAsync(() => fetchDigest(), []);
  const topics = useAsync(() => fetchTopics(), []);
  const { subscribed, isSubscribed, toggle, clearAll } = useTopicSubscriptions();
  const [focusSubscribed, setFocusSubscribed] = useState(false);

  const digestClusters = useMemo(() => {
    const all = digest.data || [];
    if (!focusSubscribed || subscribed.length === 0) return all;
    const lower = new Set(subscribed.map((s) => s.toLowerCase()));
    return all.filter((cl) => {
      if (lower.has(String(cl.topic || "").toLowerCase())) return true;
      return (cl.articles || []).some((a) => lower.has(String(a.topic || "").toLowerCase()));
    });
  }, [digest.data, focusSubscribed, subscribed]);

  const headlineArticles = useMemo(
    () => digestClusters.flatMap((c) => (c.articles || []).slice(0, 1)).slice(0, 8),
    [digestClusters]
  );

  const trending = useMemo(() => {
    const countFor = (topicName) =>
      (digest.data || []).reduce(
        (acc, cl) => acc + (cl.articles || []).filter((a) => a.topic === topicName).length,
        0
      );

    const topicNamesFromApi = topics.data?.filter(Boolean) || [];
    if (topicNamesFromApi.length > 0) {
      const rows = topicNamesFromApi.map((t) => ({ name: t, count: countFor(t) }));
      return [...rows].sort((a, b) => (b.count || 0) - (a.count || 0));
    }

    const seen = new Set();
    const fromDigest = [];
    for (const cl of digest.data || []) {
      for (const a of cl.articles || []) {
        const t = a.topic || cl.topic || "General";
        if (!seen.has(t)) {
          seen.add(t);
          fromDigest.push(t);
        }
      }
    }
    const rows = fromDigest.map((t) => ({ name: t, count: countFor(t) }));
    return [...rows].sort((a, b) => (b.count || 0) - (a.count || 0));
  }, [digest.data, topics.data]);

  const topTopicName = trending[0]?.name;

  if (digest.loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 py-24">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-digest-border border-t-digest-accent motion-reduce:animate-none"
          aria-hidden
        />
        <p className="text-sm font-medium text-digest-muted">Loading digest…</p>
      </div>
    );
  }

  if (digest.error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-rose-900 sm:px-6">
        <p className="font-heading font-semibold">Could not load digest</p>
        <p className="mt-2 text-sm leading-relaxed text-rose-800/90">{digest.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 sm:space-y-16">
      <LandingHero trendingTopicName={topTopicName} />

      <div id="digest" className="scroll-mt-28 space-y-10 sm:scroll-mt-32 sm:space-y-12">
        {topics.error && (
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:px-5">
            Could not load <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">/topics</code> (
            {topics.error}). Topic chips use topics from the digest instead; check the API (e.g. restart backend,
            empty <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">API_KEY</code> for local dev).
          </p>
        )}

        <section className="rounded-2xl border border-digest-border bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-heading text-xl font-bold text-digest-ink">Topic subscriptions</h2>
            {subscribed.length > 0 && (
              <button
                type="button"
                onClick={() => clearAll()}
                className="cursor-pointer text-xs font-medium text-digest-muted underline-offset-2 transition-colors duration-200 hover:text-digest-accent hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <p className="font-body mt-2 text-sm leading-relaxed text-digest-muted">
            Star topics you care about (saved in this browser). Use focus mode to see only those clusters.
          </p>
          {subscribed.length === 0 ? (
            <p className="mt-4 text-sm text-digest-muted">No subscriptions yet — use the star next to a topic below.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {subscribed.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-sm text-amber-950"
                >
                  <Link
                    to={`/topic/${encodeURIComponent(name)}`}
                    className="cursor-pointer font-medium transition-colors duration-200 hover:text-digest-accent"
                  >
                    {name}
                  </Link>
                  <TopicSubscribeButton topic={name} isSubscribed onToggle={toggle} />
                </span>
              ))}
            </div>
          )}
          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-digest-ink">
            <input
              type="checkbox"
              checked={focusSubscribed}
              disabled={subscribed.length === 0}
              onChange={(e) => setFocusSubscribed(e.target.checked)}
              className="mt-1 h-4 w-4 cursor-pointer rounded border-digest-border text-digest-cta focus:ring-digest-cta disabled:cursor-not-allowed disabled:opacity-50"
            />
            <span>Show only clusters matching subscribed topics</span>
          </label>
        </section>

        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold tracking-tight text-digest-ink sm:text-3xl">
                Top headlines
              </h2>
              <p className="mt-1 text-sm text-digest-muted sm:text-base">Latest lead story from each cluster.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
            {headlineArticles.length === 0 ? (
              <p className="col-span-full text-sm text-digest-muted">
                {focusSubscribed && subscribed.length > 0
                  ? "No clusters match your subscriptions right now."
                  : "No articles yet. Run the backend ingest job."}
              </p>
            ) : (
              headlineArticles.map((a) => <ArticleCard key={a.id || a.url} article={a} />)
            )}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-digest-ink sm:text-3xl">Trending topics</h2>
          <p className="mt-1 text-sm text-digest-muted">Jump into a thread or star it for later.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {trending.length === 0 ? (
              <p className="text-sm text-digest-muted">No topics in the digest yet.</p>
            ) : (
              trending.map(({ name, count }) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-0.5 rounded-full border border-digest-border bg-white px-1 py-1 pl-3 text-sm text-digest-ink shadow-sm transition-shadow duration-200 hover:border-digest-accent/30 hover:shadow"
                >
                  <Link
                    to={`/topic/${encodeURIComponent(name)}`}
                    className="cursor-pointer font-medium text-digest-ink transition-colors duration-200 hover:text-digest-accent"
                  >
                    {name}
                  </Link>
                  {count > 0 && (
                    <span className="pr-1 text-xs tabular-nums text-digest-muted">{count}</span>
                  )}
                  <TopicSubscribeButton topic={name} isSubscribed={isSubscribed(name)} onToggle={toggle} />
                </span>
              ))
            )}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold tracking-tight text-digest-ink sm:text-3xl">Clustered stories</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-digest-muted">
            Related pieces grouped by similarity so you can read the shape of a story at a glance.
          </p>
          <div className="mt-8 space-y-10 sm:space-y-12">
            {digestClusters.map((cluster, index) => {
              const articles = cluster.articles || [];
              const isMulti = articles.length > 1;
              return (
                <div
                  key={articles[0]?.id || articles[0]?.url || String(index)}
                  className="space-y-4"
                >
                  {isMulti && (
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-digest-border pb-3">
                      <h3 className="font-heading text-lg font-semibold text-digest-ink sm:text-xl">
                        {cluster.topic || "General"}
                      </h3>
                      <span className="text-xs text-digest-muted">
                        {articles.length} articles
                      </span>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {articles.map((a) => (
                      <ArticleCard key={a.id || a.url} article={a} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
