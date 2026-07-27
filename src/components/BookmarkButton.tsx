import { useBookmark } from "@/lib/bookmarks-store";

export function BookmarkButton({ eventId }: { eventId: string }) {
  const { bookmarked, toggle } = useBookmark(eventId);
  const base =
    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors";
  const styles = bookmarked
    ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-primary/10 hover:bg-primary/20"
    : "border-border bg-surface-2 text-foreground/90 hover:bg-white/5";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={bookmarked}
      className={`${base} ${styles}`}
    >
      {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
    </button>
  );
}
