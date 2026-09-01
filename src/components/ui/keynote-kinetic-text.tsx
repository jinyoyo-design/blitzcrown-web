"use client";

import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/cn";
import {
  applyWordmarkFrame,
  createCharJitter,
  type CharJitter,
} from "@/lib/keynote-motion";

type KeynoteKineticTextProps = {
  label: string;
  className?: string;
  seed?: number;
  /** Seconds for the assemble pass. */
  duration?: number;
  /** Delay before animation starts. */
  delay?: number;
  autoPlay?: boolean;
};

export function KeynoteKineticText({
  label,
  className,
  seed = 7719,
  duration = 1.15,
  delay = 0,
  autoPlay = true,
}: KeynoteKineticTextProps) {
  const charsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const jitter = useMemo<CharJitter[]>(() => createCharJitter(label.length, seed), [label, seed]);

  useEffect(() => {
    charsRef.current = charsRef.current.slice(0, label.length);

    if (!autoPlay) {
      applyWordmarkFrame(
        charsRef.current.filter((node): node is HTMLSpanElement => node !== null),
        jitter,
        1,
      );
      return undefined;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      applyWordmarkFrame(
        charsRef.current.filter((node): node is HTMLSpanElement => node !== null),
        jitter,
        1,
      );
      return undefined;
    }

    let frame = 0;
    let startAt: number | null = null;

    const tick = (now: number) => {
      if (startAt === null) startAt = now;
      const elapsed = (now - startAt) / 1000 - delay;
      const progress = Math.min(1, Math.max(0, elapsed / duration));
      applyWordmarkFrame(
        charsRef.current.filter((node): node is HTMLSpanElement => node !== null),
        jitter,
        progress,
      );
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoPlay, delay, duration, jitter, label]);

  return (
    <span className={cn("inline-block whitespace-pre", className)} aria-label={label}>
      {label.split("").map((char, index) => (
        <span
          key={`${char}-${index}`}
          ref={(node) => {
            charsRef.current[index] = node;
          }}
          aria-hidden
          className="inline-block will-change-[transform,opacity,filter]"
          style={{ opacity: 0 }}
        >
          {char === " " ? "\u00a0" : char}
        </span>
      ))}
    </span>
  );
}
