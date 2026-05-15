import { Link } from "react-router-dom";
import { IconChevronRight, IconNewspaper, IconSparkles, IconTag } from "./icons.jsx";

const features = [
  {
    title: "Multi-source",
    body: "Stories normalized from trusted RSS feeds so you see breadth, not echo chambers.",
    Icon: IconNewspaper,
  },
  {
    title: "Smart summaries",
    body: "Two-line digests make scanning fast; open originals when you want the full piece.",
    Icon: IconSparkles,
  },
  {
    title: "Topic threads",
    body: "Follow clusters and star topics—subscriptions stay in your browser.",
    Icon: IconTag,
  },
];

export function LandingHero({ trendingTopicName }) {
  return (
    <>
      <section
        className="relative overflow-hidden rounded-2xl border border-red-100 bg-white px-5 py-12 shadow-sm sm:rounded-3xl sm:px-8 sm:py-16 md:px-12 md:py-20 lg:px-16"
        aria-labelledby="landing-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23450a0a' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
          aria-hidden
        />
        <div className="relative max-w-4xl">
          <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-digest-accent sm:text-sm">
            Multi-source digest
          </p>
          <h1
            id="landing-hero-heading"
            className="font-heading mt-4 text-[clamp(2.25rem,6.5vw,4.25rem)] font-bold leading-[1.05] tracking-tight text-digest-ink"
          >
            One calm view of{" "}
            <span className="text-digest-accent">everything breaking</span>—clustered, cited, readable.
          </h1>
          <p className="font-body mt-6 max-w-2xl text-base leading-relaxed text-digest-muted sm:text-lg">
            Built for clarity: TF–IDF clustering groups related headlines, optional AI summaries keep you
            oriented, and topics help you tune the river of news to what matters.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href="#digest"
              className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-digest-cta px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-digest-cta"
            >
              Browse today&apos;s digest
              <IconChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
            </a>
            {trendingTopicName ? (
              <Link
                to={`/topic/${encodeURIComponent(trendingTopicName)}`}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-digest-border bg-digest-canvas px-6 py-3 text-sm font-medium text-digest-ink transition-colors duration-200 hover:border-digest-accent/40 hover:bg-white"
              >
                Top topic: {trendingTopicName}
              </Link>
            ) : (
              <span className="text-center text-sm text-digest-muted sm:text-left">
                Ingest feeds on the backend to populate stories.
              </span>
            )}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3" aria-label="Product highlights">
        {features.map(({ title, body, Icon }) => (
          <div
            key={title}
            className="flex flex-col rounded-2xl border border-digest-border bg-white/90 p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-digest-accent">
              <Icon className="h-6 w-6" />
            </div>
            <h2 className="font-heading text-lg font-semibold text-digest-ink">{title}</h2>
            <p className="font-body mt-2 text-sm leading-relaxed text-digest-muted">{body}</p>
          </div>
        ))}
      </section>
    </>
  );
}
