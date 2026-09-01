"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SITE } from "@/config/site";
import { KeynoteKineticText } from "@/components/ui/keynote-kinetic-text";

type PreloaderProps = {
  onComplete: () => void;
};

function PreloaderTagline({ className }: { className?: string }) {
  return (
    <div className={`flex flex-col items-start text-left font-barlow font-bold uppercase ${className ?? ""}`}>
      <KeynoteKineticText
        label={SITE.copy.preloader.line1}
        seed={7719}
        className="heading-2 leading-[0.95em]"
      />
      <KeynoteKineticText
        label={SITE.copy.preloader.line2}
        seed={8820}
        delay={0.12}
        className="heading-2 leading-[0.95em]"
      />
    </div>
  );
}

/**
 * Dual-panel open matching the reference load sequence:
 * hold ??center line reveal ??left/right panels peel away.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const line = lineRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!line || !left || !right) return;

    const ease = "power4.inOut";
    gsap.set(line, { clipPath: "inset(100% 0 0 0)" });
    gsap.set(left, { clipPath: "inset(0 50% 0 0)", xPercent: 0 });
    gsap.set(right, { clipPath: "inset(0 0 0 50%)", xPercent: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        onComplete();
      },
    });

    tl.to({}, { duration: 2 });
    tl.fromTo(
      line,
      { clipPath: "inset(100% 0 0 0)" },
      { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease }
    );
    tl.fromTo(
      left,
      { clipPath: "inset(0 50% 0 0)", xPercent: 0 },
      { clipPath: "inset(0 80% 0 0)", xPercent: -20, duration: 1.9, ease },
      "-=0.1"
    );
    tl.fromTo(
      right,
      { clipPath: "inset(0 0 0 50%)", xPercent: 0 },
      { clipPath: "inset(0 0 0 80%)", xPercent: 20, duration: 1.9, ease },
      "<"
    );

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={rootRef}
      className="pointer-events-auto fixed inset-0 z-[10000000]"
      aria-hidden="true"
    >
      <div
        ref={leftRef}
        className="bg-brand-70 text-brand-05 fixed inset-0 z-[10000000] flex items-center justify-center"
        style={{ clipPath: "inset(0 50% 0 0)" }}
      >
        <PreloaderTagline className="px-6" />
        <div
          ref={lineRef}
          className="bg-brand-05/20 absolute top-0 left-1/2 h-screen w-px -translate-x-1/2"
          style={{ clipPath: "inset(100% 0 0 0)" }}
        />
      </div>
      <div
        ref={rightRef}
        className="bg-brand-70 text-brand-05 fixed inset-0 z-[10000000] flex items-center justify-center"
        style={{ clipPath: "inset(0 0 0 50%)" }}
      >
        <PreloaderTagline className="px-6" />
      </div>
    </div>
  );
}
