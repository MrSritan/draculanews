import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "aero-dashboard:bookmarks:v1";

export interface BookmarkRecord {
  id: string;
  savedAt: string;
  note?: string;
}

const listeners = new Set<() => void>();
let snapshot: BookmarkRecord[] = load();

function isRecord(v: unknown): v is BookmarkRecord {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === "string" && typeof r.savedAt === "string";
}

function load(): BookmarkRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const clean: BookmarkRecord[] = [];
    for (const item of parsed) {
      if (!isRecord(item) || seen.has(item.id)) continue;
      seen.add(item.id);
      clean.push({
        id: item.id,
        savedAt: item.savedAt,
        ...(typeof item.note === "string" && item.note ? { note: item.note } : {}),
      });
    }
    return clean;
  } catch {
    return [];
  }
}

function persist(next: BookmarkRecord[]): void {
  snapshot = next;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* quota */ }
  listeners.forEach((l) => l());
}

export function addBookmark(id: string, note?: string): void {
  if (snapshot.some((b) => b.id === id)) return;
  persist([{ id, savedAt: new Date().toISOString(), ...(note ? { note } : {}) }, ...snapshot]);
}

export function removeBookmark(id: string): void {
  if (!snapshot.some((b) => b.id === id)) return;
  persist(snapshot.filter((b) => b.id !== id));
}

export function toggleBookmark(id: string): boolean {
  if (snapshot.some((b) => b.id === id)) { removeBookmark(id); return false; }
  addBookmark(id);
  return true;
}

export function setBookmarkNote(id: string, note: string): void {
  const trimmed = note.trim();
  let changed = false;
  const next = snapshot.map((b) => {
    if (b.id !== id) return b;
    changed = true;
    if (!trimmed) { const { note: _drop, ...rest } = b; return rest; }
    return { ...b, note: trimmed };
  });
  if (changed) persist(next);
}

export function clearBookmarks(): void { if (snapshot.length) persist([]); }
export function getBookmarks(): BookmarkRecord[] { return snapshot; }
export function isBookmarked(id: string): boolean { return snapshot.some((b) => b.id === id); }

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
const EMPTY: BookmarkRecord[] = [];

export function useBookmarks(): BookmarkRecord[] {
  return useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
}
export function useBookmarkCount(): number { return useBookmarks().length; }
export function useBookmark(id: string) {
  const all = useBookmarks();
  const bookmarked = all.some((b) => b.id === id);
  const toggle = useCallback(() => { toggleBookmark(id); }, [id]);
  return { bookmarked, toggle };
}
