import { IconStarOutline, IconStarSolid } from "./icons.jsx";

export function TopicSubscribeButton({ topic, isSubscribed, onToggle }) {
  if (!topic) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle(topic);
      }}
      className={`ml-1 inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition-colors duration-200 ${
        isSubscribed
          ? "text-amber-600 hover:bg-amber-50"
          : "text-digest-muted hover:bg-stone-100 hover:text-digest-ink"
      }`}
      title={isSubscribed ? "Unsubscribe from this topic" : "Subscribe to this topic"}
      aria-pressed={isSubscribed}
      aria-label={isSubscribed ? `Unsubscribe from ${topic}` : `Subscribe to ${topic}`}
    >
      {isSubscribed ? (
        <IconStarSolid className="h-4 w-4" />
      ) : (
        <IconStarOutline className="h-4 w-4" />
      )}
    </button>
  );
}
