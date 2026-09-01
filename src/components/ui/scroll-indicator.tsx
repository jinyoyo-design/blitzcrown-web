"use client";

import { useEffect, useState } from "react";
import { useGlobalStore } from "@/stores/global-store";
import { useScrollStore } from "@/stores/scroll-store";

const SCROLL_HIDE_OFFSET = 72;

/**
 * Fixed bottom-center scroll hint: animated mouse wheel + "SCROLL" label.
 * Appears after the hero entrance and fades once the user scrolls.
 */
export function ScrollIndicator() {
  const entranceDone = useGlobalStore((s) => s.entranceDone);
  const lenis = useScrollStore((s) => s.lenis);
  const [revealed, setRevealed] = useState(false);
  const [scrolledAway, setScrolledAway] = useState(true);

  useEffect(() => {
    if (!entranceDone) {
      setRevealed(false);
      return;
    }

    const timer = window.setTimeout(() => setRevealed(true), 500);
    return () => window.clearTimeout(timer);
  }, [entranceDone]);

  useEffect(() => {
    if (!lenis || !entranceDone) return;

    const onScroll = () => {
      setScrolledAway(lenis.scroll > SCROLL_HIDE_OFFSET);
    };

    onScroll();
    lenis.on("scroll", onScroll);
    return () => {
      lenis.off("scroll", onScroll);
    };
  }, [entranceDone, lenis]);

  if (!entranceDone) return null;

  const visible = revealed && !scrolledAway;

  return (
    <div
      aria-hidden="true"
      className={`scroll-indicator pointer-events-none fixed inset-x-0 bottom-8 z-20 flex justify-center transition-opacity duration-700 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="scroll-indicator__inner flex flex-col items-center gap-3">
        <div className="scroll-indicator__mouse">
          <span className="scroll-indicator__wheel" />
        </div>
        <span className="body-xs text-brand-05/45 font-barlow uppercase tracking-[0.28em]">
          Scroll
        </span>
      </div>
    </div>
  );
}
