"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  motion,
  stagger,
  useAnimate,
  type AnimationOptions,
} from "framer-motion";
import { cn } from "@/lib/cn";

type StaggerFrom = "first" | "last" | "center" | "random";

type WeightHoverTextProps = {
  label: string;
  className?: string;
  fromWeight?: number;
  toWeight?: number;
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  /** Play the hover-in once on mount so intro screens show the morph. */
  autoPlay?: boolean;
};

function shuffleIndices(length: number, seedSource: string) {
  const indices = Array.from({ length }, (_, i) => i);
  let seed = 0;
  for (let i = 0; i < seedSource.length; i++) {
    seed = (Math.imul(seed, 31) + seedSource.charCodeAt(i)) >>> 0;
  }
  for (let i = indices.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

/**
 * Originkit Weight Hover: letters morph `wght` on hover, staggered.
 * Locked to Barlow so the weight axis can move on variable-font builds.
 */
export function WeightHoverText({
  label,
  className,
  fromWeight = 400,
  toWeight = 900,
  staggerDuration = 30,
  staggerFrom = "random",
  autoPlay = false,
}: WeightHoverTextProps) {
  const fromSettings = `'wght' ${fromWeight}`;
  const toSettings = `'wght' ${toWeight}`;
  const staggerSec = Math.max(0, staggerDuration) / 1000;
  const [scope, animate] = useAnimate();
  const reduceMotion = useRef(false);

  const shuffledIndices = useMemo(() => {
    if (staggerFrom !== "random") return null;
    return shuffleIndices(label.length, label);
  }, [label, staggerFrom]);

  const transition: AnimationOptions = useMemo(
    () => ({ type: "spring", duration: 0.7, bounce: 0.2 }),
    []
  );

  const mergeStagger = (base: AnimationOptions): AnimationOptions => {
    if (staggerFrom === "random" && shuffledIndices) {
      return {
        ...base,
        delay: (i: number) => staggerSec * (shuffledIndices[i] ?? 0),
      } as AnimationOptions;
    }
    return {
      ...base,
      delay: stagger(staggerSec, {
        from: staggerFrom === "random" ? "first" : staggerFrom,
      }),
    } as AnimationOptions;
  };

  const hoverStartRef = useRef<(() => void) | null>(null);
  const hoverEndRef = useRef<(() => void) | null>(null);
  const timers = useRef({
    startTimer: null as ReturnType<typeof setTimeout> | null,
    startTrailing: false,
    endTimer: null as ReturnType<typeof setTimeout> | null,
    endTrailing: false,
  });

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion.current) return;

    const runStart = () => {
      animate(".letter", { fontVariationSettings: toSettings }, mergeStagger(transition));
    };
    const runEnd = () => {
      animate(".letter", { fontVariationSettings: fromSettings }, mergeStagger(transition));
    };

    const wait = 100;
    const t = timers.current;

    hoverStartRef.current = () => {
      if (!t.startTimer) {
        runStart();
        t.startTimer = setTimeout(() => {
          if (t.startTrailing) runStart();
          t.startTrailing = false;
          t.startTimer = null;
        }, wait);
      } else {
        t.startTrailing = true;
      }
    };

    hoverEndRef.current = () => {
      if (!t.endTimer) {
        runEnd();
        t.endTimer = setTimeout(() => {
          if (t.endTrailing) runEnd();
          t.endTrailing = false;
          t.endTimer = null;
        }, wait);
      } else {
        t.endTrailing = true;
      }
    };

    if (autoPlay) {
      const play = window.setTimeout(runStart, 180);
      return () => {
        window.clearTimeout(play);
        if (t.startTimer) clearTimeout(t.startTimer);
        if (t.endTimer) clearTimeout(t.endTimer);
      };
    }

    return () => {
      if (t.startTimer) clearTimeout(t.startTimer);
      if (t.endTimer) clearTimeout(t.endTimer);
      t.startTimer = null;
      t.endTimer = null;
      t.startTrailing = false;
      t.endTrailing = false;
    };
  }, [animate, autoPlay, fromSettings, toSettings, staggerSec, staggerFrom, shuffledIndices, transition]);

  const letters = label.split("");

  return (
    <span
      className={cn("inline-flex max-w-full flex-wrap justify-center", className)}
      onMouseEnter={() => hoverStartRef.current?.()}
      onMouseLeave={() => hoverEndRef.current?.()}
    >
      <span
        ref={scope}
        className="font-barlow"
        style={{ fontFamily: "var(--font-barlow), system-ui, sans-serif" }}
      >
        <span className="sr-only">{label}</span>
        {letters.map((letter, i) => (
          <motion.span
            key={`${letter}-${i}`}
            className="letter"
            aria-hidden
            style={{
              display: "inline-block",
              whiteSpace: "pre",
              fontVariationSettings: fromSettings,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
