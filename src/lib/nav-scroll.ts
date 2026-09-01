"use client";

import type Lenis from "lenis";

const NAV_SCROLL_OFFSET = -80;
export const PENDING_HASH_KEY = "bc-pending-hash";

/** About Us lives on the hero; legacy `#about` hashes must not scroll mid-page. */
export function normalizeNavHash(hash: string): string {
  const id = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!id || id === "home" || id === "about" || id === "studio") return "#home";
  return `#${id}`;
}

export function resetScrollTop(lenis: Lenis | null) {
  window.history.scrollRestoration = "manual";
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  if (lenis) lenis.scrollTo(0, { immediate: true });
}

/** Keep plain `/` loads on the hero unless the URL explicitly targets another section. */
export function pinHomeScrollIfNeeded(lenis: Lenis | null) {
  if (typeof window === "undefined" || window.location.pathname !== "/") return;
  if (normalizeNavHash(window.location.hash) !== "#home") return;
  resetScrollTop(lenis);
}

export function stashPendingHash(hash: string) {
  const normalized = normalizeNavHash(hash);
  if (!normalized || normalized === "#home") return;
  try {
    sessionStorage.setItem(PENDING_HASH_KEY, normalized);
  } catch {
    /* ignore */
  }
}

export function takePendingHash(): string {
  try {
    const hash = sessionStorage.getItem(PENDING_HASH_KEY);
    if (hash) sessionStorage.removeItem(PENDING_HASH_KEY);
    return hash ? normalizeNavHash(hash) : "";
  } catch {
    return "";
  }
}

export function preserveScrollDuring(lenis: Lenis | null, fn: () => void) {
  const y = lenis?.scroll ?? window.scrollY;
  fn();
  if (lenis) lenis.scrollTo(y, { immediate: true });
  else window.scrollTo(0, y);
}

export function scrollToNavTarget(
  lenis: Lenis | null,
  hash: string,
  options: { immediate?: boolean } = {}
) {
  const { immediate = false } = options;
  const id = normalizeNavHash(hash).slice(1);
  if (!id || id === "home") {
    resetScrollTop(lenis);
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  if (lenis) lenis.scrollTo(target, { offset: NAV_SCROLL_OFFSET, immediate });
  else target.scrollIntoView({ behavior: immediate ? "auto" : "smooth", block: "start" });
}
