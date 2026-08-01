/**
 * Single, validated path for opening external URLs.
 *
 * Stage 1 (now): window.open from the web view.
 * Stage 2 (later): replace the body of openExternal() with the Tauri
 *   open_external_url command. No caller changes needed.
 *
 * Only http: and https: are allowed. This blocks javascript:, data:, file:
 * and every other scheme.
 */

export function isSafeExternalUrl(raw: string | undefined | null): boolean {
  if (!raw) return false;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function openExternal(raw: string | undefined | null): void {
  if (!isSafeExternalUrl(raw)) {
    console.warn("Blocked unsafe or invalid URL:", raw);
    return;
  }
  window.open(raw as string, "_blank", "noopener,noreferrer");
}
