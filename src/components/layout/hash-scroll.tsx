"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGlobalStore } from "@/stores/global-store";
import { useScrollStore } from "@/stores/scroll-store";
import {
  normalizeNavHash,
  pinHomeScrollIfNeeded,
  resetScrollTop,
  scrollToNavTarget,
  takePendingHash,
} from "@/lib/nav-scroll";

/**
 * After the entrance timeline, scroll to a hash target only when the URL (or a
 * stashed redirect hash) explicitly requests it. Plain `/` loads stay pinned to
 * the hero so ScrollTrigger refresh cannot drift the page downward.
 */
export function HashScroll() {
  const pathname = usePathname();
  const lenis = useScrollStore((s) => s.lenis);
  const entranceDone = useGlobalStore((s) => s.entranceDone);

  useEffect(() => {
    if (pathname !== "/" || !lenis || !entranceDone) return;

    resetScrollTop(lenis);

    const hash = normalizeNavHash(window.location.hash || takePendingHash());
    if (hash === "#home") {
      if (window.location.hash) {
        window.history.replaceState(null, "", pathname);
      }

      pinHomeScrollIfNeeded(lenis);
      const t1 = window.setTimeout(() => pinHomeScrollIfNeeded(lenis), 300);
      const t2 = window.setTimeout(() => pinHomeScrollIfNeeded(lenis), 900);

      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }

    const t = window.setTimeout(() => {
      scrollToNavTarget(lenis, hash);
      window.history.replaceState(null, "", `${pathname}${hash}`);
    }, 150);

    return () => window.clearTimeout(t);
  }, [pathname, lenis, entranceDone]);

  return null;
}
