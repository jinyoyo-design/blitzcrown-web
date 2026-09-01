"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { registerTickerCallback } from "@/lib/ticker";

/**
 * Cursor states are declared in markup via `data-event` on any ancestor of the
 * hovered node:
 *   - `hover`        crosshair contracts and the ring fades in
 *   - `simple-hover` crosshair contracts only
 *   - `hide`         cursor disappears entirely
 */
type CursorState = "default" | "hover" | "simple-hover" | "hide";

const FOLLOW = 0.18;

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<CursorState>("default");
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Coarse pointers have no cursor to replace.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      const el = (e.target as Element | null)?.closest?.("[data-event]");
      const next = el?.getAttribute("data-event");
      setState(next === "hover" || next === "simple-hover" || next === "hide" ? next : "default");
    };

    const onLeave = () => setVisible(false);
    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    document.addEventListener("pointerleave", onLeave);

    // Sharing the site ticker keeps the cursor in step with scroll-driven
    // motion instead of drifting a frame behind it.
    const unregister = registerTickerCallback(() => {
      const dot = dotRef.current;
      if (!dot) return;
      current.current.x += (target.current.x - current.current.x) * FOLLOW;
      current.current.y += (target.current.y - current.current.y) * FOLLOW;
      dot.style.transform = `translate3d(${current.current.x}px, ${current.current.y}px, 0)`;
    });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      unregister();
    };
  }, [visible]);

  const contracted = state === "hover" || state === "simple-hover";

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100000001] h-1 w-1 will-change-transform"
        style={{ transform: `translate3d(${current.current.x}px, ${current.current.y}px, 0)` }}
        ref={dotRef}
      >
        <div
          className={cn(
            "border-brand-05/10 bg-brand-05/4 absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full border backdrop-blur-[1px] transition-all duration-400 will-change-transform",
            state === "hover" && "scale-100"
          )}
        />

        <div
          className={cn(
            "pointer-events-none absolute inset-0 mix-blend-difference transition-opacity duration-200",
            !visible || state === "hide" ? "opacity-0" : pressed ? "opacity-60" : "opacity-100"
          )}
        >
          <div
            className={cn(
              "bg-brand-05 absolute bottom-full left-1/2 h-1.5 w-0.5 -translate-x-1/2 transition-all duration-200",
              pressed && "bottom-1/2! translate-y-0!",
              contracted && "-translate-y-full scale-60"
            )}
          />
          <div
            className={cn(
              "bg-brand-05 absolute top-full left-1/2 h-1.5 w-0.5 -translate-x-1/2 transition-all duration-200",
              pressed && "top-1/2! translate-y-0!",
              contracted && "translate-y-full scale-60"
            )}
          />
          <div
            className={cn(
              "bg-brand-05 absolute top-1/2 left-full h-0.5 w-1.5 -translate-y-1/2 transition-all duration-200",
              pressed && "left-1/2! translate-x-0!",
              contracted && "translate-x-full scale-60"
            )}
          />
          <div
            className={cn(
              "bg-brand-05 absolute top-1/2 right-full h-0.5 w-1.5 -translate-y-1/2 transition-all duration-200",
              pressed && "right-1/2! translate-x-0!",
              contracted && "-translate-x-full scale-60"
            )}
          />
        </div>
      </div>
    </>
  );
}
