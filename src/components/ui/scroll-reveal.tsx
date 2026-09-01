"use client";

import {
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/cn";

gsap.registerPlugin(ScrollTrigger);

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  /** Bind the tween to the child node instead of wrapping it in an extra box. */
  asChild?: boolean;
  /** "fade" = opacity, "rise" = opacity + y (default). */
  variant?: "fade" | "rise";
  start?: string;
  end?: string;
  scrub?: boolean | number;
};

/** Lightweight stand-in for the reference site's js-s-* text binders. */
export function ScrollReveal({
  children,
  className,
  asChild = false,
  variant = "rise",
  start = "top 85%",
  end = "top 40%",
  scrub = 0.4,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tween = gsap.fromTo(
      el,
      {
        opacity: 0,
        y: variant === "rise" ? 36 : 0,
      },
      {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start,
          end,
          scrub,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [variant, start, end, scrub]);

  const setRef = (node: HTMLElement | null) => {
    ref.current = node;
  };

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ className?: string; style?: CSSProperties }>;
    return cloneElement(child, {
      ref: setRef,
      className: cn(child.props.className, className),
      style: { opacity: 0, ...child.props.style },
    } as never);
  }

  return (
    <div ref={setRef} className={cn(className)} style={{ opacity: 0 }}>
      {children}
    </div>
  );
}

/**
 * Original `.js-s-fade-in-out`: fade in, hold, fade out while the block
 * crosses mid-viewport. Process steps use this so one item sits in the
 * center-right slot like a following menu.
 */
export function ScrollFadeInOut({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { opacity: 0 });
    const tl = gsap.timeline({
      defaults: { duration: 2, ease: "none" },
      scrollTrigger: {
        trigger: el,
        scrub: true,
        start: "top 70%",
        end: "bottom 30%",
      },
    });
    tl.fromTo(el, { opacity: 0 }, { opacity: 1 });
    tl.to({}, { duration: 2 });
    tl.to(el, { opacity: 0 });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
